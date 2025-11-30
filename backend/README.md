# MCU Redefined Backend API

A modern, async FastAPI backend for the MCU Redefined platform.

## Features

- ✨ **Async FastAPI** - High-performance async API framework
- 🗃️ **Dual Database Support** - Turso (SQLite) for content, PostgreSQL for users
- 📦 **Modular Architecture** - Clean separation of concerns
- 🔐 **Authentication** - Admin-only routes with token validation
- 💾 **Caching** - In-memory caching for improved performance
- ☁️ **Cloud Storage** - Cloudflare R2 for image uploads
- 📝 **Pydantic Validation** - Request/response validation with Pydantic v2
- 📊 **OTEL Logging** - OpenTelemetry-compatible structured JSON logging

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Application settings
│   │   ├── database.py      # Database connections
│   │   ├── cache.py         # Caching utilities
│   │   ├── storage.py       # R2 storage client
│   │   ├── dependencies.py  # FastAPI dependencies
│   │   ├── logging.py       # OTEL-compatible logging
│   │   └── middleware.py    # Request logging middleware
│   ├── models/
│   │   ├── __init__.py
│   │   ├── content.py       # Blog, Review, Timeline models
│   │   └── user.py          # User, Session, Like models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── content.py       # Content Pydantic schemas
│   │   └── user.py          # User Pydantic schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── base.py          # Base service class
│   │   ├── blog.py          # Blog operations
│   │   ├── review.py        # Review operations
│   │   ├── timeline.py      # Timeline operations
│   │   └── user.py          # User operations
│   └── routers/
│       ├── __init__.py
│       ├── blogs.py         # Blog API routes
│       ├── reviews.py       # Review API routes
│       ├── timeline.py      # Timeline API routes
│       └── users.py         # User API routes
├── run.py                   # Server entry point
├── requirements.txt
└── .env
```

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Server

### Development
```bash
python run.py
```

Or with uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 4000
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 4000 --workers 4
```

## API Endpoints

### Blogs
- `GET /blogs` - List blogs (paginated)
- `GET /blogs/{id}` - Get blog by ID
- `GET /blogs/latest` - Get latest 3 blogs
- `GET /blogs/recent` - Get most recent blog
- `GET /blogs/search` - Search blogs
- `GET /blogs/tags` - Get all tags
- `GET /blogs/authors` - Get all authors
- `POST /blogs/create` - Create blog (admin)
- `PUT /blogs/update/{id}` - Update blog (admin)
- `DELETE /blogs/{id}` - Delete blog (admin)

### Reviews
- `GET /reviews` - List reviews (paginated)
- `GET /reviews/{id}` - Get review by ID
- `GET /reviews/latest` - Get latest 3 reviews
- `GET /reviews/search` - Search reviews
- `GET /reviews/tags` - Get all tags
- `GET /reviews/authors` - Get all authors
- `POST /reviews/create` - Create review (admin)
- `PUT /reviews/update/{id}` - Update review (admin)
- `DELETE /reviews/{id}` - Delete review (admin)

### Timeline
- `GET /release-slate` - Get all projects
- `GET /release-slate/{id}` - Get project by ID
- `GET /release-slate/phase/{phase}` - Get projects by phase

### User
- `POST /user/liked` - Get user's liked content
- `POST /user/liked/authors` - Get authors from liked content
- `POST /user/liked/tags` - Get tags from liked content
- `POST /user/liked/search` - Search liked content

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:4000/docs
- ReDoc: http://localhost:4000/redoc

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | MCU Redefined API |
| `APP_VERSION` | API version | 2.0.0 |
| `DEBUG` | Debug mode | False |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | INFO |
| `TURSO_DATABASE_URL` | Turso database URL | - |
| `TURSO_AUTHTOKEN` | Turso auth token | - |
| `PG_DB_HOST` | PostgreSQL host | localhost |
| `PG_DB_PORT` | PostgreSQL port | 5432 |
| `PG_DB_NAME` | PostgreSQL database name | mcu_redefined |
| `PG_DB_USER` | PostgreSQL user | postgres |
| `PG_DB_PASSWORD` | PostgreSQL password | - |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | - |
| `R2_ACCESS_KEY_ID` | R2 access key | - |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | - |
| `R2_BUCKET_NAME` | R2 bucket name | mcuredefined |
| `R2_PUBLIC_URL` | R2 public URL | - |

## Logging

The application uses OTEL-compatible structured JSON logging. Set `LOG_LEVEL=DEBUG` for detailed debugging information including:
- Request/response tracing with trace IDs
- Database operations
- Image processing steps
- Authentication flow

Example log output:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "severityText": "INFO",
  "severityNumber": 9,
  "body": "Request completed: POST /blogs/create - 201",
  "traceId": "abc123...",
  "spanId": "def456...",
  "attributes": {
    "http.method": "POST",
    "http.route": "/blogs/create",
    "http.status_code": 201,
    "duration_ms": 150.5
  }
}
```
