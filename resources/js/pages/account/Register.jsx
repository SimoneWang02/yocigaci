import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Le password non coincidono.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await register(form)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Errore durante la registrazione.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crea account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome e cognome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Telefono (opzionale)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Input label="Conferma password" type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Registrazione...' : 'Crea account'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Hai già un account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">Accedi</Link>
        </p>
      </div>
    </div>
  )
}
