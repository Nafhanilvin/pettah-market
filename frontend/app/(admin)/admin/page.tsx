'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStreets: 0,
    totalShops: 0,
    totalProducts: 0,
    totalUsers: null as number | null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [streetsRes, shopsRes, productsRes] = await Promise.all([
          apiClient.get('/streets/stats'),
          apiClient.getShops({ limit: 1 }),
          apiClient.getProducts({ limit: 1 })
        ])

        setStats({
          totalStreets: streetsRes.data.data?.length || 0,
          totalShops: shopsRes.data.data?.pagination?.total || 0,
          totalProducts: productsRes.data.data?.pagination?.total || 0,
          totalUsers: null
        })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ title, value, icon, link }: any) => (
    <Link href={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    </Link>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Streets"
              value={stats.totalStreets}
              icon="🛣️"
              link="/admin/streets"
            />
            <StatCard
              title="Total Shops"
              value={stats.totalShops}
              icon="🏪"
              link="/admin/shops"
            />
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon="📦"
              link="/admin/products"
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers ?? 'N/A'}
              icon="👥"
              link="/admin/users"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/admin/streets"
                  className="block px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors"
                >
                  Manage Streets
                </Link>
                <Link
                  href="/admin/shops"
                  className="block px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors"
                >
                  View Shops
                </Link>
                <Link
                  href="/admin/products"
                  className="block px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors"
                >
                  View Products
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Info</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-semibold">● Online</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Version</span>
                  <span className="text-gray-900 font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Environment</span>
                  <span className="text-gray-900 font-semibold">Development</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
