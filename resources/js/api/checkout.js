import api from './client'

export const createIntent = (data) => api.post('/checkout/create-intent', data).then((r) => r.data)
export const confirmCheckout = (data) => api.post('/checkout/confirm', data).then((r) => r.data)
