import api from './client'

export const getPage = (slug) => api.get(`/pages/${slug}`).then((r) => r.data.data)
