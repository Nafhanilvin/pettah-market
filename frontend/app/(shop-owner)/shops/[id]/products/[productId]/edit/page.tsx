'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { isAuthenticated, isShopOwner } from '@/lib/auth'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const shopId = params.id as string
  const productId = params.productId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    quantity: '',
  })

  // Check auth
  useEffect(() => {
    if (!isAuthenticated() || !isShopOwner()) {
      router.push('/login')
    }
  }, [router])

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.getProduct(productId)
        const product = response.data.data
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          discountPrice: product.discountPrice?.toString() || '',
          categoryId: product.categoryId?._id || '',
          quantity: product.quantity?.toString() || '0',
        })
      } catch (err: any) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories({ limit: 100 })
        setCategories(response.data.data.categories || [])
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.categoryId || !formData.price || formData.quantity === '') {
        setError('Please fill in all required fields')
        setSubmitting(false)
        return
      }

      // Update product data
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        quantity: parseInt(formData.quantity),
      }

      // API call
      await apiClient.updateProduct(productId, productData)
      setSuccess(true)

      // Redirect after 1 second
      setTimeout(() => {
        router.push(`/shop-owner/shops/${shopId}/products`)
      }, 1000)
    } catch (err: any) {
      console.error('Error updating product:', err)
      setError(err.response?.data?.message || 'Failed to update product. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/shop-owner/shops/${shopId}/products`} className="text-blue-600 hover:underline font-semibold mb-4 inline-block">
            ← Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product details</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            ✓ Product updated successfully! Redirecting...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Samsung Galaxy S21"
              disabled={submitting || success}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product details, features, specifications..."
              rows={4}
              disabled={submitting || success}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={submitting || success}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="1000"
                step="0.01"
                min="0"
                disabled={submitting || success}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Price (Rs.)
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="Optional discount price"
                step="0.01"
                min="0"
                disabled={submitting || success}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              min="0"
              disabled={submitting || success}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || success}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-all"
          >
            {submitting ? 'Updating Product...' : success ? '✓ Product Updated!' : 'Update Product'}
          </button>

          {/* Cancel Link */}
          <div className="text-center">
            <Link href={`/shop-owner/shops/${shopId}/products`} className="text-gray-600 hover:text-gray-900">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
