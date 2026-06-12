# API Contract Document
## **THE NAGRIK** — Civic Literacy Initiative
### API Specification v1.0

This document serves as the source of truth for the contract between the frontend (Next.js) and the backend (Express) applications.

### Architectural Rule: Strict Versioning
All API endpoints MUST be prefixed with the version number (e.g., `/api/v1/`). Never expose unversioned APIs.

---

## 1. Authentication APIs

### 1.1 Login
`POST /api/v1/auth/login`

**Description:** Authenticates a user and returns an access token. Sets a refresh token in an HTTP-only cookie.

**Request Body:**
```json
{
  "email": "admin@thenagrik.org",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "uuid-v7",
      "name": "Admin User",
      "email": "admin@thenagrik.org",
      "role": "super_admin"
    }
  }
}
```

**Errors:**
- `400 Bad Request`: Invalid email/password format.
- `401 Unauthorized`: Incorrect email or password.
- `403 Forbidden`: Account locked due to too many failed attempts.
- `500 Internal Server Error`: Server error.

### 1.2 Refresh Token
`POST /api/v1/auth/refresh`

**Description:** Rotates the refresh token and issues a new access token.

**Request Cookies:**
`refreshToken=eyJhbGci...`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1..."
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid or expired refresh token.

### 1.3 Logout
`POST /api/v1/auth/logout`

**Description:** Revokes the refresh token and clears the cookie.

**Request Headers:**
`Authorization: Bearer <accessToken>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. Public Content APIs

### 2.1 Get Published Articles
`GET /api/v1/articles`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `category` (string, optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "understanding-fundamental-rights",
      "title": "Understanding Fundamental Rights",
      "excerpt": "A brief overview of part III of the Constitution.",
      "featured_image_url": "https://media.thenagrik.org/...",
      "category": { "id": "uuid", "name": "Constitution", "slug": "constitution" },
      "author": { "name": "Jane Doe" },
      "reading_time_minutes": 5,
      "published_at": "2026-06-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "last_page": 5
  }
}
```

### 2.2 Get Single Article
`GET /api/v1/articles/:slug`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "understanding-fundamental-rights",
    "title": "Understanding Fundamental Rights",
    "body_html": "<p>Content here...</p>",
    "featured_image_url": "https://media.thenagrik.org/...",
    "meta_title": "Fundamental Rights | The Nagrik",
    "meta_description": "Learn about the fundamental rights guaranteed by the Indian Constitution.",
    "category": { "name": "Constitution", "slug": "constitution" },
    "author": { "name": "Jane Doe", "bio": "Legal scholar..." },
    "reading_time_minutes": 5,
    "published_at": "2026-06-01T12:00:00Z"
  }
}
```
**Errors:**
- `404 Not Found`: Article not found or not published.

### 2.3 Unified Search
`GET /api/v1/search?q={query}`

**Description:** Performs full-text search across articles, blog posts, projects, and FAQs.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "type": "article",
      "id": "uuid",
      "slug": "article-slug",
      "title": "Matched Article Title",
      "excerpt": "Snippet with match..."
    }
  ]
}
```

---

## 3. Public Forms APIs

### 3.1 Submit Contact Form
`POST /api/v1/contact`

**Request Body:**
```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "subject": "Partnership",
  "message": "We would like to partner with The Nagrik...",
  "turnstile_token": "0.xx_..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```
**Errors:**
- `400 Bad Request`: Invalid turnstile token.
- `422 Unprocessable Entity`: Validation errors (e.g., invalid email).
- `429 Too Many Requests`: Rate limit exceeded.

---

## 4. Admin APIs (Requires Auth)

### 4.1 Create Article
`POST /api/v1/admin/articles`

**Request Headers:**
`Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "title": "New Article Draft",
  "category_id": "uuid",
  "body_html": "<p>Draft content</p>",
  "featured_image_url": "https://...",
  "status": "draft",
  "meta_title": "New Article",
  "meta_description": "Description here"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "slug": "new-article-draft",
    "title": "New Article Draft",
    "status": "draft"
  }
}
```
**Errors:**
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Insufficient role (e.g., editor attempting admin action).
- `422 Unprocessable Entity`: Missing required fields.

### 4.2 Update Article Status
`PATCH /api/v1/admin/articles/:id/status`

**Request Headers:**
`Authorization: Bearer <accessToken>`

**Request Body:**
```json
{
  "status": "published"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "published",
    "published_at": "2026-06-07T10:00:00Z"
  }
}
```

### 4.3 Upload Media
`POST /api/v1/admin/media`

**Description:** Uploads a file, converts to WebP (if image), and saves to R2.
**Accepted Formats:** `jpg`, `jpeg`, `png`, `webp`, `pdf`
**Max Size:** `10MB`

**Request Headers:**
`Authorization: Bearer <accessToken>`
`Content-Type: multipart/form-data`

**Request Body:**
- `file`: (Binary File)

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "url": "https://media.thenagrik.org/...",
    "width": 1200,
    "height": 800,
    "format": "webp"
  }
}
```
**Errors:**
- `413 Payload Too Large`: File exceeds 10MB limit.
- `415 Unsupported Media Type`: Invalid file format.

*(Note: Similar endpoint structures apply to Blog, Projects, Schools, Team, and FAQ)*
