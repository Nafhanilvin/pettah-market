// Review Card Component
// Used to display reviews

interface ReviewCardProps {
  id: string
  author: string
  rating: number
  title: string
  comment: string
  helpful: number
  unhelpful: number
  date: string
  verified?: boolean
}

export default function ReviewCard({
  id,
  author,
  rating,
  title,
  comment,
  helpful,
  unhelpful,
  date,
  verified = false
}: ReviewCardProps) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{author}</h3>
            {verified && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                ✓ Verified Purchase
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <div className="text-yellow-500 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i}>{i < rating ? '★' : '☆'}</span>
          ))}
        </div>
      </div>

      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-700 mb-4">{comment}</p>

      <div className="flex gap-4 pt-4 border-t">
        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
          👍 Helpful ({helpful})
        </button>
        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600">
          👎 Not helpful ({unhelpful})
        </button>
      </div>
    </div>
  )
}
