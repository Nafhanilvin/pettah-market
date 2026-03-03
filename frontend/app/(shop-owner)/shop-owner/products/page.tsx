'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

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
  images?: string[]
  tags?: string[]
  sku?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
}

interface Category {
  _id: string
  name: string
}

export default function ShopOwnerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [shop, setShop] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    quantity: '',
    sku: '',
    imageUrls: '',
    tags: '',
    weight: '',
    length: '',
    width: '',
    height: ''
  })

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    categoryId: '',
    quantity: '',
    sku: '',
    imageUrls: '',
    tags: '',
    weight: '',
    length: '',
    width: '',
    height: ''
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopRes = await apiClient.getMyShop()
        setShop(shopRes.data.data || null)

        const productsRes = await apiClient.getMyProducts({ limit: 100 })
        setProducts(productsRes.data.data?.products || [])

        const categoriesRes = await apiClient.get('/categories?limit=100')
        setCategories(categoriesRes.data.data?.categories || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      setUploadingImages(true)

      const imageFiles = files.filter((file) => file.type.startsWith('image/'))
      if (imageFiles.length !== files.length) {
        alert('Only image files are allowed')
      }

      const tooLarge = imageFiles.find((file) => file.size > 2 * 1024 * 1024)
      if (tooLarge) {
        alert('Each image must be smaller than 2MB')
        return
      }

      const encoded = await Promise.all(imageFiles.map(fileToDataUrl))
      setUploadedImages((previous) => [...previous, ...encoded].slice(0, 6))
    } catch {
      alert('Failed to process selected images')
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  const removeUploadedImage = (index: number) => {
    setUploadedImages((previous) => previous.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shop) {
      alert('Shop not found')
      return
    }

    try {
      const imageList = formData.imageUrls
        .split(/\r?\n|,/) 
        .map((item) => item.trim())
        .filter(Boolean)

      const mergedImages = [...imageList, ...uploadedImages]

      const tagList = formData.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      const dimensions = {
        ...(formData.length ? { length: Number(formData.length) } : {}),
        ...(formData.width ? { width: Number(formData.width) } : {}),
        ...(formData.height ? { height: Number(formData.height) } : {})
      }

      const payload: any = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        quantity: parseInt(formData.quantity),
        sku: formData.sku || undefined,
        images: mergedImages.length > 0 ? mergedImages : undefined,
        tags: tagList.length > 0 ? tagList : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined
      }

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct._id}`, payload)
      } else {
        await apiClient.post('/products', payload)
      }

      setShowForm(false)
      setEditingProduct(null)
      setFormData(emptyForm)
      setUploadedImages([])
      
      const productsRes = await apiClient.getMyProducts({ limit: 100 })
      setProducts(productsRes.data.data?.products || [])
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || '',
      categoryId: product.categoryId?._id || '',
      quantity: product.quantity.toString(),
      sku: product.sku || '',
      imageUrls: Array.isArray(product.images) ? product.images.join('\n') : '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      weight: product.weight?.toString() || '',
      length: product.dimensions?.length?.toString() || '',
      width: product.dimensions?.width?.toString() || '',
      height: product.dimensions?.height?.toString() || ''
    })
    setUploadedImages([])
    setShowForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await apiClient.delete(`/products/${productId}`)
      setProducts(products.filter(p => p._id !== productId))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product')
    }
  }

  if (!shop && !loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
        <p className="text-yellow-800 font-semibold text-lg mb-6">
          ⚠️ You need to set up your shop first.
        </p>
        <Link
          href="/shop-owner/my-shop"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Set Up Shop
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="flex gap-3">
          <Link
            href="/shop-owner/categories"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Manage Subcategories
          </Link>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingProduct(null)
              setFormData(emptyForm)
              setUploadedImages([])
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Assigned shop: <span className="font-semibold">{shop?.name || 'N/A'}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Price (Rs.)
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Product Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Up to 6 images, max 2MB each</p>
                {uploadingImages && <p className="text-xs text-blue-600 mt-1">Processing images...</p>}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {uploadedImages.map((image, index) => (
                      <div key={`${index}-${image.slice(0, 30)}`} className="relative">
                        <img src={image} alt={`Upload ${index + 1}`} className="h-24 w-full object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(index)}
                          className="absolute top-1 right-1 px-2 py-1 text-xs bg-red-600 text-white rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image URLs (comma or new line separated)
                </label>
                <textarea
                  name="imageUrls"
                  value={formData.imageUrls}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                  <input
                    type="number"
                    step="0.01"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                  <input
                    type="number"
                    step="0.01"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="number"
                    step="0.01"
                    name="height"
                    value={formData.height}
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
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingProduct(null)
                    setUploadedImages([])
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

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                    {Array.isArray(product.images) && product.images.length > 0 && (
                      <a
                        href={product.images[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Image
                      </a>
                    )}
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
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
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
          <p className="text-gray-600 text-lg mb-6">You haven't added any products yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Add First Product
          </button>
        </div>
      )}
    </div>
  )
}
