'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { getUser, isAuthenticated, isShopOwner } from '@/lib/auth'

interface Shop {
  _id: string
  name: string
  description?: string
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
  }
  ownerId: string
  rating: number
  totalReviews: number
  totalProducts: number
}

export default function ShopOwnerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    if (!isShopOwner()) {
      router.push('/profile')
      return
    }

    const currentUser = getUser()
    setUser(currentUser)

    // Fetch current user's shop
    const fetchShops = async () => {
      try {
        setError(null)
        const response = await apiClient.getMyShop()
        const shop = response.data.data
        setShops(shop ? [shop] : [])
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setShops([])
        } else {
          console.error('Error fetching shops:', err)
          setError('Failed to load your shop')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [router])

  const handleDeleteShop = async (shopId: string) => {
    if (!confirm('Are you sure you want to delete this shop?')) return

    try {
      await apiClient.deleteShop(shopId)
      setShops(shops.filter(s => s._id !== shopId))
    } catch (err: any) {
      alert('Failed to delete shop')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}! Manage your shops here.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Create Shop Button */}
        <div className="mb-8">
          <Link
            href="/shop-owner/create-shop"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            + Create New Shop
          </Link>
        </div>

        {/* Shops Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-80 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                {/* Shop Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h2 className="text-xl font-bold">{shop.name}</h2>
                  <p className="text-blue-100 text-sm">{shop.category}</p>
                </div>

                {/* Shop Info */}
                <div className="p-4 space-y-3">
                  {shop.description && (
                    <p className="text-gray-700 text-sm">{shop.description}</p>
                  )}

                  {/* Address */}
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-700">📍 Location</p>
                    <p>{shop.address.street}</p>
                    <p>{shop.address.city}</p>
                    <p>{shop.address.district}</p>
                  </div>

                  {/* Contact */}
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-700">📞 Contact</p>
                    <p>{shop.contact.phone}</p>
                    <p>{shop.contact.email}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{shop.totalProducts || 0}</p>
                      <p className="text-xs text-gray-600">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-500">⭐ {shop.rating?.toFixed(1) || 'N/A'}</p>
                      <p className="text-xs text-gray-600">{shop.totalReviews || 0} reviews</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/shop-owner/shops/${shop._id}/products`}
                      className="text-center bg-blue-50 text-blue-600 px-3 py-2 rounded font-semibold text-sm hover:bg-blue-100 transition-all"
                    >
                      📦 Products
                    </Link>
                    <Link
                      href={`/shop-owner/shops/${shop._id}/edit`}
                      className="text-center bg-gray-100 text-gray-700 px-3 py-2 rounded font-semibold text-sm hover:bg-gray-200 transition-all"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteShop(shop._id)}
                      className="col-span-2 bg-red-50 text-red-600 px-3 py-2 rounded font-semibold text-sm hover:bg-red-100 transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">You don't have any shops yet.</p>
            <Link
              href="/shop-owner/create-shop"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Create Your First Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
