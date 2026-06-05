import api from './client'

export const getAddresses = () => api.get('/addresses').then((r) => r.data.data)
export const saveAddress = (data) => api.post('/addresses', data).then((r) => r.data.data)
export const deleteAddress = (id) => api.delete(`/addresses/${id}`)
