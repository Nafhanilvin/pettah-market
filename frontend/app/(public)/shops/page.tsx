'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface Shop {
  _id: string
  name: string
  description: string
  category: string
  rating: number
  totalReviews: number
  street?: {
    _id: string
    name: string
  }
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get('/shops?limit=100')
        setShops(response.data.data?.shops || [])
      } catch (err) {
        console.error('Failed to fetch shops:', err)
        setError('Failed to load shops')
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🛍️ Browse Shops</h1>
          <p className="text-lg text-gray-600">
            Explore all shops in Pettah Market. Find exactly what you're looking for!
          </p>
        </div>

        {/* Filter */}
        {shops.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
              }`}
            >
              All Shops
            </button>
            {Array.from(new Set(shops.map(s => s.category).filter(Boolean))).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading shops...</p>
          </div>
        ) : (selectedCategory ? shops.filter(shop => shop.category === selectedCategory) : shops).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedCategory ? shops.filter(shop => shop.category === selectedCategory) : shops).map((shop) => (
              <Link key={shop._id} href={`/shops/${shop._id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-24 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-3xl">🏬</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{shop.name}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shop.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {shop.street && (
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="text-blue-600 font-semibold">📍</span>
                          <span className="ml-2">{shop.street.name}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="font-semibold text-yellow-500">⭐</span>
                        <span className="ml-2">
                          {shop.rating?.toFixed(1) || 'N/A'} ({shop.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {shop.category}
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      View Shop →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              {selectedCategory ? 'No shops found in this category.' : 'No shops available at the moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
