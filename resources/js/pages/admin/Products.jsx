import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetProducts, adminDeleteProduct } from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Select } from '../../components/ui/Select'
import { PageSpinner } from '../../components/ui/Spinner'
import { adminGetGames } from '../../api/admin'

export default function AdminProducts() {
  const qc = useQueryClient()
  const [filterGame, setFilterGame] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: gamesData } = useQuery({ queryKey: ['admin-games'], queryFn: adminGetGames })
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', filterGame, filterStatus],
    queryFn: () => adminGetProducts({
      ...(filterGame ? { game_id: filterGame } : {}),
      ...(filterStatus === 'active' ? { is_active: true } : {}),
      ...(filterStatus === 'inactive' ? { is_active: false } : {}),
    }),
  })

  const games = gamesData?.data ?? []
  const products = data?.data ?? []

  const del = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => qc.invalidateQueries(['admin-products']),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prodotti</h1>
        <Link to="/admin/prodotti/nuovo">
          <Button variant="primary" size="sm">+ Nuovo prodotto</Button>
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <Select value={filterGame} onChange={(e) => setFilterGame(e.target.value)} className="w-44">
          <option value="">Tutti i giochi</option>
          {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Select>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-44">
          <option value="">Tutti gli stati</option>
          <option value="active">Attivi</option>
          <option value="inactive">Nascosti</option>
        </Select>
      </div>

      {isLoading ? <PageSpinner /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 w-12"></th>
                <th className="text-left px-4 py-3">Prodotto</th>
                <th className="text-left px-4 py-3">Gioco</th>
                <th className="text-right px-4 py-3">Prezzo</th>
                <th className="text-center px-4 py-3">Stock</th>
                <th className="text-center px-4 py-3">Stato</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {p.primary_image?.url ? (
                      <img src={p.primary_image.url} alt="" className="w-10 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-12 bg-gray-100 rounded" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.name}</p>
                    {p.is_preorder && <Badge variant="preorder">Preordine</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.game?.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    € {Number(p.price).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.is_preorder ? '—' : (
                      <span className={p.stock === 0 ? 'text-red-500 font-medium' : 'text-gray-700'}>
                        {p.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {p.is_active ? 'Attivo' : 'Nascosto'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/admin/prodotti/${p.id}/modifica`}>
                        <Button variant="ghost" size="sm">Modifica</Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => window.confirm('Eliminare questo prodotto?') && del.mutate(p.id)}
                      >
                        Elimina
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center py-12 text-gray-400">Nessun prodotto trovato.</p>
          )}
        </div>
      )}
    </div>
  )
}
