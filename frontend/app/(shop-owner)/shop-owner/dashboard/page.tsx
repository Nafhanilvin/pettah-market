'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { getUserData } from '@/lib/auth'

export default function ShopOwnerDashboard() {
  const [shop, setShop] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    rating: 0
  })
  const [loading, setLoading] = useState(true)
  const user = getUserData()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch shop owned by this user
        const shopsRes = await apiClient.get('/shops?limit=1')
        const userShops = shopsRes.data.data?.shops?.filter((s: any) => s.ownerId === user?._id)
        
        if (userShops && userShops.length > 0) {
          setShop(userShops[0])
        }

        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          rating: 0
        })
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?._id])

  const StatCard = ({ title, value, icon }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop Owner Dashboard</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Shop Info */}
          {shop ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{shop.name}</h2>
                  <p className="text-gray-600 mb-4">{shop.description}</p>
                  <div className="space-y-1 text-sm">
                    <p><strong>Category:</strong> {shop.category}</p>
                    <p><strong>Phone:</strong> {shop.contact?.phone}</p>
                    <p><strong>Email:</strong> {shop.contact?.email}</p>
                  </div>
                </div>
                <Link
                  href="/shop-owner/my-shop"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Edit Shop
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-yellow-800 font-semibold mb-4">
                ⚠️ You haven't set up a shop yet. The admin needs to create your shop first.
              </p>
              <Link
                href="/shop-owner/my-shop"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Shop Setup
              </Link>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon="📦"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon="📋"
            />
            <StatCard
              title="Total Revenue"
              value={`Rs. ${stats.totalRevenue}`}
              icon="💰"
            />
            <StatCard
              title="Shop Rating"
              value={`${stats.rating.toFixed(1)} ⭐`}
              icon="⭐"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/shop-owner/products?action=new"
                className="block px-4 py-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors text-center"
              >
                + Add New Product
              </Link>
              <Link
                href="/shop-owner/my-shop"
                className="block px-4 py-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors text-center"
              >
                📝 Edit Shop Details
              </Link>
              <Link
                href="/shop-owner/orders"
                className="block px-4 py-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors text-center"
              >
                📋 View Orders
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
