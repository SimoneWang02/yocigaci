import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { Badge } from '../ui/Badge'

export function ProductCard({ product }) {
  const { addItem, openCart } = useCartStore()
  const [added, setAdded] = useState(false)
  const [imageIdx, setImageIdx] = useState(0)

  const images = product.images ?? [product.primary_image].filter(Boolean)
  const currentImage = images[imageIdx]

  const handleAddToCart = () => {
    addItem(product)
    openCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const isOutOfStock = !product.is_preorder && product.stock === 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <Link
        to={`/prodotti/${product.slug}`}
        className="block relative overflow-hidden aspect-[3/4]"
        onMouseEnter={() => images.length > 1 && setImageIdx(1)}
        onMouseLeave={() => setImageIdx(0)}
      >
        {currentImage?.url ? (
          <img
            src={currentImage.url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_preorder && <Badge variant="preorder">Preordine</Badge>}
          {isOutOfStock && <Badge variant="sold_out">Esaurito</Badge>}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link to={`/prodotti/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-2">
          <p className="text-base font-bold text-indigo-700">
            € {Number(product.price).toFixed(2).replace('.', ',')}
          </p>
          {product.is_preorder && product.preorder_release_date && (
            <p className="text-xs text-amber-600">
              Uscita: {new Date(product.preorder_release_date).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {isOutOfStock ? (
          <button disabled className="w-full py-2 text-sm text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed">
            Esaurito
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
              added
                ? 'bg-green-100 text-green-700'
                : product.is_preorder
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {added ? '✓ Aggiunto' : product.is_preorder ? 'Preordina' : 'Aggiungi al carrello'}
          </button>
        )}
      </div>
    </div>
  )
}
