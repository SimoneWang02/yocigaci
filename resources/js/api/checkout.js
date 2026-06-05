import api from './client'

export const createSession = (data) => api.post('/checkout/create-session', data).then((r) => r.data)
export const confirmCheckout = (data) => api.post('/checkout/confirm', data).then((r) => r.data)
