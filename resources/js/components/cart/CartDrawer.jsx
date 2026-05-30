import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const SHIPPING_THRESHOLD = 60

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - total)

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCart} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Carrello</h2>
          <button onClick={closeCart} className="p-1 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-4">🛒</p>
              <p>Il carrello è vuoto</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 py-3 border-b last:border-0">
                {item.primary_image?.url ? (
                  <img
                    src={item.primary_image.url}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  {item.is_preorder && (
                    <span className="text-xs text-amber-600 font-medium">Preordine</span>
                  )}
                  <p className="text-sm font-bold text-indigo-700 mt-1">
                    € {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t space-y-3">
            {toFreeShipping > 0 ? (
              <p className="text-xs text-center text-gray-500 bg-gray-50 rounded py-2">
                Aggiungi <span className="font-semibold text-indigo-600">€ {toFreeShipping.toFixed(2).replace('.', ',')}</span> per la spedizione gratuita
              </p>
            ) : (
              <p className="text-xs text-center text-green-600 bg-green-50 rounded py-2 font-medium">
                Spedizione gratuita!
              </p>
            )}
            <div className="flex justify-between font-semibold">
              <span>Subtotale</span>
              <span>€ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <Button
              as={Link}
              to="/checkout"
              variant="primary"
              size="lg"
              className="w-full"
              onClick={closeCart}
            >
              Vai al checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
