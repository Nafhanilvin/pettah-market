# Shop Management API Testing Guide

## Prerequisites

1. You must be logged in (have an access token)
2. MongoDB must be running and connected
3. Backend server must be running on port 5000

## API Endpoints

### Base URL
```
http://localhost:5000/api/shops
```

---

## Testing Endpoints

### 1. Create a New Shop (Protected)

**Method:** POST
**URL:** `http://localhost:5000/api/shops`
**Authorization:** Bearer `<accessToken>`

```http
POST http://localhost:5000/api/shops
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "name": "Tech World",
  "description": "Your one-stop shop for electronics and gadgets",
  "category": "Electronics",
  "phone": "+94701234567",
  "email": "techworld@example.com",
  "website": "https://techworld.com",
  "street": "123 Main Street",
  "city": "Colombo",
  "district": "Western",
  "postalCode": "00100",
  "about": "We offer the best quality electronics at affordable prices"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Shop created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "ownerId": "507f1f77bcf86cd799439010",
    "name": "Tech World",
    "description": "Your one-stop shop for electronics and gadgets",
    "category": "Electronics",
    "contact": {
      "phone": "+94701234567",
      "email": "techworld@example.com",
      "website": "https://techworld.com"
    },
    "address": {
      "street": "123 Main Street",
      "city": "Colombo",
      "district": "Western",
      "postalCode": "00100"
    },
    "rating": 0,
    "totalReviews": 0,
    "isActive": true,
    "createdAt": "2024-01-31T10:00:00.000Z"
  }
}
```

---

### 2. Get All Shops (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/shops`

**Optional Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `city` - Filter by city
- `search` - Full text search
- `sort` - Sort field (e.g., `-createdAt`, `rating`)

```http
GET http://localhost:5000/api/shops?page=1&limit=10&category=Electronics&city=Colombo
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shops retrieved successfully",
  "data": {
    "shops": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Tech World",
        "category": "Electronics",
        "address": {
          "city": "Colombo"
        },
        "rating": 4.5,
        "totalReviews": 20
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

---

### 3. Get Shop by ID (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/shops/:shopId`

```http
GET http://localhost:5000/api/shops/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "ownerId": {
      "_id": "507f1f77bcf86cd799439010",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+94701234567"
    },
    "name": "Tech World",
    "description": "Your one-stop shop for electronics",
    "category": "Electronics",
    "contact": { ... },
    "address": { ... },
    "openingHours": { ... },
    "rating": 4.5,
    "totalReviews": 20,
    "isActive": true
  }
}
```

---

### 4. Get My Shop (Protected)

**Method:** GET
**URL:** `http://localhost:5000/api/shops/user/my-shop`
**Authorization:** Bearer `<accessToken>`

```http
GET http://localhost:5000/api/shops/user/my-shop
Authorization: Bearer <your_access_token>
```

**Response (200 OK):** Same format as Get Shop by ID

---

### 5. Update Shop (Protected)

**Method:** PUT
**URL:** `http://localhost:5000/api/shops/:shopId`
**Authorization:** Bearer `<accessToken>`

```http
PUT http://localhost:5000/api/shops/507f1f77bcf86cd799439011
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "name": "Tech World Updated",
  "description": "Updated description",
  "phone": "+94701234568",
  "about": "Updated about section"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop updated successfully",
  "data": { ... updated shop object ... }
}
```

---

### 6. Delete Shop (Protected)

**Method:** DELETE
**URL:** `http://localhost:5000/api/shops/:shopId`
**Authorization:** Bearer `<accessToken>`

```http
DELETE http://localhost:5000/api/shops/507f1f77bcf86cd799439011
Authorization: Bearer <your_access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shop deleted successfully"
}
```

---

### 7. Search Shops (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/shops/search`

**Query Parameters:**
- `query` - Search query
- `category` - Filter by category
- `city` - Filter by city
- `limit` - Results limit

```http
GET http://localhost:5000/api/shops/search?query=electronics&city=Colombo&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tech World",
      "category": "Electronics",
      "address": {
        "city": "Colombo"
      },
      "rating": 4.5,
      "totalReviews": 20
    }
  ]
}
```

---

### 8. Get Shops by Category (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/shops/category/:category`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page

```http
GET http://localhost:5000/api/shops/category/Electronics?page=1&limit=10
```

**Response (200 OK):** Same format as Get All Shops

---

### 9. Get Shops by City (Public)

**Method:** GET
**URL:** `http://localhost:5000/api/shops/city/:city`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page

```http
GET http://localhost:5000/api/shops/city/Colombo?page=1&limit=10
```

**Response (200 OK):** Same format as Get All Shops

---

## Testing with REST Client Extension (VS Code)

Create `test_shops.http` in backend folder:

```http
### Get all shops
GET http://localhost:5000/api/shops

### Get shops by category
GET http://localhost:5000/api/shops/category/Electronics

### Get shops by city
GET http://localhost:5000/api/shops/city/Colombo

### Search shops
GET http://localhost:5000/api/shops/search?query=tech&city=Colombo

### Get shop by ID
GET http://localhost:5000/api/shops/SHOP_ID_HERE

### Create a shop (need to replace token)
POST http://localhost:5000/api/shops
Authorization: Bearer TOKEN_HERE
Content-Type: application/json

{
  "name": "Tech World",
  "description": "Electronics shop",
  "category": "Electronics",
  "phone": "+94701234567",
  "email": "tech@example.com",
  "street": "123 Main St",
  "city": "Colombo",
  "district": "Western",
  "postalCode": "00100",
  "about": "Quality electronics"
}

### Get my shop
GET http://localhost:5000/api/shops/user/my-shop
Authorization: Bearer TOKEN_HERE

### Update shop
PUT http://localhost:5000/api/shops/SHOP_ID_HERE
Authorization: Bearer TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Shop Name",
  "description": "Updated description"
}

### Delete shop
DELETE http://localhost:5000/api/shops/SHOP_ID_HERE
Authorization: Bearer TOKEN_HERE
```

---

## Complete Testing Workflow

### Step 1: Register a User
```json
POST /api/auth/register
{
  "email": "shopowner@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "Shop",
  "lastName": "Owner",
  "userType": "SHOP_OWNER"
}
```

Copy the `token` from response.

### Step 2: Login to Get Token
```json
POST /api/auth/login
{
  "email": "shopowner@example.com",
  "password": "password123"
}
```

Copy the `accessToken` from response.

### Step 3: Create a Shop
Use the token in Authorization header:
```json
POST /api/shops
{
  "name": "My Electronics Shop",
  "category": "Electronics",
  "phone": "+94701234567",
  "email": "shop@example.com",
  "street": "123 Main Street",
  "city": "Colombo",
  "district": "Western"
}
```

Copy the shop `_id` from response.

### Step 4: Get All Shops
```
GET /api/shops
```

### Step 5: Get Specific Shop
```
GET /api/shops/{shopId}
```

### Step 6: Update Your Shop
```json
PUT /api/shops/{shopId}
{
  "description": "Best electronics shop in Colombo"
}
```

### Step 7: Search Shops
```
GET /api/shops/search?query=electronics&city=Colombo
```

---

## Shop Categories Available

- Electronics
- Clothing
- Food & Beverages
- Home & Garden
- Health & Beauty
- Books & Media
- Sports & Outdoors
- Toys & Games
- Automotive
- Services
- Other

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Shop name is required"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

### Shop Already Exists (409)
```json
{
  "success": false,
  "message": "You already have a shop. Please update the existing one."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Shop not found"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "You do not have permission to update this shop"
}
```

---

## Tips

1. **Always save shop ID** when creating a shop
2. **Use the same token** for operations on your shop
3. **Public endpoints** (GET) don't need authentication
4. **Protected endpoints** need valid Bearer token
5. Test pagination by using different `page` and `limit` values
6. Use `sort=-createdAt` to sort by newest first
7. Use `sort=rating` to sort by rating ascending

---

**Last Updated:** January 31, 2026
