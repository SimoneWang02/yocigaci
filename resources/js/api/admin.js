import api from './client'

// Games
export const adminGetGames = () => api.get('/admin/games').then((r) => r.data)
export const adminCreateGame = (data) => api.post('/admin/games', data).then((r) => r.data)
export const adminUpdateGame = (id, data) => api.put(`/admin/games/${id}`, data).then((r) => r.data)
export const adminDeleteGame = (id) => api.delete(`/admin/games/${id}`).then((r) => r.data)
export const adminReorderGames = (ids) => api.post('/admin/games/reorder', { ids }).then((r) => r.data)

// Categories
export const adminGetCategories = (params) => api.get('/admin/categories', { params }).then((r) => r.data)
export const adminCreateCategory = (data) => api.post('/admin/categories', data).then((r) => r.data)
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data).then((r) => r.data)
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data)
export const adminReorderCategories = (columns) => api.post('/admin/categories/reorder', { columns }).then((r) => r.data)

// Products
export const adminGetProducts = (params) => api.get('/admin/products', { params }).then((r) => r.data)
export const adminGetProduct = (id) => api.get(`/admin/products/${id}`).then((r) => r.data)
export const adminCreateProduct = (data) => api.post('/admin/products', data).then((r) => r.data)
export const adminUpdateProduct = (id, data) => api.put(`/admin/products/${id}`, data).then((r) => r.data)
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`).then((r) => r.data)
export const adminDecrementStock = (id) => api.patch(`/admin/products/${id}/decrement-stock`).then((r) => r.data)
export const adminIncrementStock = (id) => api.patch(`/admin/products/${id}/increment-stock`).then((r) => r.data)
export const adminUploadImage = (id, file) => {
  const form = new FormData()
  form.append('image', file)
  return api.post(`/admin/products/${id}/images`, form).then((r) => r.data)
}
export const adminReorderImages = (id, order) =>
  api.patch(`/admin/products/${id}/images/reorder`, { order }).then((r) => r.data)
export const adminDeleteImage = (productId, imageId) =>
  api.delete(`/admin/products/${productId}/images/${imageId}`).then((r) => r.data)

// Homepage sections
export const adminGetHomepageSections = () => api.get('/admin/homepage-sections').then((r) => r.data)
export const adminCreateHomepageSection = (data) => api.post('/admin/homepage-sections', data).then((r) => r.data)
export const adminUpdateHomepageSection = (id, data) => api.put(`/admin/homepage-sections/${id}`, data).then((r) => r.data)
export const adminDeleteHomepageSection = (id) => api.delete(`/admin/homepage-sections/${id}`).then((r) => r.data)
export const adminReorderHomepageSections = (ids) => api.post('/admin/homepage-sections/reorder', { ids }).then((r) => r.data)

// Carousel banners
export const adminGetCarouselBanners = () => api.get('/admin/carousel-banners').then((r) => r.data)
export const adminUploadCarouselBanner = (file) => {
  const form = new FormData()
  form.append('image', file)
  return api.post('/admin/carousel-banners', form).then((r) => r.data)
}
export const adminUpdateCarouselBanner = (id, data) => api.patch(`/admin/carousel-banners/${id}`, data).then((r) => r.data)
export const adminDeleteCarouselBanner = (id) => api.delete(`/admin/carousel-banners/${id}`).then((r) => r.data)
export const adminReorderCarouselBanners = (ids) => api.post('/admin/carousel-banners/reorder', { ids }).then((r) => r.data)

// Settings
export const adminGetSettings = () => api.get('/admin/settings').then((r) => r.data)
export const adminUpdateSettings = (data) => api.patch('/admin/settings', data).then((r) => r.data)

// Pages
export const adminGetPages = () => api.get('/admin/pages').then((r) => r.data.data)
export const adminUpdatePage = (slug, data) => api.patch(`/admin/pages/${slug}`, data).then((r) => r.data.data)

// Orders
export const adminGetNewOrdersCount = () => api.get('/admin/orders/new-count').then((r) => r.data)
export const adminMarkOrdersSeen = () => api.post('/admin/orders/mark-seen').then((r) => r.data)
export const adminGetOrders = (params) => api.get('/admin/orders', { params }).then((r) => r.data)
export const adminGetOrder = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data)
export const adminAddTracking = (id, tracking_code) =>
  api.patch(`/admin/orders/${id}/tracking`, { tracking_code }).then((r) => r.data)
export const adminNotifyPickupReady = (id) =>
  api.post(`/admin/orders/${id}/notify-pickup`).then((r) => r.data)
export const adminConfirmPickup = (id) =>
  api.post(`/admin/orders/${id}/confirm-pickup`).then((r) => r.data)
export const adminRefundOrder = (id, { amount, reason } = {}) =>
  api.post(`/admin/orders/${id}/refund`, { amount, reason }).then((r) => r.data)

// Dashboard
export const adminGetDashboardStats = (period, offset = 0) =>
  api.get('/admin/dashboard/stats', { params: { period, offset } }).then((r) => r.data)

// Coupons
export const adminGetCoupons = () => api.get('/admin/coupons').then((r) => r.data)
export const adminCreateCoupon = (data) => api.post('/admin/coupons', data).then((r) => r.data)
export const adminUpdateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data).then((r) => r.data)
export const adminDeleteCoupon = (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data)
