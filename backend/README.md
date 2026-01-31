# Pettah Market - Backend API

Node.js/Express backend API for Pettah Market

## Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment variables
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB Atlas URI and JWT secret

4. Run development server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── models/          # MongoDB schemas
├── routes/          # API routes
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Helper functions
├── server.js        # Entry point
└── package.json
```

## API Endpoints

See [API.md](../docs/API.md) for detailed endpoint documentation.
