'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const loadCategories = async () => {
    try {
      setError(null)
      const response = await apiClient.getCategories({ limit: 100 })
      setCategories(response.data.data.categories || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await apiClient.createCategory({ name: name.trim(), description: description.trim() || null })
      setName('')
      setDescription('')
      await loadCategories()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category')
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Delete this category?')) return

    try {
      await apiClient.deleteCategory(categoryId)
      await loadCategories()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Category name"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">Loading categories...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">No categories found</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.description || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
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
