// TypeScript types for the entire application

export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  userType: 'CUSTOMER' | 'SHOP_OWNER'
  createdAt: string
  updatedAt: string
}

export interface Shop {
  _id: string
  ownerId: string | User
  name: string
  description: string
  category: string
  contact: {
    phone: string
    email: string
    website?: string
  }
  address: {
    street: string
    city: string
    district: string
    postalCode: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  rating: number
  totalReviews: number
  totalProducts: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parentCategoryId?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  shopId: string | Shop
  name: string
  description: string
  categoryId: string | Category
  price: number
  discountPrice?: number
  quantity: number
  images?: string[]
  tags?: string[]
  rating: number
  totalReviews: number
  views: number
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Review {
  _id: string
  userId: string | User
  targetId: string
  targetType: 'PRODUCT' | 'SHOP'
  rating: number
  title: string
  comment: string
  helpful: number
  unhelpful: number
  status: 'PUBLISHED' | 'DRAFT'
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface APIResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}
