'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api'

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    shopName: '',
    category: 'Other',
    phone: '',
    shopEmail: '',
    website: '',
    street: '',
    city: 'Colombo',
    district: '',
    postalCode: '',
    description: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        owner: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        },
        shop: {
          name: formData.shopName,
          category: formData.category,
          description: formData.description,
          phone: formData.phone,
          email: formData.shopEmail || formData.email,
          website: formData.website,
          street: formData.street,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode
        }
      }

      const response = await apiClient.createOwnerWithShop(payload)
      setSuccess(`Owner ${response.data.data.owner.email} and shop ${response.data.data.shop.name} created successfully.`)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        shopName: '',
        category: 'Other',
        phone: '',
        shopEmail: '',
        website: '',
        street: '',
        city: 'Colombo',
        district: '',
        postalCode: '',
        description: ''
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create owner and shop')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Owner Management</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 mb-4">{success}</div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Shop Owner + Initial Shop</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Owner first name" className="px-4 py-2 border border-gray-300 rounded-lg" />
            <input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Owner last name" className="px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Owner login email" className="px-4 py-2 border border-gray-300 rounded-lg" />
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="Owner login password" className="px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="shopName" value={formData.shopName} onChange={handleChange} required placeholder="Shop name" className="px-4 py-2 border border-gray-300 rounded-lg" />
            <select name="category" value={formData.category} onChange={handleChange} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Food & Beverages</option>
              <option>Home & Garden</option>
              <option>Health & Beauty</option>
              <option>Books & Media</option>
              <option>Sports & Outdoors</option>
              <option>Toys & Games</option>
              <option>Automotive</option>
              <option>Services</option>
              <option>Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="Shop phone" className="px-4 py-2 border border-gray-300 rounded-lg" />
            <input type="email" name="shopEmail" value={formData.shopEmail} onChange={handleChange} placeholder="Shop contact email (optional)" className="px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <input name="website" value={formData.website} onChange={handleChange} placeholder="Website (optional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="street" value={formData.street} onChange={handleChange} required placeholder="Street address" className="px-4 py-2 border border-gray-300 rounded-lg" />
            <input name="district" value={formData.district} onChange={handleChange} required placeholder="District" className="px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="city" value={formData.city} onChange={handleChange} required placeholder="City" className="px-4 py-2 border border-gray-300 rounded-lg" />
            <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code (optional)" className="px-4 py-2 border border-gray-300 rounded-lg" />
          </div>

          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Shop description (optional)" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Owner + Shop'}
          </button>
        </form>
      </div>
    </div>
  )
}
