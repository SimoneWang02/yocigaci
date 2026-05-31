import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../css/app.css'
import App from './App.jsx'
import { getCsrfCookie } from './api/client'

// Inizializza il cookie CSRF di Sanctum così che le POST (login, checkout, ecc.) non falliscano con 419
getCsrfCookie().catch(() => {})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
