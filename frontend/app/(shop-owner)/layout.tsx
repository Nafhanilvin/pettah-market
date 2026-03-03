'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, isShopOwner, getUserData, logout } from '@/lib/auth'

export default function ShopOwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const user = getUserData()
    if (user?.userType !== 'shop-owner') {
      router.push('/')
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const user = getUserData()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/shop-owner/dashboard" className="text-2xl font-bold text-blue-600">
                🏪 Shop Owner
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <nav className="p-4 space-y-2">
            <Link
              href="/shop-owner/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/shop-owner/my-shop"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              🏪 My Shop
            </Link>
            <Link
              href="/shop-owner/products"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              📦 Products
            </Link>
            <Link
              href="/shop-owner/categories"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              🗂️ Subcategories
            </Link>
            <Link
              href="/shop-owner/orders"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              📋 Orders
            </Link>
            <Link
              href="/shop-owner/analytics"
              className="block px-4 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              📈 Analytics
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
