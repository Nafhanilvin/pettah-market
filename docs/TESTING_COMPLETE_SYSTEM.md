# Complete Pettah Market API Testing Guide

## System Overview

Complete backend system with:
- ✅ User Authentication
- ✅ Shop Management
- ✅ Product Management
- ✅ Category System
- ✅ Review & Ratings System

---

## Complete Testing Flow

### Prerequisites
1. MongoDB Atlas account (free tier)
2. Backend running: `npm run dev` in `/backend`
3. VS Code REST Client extension (or Postman)

---

## Test File: `test_complete_system.http`

Copy all of this into a file called `test_complete_system.http` in your backend folder:

```http
# ============================================
# PART 1: USER AUTHENTICATION
# ============================================

### 1.1 Register Customer
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Customer",
  "userType": "CUSTOMER"
}

###

### 1.2 Register Shop Owner
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "shopowner@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "Ahmed",
  "lastName": "Shop",
  "userType": "SHOP_OWNER"
}

###

### 1.3 Login Shop Owner
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "shopowner@example.com",
  "password": "password123"
}

###

### 1.4 Login Customer
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}

###

# ============================================
# PART 2: CATEGORIES
# ============================================

### 2.1 Get All Categories
GET http://localhost:5000/api/categories

###

### 2.2 Create Category (paste token from 1.3)
POST http://localhost:5000/api/categories
Authorization: Bearer PASTE_TOKEN_HERE
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "icon": "📱"
}

###

### 2.3 Create Another Category
POST http://localhost:5000/api/categories
Authorization: Bearer PASTE_TOKEN_HERE
Content-Type: application/json

{
  "name": "Clothing",
  "description": "Clothes and fashion items",
  "icon": "👕"
}

###

### 2.4 Get Category by Slug
GET http://localhost:5000/api/categories/slug/electronics

###

# ============================================
# PART 3: SHOP MANAGEMENT
# ============================================

### 3.1 Create Shop (use token from 1.3 - shop owner)
POST http://localhost:5000/api/shops
Authorization: Bearer PASTE_SHOP_OWNER_TOKEN_HERE
Content-Type: application/json

{
  "name": "Tech World Electronics",
  "description": "Best electronics in Colombo",
  "category": "Electronics",
  "phone": "+94701234567",
  "email": "techworld@example.com",
  "website": "https://techworld.example.com",
  "street": "123 Main Street, Pettah",
  "city": "Colombo",
  "district": "Western",
  "postalCode": "00100",
  "about": "We provide quality electronics with warranty"
}

###

### 3.2 Get All Shops
GET http://localhost:5000/api/shops

###

### 3.3 Get My Shop (shop owner only)
GET http://localhost:5000/api/shops/user/my-shop
Authorization: Bearer PASTE_SHOP_OWNER_TOKEN_HERE

###

### 3.4 Get Shops by Category
GET http://localhost:5000/api/shops?category=Electronics

###

### 3.5 Get Shops in Colombo
GET http://localhost:5000/api/shops/city/Colombo

###

### 3.6 Search Shops
GET http://localhost:5000/api/shops/search?query=tech&city=Colombo

###

# ============================================
# PART 4: PRODUCTS
# ============================================

### 4.1 Create Product (shop owner - replace token)
POST http://localhost:5000/api/products
Authorization: Bearer PASTE_SHOP_OWNER_TOKEN_HERE
Content-Type: application/json

{
  "name": "iPhone 14 Pro",
  "description": "Latest iPhone with A16 Bionic chip, 6.1 inch display, and advanced camera system",
  "categoryId": "PASTE_ELECTRONICS_CATEGORY_ID",
  "price": 150000,
  "discountPrice": 135000,
  "quantity": 50
}

###

### 4.2 Create Another Product
POST http://localhost:5000/api/products
Authorization: Bearer PASTE_SHOP_OWNER_TOKEN_HERE
Content-Type: application/json

{
  "name": "Samsung Galaxy S23",
  "description": "Powerful Android phone with Snapdragon 8 Gen 2",
  "categoryId": "PASTE_ELECTRONICS_CATEGORY_ID",
  "price": 120000,
  "discountPrice": 110000,
  "quantity": 30
}

###

### 4.3 Get All Products
GET http://localhost:5000/api/products

###

### 4.4 Get Products by Category
GET http://localhost:5000/api/products?categoryId=PASTE_ELECTRONICS_CATEGORY_ID

###

### 4.5 Get Shop Products
GET http://localhost:5000/api/products/shop/PASTE_SHOP_ID_HERE

###

### 4.6 Get My Products (shop owner)
GET http://localhost:5000/api/products/user/my-products
Authorization: Bearer PASTE_SHOP_OWNER_TOKEN_HERE

###

### 4.7 Search Products
GET http://localhost:5000/api/products/search?query=iphone&maxPrice=160000

###

### 4.8 Get Product by ID
GET http://localhost:5000/api/products/PASTE_PRODUCT_ID_HERE

###

### 4.9 Get Featured Products
GET http://localhost:5000/api/products/featured

###

### 4.10 Update Product
PUT http://localhost:5000/api/products/PASTE_PRODUCT_ID_HERE
Authorization: Bearer PASTE_SHOP_OWNER_TOKEN_HERE
Content-Type: application/json

{
  "name": "iPhone 14 Pro - Updated",
  "price": 145000,
  "quantity": 45
}

###

# ============================================
# PART 5: REVIEWS & RATINGS
# ============================================

### 5.1 Create Review for Product (customer)
POST http://localhost:5000/api/reviews
Authorization: Bearer PASTE_CUSTOMER_TOKEN_HERE
Content-Type: application/json

{
  "targetId": "PASTE_PRODUCT_ID_HERE",
  "targetType": "PRODUCT",
  "rating": 5,
  "title": "Excellent phone!",
  "comment": "This iPhone is absolutely fantastic. Great display, amazing camera, and fast performance. Highly recommend!"
}

###

### 5.2 Create Review for Shop
POST http://localhost:5000/api/reviews
Authorization: Bearer PASTE_CUSTOMER_TOKEN_HERE
Content-Type: application/json

{
  "targetId": "PASTE_SHOP_ID_HERE",
  "targetType": "SHOP",
  "rating": 4,
  "title": "Good shop experience",
  "comment": "Great service and quality products. Only minor issue was delivery time but overall very satisfied."
}

###

### 5.3 Get Product Reviews
GET http://localhost:5000/api/reviews/PRODUCT/PASTE_PRODUCT_ID_HERE

###

### 5.4 Get Shop Reviews
GET http://localhost:5000/api/reviews/SHOP/PASTE_SHOP_ID_HERE

###

### 5.5 Get My Reviews (customer)
GET http://localhost:5000/api/reviews/user/my-reviews
Authorization: Bearer PASTE_CUSTOMER_TOKEN_HERE

###

### 5.6 Get Rating Summary
GET http://localhost:5000/api/reviews/summary/PRODUCT/PASTE_PRODUCT_ID_HERE

###

### 5.7 Mark Review as Helpful
PATCH http://localhost:5000/api/reviews/PASTE_REVIEW_ID_HERE/helpful

###

### 5.8 Update Review (customer)
PUT http://localhost:5000/api/reviews/PASTE_REVIEW_ID_HERE
Authorization: Bearer PASTE_CUSTOMER_TOKEN_HERE
Content-Type: application/json

{
  "rating": 4,
  "title": "Good but not perfect",
  "comment": "Updated review - still good but found a few minor issues after extended use"
}

###

### 5.9 Delete Review (customer)
DELETE http://localhost:5000/api/reviews/PASTE_REVIEW_ID_HERE
Authorization: Bearer PASTE_CUSTOMER_TOKEN_HERE

###

# ============================================
# PART 6: HEALTH CHECK
# ============================================

### 6.1 Health Check
GET http://localhost:5000/api/health

###
```

---

## Step-by-Step Testing Instructions

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Step 2: Create Test File
- Create `test_complete_system.http` in backend folder
- Copy all the requests above into it
- Open it in VS Code

### Step 3: Test Authentication
1. Click "Send Request" on **1.1 Register Customer**
   - Save the response
2. Click "Send Request" on **1.2 Register Shop Owner**
3. Click "Send Request" on **1.3 Login Shop Owner**
   - Copy the `accessToken` (long string)
4. Click "Send Request" on **1.4 Login Customer**
   - Copy the `accessToken`

### Step 4: Set Up Tokens
Replace in your test file:
- `PASTE_SHOP_OWNER_TOKEN_HERE` → Token from Step 3 (shop owner login)
- `PASTE_CUSTOMER_TOKEN_HERE` → Token from Step 3 (customer login)

### Step 5: Test Categories
1. Click "Send Request" on **2.1 Get All Categories** (public)
2. Click "Send Request" on **2.2 Create Category**
   - Copy the category `_id`
3. Click "Send Request" on **2.3 Create Another Category**
4. Replace `PASTE_ELECTRONICS_CATEGORY_ID` with the ID from step 2

### Step 6: Test Shops
1. Click "Send Request" on **3.1 Create Shop**
   - Copy the shop `_id`
2. Click "Send Request" on **3.2 Get All Shops**
3. Replace all `PASTE_SHOP_ID_HERE` with the shop ID
4. Test filtering: **3.4, 3.5, 3.6**

### Step 7: Test Products
1. Click "Send Request" on **4.1 Create Product**
   - Copy the product `_id`
2. Click "Send Request" on **4.2 Create Another Product**
3. Replace `PASTE_PRODUCT_ID_HERE` with product ID
4. Test all product endpoints: **4.3 through 4.10**

### Step 8: Test Reviews
1. Click "Send Request" on **5.1 Create Review for Product**
   - Copy the review `_id`
2. Click "Send Request" on **5.2 Create Review for Shop**
3. Replace `PASTE_REVIEW_ID_HERE` with review ID
4. Test all review endpoints: **5.3 through 5.9**

### Step 9: Verify Data
- Products should show updated ratings after reviews
- Shops should show updated ratings after shop reviews
- All filtering should work correctly

---

## Expected Results

### Authentication
✅ Register users as CUSTOMER or SHOP_OWNER
✅ Login returns accessToken and refreshToken
✅ Protected routes require valid token

### Shops
✅ Shop owners can create/update/delete shops
✅ Shops automatically linked to shop owner
✅ Can filter by category, city
✅ Can search shops

### Products
✅ Only shop owners can create products
✅ Products belong to a shop
✅ Can filter by category, price range
✅ Can search products
✅ Views increment when product accessed

### Categories
✅ Can create and manage categories
✅ Products must belong to valid category
✅ Can access by ID or slug

### Reviews
✅ Only logged-in users can create reviews
✅ Ratings automatically calculated
✅ Shop and product ratings update automatically
✅ Users can only review once per product/shop
✅ Can update/delete own reviews

---

## Troubleshooting

### "MongoDB connection failed"
- Check `.env` MONGODB_URI
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas

### "No token provided"
- Copy the full accessToken from login response
- Include "Bearer " before token
- Token may be expired (login again)

### "Product not found when creating review"
- Make sure you're using correct product ID
- Product must exist before review

### "Category not found"
- Create category first before creating products
- Use the category `_id` not the name

### "User already reviewed this"
- Each user can only review a product/shop once
- Delete previous review if you want to create new one

---

## API Summary

### Base URLs
- Auth: `/api/auth`
- Shops: `/api/shops`
- Products: `/api/products`
- Categories: `/api/categories`
- Reviews: `/api/reviews`

### Public Endpoints (No Token Needed)
- GET all shops, products, categories
- GET shop/product/category details
- GET reviews

### Protected Endpoints (Need Token)
- POST/PUT/DELETE products (shop owner)
- POST/PUT/DELETE reviews (reviewer)
- POST/PUT/DELETE shops (shop owner)

---

## Performance Tips

1. **Always save IDs** when creating resources
2. **Reuse tokens** for multiple requests
3. **Test one endpoint at a time** initially
4. **Use pagination** for large datasets
5. **Check response errors** carefully

---

**Last Updated:** January 31, 2026
**Version:** 1.0.0 - Complete System
