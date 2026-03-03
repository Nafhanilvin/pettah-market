// Custom hooks for the frontend

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { setAuthTokens, setUser, clearAuth, getUser } from '@/lib/auth'

export const useAuth = () => {
  const [user, setCurrentUser] = useState(getUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const register = useCallback(
    async (data: any) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.register(data)
        setAuthTokens({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        })
        setUser(response.data.data.user)
        setCurrentUser(response.data.data.user)
        router.push(response.data.data.user.userType === 'shop-owner' ? '/shop-owner/dashboard' : '/profile')
        return response.data
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.login(email, password)
        setAuthTokens({
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken
        })
        setUser(response.data.data.user)
        setCurrentUser(response.data.data.user)
        router.push(response.data.data.user.userType === 'shop-owner' ? '/shop-owner/dashboard' : '/profile')
        return response.data
      } catch (err: any) {
        const message = err.response?.data?.message || 'Login failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await apiClient.logout()
      clearAuth()
      setCurrentUser(null)
      router.push('/')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isShopOwner: user?.userType === 'shop-owner'
  }
}

export const useShops = () => {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getShops = useCallback(
    async (params?: any) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.getShops(params)
        setShops(response.data.data.shops)
        return response.data
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to fetch shops'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { shops, loading, error, getShops }
}

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getProducts = useCallback(
    async (params?: any) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.getProducts(params)
        setProducts(response.data.data.products)
        return response.data
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to fetch products'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { products, loading, error, getProducts }
}
