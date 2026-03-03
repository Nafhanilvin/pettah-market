'use client'

import { useEffect, useState } from 'react'
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

export default function StreetsPage() {
  const [streets, setStreets] = useState<Street[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStreets = async () => {
      try {
        const response = await apiClient.get('/streets?limit=100')
        const activeStreets = response.data.data?.streets?.filter((s: Street) => s.isActive) || []
        setStreets(activeStreets)
      } catch (err) {
        console.error('Failed to fetch streets:', err)
        setError('Failed to load streets')
      } finally {
        setLoading(false)
      }
    }

    fetchStreets()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏪 Explore Pettah Streets</h1>
          <p className="text-lg text-gray-600">
            Discover all the streets and shops in Pettah Market. Browse products from different areas.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading streets...</p>
          </div>
        ) : streets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streets.map((street) => (
              <Link key={street._id} href={`/streets/${street._id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-3xl font-bold">📍</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{street.name}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{street.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="font-semibold">Location:</span>
                        <span className="ml-2">{street.location.area}, {street.location.city}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="font-semibold">Shops:</span>
                        <span className="ml-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                          {street.shopCount}
                        </span>
                      </div>
                    </div>

                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      View Shops →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No streets available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
