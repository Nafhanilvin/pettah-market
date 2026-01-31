# System Architecture

## Overview

Pettah Market is built with a modern three-tier architecture:

1. **Frontend (Next.js)** - User interface and client-side logic
2. **Backend (Express.js)** - RESTful API and business logic
3. **Database (MongoDB)** - Data persistence

## Architecture Diagram

```
┌─────────────────────────────────────┐
│       Client Browser                │
│  (Next.js Frontend Application)     │
└────────────────┬────────────────────┘
                 │ HTTP/HTTPS
                 ▼
┌─────────────────────────────────────┐
│    Express.js Backend API           │
│  - Authentication                   │
│  - Business Logic                   │
│  - Data Validation                  │
└────────────────┬────────────────────┘
                 │ MongoDB Driver
                 ▼
┌─────────────────────────────────────┐
│    MongoDB Atlas Database           │
│  - Users                            │
│  - Shops                            │
│  - Products                         │
│  - Reviews                          │
└─────────────────────────────────────┘
```

## Frontend Architecture

- **Pages:** Route-based components (Next.js App Router)
- **Components:** Reusable UI components
- **Services:** API client functions
- **Store:** Global state management
- **Styles:** TailwindCSS utilities

## Backend Architecture

- **Routes:** API endpoint definitions
- **Controllers:** Request handlers
- **Models:** MongoDB schemas
- **Middlewares:** Authentication, validation, error handling
- **Services:** Business logic
- **Utils:** Helper functions

## Database Design

- **Collections:** Users, Shops, Products, Reviews, Categories
- **Relationships:** One-to-many and many-to-many relationships
- **Indexing:** For optimized queries

See [DATABASE.md](./DATABASE.md) for detailed schema.
