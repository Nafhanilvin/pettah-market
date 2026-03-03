'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { getUserData } from '@/lib/auth'

interface Street {
  _id: string
  name: string
  location?: {
    area?: string
    city?: string
  }
}

interface Shop {
  _id: string
  name: string
  description: string
  category: string
  street?: string
  contact: {
    phone: string
    email: string
  }
}

export default function ShopOwnerShop() {
  const router = useRouter()
  const user = getUserData()
  const [shop, setShop] = useState<Shop | null>(null)
  const [streets, setStreets] = useState<Street[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    street: '',
    name: '',
    description: '',
    category: 'Electronics',
    phone: '',
    email: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch streets
        const streetsRes = await apiClient.get('/streets/stats')
        setStreets(streetsRes.data.data || [])

        // Fetch user's shop
        const shopsRes = await apiClient.get('/shops?limit=100')
        const userShops = shopsRes.data.data?.shops?.filter((s: any) => s.ownerId === user?._id)
        
        if (userShops && userShops.length > 0) {
          const userShop = userShops[0]
          setShop(userShop)
          setFormData({
            street: userShop.street || '',
            name: userShop.name,
            description: userShop.description || '',
            category: userShop.category || 'Electronics',
            phone: userShop.contact?.phone || '',
            email: userShop.contact?.email || ''
          })
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?._id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shop) {
      alert('Shop not found')
      return
    }

    try {
      const payload = {
        street: formData.street || null,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        contact: {
          phone: formData.phone,
          email: formData.email
        }
      }

      await apiClient.put(`/shops/${shop._id}`, payload)
      setShop({ ...shop, ...formData })
      setEditing(false)
      alert('Shop updated successfully!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update shop')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Shop</h1>
        <Link href="/shop-owner/dashboard" className="text-blue-600 hover:underline font-semibold">
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading shop details...</p>
        </div>
      ) : shop ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            {!editing ? (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                    <p className="text-lg font-semibold text-gray-900">{shop.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {shop.street ? streets.find(s => s._id === shop.street)?.name : 'Not assigned'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-gray-700">{shop.description || 'No description'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <p className="text-gray-700">{shop.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <p className="text-gray-700">{shop.contact?.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <p className="text-gray-700">{shop.contact?.email}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  ✏️ Edit Shop Details
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Street *
                  </label>
                  <select
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select a street --</option>
                    {streets.map(street => (
                      <option key={street._id} value={street._id}>
                        {street.name} {street.location?.area && `(${street.location.area})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Books & Media">Books & Media</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
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
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
          <p className="text-yellow-800 font-semibold text-lg mb-6">
            ⚠️ You haven't been assigned a shop yet. Please contact the admin to create your shop.
          </p>
          <Link
            href="/shop-owner/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  )
}
