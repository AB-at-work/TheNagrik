# Content Model Document
## **THE NAGRIK** — Civic Literacy Initiative

This document defines the exact CMS fields for all content types managed in the Admin Panel.

---

## 1. Article (Learn Section)
Educational, long-form content.

| Field | Type | Required | Description |
|---|---|---|---|
| `Title` | String | Yes | Main headline (H1) |
| `Slug` | String | Yes | URL identifier (auto-generated) |
| `Category` | Relation | Yes | Reference to Category entity |
| `Author` | Relation | Yes | Reference to User (Team Member) |
| `Featured Image`| File | Yes | Main article image (R2 URL) |
| `Excerpt` | Text | Yes | Short summary for cards |
| `Body` | Rich Text (HTML)| Yes | Main content from Tiptap editor |
| `SEO Title` | String | No | Meta title (defaults to Title) |
| `SEO Description`| Text | No | Meta description (defaults to Excerpt) |
| `Status` | Enum | Yes | `draft`, `published`, `archived` |
| `Published Date` | Timestamp | No | Auto-set on first publish |

## 2. Blog Post
Updates, opinions, and news.

| Field | Type | Required | Description |
|---|---|---|---|
| `Title` | String | Yes | Main headline |
| `Slug` | String | Yes | URL identifier |
| `Author` | Relation | Yes | Reference to User |
| `Featured Image`| File | No | Optional cover image |
| `Excerpt` | Text | Yes | Short summary |
| `Body` | Rich Text (HTML)| Yes | Main content |
| `Tags` | Array[String] | No | Keywords for filtering (e.g., ["news", "event"]) |
| `SEO Title` | String | No | Meta title |
| `SEO Description`| Text | No | Meta description |
| `Status` | Enum | Yes | `draft`, `published`, `archived` |
| `Published Date` | Timestamp | No | Auto-set on first publish |

## 3. Project
Current and past organizational initiatives.

| Field | Type | Required | Description |
|---|---|---|---|
| `Title` | String | Yes | Project name |
| `Slug` | String | Yes | URL identifier |
| `Status` | Enum | Yes | `planned`, `active`, `completed` |
| `Description` | Rich Text | Yes | Full project description |
| `Featured Image`| File | Yes | Cover image |
| `CTA Text` | String | No | e.g., "Volunteer for this" |
| `CTA URL` | String | No | Link for the CTA button |

## 4. School Session
Records of physical outreach programs.

| Field | Type | Required | Description |
|---|---|---|---|
| `School Name` | String | Yes | Name of the institution |
| `Location` | String | Yes | City, State or Region |
| `Session Date` | Date | Yes | When the session occurred |
| `Students Reached`| Number | Yes | Impact metric |
| `Description` | Text | No | Brief notes on the session |
| `Photos` | Array[File] | No | 1-10 images from the session |

## 5. Team Member
Profiles for the About page.

| Field | Type | Required | Description |
|---|---|---|---|
| `Name` | String | Yes | Full name |
| `Role` | String | Yes | E.g., "Founder", "Legal Head" |
| `Bio` | Text | No | Short biography |
| `Profile Photo` | File | Yes | Headshot |
| `LinkedIn URL` | String | No | Social link |
| `Twitter URL` | String | No | Social link |
| `Display Order` | Number | Yes | Used for sorting on About page |

## 6. FAQ
Frequently asked questions.

| Field | Type | Required | Description |
|---|---|---|---|
| `Question` | String | Yes | The question |
| `Answer` | Rich Text | Yes | The answer (supports basic formatting/links) |
| `Category` | String | Yes | E.g., "General", "Volunteering" |
| `Display Order` | Number | Yes | Used for sorting within category |
