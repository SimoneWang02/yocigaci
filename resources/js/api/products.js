import api from './client'

export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data)
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data)
export const getRelatedProducts = (slug) =>
  api.get(`/products/${slug}/related`).then((r) => r.data)
export const getGames = (withCategories = false) =>
  api.get('/games', { params: withCategories ? { with: 'categories' } : {} }).then((r) => r.data)
export const getHomepageSections = () => api.get('/homepage-sections').then((r) => r.data)
export const getCarouselBanners = () => api.get('/carousel-banners').then((r) => r.data)
export const getCatalog = (id) => api.get(`/catalogs/${id}`).then((r) => r.data)
export const getSettings = () => api.get('/settings').then((r) => r.data)
export const getSearchSuggestions = (q) => api.get('/products/search-suggestions', { params: { q } }).then((r) => r.data)
export const getProductFacets = (params) => api.get('/products/facets', { params }).then((r) => r.data)
export const getShippingMethods = () => api.get('/shipping-methods').then((r) => r.data)
