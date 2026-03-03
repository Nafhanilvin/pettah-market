// Authentication utilities

export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  userType: 'customer' | 'shop-owner' | 'admin'
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export const setAuthTokens = (tokens: AuthTokens) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
}

export const setUser = (user: User) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

export const clearAuth = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}

export const getUserData = (): User | null => {
  return getUser()
}

export const logout = () => {
  clearAuth()
}

export const isAdmin = (): boolean => {
  const user = getUser()
  return user?.userType === 'admin'
}

export const isShopOwner = (): boolean => {
  const user = getUser()
  return user?.userType === 'shop-owner'
}

export const isCustomer = (): boolean => {
  const user = getUser()
  return user?.userType === 'customer'
}
