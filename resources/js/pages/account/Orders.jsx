import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '../../api/orders'
import { Badge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'

const STATUS_LABELS = {
  pending: { label: 'In attesa', variant: 'default' },
  paid: { label: 'Pagato', variant: 'success' },
  processing: { label: 'In preparazione', variant: 'info' },
  shipped: { label: 'Spedito', variant: 'success' },
  delivered: { label: 'Consegnato', variant: 'success' },
  cancelled: { label: 'Annullato', variant: 'sold_out' },
  refunded: { label: 'Rimborsato', variant: 'default' },
  preorder_confirmed: { label: 'Preordine confermato', variant: 'preorder' },
  preorder_ready: { label: 'Pronto per la spedizione', variant: 'info' },
}

export default function Orders() {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: getOrders })
  const orders = data?.data ?? []

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">I miei ordini</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📦</p>
          <p>Nessun ordine ancora.</p>
          <Link to="/catalogo" className="mt-4 inline-block text-indigo-600 hover:underline">
            Vai al catalogo →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' }
            return (
              <Link
                key={order.id}
                to={`/account/ordini/${order.order_number}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{order.order_number}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(order.created_at).toLocaleDateString('it-IT')}</span>
                  <span className="font-semibold text-gray-800">
                    € {Number(order.total).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                {order.type === 'preorder' && (
                  <p className="text-xs text-amber-600 mt-1">Preordine</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
