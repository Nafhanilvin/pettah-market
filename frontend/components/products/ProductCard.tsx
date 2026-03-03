// Product Card Component
// Used in product grid displays

interface ProductCardProps {
  id: string
  name: string
  price: number
  discountPrice?: number
  rating: number
  reviews: number
  image?: string
}

export default function ProductCard({
  id,
  name,
  price,
  discountPrice,
  rating,
  reviews,
  image
}: ProductCardProps) {
  const discount = discountPrice ? Math.round((1 - discountPrice / price) * 100) : 0

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition">
      <div className="bg-gray-200 h-48 relative">
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">{name}</h3>

        <div className="flex items-baseline gap-2 mb-2">
          {discountPrice ? (
            <>
              <span className="text-lg font-bold text-gray-900">Rs. {discountPrice.toLocaleString()}</span>
              <span className="text-sm text-gray-500 line-through">Rs. {price.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">Rs. {price.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm">
          <span className="text-yellow-500">★ {rating.toFixed(1)}</span>
          <span className="text-gray-500">({reviews})</span>
        </div>
      </div>
    </div>
  )
}
