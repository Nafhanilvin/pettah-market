import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">🏪 Pettah Market</h3>
            <p className="text-gray-400">
              Your virtual marketplace connecting Pettah shops and customers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/shops" className="hover:text-white">Browse Shops</Link></li>
              <li><Link href="/products" className="hover:text-white">Browse Products</Link></li>
              <li><Link href="/search" className="hover:text-white">Search</Link></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/register" className="hover:text-white">Create Shop</Link></li>
              <li><Link href="/shop-owner/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link href="/shop-owner/products" className="hover:text-white">Manage Products</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@pettahmarket.com</li>
              <li>Phone: +94 (0) 123 456 789</li>
              <li>Address: Pettah, Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex justify-between items-center flex-col md:flex-row gap-4">
            <p className="text-gray-400">
              © 2026 Pettah Market. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-400">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/contact" className="hover:text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
