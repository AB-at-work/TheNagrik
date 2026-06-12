-- ─────────────────────────────────────────────────────────────
-- The Nagrik — Custom SQL: triggers & partial indexes
-- Applied after generated Drizzle migrations (db/migrate.ts).
-- Idempotent: safe to run repeatedly.
-- Source: BackendSchema_TheNagrik.md §4.5, §15.2, §22.3.
-- ─────────────────────────────────────────────────────────────

-- ── updated_at auto-touch ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'users','categories','articles','blog_posts','projects','school_sessions',
    'team_members','core_principles','faq_entries','faqs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION update_updated_at();', t);
  END LOOP;
END $$;

-- ── articles: full-text search_vector ────────────────────────
CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(
      regexp_replace(NEW.body, '<[^>]*>', ' ', 'g'), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_search_vector_trigger ON articles;
CREATE TRIGGER articles_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, excerpt, body ON articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();

-- ── blog_posts: full-text search_vector ──────────────────────
CREATE OR REPLACE FUNCTION blog_posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(
      regexp_replace(NEW.body, '<[^>]*>', ' ', 'g'), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_search_vector_trigger ON blog_posts;
CREATE TRIGGER blog_posts_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, excerpt, body ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION blog_posts_search_vector_update();

-- ── projects: full-text search_vector ────────────────────────
CREATE OR REPLACE FUNCTION projects_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(
      regexp_replace(NEW.description, '<[^>]*>', ' ', 'g'), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_search_vector_trigger ON projects;
CREATE TRIGGER projects_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, short_description, description ON projects
  FOR EACH ROW EXECUTE FUNCTION projects_search_vector_update();

-- ── faq_entries: full-text search_vector ─────────────────────
CREATE OR REPLACE FUNCTION faq_entries_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.question, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(
      regexp_replace(NEW.answer, '<[^>]*>', ' ', 'g'), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS faq_entries_search_vector_trigger ON faq_entries;
CREATE TRIGGER faq_entries_search_vector_trigger
  BEFORE INSERT OR UPDATE OF question, answer ON faq_entries
  FOR EACH ROW EXECUTE FUNCTION faq_entries_search_vector_update();

-- ── school_sessions: full-text search_vector ─────────────────
CREATE OR REPLACE FUNCTION school_sessions_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.school_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS school_sessions_search_vector_trigger ON school_sessions;
CREATE TRIGGER school_sessions_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, school_name, description ON school_sessions
  FOR EACH ROW EXECUTE FUNCTION school_sessions_search_vector_update();

-- ── Partial indexes for soft-deleted content (BackendSchema §15.2) ──
CREATE INDEX IF NOT EXISTS articles_active_idx
  ON articles (status, published_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS blog_posts_active_idx
  ON blog_posts (status, published_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS projects_active_idx
  ON projects (status, sort_order) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS school_sessions_active_idx
  ON school_sessions (session_date DESC) WHERE deleted_at IS NULL;

-- ── Backfill search_vector for any pre-existing rows ─────────
UPDATE articles SET title = title WHERE search_vector IS NULL;
UPDATE blog_posts SET title = title WHERE search_vector IS NULL;
UPDATE projects SET title = title WHERE search_vector IS NULL;
UPDATE faq_entries SET question = question WHERE search_vector IS NULL;
UPDATE school_sessions SET title = title WHERE search_vector IS NULL;
