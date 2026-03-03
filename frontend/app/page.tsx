'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import ShopCard from '@/components/shops/ShopCard'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [shops, setShops] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingShops, setLoadingShops] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        
        // Fetch featured products
        const productsResponse = await apiClient.getFeaturedProducts({ limit: 4 })
        setFeaturedProducts(productsResponse.data.data.products || [])
        
        // Fetch popular shops
        const shopsResponse = await apiClient.getShops({ limit: 3, sort: '-rating' })
        setShops(shopsResponse.data.data.shops || [])
      } catch (err: any) {
        console.error('Error loading data:', err)
        setError('Failed to load marketplace data')
      } finally {
        setLoadingProducts(false)
        setLoadingShops(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Pettah Market</h1>
          <p className="text-xl mb-8">Discover the best shops and products in Pettah, Colombo</p>
          <div className="flex gap-4 justify-center">
            <Link href="/shops" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all">
              Browse Shops
            </Link>
            <Link href="/products" className="border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>{error}</p>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link href="/products" className="text-blue-600 hover:underline font-semibold">
            View All →
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product._id} href={`/products/${product._id}`}>
                <ProductCard
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  rating={product.rating || 0}
                  reviews={product.totalReviews || 0}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No featured products available yet</p>
          </div>
        )}
      </section>

      {/* Popular Shops */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Popular Shops</h2>
          <Link href="/shops" className="text-blue-600 hover:underline font-semibold">
            View All →
          </Link>
        </div>

        {loadingShops ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop._id} href={`/shops/${shop._id}`}>
                <ShopCard
                  id={shop._id}
                  name={shop.name}
                  category={shop.category}
                  city={shop.address?.city || 'N/A'}
                  rating={shop.rating || 0}
                  reviews={shop.totalReviews || 0}
                  description={shop.description}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No shops available yet. <Link href="/register" className="text-blue-600 hover:underline">Create one!</Link></p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are you a shop owner?</h2>
          <p className="text-gray-600 mb-6">Join Pettah Market and reach more customers</p>
          <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all inline-block">
            Create Your Shop
          </Link>
        </div>
      </section>
    </div>
  )
}
