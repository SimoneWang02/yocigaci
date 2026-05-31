import api from './client'

export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data)
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data)
export const getGames = (withCategories = false) =>
  api.get('/games', { params: withCategories ? { with: 'categories' } : {} }).then((r) => r.data)
export const getHomepageSections = () => api.get('/homepage-sections').then((r) => r.data)
