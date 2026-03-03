'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface Street {
  _id: string
  name: string
  description: string
  location: {
    area: string
    city: string
  }
  shopCount: number
  isActive: boolean
}

interface Shop {
  _id: string
  name: string
  description: string
  category: string
  rating: number
  totalReviews: number
}

export default function StreetDetailPage() {
  const { id } = useParams()
  const [street, setStreet] = useState<Street | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch street
        const streetRes = await apiClient.get(`/streets/${id}`)
        setStreet(streetRes.data.data?.street)

        // Fetch shops in this street
        const shopsRes = await apiClient.get(`/shops?street=${id}&limit=50`)
        setShops(shopsRes.data.data?.shops || [])
      } catch (err) {
        console.error('Failed to fetch street:', err)
        setError('Failed to load street details')
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
          <p className="text-gray-600">Loading street...</p>
        </div>
      </div>
    )
  }

  if (error || !street) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 text-lg mb-6">{error || 'Street not found'}</p>
            <Link href="/streets" className="text-blue-600 hover:underline font-semibold">
              ← Back to Streets
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/streets" className="text-blue-600 hover:underline font-semibold mb-8 inline-block">
          ← Back to Streets
        </Link>

        {/* Street Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-5xl">📍</p>
            </div>
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{street.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {street.location.area}, {street.location.city}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Shops Available</p>
                <p className="text-lg font-semibold text-blue-600 mt-1">{street.shopCount} shops</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className={`text-lg font-semibold mt-1 ${street.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {street.isActive ? '✅ Active' : '❌ Inactive'}
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-lg">{street.description}</p>
          </div>
        </div>

        {/* Shops Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">🏬 Shops in {street.name}</h2>
          
          {shops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Link key={shop._id} href={`/shops/${shop._id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-24 flex items-center justify-center">
                      <div className="text-white text-center">
                        <p className="text-3xl">🏬</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shop.description}</p>
                      
                      <div className="space-y-2 mb-4">
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
              <p className="text-gray-600 text-lg">No shops available in this street yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
