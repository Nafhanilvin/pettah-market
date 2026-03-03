'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/api'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string | null
  parentCategoryId?: string | null
}

export default function ShopOwnerCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [parentCategoryId, setParentCategoryId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parentCategoryId),
    [categories]
  )

  const subCategories = useMemo(
    () => categories.filter((category) => !!category.parentCategoryId),
    [categories]
  )

  const loadCategories = async () => {
    try {
      setError(null)
      const response = await apiClient.getCategories({ limit: 200 })
      setCategories(response.data.data?.categories || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!parentCategoryId || !name.trim()) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      await apiClient.createCategory({
        name: name.trim(),
        description: description.trim() || null,
        parentCategoryId
      })

      setName('')
      setDescription('')
      await loadCategories()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subcategory')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Subcategories</h1>

      <form onSubmit={handleCreateSubCategory} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Subcategory</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={parentCategoryId}
            onChange={(e) => setParentCategoryId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select parent category</option>
            {parentCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Subcategory name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">Loading categories...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      ) : subCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">No subcategories found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Parent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {parentCategories.find((parent) => parent._id === category.parentCategoryId)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}