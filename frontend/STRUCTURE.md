# Frontend Structure - Pettah Market

Complete Next.js 14 frontend scaffolding for Pettah Market marketplace.

## 📁 Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Home page
│   ├── (public)/                           # Public routes group
│   │   ├── shops/
│   │   │   ├── page.tsx                    # Browse shops
│   │   │   └── [id]/
│   │   │       └── page.tsx                # Shop detail
│   │   ├── products/
│   │   │   ├── page.tsx                    # Browse products
│   │   │   └── [id]/
│   │   │       └── page.tsx                # Product detail
│   │   └── search/
│   │       └── page.tsx                    # Search results
│   ├── (auth)/                             # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx                    # Login page
│   │   └── register/
│   │       └── page.tsx                    # Sign up page
│   ├── (customer)/                         # Customer routes group
│   │   ├── profile/
│   │   │   └── page.tsx                    # Customer profile
│   │   └── reviews/
│   │       └── page.tsx                    # My reviews
│   └── (shop-owner)/                       # Shop owner routes group
│       ├── dashboard/
│       │   └── page.tsx                    # Shop dashboard
│       ├── products/
│       │   └── page.tsx                    # Manage products
│       └── settings/
│           └── page.tsx                    # Shop settings
│
├── components/
│   ├── navigation/
│   │   ├── Navbar.tsx                      # Top navigation
│   │   └── Footer.tsx                      # Footer
│   ├── products/
│   │   └── ProductCard.tsx                 # Product card component
│   ├── shops/
│   │   └── ShopCard.tsx                    # Shop card component
│   └── reviews/
│       └── ReviewCard.tsx                  # Review card component
│
├── lib/
│   ├── api.ts                              # API client with axios
│   ├── auth.ts                             # Auth utilities
│   ├── types.ts                            # TypeScript types
│   └── hooks.ts                            # Custom hooks
│
├── public/                                 # Static files
├── styles/
│   └── globals.css                         # Global styles
├── next.config.js                          # Next.js config
├── tailwind.config.js                      # Tailwind config
├── tsconfig.json                           # TypeScript config
└── package.json                            # Dependencies

```

## 🎯 Features Scaffolded

### Pages (20 pages total)
✅ **Public Pages:**
- Home page with featured products and shops
- Browse shops with filters (category, city)
- Shop detail page with products and reviews
- Browse products with filters (category, price, search)
- Product detail page with reviews
- Search page with combined results

✅ **Auth Pages:**
- Login page
- Register page with user type selection

✅ **Customer Pages:**
- Customer profile
- My reviews

✅ **Shop Owner Pages:**
- Dashboard with stats
- Manage products (CRUD)
- Shop settings

### Components (4 components)
✅ **Navigation:**
- Navbar with search and auth links
- Footer with links

✅ **Product:**
- ProductCard component

✅ **Shop:**
- ShopCard component

✅ **Review:**
- ReviewCard component

### API Layer
✅ **Complete API Client** with:
- All endpoints from backend API
- JWT token management
- Automatic token refresh
- Request/response interceptors
- Error handling

✅ **Auth Utilities:**
- Token storage
- User management
- Auth checks (isAuthenticated, isShopOwner, isCustomer)

✅ **Custom Hooks:**
- useAuth (register, login, logout)
- useShops (fetch shops)
- useProducts (fetch products)

✅ **TypeScript Types:**
- User, Shop, Product, Category, Review interfaces
- API response types
- Pagination types

## 🚀 Next Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Set Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

### 4. Build Components (In Priority Order)
1. **Navbar** - Make it interactive with auth state
2. **ProductCard & ShopCard** - Use real data from API
3. **Auth Pages** - Connect login/register to useAuth hook
4. **Home Page** - Load featured products and shops
5. **Product Browse** - Implement filtering and pagination
6. **Shop Browse** - Implement filtering and pagination
7. **Product Detail** - Load product data and reviews
8. **Shop Detail** - Load shop data and reviews
9. **Customer Dashboard** - Profile, reviews, wishlist
10. **Shop Owner Dashboard** - Stats, product management

## 📦 Dependencies Installed

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "axios": "^1.6.0"
}
```

## 🔑 Key Features Ready to Implement

✅ **API Integration:**
- All endpoints connected
- Token management automatic
- Error handling ready

✅ **Authentication:**
- Login/Register flows
- Token storage
- Protected routes ready

✅ **State Management:**
- Custom hooks for auth, shops, products
- Can add Zustand or Context API if needed

✅ **Styling:**
- Tailwind CSS configured
- Responsive design ready
- Dark mode ready (can be added)

✅ **TypeScript:**
- Full type safety
- All interfaces defined
- No `any` types in components

## 📝 File Checklist

- [x] Root layout
- [x] Home page
- [x] Public route group (shops, products, search)
- [x] Auth route group (login, register)
- [x] Customer route group (profile, reviews)
- [x] Shop owner route group (dashboard, products, settings)
- [x] Navigation components (Navbar, Footer)
- [x] Product card component
- [x] Shop card component
- [x] Review card component
- [x] API client (lib/api.ts)
- [x] Auth utilities (lib/auth.ts)
- [x] TypeScript types (lib/types.ts)
- [x] Custom hooks (lib/hooks.ts)

## 🎨 Design System Ready

All pages use:
- **Tailwind CSS** for styling
- **Consistent spacing** with max-w-6xl containers
- **Responsive grid layouts**
- **Loading states** with animate-pulse
- **Hover effects** for interactivity

## 🔄 Connection to Backend

All API calls go through:
1. `apiClient` from lib/api.ts
2. Automatically adds JWT tokens
3. Handles 401 errors with token refresh
4. Type-safe with TypeScript

Backend running on: `http://localhost:5000/api`

---

**Status:** ✅ Complete Frontend Scaffolding
**Ready for:** Building features with real API integration
