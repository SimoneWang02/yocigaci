import api from './client'

export const getOrders = (params) => api.get('/orders', { params }).then((r) => r.data)
export const getOrder = (orderNumber) => api.get(`/orders/${orderNumber}`).then((r) => r.data)
export const trackOrder = (data) => api.post('/orders/track', data).then((r) => r.data)
export const getAddresses = () => api.get('/addresses').then((r) => r.data)
export const createAddress = (data) => api.post('/addresses', data).then((r) => r.data)
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data).then((r) => r.data)
export const deleteAddress = (id) => api.delete(`/addresses/${id}`).then((r) => r.data)
