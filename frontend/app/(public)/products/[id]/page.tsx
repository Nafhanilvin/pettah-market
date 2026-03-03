'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  shopId: {
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

interface Review {
  _id: string
  author: { _id: string; firstName: string; lastName: string }
  rating: number
  comment: string
  createdAt: string
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authenticated = isAuthenticated()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/products/${id}`)
        setProduct(response.data.data?.product)

        // Fetch reviews
        const reviewsRes = await apiClient.get(`/reviews?productId=${id}&limit=10`)
        setReviews(reviewsRes.data.data?.reviews || [])
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700 text-lg mb-6">{error || 'Product not found'}</p>
            <Link href="/products" className="text-blue-600 hover:underline font-semibold">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/products" className="text-blue-600 hover:underline font-semibold mb-8 inline-block">
          ← Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg h-96 flex items-center justify-center text-6xl relative">
              📦
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">⭐</span>
                  <span className="text-xl font-bold text-gray-900">{product.rating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-gray-600">({product.totalReviews} reviews)</span>
                </div>
              </div>

              {/* Shop Info */}
              <Link href={`/shops/${product.shopId._id}`}>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                  <p className="text-sm text-gray-600">Available at:</p>
                  <p className="text-lg font-bold text-blue-600">🏬 {product.shopId.name}</p>
                </div>
              </Link>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-3">
                  {product.discountPrice ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        Rs. {product.discountPrice.toLocaleString()}
                      </span>
                      <span className="text-2xl text-gray-500 line-through">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-gray-900">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.categoryId && (
                  <p className="text-gray-600">Category: <span className="font-semibold">{product.categoryId.name}</span></p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock && product.quantity > 0 ? (
                  <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-800">In Stock</p>
                      <p className="text-sm text-green-700">{product.quantity} units available</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                    <span className="text-2xl">❌</span>
                    <p className="font-semibold text-red-800">Out of Stock</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {product.inStock && product.quantity > 0 && (
                <div className="flex gap-4">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    🛒 Add to Cart
                  </button>
                  <button className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                    ❤️ Wishlist
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="border-t p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              {!authenticated && (
                <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  + Write Review
                </Link>
              )}
            </div>

            {!authenticated && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  <Link href="/register" className="font-bold hover:underline">Register</Link> or <Link href="/login" className="font-bold hover:underline">Login</Link> to write a review
                </p>
              </div>
            )}

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">
                          {review.author.firstName} {review.author.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
