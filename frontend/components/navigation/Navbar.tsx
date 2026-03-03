'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          🏪 Pettah Market
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shops" className="text-gray-700 hover:text-blue-600">
            Shops
          </Link>
          <Link href="/products" className="text-gray-700 hover:text-blue-600">
            Products
          </Link>
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-64"
          />
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
          <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t py-4 px-4 space-y-4">
          <Link href="/shops" className="block text-gray-700 hover:text-blue-600">
            Shops
          </Link>
          <Link href="/products" className="block text-gray-700 hover:text-blue-600">
            Products
          </Link>
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <Link href="/login" className="block text-blue-600 font-semibold">
            Login
          </Link>
          <Link href="/register" className="block bg-blue-600 text-white px-6 py-2 rounded-lg text-center">
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  )
}
