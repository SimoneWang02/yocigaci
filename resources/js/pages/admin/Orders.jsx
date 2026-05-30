import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetOrders, adminGetOrder, adminUpdateOrderStatus, adminAddTracking } from '../../api/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
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
  preorder_ready: { label: 'Pronto', variant: 'info' },
}

const ALL_STATUSES = Object.entries(STATUS_LABELS).map(([value, { label }]) => ({ value, label }))

function OrderDrawer({ orderId, onClose }) {
  const qc = useQueryClient()
  const [newStatus, setNewStatus] = useState('')
  const [tracking, setTracking] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => adminGetOrder(orderId),
    enabled: !!orderId,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => adminUpdateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries(['admin-orders']); qc.invalidateQueries(['admin-order', orderId]) },
  })

  const addTracking = useMutation({
    mutationFn: ({ id, code }) => adminAddTracking(id, code),
    onSuccess: () => { qc.invalidateQueries(['admin-orders']); qc.invalidateQueries(['admin-order', orderId]) },
  })

  const order = data?.data
  const status = order ? (STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' }) : null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-900">
            {order ? order.order_number : 'Ordine'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        {isLoading ? <PageSpinner /> : order && (
          <div className="p-5 space-y-6">
            <div className="flex items-center gap-3">
              <Badge variant={status.variant}>{status.label}</Badge>
              <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('it-IT')}</span>
              {order.type === 'preorder' && <Badge variant="preorder">Preordine</Badge>}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Prodotti</p>
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.product_snapshot?.name}</p>
                    <p className="text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold">€ {Number(item.total_price).toFixed(2).replace('.', ',')}</p>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Totale</span>
                <span>€ {Number(order.total).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {/* Customer */}
            {order.user && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-semibold text-gray-700">Cliente</p>
                <p>{order.user.name}</p>
                <p className="text-gray-500">{order.user.email}</p>
              </div>
            )}

            {/* Shipping address */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p className="font-semibold text-gray-700">Indirizzo di spedizione</p>
              {order.shipping_address && (
                <p className="text-gray-600">
                  {order.shipping_address.full_name}<br />
                  {order.shipping_address.address_line1}<br />
                  {order.shipping_address.postal_code} {order.shipping_address.city} ({order.shipping_address.province})
                </p>
              )}
            </div>

            {/* Tracking */}
            {order.tracking_code && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-green-800">Tracciamento: {order.tracking_code}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-semibold text-gray-700">Aggiorna stato</p>
              <div className="flex gap-2">
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1"
                >
                  <option value="">Seleziona stato...</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!newStatus}
                  onClick={() => { updateStatus.mutate({ id: order.id, status: newStatus }); setNewStatus('') }}
                >
                  Aggiorna
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Aggiungi tracking</p>
              <div className="flex gap-2">
                <Input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Codice spedizione..."
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!tracking}
                  onClick={() => { addTracking.mutate({ id: order.id, code: tracking }); setTracking('') }}
                >
                  Salva
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus, filterType],
    queryFn: () => adminGetOrders({
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(filterType ? { type: filterType } : {}),
    }),
  })

  const orders = data?.data ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ordini</h1>

      <div className="flex gap-3 mb-4">
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-52">
          <option value="">Tutti gli stati</option>
          {ALL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-44">
          <option value="">Tutti i tipi</option>
          <option value="standard">Standard</option>
          <option value="preorder">Preordine</option>
        </Select>
      </div>

      {isLoading ? <PageSpinner /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Numero</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Data</th>
                <th className="text-right px-4 py-3">Totale</th>
                <th className="text-center px-4 py-3">Tipo</th>
                <th className="text-center px-4 py-3">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: 'default' }
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-indigo-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedId(order.id)}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{order.order_number}</td>
                    <td className="px-4 py-3">
                      {order.user ? (
                        <div>
                          <p className="font-medium text-gray-800">{order.user.name}</p>
                          <p className="text-gray-500 text-xs">{order.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Guest</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      € {Number(order.total).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-600">{order.type}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center py-12 text-gray-400">Nessun ordine trovato.</p>
          )}
        </div>
      )}

      {selectedId && (
        <OrderDrawer orderId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}
