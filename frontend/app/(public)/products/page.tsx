'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  shopId?: {
    _id: string
    name: string
  }
  categoryId?: {
    _id: string
    name: string
  }
  rating: number
  totalReviews: number
  quantity: number
  inStock: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get('/products?limit=200')
        setProducts(response.data.data?.products || [])
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const categories = Array.from(new Set(products.map(p => p.categoryId?.name).filter(Boolean)))
  
  const filteredProducts = products.filter(product => {
    const matchCategory = !selectedCategory || product.categoryId?.name === selectedCategory
    const matchPrice = product.price >= priceRange.min && product.price <= priceRange.max
    return matchCategory && matchPrice
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🛒 Browse Products</h1>
          <p className="text-lg text-gray-600">
            Discover a wide variety of products available in Pettah Market
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Filters</h3>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Category</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === ''
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === cat
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min: Rs. {priceRange.min.toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max: Rs. {priceRange.max.toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('')
                  setPriceRange({ min: 0, max: 100000 })
                }}
                className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <p className="text-gray-600 mb-6">Showing {filteredProducts.length} products</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Link key={product._id} href={`/products/${product._id}`}>
                      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full flex flex-col">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-40 flex items-center justify-center text-4xl relative overflow-hidden">
                          📦
                          {product.discountPrice && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                              SALE
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                          <div className="mt-auto">
                            {product.shopId && (
                              <p className="text-xs text-blue-600 font-semibold mb-2">🏬 {product.shopId.name}</p>
                            )}

                            <div className="flex items-baseline gap-2 mb-3">
                              {product.discountPrice ? (
                                <>
                                  <span className="text-2xl font-bold text-gray-900">Rs. {product.discountPrice.toLocaleString()}</span>
                                  <span className="text-sm text-gray-500 line-through">Rs. {product.price.toLocaleString()}</span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-gray-900">Rs. {product.price.toLocaleString()}</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">⭐</span>
                                <span className="font-semibold text-sm">{product.rating?.toFixed(1) || 'N/A'}</span>
                                <span className="text-gray-600 text-xs">({product.totalReviews})</span>
                              </div>
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                product.inStock && product.quantity > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.inStock && product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>

                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">
                  {selectedCategory || (priceRange.min > 0 || priceRange.max < 100000)
                    ? 'No products found with these filters.'
                    : 'No products available at the moment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
