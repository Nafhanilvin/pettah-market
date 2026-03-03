'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface Shop {
  _id: string
  name: string
  description: string
  category: string
  rating: number
  totalReviews: number
  address?: {
    city?: string
  }
}

interface Product {
  _id: string
  name: string
  price: number
  discountPrice?: number
  rating: number
  totalReviews: number
}

export default function ShopDetailPage() {
  const { id } = useParams()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch shop
        const shopRes = await apiClient.get(`/shops/${id}`)
        setShop(shopRes.data.data || null)

        // Fetch products for this shop
        const productsRes = await apiClient.get(`/products/shop/${id}?limit=50`)
        setProducts(productsRes.data.data?.products || [])
      } catch (err) {
        console.error('Failed to fetch shop:', err)
        setError('Failed to load shop details')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 text-lg mb-6">{error || 'Shop not found'}</p>
            <Link href="/shops" className="text-blue-600 hover:underline font-semibold">
              ← Back to Shops
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/shops" className="text-blue-600 hover:underline font-semibold mb-8 inline-block">
          ← Back to Shops
        </Link>

        {/* Shop Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-32 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-5xl">🏬</p>
            </div>
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{shop.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl font-bold text-gray-900">{shop.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-gray-600">({shop.totalReviews} reviews)</span>
                </div>
              </div>
              {shop.address?.city && (
                <div>
                  <p className="text-gray-600 text-sm">Location</p>
                  <p className="text-lg font-semibold text-blue-600 mt-1">📍 {shop.address.city}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm">Category</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{shop.category}</p>
              </div>
            </div>

            <p className="text-gray-700 text-lg">{shop.description}</p>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🛍️ Shop Products</h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product._id} href={`/products/${product._id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full flex flex-col">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-40 flex items-center justify-center text-4xl">
                      📦
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-2 mb-3">
                          {product.discountPrice ? (
                            <>
                              <span className="text-xl font-bold text-gray-900">Rs. {product.discountPrice.toLocaleString()}</span>
                              <span className="text-sm text-gray-500 line-through">Rs. {product.price.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-gray-900">Rs. {product.price.toLocaleString()}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mb-4">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-sm">{product.rating?.toFixed(1) || 'N/A'}</span>
                          <span className="text-gray-600 text-xs">({product.totalReviews})</span>
                        </div>

                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                          View →
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">This shop hasn't added any products yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
