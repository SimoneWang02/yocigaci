import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, quantity = 1) => {
        const items = get().items
        const existing = items.find((i) => i.id === product.id)

        // Controlla conflitto preordine/normale solo se il prodotto non è già nel carrello
        if (!existing && items.length > 0) {
          const cartHasPreorder = items.some((i) => i.is_preorder)
          const cartHasRegular = items.some((i) => !i.is_preorder)
          if (product.is_preorder && cartHasRegular) {
            return { ok: false, reason: 'mixed_cart' }
          }
          if (!product.is_preorder && cartHasPreorder) {
            return { ok: false, reason: 'mixed_cart' }
          }
        }

        const cap = (qty) => Math.min(qty, product.is_limited ? 1 : product.stock)

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: cap(i.quantity + quantity) }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity: cap(quantity) }] })
        }
        return { ok: true }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== productId) })
        } else {
          set({
            items: get().items.map((i) =>
              i.id === productId
                ? { ...i, quantity: Math.min(quantity, i.is_limited ? 1 : i.stock) }
                : i
            ),
          })
        }
      },

      clear: () => set({ items: [] }),
    }),
    { name: 'yocigaci-cart', partialize: (state) => ({ items: state.items }) }
  )
)
