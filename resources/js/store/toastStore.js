import { create } from 'zustand'

let nextId = 1

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, { type = 'success', duration = 3000 } = {}) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration)
    }
    return id
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// Helper per usarlo fuori dai componenti React.
export const toast = (message, opts) =>
  useToastStore.getState().addToast(message, opts)
