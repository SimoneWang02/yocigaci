import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetGames, adminCreateGame, adminUpdateGame, adminDeleteGame, adminGetProducts } from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import { Link } from 'react-router-dom'

function GameForm({ game, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: game?.name ?? '',
    slug: game?.slug ?? '',
    navbar_columns: game?.navbar_columns ?? 1,
    is_active: game?.is_active ?? true,
    sort_order: game?.sort_order ?? 0,
  })

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Colonne navbar"
          type="number"
          min={1}
          max={4}
          value={form.navbar_columns}
          onChange={(e) => setForm({ ...form, navbar_columns: parseInt(e.target.value) })}
        />
        <Input
          label="Ordine"
          type="number"
          min={0}
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) })}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Attivo</label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Visibile</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Annulla</Button>
        <Button variant="primary" size="sm" onClick={() => onSave(form)}>
          {game ? 'Salva modifiche' : 'Crea gioco'}
        </Button>
      </div>
    </div>
  )
}

function GameProducts({ gameId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products-by-game', gameId],
    queryFn: () => adminGetProducts({ game_id: gameId, per_page: 100 }),
  })
  const products = data?.data ?? []

  if (isLoading) return <div className="px-6 py-3 text-sm text-gray-400">Caricamento...</div>
  if (products.length === 0) return <div className="px-6 py-3 text-sm text-gray-400">Nessun prodotto per questo gioco.</div>

  return (
    <div className="border-t border-gray-100 bg-gray-50 divide-y divide-gray-100">
      {products.map((p) => (
        <div key={p.id} className="flex items-center gap-3 px-6 py-2">
          {p.primary_image?.url ? (
            <img src={p.primary_image.url} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
          ) : (
            <div className="w-8 h-10 bg-gray-200 rounded shrink-0" />
          )}
          <span className="flex-1 text-sm text-gray-800">{p.name}</span>
          <span className="text-sm text-gray-500">€ {Number(p.price).toFixed(2).replace('.', ',')}</span>
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {p.is_active ? 'Attivo' : 'Nascosto'}
          </span>
          <Link to={`/admin/prodotti/${p.id}/modifica`}>
            <Button variant="ghost" size="sm" className="!px-2"><Pencil className="w-3.5 h-3.5" /></Button>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default function AdminGames() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedGame, setExpandedGame] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-games'], queryFn: adminGetGames })
  const games = (data?.data ?? []).filter((g) =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  )

  const create = useMutation({
    mutationFn: adminCreateGame,
    onSuccess: () => { qc.invalidateQueries(['admin-games']); qc.invalidateQueries(['games-nav']); setCreating(false) },
  })
  const update = useMutation({
    mutationFn: ({ id, data }) => adminUpdateGame(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-games']); qc.invalidateQueries(['games-nav']); setEditing(null) },
  })
  const del = useMutation({
    mutationFn: adminDeleteGame,
    onSuccess: () => { qc.invalidateQueries(['admin-games']); qc.invalidateQueries(['games-nav']) },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Giochi</h1>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)}>+ Nuovo gioco</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cerca gioco..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      {creating && (
        <div className="mb-4">
          <GameForm onSave={(d) => create.mutate(d)} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 w-8"></th>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-center px-4 py-3">Colonne</th>
              <th className="text-center px-4 py-3">Ordine</th>
              <th className="text-center px-4 py-3">Stato</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <>
                <tr key={game.id} className="hover:bg-gray-50 border-t border-gray-100 first:border-t-0">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {expandedGame === game.id
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{game.name}</td>
                  <td className="px-4 py-3 text-center">{game.navbar_columns}</td>
                  <td className="px-4 py-3 text-center">{game.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${game.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {game.is_active ? 'Attivo' : 'Nascosto'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" aria-label="Modifica" title="Modifica" className="!px-2" onClick={() => setEditing(game.id)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        aria-label="Elimina"
                        title="Elimina"
                        className="!px-2"
                        onClick={() => window.confirm('Eliminare questo gioco?') && del.mutate(game.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                {editing === game.id && (
                  <tr key={`edit-${game.id}`}>
                    <td colSpan={6} className="px-4 pb-4">
                      <GameForm
                        game={game}
                        onSave={(d) => update.mutate({ id: game.id, data: d })}
                        onCancel={() => setEditing(null)}
                      />
                    </td>
                  </tr>
                )}
                {expandedGame === game.id && (
                  <tr key={`products-${game.id}`}>
                    <td colSpan={6} className="p-0">
                      <GameProducts gameId={game.id} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
