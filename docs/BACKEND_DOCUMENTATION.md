# Pettah Market - Backend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [Architecture](#architecture)
5. [Authentication System](#authentication-system)
6. [API Endpoints](#api-endpoints)
7. [Database Models](#database-models)
8. [Middleware](#middleware)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Deployment](#deployment)

---

## Project Overview

**Pettah Market Backend** is a RESTful API built with Node.js and Express.js that powers the Pettah Market virtual marketplace platform. It handles:
- User authentication and authorization
- Shop and product management
- Search and filtering
- Reviews and ratings
- Data persistence with MongoDB

**Tech Stack:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** Joi
- **Environment:** dotenv

---

## Project Structure

```
backend/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection (to be created)
│   └── constants.js     # App constants
├── controllers/         # Business logic & request handlers
│   ├── authController.js       # Authentication logic
│   ├── shopController.js       # Shop operations (to be created)
│   ├── productController.js    # Product operations (to be created)
│   └── reviewController.js     # Review operations (to be created)
├── models/              # MongoDB Mongoose schemas
│   ├── User.js          # User schema
│   ├── Shop.js          # Shop schema (to be created)
│   ├── Product.js       # Product schema (to be created)
│   ├── Review.js        # Review schema (to be created)
│   └── Category.js      # Category schema (to be created)
├── routes/              # API route definitions
│   ├── authRoutes.js    # Auth endpoints
│   ├── shopRoutes.js    # Shop endpoints (to be created)
│   ├── productRoutes.js # Product endpoints (to be created)
│   └── reviewRoutes.js  # Review endpoints (to be created)
├── middleware/          # Custom middleware functions
│   ├── auth.js          # JWT verification middleware
│   ├── errorHandler.js  # Error handling (to be created)
│   └── validation.js    # Request validation (to be created)
├── utils/               # Utility & helper functions
│   ├── jwt.js           # JWT token generation/verification
│   ├── validation.js    # Input validation schemas
│   └── logger.js        # Logging utility (to be created)
├── services/            # Business logic services (to be created)
│   ├── authService.js
│   ├── shopService.js
│   └── productService.js
├── .env                 # Environment variables (local)
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── server.js            # Entry point / Server initialization
├── package.json         # Project dependencies
└── package-lock.json    # Locked dependency versions
```

---

## Setup Instructions

### Prerequisites
- Node.js v14+ installed
- npm or yarn package manager
- MongoDB Atlas account (free tier available)
- Git installed
- Code editor (VS Code recommended)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Nafhanilvin/pettah-market.git
cd pettah-market/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `joi` - Input validation
- `cors` - Cross-Origin Resource Sharing
- `nodemon` - Development auto-reload
- `axios` - HTTP client

### Step 3: Configure MongoDB

1. **Create MongoDB Atlas Account:**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)

2. **Create a Cluster:**
   - Click "Build a Database"
   - Select M0 Sandbox (free)
   - Choose region
   - Create cluster (takes ~3 minutes)

3. **Create Database User:**
   - Go to "Database Access"
   - "Add New Database User"
   - Username: `pettah_user`
   - Auto-generate secure password
   - Copy password somewhere safe
   - Click "Add User"

4. **Configure Network Access:**
   - Go to "Network Access"
   - "Add IP Address"
   - "Allow Access from Anywhere" (for development)

5. **Get Connection String:**
   - Go to Clusters → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Example: `mongodb+srv://pettah_user:PASSWORD@cluster.mongodb.net/pettah-market?retryWrites=true&w=majority`

### Step 4: Create .env File
```bash
cp .env.example .env
```

Edit `.env` and update:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pettah-market?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Step 5: Run Development Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
🔧 Environment: development
```

---

## Architecture

### Request Flow Diagram

```
HTTP Request
    ↓
Express Middleware (CORS, JSON parser)
    ↓
Route Handler (routes/*.js)
    ↓
Controller (controllers/*.js) - Validation & Business Logic
    ↓
Service/Model (models/*.js, services/*.js)
    ↓
MongoDB Database
    ↓
Response (JSON)
```

### Design Pattern: MVC (Model-View-Controller)

- **Models** - Database schemas and data structure
- **Controllers** - Handle requests and business logic
- **Routes** - Define API endpoints
- **Services** - Reusable business logic (future)
- **Middleware** - Process requests before controllers

---

## Authentication System

### How It Works

```
1. User Registration
   ├─ Receive email, password, name
   ├─ Validate input with Joi
   ├─ Check if user exists
   ├─ Hash password with bcryptjs (salt rounds: 10)
   ├─ Save user to MongoDB
   └─ Return user data + JWT token

2. User Login
   ├─ Receive email, password
   ├─ Find user in database
   ├─ Compare password with hash (bcryptjs)
   ├─ If valid, generate tokens
   ├─ Return accessToken & refreshToken
   └─ Token includes userId and expiration

3. Protected Route Access
   ├─ Client sends request with Authorization header
   ├─ Authorization: Bearer <token>
   ├─ Middleware verifies token signature
   ├─ Extract userId from token
   ├─ If valid, proceed to controller
   └─ If invalid/expired, return 401 error

4. Token Refresh
   ├─ Client sends refreshToken
   ├─ Server verifies refreshToken
   ├─ Generate new accessToken
   └─ Return new accessToken
```

### Token Structure

**Access Token (1 hour expiry):**
```javascript
{
  userId: "507f1f77bcf86cd799439011",  // MongoDB user ID
  type: "access",
  iat: 1675000000,                      // Issued at
  exp: 1675003600                       // Expires in 1 hour
}
```

**Refresh Token (7 days expiry):**
```javascript
{
  userId: "507f1f77bcf86cd799439011",
  type: "refresh",
  iat: 1675000000,
  exp: 1675604400                       // Expires in 7 days
}
```

### Key Security Features

1. **Password Hashing:**
   - Using bcryptjs with 10 salt rounds
   - Passwords never stored in plain text
   - Passwords never returned in API responses

2. **JWT Tokens:**
   - Signed with secret key
   - Include expiration times
   - Cannot be modified without secret key
   - Stateless authentication (no session database needed)

3. **CORS Protection:**
   - Only allow requests from frontend origin
   - Prevents unauthorized domain access

4. **Input Validation:**
   - Joi schema validation
   - Email format verification
   - Password strength requirements
   - Field type checking

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 1. Authentication Endpoints

#### Register User
```http
POST /auth/register

Request Body:
{
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "CUSTOMER"  // or "SHOP_OWNER"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "CUSTOMER",
      "emailVerified": false,
      "isActive": true,
      "createdAt": "2024-01-31T10:00:00.000Z",
      "updatedAt": "2024-01-31T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Responses:
- 400: Validation failed (invalid email, weak password, etc.)
- 409: User already exists with that email
- 500: Server error
```

#### Login User
```http
POST /auth/login

Request Body:
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Responses:
- 400: Validation failed
- 401: Invalid email or password
- 500: Server error
```

#### Get User Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "User profile retrieved",
  "data": { ... user object ... }
}

Error Responses:
- 401: No token provided or token invalid/expired
- 404: User not found
- 500: Server error
```

#### Update User Profile (Protected)
```http
PUT /auth/profile
Authorization: Bearer <accessToken>

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+94701234567",
  "address": {
    "street": "123 Main Street",
    "city": "Colombo",
    "district": "Western",
    "postalCode": "00100"
  }
}

Response (200 OK):
{
  "success": true,
  "message": "User profile updated successfully",
  "data": { ... updated user object ... }
}

Error Responses:
- 401: Unauthorized
- 404: User not found
- 500: Server error
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "User logged out successfully"
}
```

#### Refresh Token
```http
POST /auth/refresh-token

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Responses:
- 400: Refresh token required
- 401: Invalid refresh token
- 500: Server error
```

### 2. Health Check
```http
GET /health

Response (200 OK):
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-31T10:00:00.000Z"
}
```

---

## Database Models

### User Model

**File:** `backend/models/User.js`

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  email: String,              // Unique email
  password: String,           // Hashed password
  firstName: String,          // First name
  lastName: String,           // Last name
  phone: String,              // Phone number (optional)
  profileImage: String,       // Profile picture URL (optional)
  userType: String,           // "CUSTOMER" or "SHOP_OWNER"
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String
  },
  isActive: Boolean,          // Account active status
  emailVerified: Boolean,     // Email verification status
  createdAt: Date,            // Account creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

**Key Methods:**
```javascript
// Compare password
await user.comparePassword(enteredPassword)
// Returns: true/false

// Get public user data (excludes password)
user.toJSON()
// Returns: user object without password
```

**Validations:**
- Email: Required, unique, valid email format
- Password: Required, minimum 6 characters
- First Name: Required, trimmed
- Last Name: Required, trimmed
- User Type: Must be "CUSTOMER" or "SHOP_OWNER"

---

## Middleware

### Authentication Middleware (`middleware/auth.js`)

```javascript
authMiddleware
├─ Extracts token from Authorization header
├─ Verifies token signature using JWT_SECRET
├─ Attaches user data (userId) to req.user
├─ Returns 401 if token missing/invalid/expired
└─ Calls next() if valid

shopOwnerMiddleware
└─ Verifies user is shop owner (future implementation)

adminMiddleware
└─ Verifies user is admin (future implementation)
```

**Usage in Routes:**
```javascript
// Public route
router.post('/login', authController.login);

// Protected route
router.get('/profile', authMiddleware, authController.getProfile);
```

---

## Error Handling

### Error Response Format

All errors follow this standard format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "error details (only in development)"
}
```

### HTTP Status Codes Used

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, POST, PUT |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 409 | Conflict | Email already exists |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected error |

### Common Error Scenarios

**1. Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token",
  "error": "..."
}
```
→ **Fix:** Ensure token is correct and not expired

**2. MongoDB Connection Failed:**
```
❌ MongoDB connection failed: Error details
```
→ **Fix:** Check MongoDB URI in .env

**3. Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {"field": "email", "message": "Email must be valid"},
    {"field": "password", "message": "Password must be at least 6 characters"}
  ]
}
```
→ **Fix:** Check input data format

---

## Testing

### Using REST Client Extension (VS Code)

1. Install "REST Client" extension by Huachao Mao
2. Create `test.http` in backend folder:

```http
### Health Check
GET http://localhost:5000/api/health

### Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "CUSTOMER"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

### Get Profile
GET http://localhost:5000/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Update Profile
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "phone": "+94701234567",
  "address": {
    "city": "Colombo"
  }
}

### Refresh Token
POST http://localhost:5000/api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Click "Send Request" above each request to test.

### Using Postman

1. Download Postman from postman.com
2. Import or create requests manually
3. Set Authorization header: `Bearer <token>`
4. Test each endpoint

### Using cURL (Command Line)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Profile (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

---

## Environment Variables

Create a `.env` file with these variables:

```bash
# Server Configuration
PORT=5000                              # Server port
NODE_ENV=development                   # Environment: development or production

# Database Configuration
MONGODB_URI=mongodb+srv://...          # MongoDB connection string

# Authentication
JWT_SECRET=your_secret_key_here        # Secret for signing JWT tokens
JWT_EXPIRE=7d                          # Token expiration time

# CORS
CORS_ORIGIN=http://localhost:3000      # Frontend URL for CORS
```

**Important:** Never commit `.env` to Git. Use `.env.example` as template.

---

## Deployment

### Production Checklist

Before deploying to production:

1. **Update Environment Variables:**
   ```bash
   NODE_ENV=production
   JWT_SECRET=<use_strong_random_string>
   MONGODB_URI=<production_db_uri>
   CORS_ORIGIN=<your_frontend_domain>
   ```

2. **Security:**
   - Change default JWT_SECRET to random string (32+ chars)
   - Enable MongoDB IP whitelist (only your server)
   - Use HTTPS for all connections
   - Set secure CORS origin

3. **Database:**
   - Use MongoDB production cluster (not free tier)
   - Enable backups
   - Configure monitoring

4. **Server:**
   - Use process manager (PM2, systemd)
   - Set up logging
   - Configure error monitoring (Sentry, etc.)

### Deploy to DigitalOcean

1. Create Droplet (Ubuntu 20.04)
2. SSH into server
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Clone repository:
   ```bash
   git clone https://github.com/Nafhanilvin/pettah-market.git
   cd pettah-market/backend
   ```
5. Install dependencies:
   ```bash
   npm install --production
   ```
6. Set up PM2:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "pettah-market"
   pm2 startup
   pm2 save
   ```
7. Configure reverse proxy (Nginx)
8. Set up SSL with Let's Encrypt

---

## File Descriptions

### Core Files

| File | Purpose |
|------|---------|
| `server.js` | Application entry point, Express setup, MongoDB connection |
| `package.json` | Project metadata, dependencies, scripts |
| `.env` | Local environment variables (not in Git) |
| `.env.example` | Template for environment variables |

### Controllers (`controllers/`)

| File | Purpose |
|------|---------|
| `authController.js` | Handles register, login, profile operations |

### Models (`models/`)

| File | Purpose |
|------|---------|
| `User.js` | User data schema and methods |

### Routes (`routes/`)

| File | Purpose |
|------|---------|
| `authRoutes.js` | Authentication endpoints definitions |

### Middleware (`middleware/`)

| File | Purpose |
|------|---------|
| `auth.js` | JWT verification and authorization |

### Utils (`utils/`)

| File | Purpose |
|------|---------|
| `jwt.js` | JWT token generation and verification |
| `validation.js` | Joi schemas for input validation |

---

## Key Concepts

### RESTful API Principles

- **GET** - Retrieve data
- **POST** - Create new data
- **PUT** - Update existing data
- **DELETE** - Remove data

**Example:**
```
POST   /api/auth/register    → Create new user
GET    /api/auth/profile     → Get user info
PUT    /api/auth/profile     → Update user info
DELETE /api/users/:id        → Delete user (future)
```

### MongoDB & Mongoose

**MongoDB:**
- NoSQL database storing data as JSON documents
- Collections = Tables, Documents = Rows

**Mongoose:**
- ODM (Object Data Modeling) for MongoDB
- Provides schema validation
- Handles connections and queries

```javascript
// Define schema
const schema = new mongoose.Schema({...});

// Create model
const Model = mongoose.model('Name', schema);

// Use model
await Model.findById(id);
await Model.create({...});
await Model.findByIdAndUpdate(id, {...});
```

### JWT Authentication Flow

```
Client                          Server
  │                               │
  ├──── POST /auth/login ────────→│
  │                               │ Verify credentials
  │                               │ Generate JWT
  │←── Return JWT token ──────────┤
  │                               │
  ├── GET /auth/profile           │
  │    + Authorization: Bearer JWT→│
  │                               │ Verify JWT
  │                               │ Fetch user data
  │←────── Return user data ──────┤
```

---

## Common Patterns

### Middleware Usage

```javascript
// Public route (no middleware)
router.post('/login', authController.login);

// Protected route (requires authentication)
router.get('/profile', authMiddleware, authController.getProfile);

// Admin route (requires authentication + admin role)
router.post('/admin/users', authMiddleware, adminMiddleware, ...);
```

### Error Handling Pattern

```javascript
try {
  // 1. Validate input
  const { error, value } = schema.validate(data);
  if (error) return res.status(400).json({ ... });

  // 2. Check database
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ ... });

  // 3. Perform operation
  const result = await Model.create(value);

  // 4. Return success
  res.status(201).json({ success: true, data: result });
} catch (err) {
  res.status(500).json({ success: false, error: err.message });
}
```

### Database Query Pattern

```javascript
// Find by ID
const user = await User.findById(userId);

// Find by condition
const user = await User.findOne({ email: 'john@example.com' });

// Update
const user = await User.findByIdAndUpdate(id, updateData, { new: true });

// Delete
await User.findByIdAndDelete(id);

// Find multiple
const users = await User.find({ userType: 'CUSTOMER' });

// With select
const user = await User.findById(id).select('+password');
```

---

## Next Steps

1. ✅ **Authentication System** - Complete
2. ⏳ **Shop Management** - Create Shop model, controller, routes
3. ⏳ **Product Management** - Create Product model, controller, routes
4. ⏳ **Search Functionality** - Implement product/shop search
5. ⏳ **Reviews System** - Rating and review features
6. ⏳ **Frontend Integration** - Connect with React/Next.js frontend

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoDB connection failed`

**Solutions:**
1. Check MongoDB URI in `.env` is correct
2. Verify database user credentials
3. Check IP whitelist in MongoDB Atlas (should include your IP)
4. Ensure cluster is running (check MongoDB Atlas dashboard)
5. Test connection string: `mongosh "mongodb+srv://..."`

### JWT Token Errors

**Error:** `Invalid token` or `Token has expired`

**Solutions:**
1. Ensure token is copied correctly (no extra spaces)
2. Use token before it expires
3. Use refresh token to get new access token
4. Check JWT_SECRET in `.env` is correct

### Port Already in Use

**Error:** `Error: listen EADDRINUSE :::5000`

**Solutions:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

---

## Support & Resources

- **Node.js Docs:** https://nodejs.org/docs/
- **Express.js Docs:** https://expressjs.com/
- **MongoDB Docs:** https://docs.mongodb.com/
- **Mongoose Docs:** https://mongoosejs.com/
- **JWT.io:** https://jwt.io/

---

**Last Updated:** January 31, 2026
**Backend Version:** 1.0.0
