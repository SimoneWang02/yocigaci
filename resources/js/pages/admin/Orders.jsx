import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetOrders, adminGetOrder, adminUpdateOrderStatus, adminAddTracking } from '../../api/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import { X, Package, User, MapPin, Truck, Hash, RefreshCw } from 'lucide-react'
import { useTableSort } from '../../hooks/useTableSort'
import { SortTh } from '../../components/ui/SortTh'

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

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-500" />
      </div>
      <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
  )
}

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

  const initials = order?.user?.name
    ? order.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-300" />
                <span className="font-mono text-white font-bold text-base tracking-wide">
                  {order?.order_number ?? '—'}
                </span>
                {order?.type === 'preorder' && (
                  <span className="text-xs bg-amber-400/20 text-amber-200 border border-amber-400/30 px-1.5 py-0.5 rounded font-medium">
                    Preordine
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {status && <Badge variant={status.variant}>{status.label}</Badge>}
                {order && (
                  <span className="text-indigo-200 text-xs">
                    {new Date(order.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? <PageSpinner /> : order && (
            <div className="p-5 space-y-6">

              {/* Products */}
              <div>
                <SectionHeader icon={Package} title="Prodotti" />
                <div className="bg-gray-50 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-indigo-600">{item.quantity}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{item.product_snapshot?.name}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 ml-3 flex-shrink-0">
                        € {Number(item.total_price).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-4 py-3 bg-white">
                    <span className="text-sm font-bold text-gray-900">Totale ordine</span>
                    <span className="text-base font-bold text-indigo-600">
                      € {Number(order.total).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer */}
              {order.user && (
                <div>
                  <SectionHeader icon={User} title="Cliente" />
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-700">{initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{order.user.name}</p>
                      <p className="text-xs text-gray-500">{order.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping address */}
              {order.shipping_address && (
                <div>
                  <SectionHeader icon={MapPin} title="Indirizzo di spedizione" />
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 space-y-0.5">
                    <p className="font-semibold text-gray-800">{order.shipping_address.full_name}</p>
                    <p>{order.shipping_address.address_line1}</p>
                    <p>
                      {order.shipping_address.postal_code} {order.shipping_address.city}
                      {order.shipping_address.province && ` (${order.shipping_address.province})`}
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking */}
              {order.tracking_code && (
                <div>
                  <SectionHeader icon={Truck} title="Tracciamento" />
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-mono font-semibold text-green-800">{order.tracking_code}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-100 pt-5 space-y-5">
                <div>
                  <SectionHeader icon={RefreshCw} title="Aggiorna stato" />
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1">
                    <Select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="">Seleziona stato...</option>
                      {ALL_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      disabled={!newStatus || updateStatus.isPending}
                      onClick={() => { updateStatus.mutate({ id: order.id, status: newStatus }); setNewStatus('') }}
                    >
                      Aggiorna
                    </Button>
                  </div>
                </div>

                <div>
                  <SectionHeader icon={Truck} title="Aggiungi tracking" />
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1">
                    <Input
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      placeholder="Codice spedizione..."
                    />
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      disabled={!tracking || addTracking.isPending}
                      onClick={() => { addTracking.mutate({ id: order.id, code: tracking }); setTracking('') }}
                    >
                      Salva
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus, filterType],
    queryFn: () => adminGetOrders({
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(filterType ? { type: filterType } : {}),
    }),
  })

  const filteredOrders = (data?.data ?? []).filter((o) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    )
  })
  const { sort, sorted: orders, onSort } = useTableSort(filteredOrders, 'created_at', 'desc')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ordini</h1>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Cerca ordine o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tutti gli stati</option>
            {ALL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        <div className="flex-1">
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tutti i tipi</option>
            <option value="standard">Standard</option>
            <option value="preorder">Preordine</option>
          </Select>
        </div>
      </div>

      {isLoading ? <PageSpinner /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <SortTh column="order_number" sort={sort} onSort={onSort}>Numero</SortTh>
                <SortTh column="user.name" sort={sort} onSort={onSort}>Cliente</SortTh>
                <SortTh column="created_at" sort={sort} onSort={onSort}>Data</SortTh>
                <SortTh column="total" sort={sort} onSort={onSort} align="right">Totale</SortTh>
                <SortTh column="type" sort={sort} onSort={onSort} align="center">Tipo</SortTh>
                <SortTh column="status" sort={sort} onSort={onSort} align="center">Stato</SortTh>
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
                      <span className="text-xs text-gray-600">{order.type ? order.type.charAt(0).toUpperCase() + order.type.slice(1) : ''}</span>
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
