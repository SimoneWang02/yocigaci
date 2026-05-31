import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

// Sanctum SPA: recupera il cookie XSRF-TOKEN. Memoizzato così la fetch parte una sola volta.
let csrfPromise = null
export const getCsrfCookie = () => {
  if (!csrfPromise) csrfPromise = api.get('/sanctum/csrf-cookie', { baseURL: '/' })
  return csrfPromise
}

const MUTATING = ['post', 'put', 'patch', 'delete']

api.interceptors.request.use(async (config) => {
  // Prima di ogni richiesta mutante assicura il cookie CSRF: senza, Sanctum risponde 419.
  // Axios invierà poi in automatico l'header X-XSRF-TOKEN leggendo il cookie.
  if (MUTATING.includes((config.method || 'get').toLowerCase()) && !document.cookie.includes('XSRF-TOKEN=')) {
    await getCsrfCookie()
  }
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
