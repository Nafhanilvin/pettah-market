'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface Shop {
  _id: string
  name: string
  category: string
  rating: number
  totalProducts: number
  totalReviews: number
  isActive: boolean
  address?: {
    city?: string
  }
  ownerId?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const response = await apiClient.getShops({ limit: 100, sort: '-createdAt' })
        setShops(response.data.data.shops || [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load shops')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
        <p className="text-sm text-gray-500">Read-only admin view</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">Loading shops...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">No shops found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Shop</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shops.map((shop) => (
                <tr key={shop._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/shops/${shop._id}`} className="font-semibold text-blue-600 hover:underline">
                      {shop.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {shop.ownerId?.firstName || 'N/A'} {shop.ownerId?.lastName || ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.category || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{shop.address?.city || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{(shop.rating || 0).toFixed(1)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
