# Pettah Market - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints Overview

### 1. Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - Logout user

### 2. Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `GET /users/:id/avatar` - Get user avatar
- `POST /users/:id/avatar` - Upload avatar

### 3. Shops
- `GET /shops` - Get all shops (with filters)
- `GET /shops/:id` - Get shop details
- `POST /shops` - Create shop (shop owner only)
- `PUT /shops/:id` - Update shop (shop owner only)
- `DELETE /shops/:id` - Delete shop (shop owner only)
- `GET /shops/:id/products` - Get shop products
- `GET /shops/:id/reviews` - Get shop reviews

### 4. Products
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (shop owner only)
- `PUT /products/:id` - Update product (shop owner only)
- `DELETE /products/:id` - Delete product (shop owner only)
- `GET /products/:id/reviews` - Get product reviews
- `POST /products/:id/images` - Upload product images

### 5. Reviews
- `GET /reviews` - Get all reviews
- `POST /reviews` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### 6. Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category details
- `POST /categories` - Create category (admin only)

### 7. Search
- `GET /search` - Global search (products & shops)
- `GET /search/suggestions` - Search suggestions

## Common Query Parameters

### Pagination
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page

### Sorting
- `sort` - Sorting field (e.g., `createdAt`, `-price`)

### Filtering
- `category` - Filter by category
- `city` - Filter by city
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `rating` - Minimum rating

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

## Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Example Requests

### Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "CUSTOMER"
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Get All Products
```bash
GET /products?page=1&limit=10&category=Electronics&sort=-price
```

### Create Shop (Protected)
```bash
POST /shops
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Store",
  "description": "Electronics and gadgets",
  "category": "Electronics",
  "phone": "+94701234567",
  "address": {
    "street": "123 Main Street",
    "city": "Colombo",
    "district": "Western"
  }
}
```

---

More detailed endpoint documentation coming soon!
