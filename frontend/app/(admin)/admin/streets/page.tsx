'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface Street {
  _id: string
  name: string
  description?: string
  location?: {
    area?: string
    city?: string
  }
  shopCount: number
  isActive: boolean
}

export default function StreetsPage() {
  const [streets, setStreets] = useState<Street[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStreet, setEditingStreet] = useState<Street | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    area: '',
    city: 'Colombo'
  })

  useEffect(() => {
    fetchStreets()
  }, [])

  const fetchStreets = async () => {
    try {
      const response = await apiClient.get('/streets/stats')
      setStreets(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch streets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        location: {
          area: formData.area,
          city: formData.city
        }
      }

      if (editingStreet) {
        await apiClient.put(`/streets/${editingStreet._id}`, payload)
      } else {
        await apiClient.post('/streets', payload)
      }

      setShowForm(false)
      setEditingStreet(null)
      setFormData({ name: '', description: '', area: '', city: 'Colombo' })
      fetchStreets()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save street')
    }
  }

  const handleEdit = (street: Street) => {
    setEditingStreet(street)
    setFormData({
      name: street.name,
      description: street.description || '',
      area: street.location?.area || '',
      city: street.location?.city || 'Colombo'
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this street?')) return

    try {
      await apiClient.delete(`/streets/${id}`)
      fetchStreets()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete street')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Streets Management</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingStreet(null)
            setFormData({ name: '', description: '', area: '', city: 'Colombo' })
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + Add New Street
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingStreet ? 'Edit Street' : 'Add New Street'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main Street, 1st Cross Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pettah, Fort"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {editingStreet ? 'Update Street' : 'Create Street'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingStreet(null)
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Streets List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading streets...</p>
        </div>
      ) : streets.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Street Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Shops</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {streets.map((street) => (
                <tr key={street._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{street.name}</p>
                      {street.description && (
                        <p className="text-sm text-gray-600 mt-1">{street.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {street.location?.area && `${street.location.area}, `}
                    {street.location?.city || 'Colombo'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {street.shopCount} shops
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      street.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {street.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(street)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(street._id)}
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
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg mb-6">No streets found. Add your first street to get started!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Add First Street
          </button>
        </div>
      )}
    </div>
  )
}
