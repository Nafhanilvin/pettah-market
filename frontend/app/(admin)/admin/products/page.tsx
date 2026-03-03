'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface Product {
  _id: string
  name: string
  price: number
  discountPrice?: number | null
  inStock: boolean
  rating: number
  totalReviews: number
  shopId?: {
    _id?: string
    name?: string
  }
  categoryId?: {
    name?: string
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const response = await apiClient.getProducts({ limit: 100, sort: '-createdAt' })
        setProducts(response.data.data.products || [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500">Read-only admin view</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">Loading products...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">No products found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Shop</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/products/${product._id}`} className="font-semibold text-blue-600 hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.shopId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.categoryId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    Rs. {(product.discountPrice ?? product.price ?? 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{(product.rating || 0).toFixed(1)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.inStock ? 'In stock' : 'Out of stock'}
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
