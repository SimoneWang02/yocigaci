import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { confirmCheckout } from '../api/checkout'
import { useCartStore } from '../store/cartStore'
import { savePendingSession } from '../utils/checkoutStorage'
import { Button } from '../components/ui/Button'
import { Loader2 } from 'lucide-react'

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { clear } = useCartStore()
    const [error, setError] = useState(null)

    useEffect(() => {
        const sessionId = searchParams.get('session_id')
        if (!sessionId) {
            navigate('/checkout', { replace: true })
            return
        }

        confirmCheckout({ session_id: sessionId })
            .then((data) => {
                clear()
                savePendingSession(null)
                navigate(`/ordine-confermato/${data.order_number}`, { replace: true })
            })
            .catch((err) => {
                setError(err.response?.data?.message ?? 'Errore nella conferma del pagamento.')
            })
    }, [])

    if (error) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <p className="text-gray-500 text-sm mb-8">
                    Il pagamento potrebbe essere andato a buon fine. Controlla la tua email o contatta il supporto.
                </p>
                <Button onClick={() => navigate('/account/ordini')} variant="outline">
                    I miei ordini
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto px-4 py-24 text-center">
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-gray-600">Conferma dell&apos;ordine in corso...</p>
        </div>
    )
}
