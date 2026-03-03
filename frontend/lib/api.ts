import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor to include token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          const refreshed = await this.refreshToken()
          if (refreshed) {
            return this.client(originalRequest)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  }

  private setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  private clearTokens() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return false

      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken
      })

      this.setTokens(response.data.data.accessToken, response.data.data.refreshToken)
      return true
    } catch (error) {
      this.clearTokens()
      return false
    }
  }

  async get(url: string, config?: any) {
    return this.client.get(url, config)
  }

  async post(url: string, data?: any, config?: any) {
    return this.client.post(url, data, config)
  }

  async put(url: string, data?: any, config?: any) {
    return this.client.put(url, data, config)
  }

  async patch(url: string, data?: any, config?: any) {
    return this.client.patch(url, data, config)
  }

  async delete(url: string, config?: any) {
    return this.client.delete(url, config)
  }

  // Auth endpoints
  async register(data: any) {
    return this.client.post('/auth/register', data)
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password })
  }

  async getProfile() {
    return this.client.get('/auth/profile')
  }

  async updateProfile(data: any) {
    return this.client.put('/auth/profile', data)
  }

  async logout() {
    this.clearTokens()
    return this.client.post('/auth/logout', {})
  }

  async createOwnerWithShop(data: any) {
    return this.client.post('/auth/admin/create-owner', data)
  }

  // Shop endpoints
  async getShops(params?: any) {
    return this.client.get('/shops', { params })
  }

  async getShop(id: string) {
    return this.client.get(`/shops/${id}`)
  }

  async createShop(data: any) {
    return this.client.post('/shops', data)
  }

  async updateShop(id: string, data: any) {
    return this.client.put(`/shops/${id}`, data)
  }

  async deleteShop(id: string) {
    return this.client.delete(`/shops/${id}`)
  }

  async getMyShop() {
    return this.client.get('/shops/user/my-shop')
  }

  async searchShops(query: string, params?: any) {
    return this.client.get('/shops/search', { params: { query, ...params } })
  }

  async getShopsByCategory(category: string, params?: any) {
    return this.client.get(`/shops/category/${category}`, { params })
  }

  async getShopsByCity(city: string, params?: any) {
    return this.client.get(`/shops/city/${city}`, { params })
  }

  // Product endpoints
  async getProducts(params?: any) {
    return this.client.get('/products', { params })
  }

  async getProduct(id: string) {
    return this.client.get(`/products/${id}`)
  }

  async createProduct(data: any) {
    return this.client.post('/products', data)
  }

  async updateProduct(id: string, data: any) {
    return this.client.put(`/products/${id}`, data)
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/products/${id}`)
  }

  async getMyProducts(params?: any) {
    return this.client.get('/products/user/my-products', { params })
  }

  async getShopProducts(shopId: string, params?: any) {
    return this.client.get(`/products/shop/${shopId}`, { params })
  }

  async searchProducts(query: string, params?: any) {
    return this.client.get('/products/search', { params: { query, ...params } })
  }

  async getFeaturedProducts(params?: any) {
    return this.client.get('/products/featured', { params })
  }

  // Category endpoints
  async getCategories(params?: any) {
    return this.client.get('/categories', { params })
  }

  async getCategory(id: string) {
    return this.client.get(`/categories/${id}`)
  }

  async getCategoryBySlug(slug: string) {
    return this.client.get(`/categories/slug/${slug}`)
  }

  async createCategory(data: any) {
    return this.client.post('/categories', data)
  }

  async updateCategory(id: string, data: any) {
    return this.client.put(`/categories/${id}`, data)
  }

  async deleteCategory(id: string) {
    return this.client.delete(`/categories/${id}`)
  }

  // Review endpoints
  async getReviews(targetType: string, targetId: string, params?: any) {
    return this.client.get(`/reviews/${targetType}/${targetId}`, { params })
  }

  async getReview(id: string) {
    return this.client.get(`/reviews/${id}`)
  }

  async createReview(data: any) {
    return this.client.post('/reviews', data)
  }

  async updateReview(id: string, data: any) {
    return this.client.put(`/reviews/${id}`, data)
  }

  async deleteReview(id: string) {
    return this.client.delete(`/reviews/${id}`)
  }

  async getMyReviews(params?: any) {
    return this.client.get('/reviews/user/my-reviews', { params })
  }

  async getRatingSummary(targetType: string, targetId: string) {
    return this.client.get(`/reviews/summary/${targetType}/${targetId}`)
  }

  async markReviewHelpful(id: string) {
    return this.client.patch(`/reviews/${id}/helpful`)
  }
}

export const apiClient = new APIClient()
