# Authentication Testing Guide

## Setup MongoDB Atlas

Before running the server, you need a MongoDB database. Follow these steps:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up (you can use free tier)
   - Create a new project

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose free tier M0
   - Select region closest to you
   - Create cluster (takes a few minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Add database user
   - Username: anything (e.g., `pettah_user`)
   - Password: generate a strong password and save it
   - Add user

4. **Configure Network Access**
   - Go to "Network Access"
   - Add IP Address
   - Click "Allow Access from Anywhere" (for development)

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>` and `<password>` with your database user credentials
   - Replace `myFirstDatabase` with `pettah-market`

6. **Update .env file**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pettah-market?retryWrites=true&w=majority
   ```

## Running the Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
🔧 Environment: development
```

## Testing Authentication Endpoints

You can test using **Postman**, **Insomnia**, or **VS Code REST Client**.

### 1. Register User

**Method:** POST
**URL:** `http://localhost:5000/api/auth/register`
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "CUSTOMER"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "CUSTOMER",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User

**Method:** POST
**URL:** `http://localhost:5000/api/auth/login`
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get User Profile (Protected)

**Method:** GET
**URL:** `http://localhost:5000/api/auth/profile`
**Headers:**
```
Authorization: Bearer <your_access_token_here>
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": { ... }
}
```

### 4. Update User Profile (Protected)

**Method:** PUT
**URL:** `http://localhost:5000/api/auth/profile`
**Headers:**
```
Authorization: Bearer <your_access_token_here>
Content-Type: application/json
```

**Body:**
```json
{
  "phone": "+94701234567",
  "address": {
    "street": "123 Main Street",
    "city": "Colombo",
    "district": "Western",
    "postalCode": "00100"
  }
}
```

### 5. Refresh Token

**Method:** POST
**URL:** `http://localhost:5000/api/auth/refresh-token`
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "<your_refresh_token_here>"
}
```

### 6. Logout

**Method:** POST
**URL:** `http://localhost:5000/api/auth/logout`
**Headers:**
```
Authorization: Bearer <your_access_token_here>
```

## Using REST Client Extension in VS Code

Create a file `test.http` in the backend folder:

```http
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
Authorization: Bearer <paste_token_here>

### Health Check
GET http://localhost:5000/api/health
```

Then click "Send Request" above each request to test.

## Troubleshooting

**Connection refused error?**
- Make sure MongoDB URI is correct
- Check MongoDB is running/accessible
- Verify network access settings in MongoDB Atlas

**Token validation failed?**
- Make sure JWT_SECRET in .env matches what's being used
- Check token hasn't expired
- Copy token correctly without extra spaces

**Validation errors?**
- Check all required fields are provided
- Password must be at least 6 characters
- Email must be valid format
