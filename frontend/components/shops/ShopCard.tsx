// Shop Card Component
// Used in shop grid displays

interface ShopCardProps {
  id: string
  name: string
  category: string
  city: string
  rating: number
  reviews: number
  logo?: string
  description?: string
}

export default function ShopCard({
  id,
  name,
  category,
  city,
  rating,
  reviews,
  logo,
  description
}: ShopCardProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
      <div className="bg-gray-200 h-40">
        {logo && <img src={logo} alt={name} className="w-full h-full object-cover" />}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{name}</h3>

        <div className="flex justify-between items-start mb-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {category}
          </span>
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
            {city}
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm mb-2">
          <span className="text-yellow-500">★ {rating.toFixed(1)}</span>
          <span className="text-gray-500">({reviews})</span>
        </div>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  )
}
