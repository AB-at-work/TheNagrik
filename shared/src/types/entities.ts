/**
 * Entity & DTO types shared across client and server.
 *
 * Server-side, Drizzle infers row types directly from the schema; these are the
 * serialized (JSON, ISO-8601 dates) shapes the API returns and the client
 * consumes. They follow BackendSchema_TheNagrik.md §4 column definitions and
 * APIContract_TheNagrik.md response payloads.
 */

import type {
  ContentStatus,
  ProjectStatus,
  ContactSubject,
  ContactStatus,
  VolunteerStatus,
  VolunteerOccupation,
  VolunteerInterest,
  NewsletterStatus,
  SettingType,
  SettingGroup,
  SearchResultType,
  UserRole,
  UserStatus,
} from './enums.js';

/** ISO-8601 timestamp string (UTC). */
export type ISODateString = string;

// ── Users ─────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ── Categories ────────────────────────────────────────────────

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  articleCount?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ── Articles ──────────────────────────────────────────────────

export interface AuthorRef {
  id?: string;
  name: string;
  bio?: string | null;
}

export interface CategoryRef {
  id?: string;
  name: string;
  slug: string;
}

/** Lightweight shape used in listing/cards. */
export interface ArticleCardDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  category: CategoryRef;
  author: AuthorRef;
  readingTimeMinutes: number | null;
  publishedAt: ISODateString | null;
}

/** Full article detail. */
export interface ArticleDTO extends ArticleCardDTO {
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  status: ContentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ── Blog ──────────────────────────────────────────────────────

export interface BlogPostCardDTO {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  tags: string[];
  category: CategoryRef | null;
  author: AuthorRef;
  readingTimeMinutes: number | null;
  publishedAt: ISODateString | null;
}

export interface BlogPostDTO extends BlogPostCardDTO {
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  status: ContentStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ── Projects ──────────────────────────────────────────────────

export interface ProjectDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  status: ProjectStatus;
  ctaText: string | null;
  ctaUrl: string | null;
  startDate: ISODateString | null;
  endDate: ISODateString | null;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ── Schools ───────────────────────────────────────────────────

export interface SessionPhotoDTO {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string;
  sortOrder: number;
}

export interface SchoolSessionDTO {
  id: string;
  title: string;
  slug: string;
  schoolName: string;
  sessionDate: ISODateString;
  description: string | null;
  studentCount: number | null;
  city: string | null;
  state: string | null;
  sortOrder: number;
  photos: SessionPhotoDTO[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ── Team & principles ─────────────────────────────────────────

export interface TeamMemberDTO {
  id: string;
  name: string;
  roleTitle: string;
  bio: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  email: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CorePrincipleDTO {
  id: string;
  title: string;
  description: string;
  iconName: string | null;
  sortOrder: number;
}

// ── FAQ ───────────────────────────────────────────────────────

export interface FaqEntryDTO {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export interface FaqGroupDTO {
  category: string;
  items: FaqEntryDTO[];
}

// ── Media ─────────────────────────────────────────────────────

export interface MediaFileDTO {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string;
  createdAt: ISODateString;
}

// ── Forms ─────────────────────────────────────────────────────

export interface ContactSubmissionDTO {
  id: string;
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  status: ContactStatus;
  readAt: ISODateString | null;
  createdAt: ISODateString;
}

export interface VolunteerRegistrationDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number;
  city: string;
  state: string | null;
  occupation: VolunteerOccupation;
  interests: VolunteerInterest[];
  motivation: string | null;
  status: VolunteerStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface NewsletterSubscriberDTO {
  id: string;
  email: string;
  status: NewsletterStatus;
  subscribedAt: ISODateString;
  unsubscribedAt: ISODateString | null;
}

// ── Settings ──────────────────────────────────────────────────

export interface SettingDTO {
  key: string;
  value: string;
  type: SettingType;
  group: SettingGroup;
  label: string | null;
  description: string | null;
  updatedAt: ISODateString;
}

/** Public settings are returned as a flat key→value map. */
export type PublicSettings = Record<string, string>;

// ── Audit ─────────────────────────────────────────────────────

export interface AuditLogDTO {
  id: string;
  userId: string | null;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityTitle: string | null;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  ipAddress: string | null;
  createdAt: ISODateString;
}

// ── Dashboard ─────────────────────────────────────────────────

export interface DashboardStats {
  totalArticles: number;
  totalBlogPosts: number;
  totalProjects: number;
  totalSubscribers: number;
  unreadMessages: number;
  newVolunteers: number;
}

// ── Search ────────────────────────────────────────────────────

export interface SearchResultDTO {
  type: SearchResultType;
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  section: string;
}
