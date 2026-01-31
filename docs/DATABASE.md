# Database Schema Design

## Collections

### 1. Users
Stores information about customers and shop owners.

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  profileImage: String (URL),
  userType: Enum ['CUSTOMER', 'SHOP_OWNER'],
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String
  },
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### 2. Shops
Contains shop/business information.

```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: Users),
  name: String,
  description: String,
  category: String,
  logo: String (URL),
  coverImage: String (URL),
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    // ... rest of days
  },
  rating: Number (0-5),
  totalReviews: Number,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### 3. Products
Product/service listings by shops.

```javascript
{
  _id: ObjectId,
  shopId: ObjectId (ref: Shops),
  name: String,
  description: String,
  category: String,
  price: Number,
  discountPrice: Number (optional),
  images: [String] (URLs),
  inStock: Boolean,
  quantity: Number,
  rating: Number (0-5),
  totalReviews: Number,
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### 4. Reviews
Customer reviews for products and shops.

```javascript
{
  _id: ObjectId,
  reviewerId: ObjectId (ref: Users),
  targetId: ObjectId (ref: Products or Shops),
  targetType: Enum ['PRODUCT', 'SHOP'],
  rating: Number (1-5),
  comment: String,
  images: [String] (optional),
  helpful: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Categories
Product/service categories.

```javascript
{
  _id: ObjectId,
  name: String (unique),
  slug: String,
  description: String,
  icon: String (URL),
  parentCategoryId: ObjectId (for subcategories),
  createdAt: Date
}
```

### 6. Search History
Track user searches for analytics (optional).

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  searchQuery: String,
  results: Number,
  createdAt: Date
}
```

## Indexes

- **Users:** email (unique), userType
- **Shops:** ownerId, category, isActive, name (text)
- **Products:** shopId, category, isActive, name (text)
- **Reviews:** reviewerId, targetId, targetType
- **Categories:** slug (unique)

## Relationships

- User (1) → (Many) Shops
- Shop (1) → (Many) Products
- User (1) → (Many) Reviews
- Product (1) → (Many) Reviews
- Category (1) → (Many) Products
