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
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity }] })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== productId) })
        } else {
          set({
            items: get().items.map((i) =>
              i.id === productId ? { ...i, quantity } : i
            ),
          })
        }
      },

      clear: () => set({ items: [] }),

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
      get count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
      get hasPreorder() {
        return get().items.some((i) => i.is_preorder)
      },
    }),
    { name: 'yocigaci-cart' }
  )
)
