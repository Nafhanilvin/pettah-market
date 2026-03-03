'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import ShopCard from '@/components/shops/ShopCard'

interface Product {
  _id: string
  name: string
  price: number
  discountPrice?: number
  rating: number
  totalReviews: number
  images?: string[]
}

interface Shop {
  _id: string
  name: string
  category: string
  rating: number
  totalReviews: number
  address: { city: string }
  logo?: string
  description?: string
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!initialQuery.trim()) return

      try {
        setLoading(true)
        setError(null)

        const [productRes, shopRes] = await Promise.all([
          apiClient.searchProducts(initialQuery.trim(), { limit: 12 }),
          apiClient.searchShops(initialQuery.trim(), { limit: 8 })
        ])

        setProducts(productRes.data.data || [])
        setShops(shopRes.data.data || [])
      } catch (err: any) {
        console.error('Search error:', err)
        setError('Failed to load search results')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Search Results</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <input
          type="text"
          placeholder="Search shops, products, categories..."
          className="w-full px-4 py-3 border rounded-lg text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white border rounded-lg p-12 text-center text-gray-600">Loading results...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Results */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Products</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <Link key={product._id} href={`/products/${product._id}`}>
                    <ProductCard
                      id={product._id}
                      name={product.name}
                      price={product.price}
                      discountPrice={product.discountPrice}
                      rating={product.rating || 0}
                      reviews={product.totalReviews || 0}
                      image={product.images?.[0]}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-6 text-center text-gray-600">
                No products found.
              </div>
            )}
          </div>

          {/* Shops Results */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Shops</h2>
            {shops.length > 0 ? (
              <div className="space-y-4">
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
                      logo={shop.logo}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border rounded-lg p-6 text-center text-gray-600">
                No shops found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
