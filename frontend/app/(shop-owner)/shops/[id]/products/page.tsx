'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { isAuthenticated, isShopOwner } from '@/lib/auth'

interface Product {
  _id: string
  name: string
  price: number
  discountPrice?: number
  description: string
  categoryId?: {
    _id: string
    name: string
  }
  quantity: number
  inStock: boolean
  rating: number
  totalReviews: number
}

export default function ProductsPage() {
  const router = useRouter()
  const params = useParams()
  const shopId = params.id as string

  const [products, setProducts] = useState<Product[]>([])
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check auth
  useEffect(() => {
    if (!isAuthenticated() || !isShopOwner()) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        
        // Fetch shop details
        const shopResponse = await apiClient.getShop(shopId)
        setShop(shopResponse.data.data)

        // Fetch products for this shop
        const productsResponse = await apiClient.getShopProducts(shopId, { limit: 100 })
        setProducts(productsResponse.data.data.products || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    if (shopId) {
      fetchData()
    }
  }, [shopId])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await apiClient.deleteProduct(productId)
      setProducts(products.filter(p => p._id !== productId))
    } catch (err: any) {
      alert('Failed to delete product')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/shop-owner/dashboard" className="text-blue-600 hover:underline font-semibold">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {loading ? 'Loading...' : shop?.name}
          </h1>
          <p className="text-gray-600">Manage your products</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Create Product Button */}
        <div className="mb-8">
          <Link
            href={`/shop-owner/shops/${shopId}/products/create`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            + Add Product
          </Link>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-all">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.categoryId?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-gray-900">Rs. {product.price.toLocaleString()}</span>
                        {product.discountPrice && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Rs. {product.discountPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.quantity > 10 && product.inStock
                          ? 'bg-green-100 text-green-800'
                          : product.quantity > 0 && product.inStock
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? `${product.quantity} units` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold">{product.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-gray-600">({product.totalReviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/shop-owner/shops/${shopId}/products/${product._id}/edit`}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">You don't have any products yet.</p>
            <Link
              href={`/shop-owner/shops/${shopId}/products/create`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
