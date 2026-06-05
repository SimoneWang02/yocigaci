import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { CircleCheck } from 'lucide-react'

export default function OrderConfirmation() {
  const { orderNumber } = useParams()

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CircleCheck className="w-16 h-16 mx-auto mb-6 text-green-600" strokeWidth={1.5} />
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Ordine confermato!</h1>
      <p className="text-gray-600 mb-2">
        Il tuo ordine <span className="font-semibold text-indigo-700">{orderNumber}</span> è stato ricevuto.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Riceverai una email di conferma a breve.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/account/ordini">
          <Button variant="outline">I miei ordini</Button>
        </Link>
        <Link to="/catalogo">
          <Button variant="primary">Continua a fare shopping</Button>
        </Link>
      </div>
    </div>
  )
}
