# Pettah Market - Backend API

Node.js/Express backend API for Pettah Market

## Setup

### Fastest (Docker + one command)

Prerequisite: Docker Desktop must be installed and running.

1. Install dependencies
```bash
npm install
```

2. Run full local setup (MySQL container + schema + seed)
```bash
npm run setup:docker
```

If Docker is not available, use `npm run setup:easy` with your own local MySQL.

3. Start API
```bash
npm run dev
```

---

### Manual setup (if you already have MySQL)

1. Install dependencies
```bash
npm install
```

2. Configure environment variables
```bash
cp .env.example .env
```

3. Update `.env` with your MySQL connection URL and JWT secret
	 - Example local database URL:
		 - `DATABASE_URL=mysql://root:password@localhost:3306/pettah_market`
	 - Create the database first:
		 - `CREATE DATABASE pettah_market;`

4. Generate Prisma client, apply schema, and seed starter data
```bash
npm run prisma:generate
npm run prisma:push
npm run db:seed
```

5. Run development server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Seeded default admin

- Email: `admin@pettahmarket.com`
- Password: `admin123`

## Database Strategy

- **Current:** MySQL + Prisma ORM for relational data and typed queries.
- **Scaling:** Move from local MySQL to managed MySQL by changing `DATABASE_URL` only.

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── prisma/          # Prisma schema and migrations
├── routes/          # API routes
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Helper functions
├── server.js        # Entry point
└── package.json
```

## API Endpoints

See [API.md](../docs/API.md) for detailed endpoint documentation.
