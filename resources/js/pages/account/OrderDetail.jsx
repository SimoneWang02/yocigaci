import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrder } from '../../api/orders'
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

export default function OrderDetail() {
  const { orderNumber } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => getOrder(orderNumber),
  })

  if (isLoading) return <PageSpinner />

  const order = data?.data
  if (!order) return <p className="text-center py-16 text-gray-500">Ordine non trovato.</p>

  const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' }
  const addr = order.shipping_address

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/account/ordini" className="text-sm text-indigo-600 hover:underline mb-4 block">
        ← Tutti gli ordini
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {order.tracking_code && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-semibold text-sm">Codice tracciamento: {order.tracking_code}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl divide-y">
        {order.items?.map((item) => (
          <div key={item.id} className="p-4 flex gap-3">
            {item.product_snapshot?.image_url && (
              <img src={item.product_snapshot.image_url} alt="" className="w-14 h-18 object-cover rounded" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.product_snapshot?.name}</p>
              {item.product_snapshot?.is_preorder && <p className="text-xs text-amber-600">Preordine</p>}
              <p className="text-sm text-gray-500">x{item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-900">
              € {Number(item.total_price).toFixed(2).replace('.', ',')}
            </p>
          </div>
        ))}
        <div className="p-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotale</span>
            <span>€ {Number(order.subtotal).toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Spedizione</span>
            <span>{Number(order.shipping_cost) === 0 ? 'Gratuita' : `€ ${Number(order.shipping_cost).toFixed(2).replace('.', ',')}`}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
            <span>Totale</span>
            <span>€ {Number(order.total).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
        <p className="font-semibold text-gray-800 mb-2">Indirizzo di spedizione</p>
        <p className="text-sm text-gray-600">
          {addr?.full_name}<br />
          {addr?.address_line1}{addr?.address_line2 ? `, ${addr.address_line2}` : ''}<br />
          {addr?.postal_code} {addr?.city} ({addr?.province})<br />
          {addr?.country}
        </p>
      </div>
    </div>
  )
}
