'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { isAuthenticated, isCustomer } from '@/lib/auth'

interface Review {
  _id: string
  targetType: 'PRODUCT' | 'SHOP'
  targetId: string
  rating: number
  title: string
  comment: string
  createdAt: string
}

export default function MyReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ rating: 5, title: '', comment: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated() || !isCustomer()) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setError(null)
        const response = await apiClient.getMyReviews({ limit: 50 })
        setReviews(response.data.data.reviews || [])
      } catch (err: any) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load your reviews')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const startEdit = (review: Review) => {
    setEditingId(review._id)
    setFormData({ rating: review.rating, title: review.title, comment: review.comment })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ rating: 5, title: '', comment: '' })
  }

  const handleUpdate = async (reviewId: string) => {
    try {
      setSaving(true)
      const response = await apiClient.updateReview(reviewId, formData)
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? response.data.data : r)))
      cancelEdit()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update review')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await apiClient.deleteReview(reviewId)
      setReviews((prev) => prev.filter((r) => r._id !== reviewId))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete review')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Reviews</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-6 animate-pulse h-40"></div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{review.title}</h3>
                  <p className="text-sm text-gray-500">
                    {review.targetType} review • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(review)}
                    className="px-4 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="px-4 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingId === review._id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      disabled={saving}
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>{rating} Stars</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                    <textarea
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      rows={4}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(review._id)}
                      disabled={saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="border px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-yellow-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
          <Link href="/products" className="text-blue-600 hover:underline font-semibold">
            Browse products
          </Link>
        </div>
      )}
    </div>
  )
}
