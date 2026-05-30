import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await login(form)
      setAuth(data.user, data.token)
      navigate(data.user.role === 'admin' ? '/admin/prodotti' : '/')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Credenziali non valide.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Accedi</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Accesso...' : 'Accedi'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Non hai un account?{' '}
          <Link to="/registrati" className="text-indigo-600 hover:underline font-medium">Registrati</Link>
        </p>
      </div>
    </div>
  )
}
