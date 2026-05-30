import api from './client'

// Games
export const adminGetGames = () => api.get('/admin/games').then((r) => r.data)
export const adminCreateGame = (data) => api.post('/admin/games', data).then((r) => r.data)
export const adminUpdateGame = (id, data) => api.put(`/admin/games/${id}`, data).then((r) => r.data)
export const adminDeleteGame = (id) => api.delete(`/admin/games/${id}`).then((r) => r.data)

// Categories
export const adminGetCategories = (params) => api.get('/admin/categories', { params }).then((r) => r.data)
export const adminCreateCategory = (data) => api.post('/admin/categories', data).then((r) => r.data)
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data).then((r) => r.data)
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data)

// Products
export const adminGetProducts = (params) => api.get('/admin/products', { params }).then((r) => r.data)
export const adminGetProduct = (id) => api.get(`/admin/products/${id}`).then((r) => r.data)
export const adminCreateProduct = (data) => api.post('/admin/products', data).then((r) => r.data)
export const adminUpdateProduct = (id, data) => api.put(`/admin/products/${id}`, data).then((r) => r.data)
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`).then((r) => r.data)
export const adminUploadImage = (id, file) => {
  const form = new FormData()
  form.append('image', file)
  return api.post(`/admin/products/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
}
export const adminReorderImages = (id, order) =>
  api.patch(`/admin/products/${id}/images/reorder`, { order }).then((r) => r.data)
export const adminDeleteImage = (productId, imageId) =>
  api.delete(`/admin/products/${productId}/images/${imageId}`).then((r) => r.data)

// Orders
export const adminGetOrders = (params) => api.get('/admin/orders', { params }).then((r) => r.data)
export const adminGetOrder = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data)
export const adminUpdateOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data)
export const adminAddTracking = (id, tracking_code) =>
  api.patch(`/admin/orders/${id}/tracking`, { tracking_code }).then((r) => r.data)
