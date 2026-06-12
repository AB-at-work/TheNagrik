# Database Entity-Relationship Diagram
## **THE NAGRIK** — Civic Literacy Initiative

This diagram visualizes the relationships between the core entities in the PostgreSQL database as defined by the backend schema.

```mermaid
erDiagram
    %% Core Entities
    users {
        uuid id PK
        varchar email
        varchar password_hash
        varchar full_name
        varchar role
        boolean is_active
        timestamp created_at
    }

    refresh_tokens {
        uuid id PK
        uuid user_id FK
        varchar token_hash
        timestamp expires_at
    }

    categories {
        uuid id PK
        varchar name
        varchar slug
        varchar icon_name
        integer display_order
    }

    articles {
        uuid id PK
        varchar title
        varchar slug
        uuid category_id FK
        uuid author_id FK
        text body_html
        varchar status
        timestamp published_at
    }

    blog_posts {
        uuid id PK
        varchar title
        varchar slug
        uuid author_id FK
        text body_html
        jsonb tags
        varchar status
        timestamp published_at
    }

    projects {
        uuid id PK
        varchar title
        varchar slug
        varchar status
        text description
        varchar cta_text
        varchar cta_url
    }

    school_sessions {
        uuid id PK
        varchar school_name
        varchar location
        date session_date
        integer students_reached
    }

    session_photos {
        uuid id PK
        uuid session_id FK
        varchar image_url
        integer display_order
    }

    team_members {
        uuid id PK
        varchar name
        varchar role
        integer display_order
    }

    faq_entries {
        uuid id PK
        varchar question
        text answer
        varchar category
        integer display_order
    }

    contact_submissions {
        uuid id PK
        varchar name
        varchar email
        varchar subject
        varchar status
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar entity_type
        uuid entity_id
        jsonb changes
        timestamp created_at
    }

    media_files {
        uuid id PK
        uuid uploaded_by FK
        varchar file_name
        varchar file_url
        varchar file_type
    }

    %% Relationships
    users ||--o{ refresh_tokens : "has"
    users ||--o{ articles : "writes"
    users ||--o{ blog_posts : "writes"
    users ||--o{ audit_logs : "performs"
    users ||--o{ media_files : "uploads"
    
    categories ||--o{ articles : "categorizes"
    
    school_sessions ||--o{ session_photos : "contains"
```

## Key Architectural Notes:
1. **Soft Deletes:** `articles`, `blog_posts`, `projects`, and `school_sessions` contain a `deleted_at` column.
2. **Auditability:** Every mutation made by a `user` triggers a record in `audit_logs`.
3. **Roles:** `users.role` is an enum (`super_admin`, `admin`, `editor`).
4. **Searchability:** Content tables contain a `search_vector` (`tsvector`) column for PostgreSQL full-text search.
