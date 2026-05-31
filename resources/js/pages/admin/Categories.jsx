import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api/admin'
import { adminGetGames } from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { PageSpinner } from '../../components/ui/Spinner'

function CategoryForm({ category, games, onSave, onCancel }) {
  const [form, setForm] = useState({
    game_id: category?.game_id ?? (games[0]?.id ?? ''),
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    is_active: category?.is_active ?? true,
    sort_order: category?.sort_order ?? 0,
  })

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Gioco"
          value={form.game_id}
          onChange={(e) => setForm({ ...form, game_id: e.target.value })}
        >
          {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Select>
        <Input
          label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Ordine"
          type="number"
          min={0}
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) })}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Stato</label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Attiva</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Annulla</Button>
        <Button variant="primary" size="sm" onClick={() => onSave(form)}>
          {category ? 'Salva' : 'Crea'}
        </Button>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [filterGame, setFilterGame] = useState('')

  const { data: gamesData } = useQuery({ queryKey: ['admin-games'], queryFn: adminGetGames })
  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories', filterGame],
    queryFn: () => adminGetCategories(filterGame ? { game_id: filterGame } : {}),
  })

  const games = gamesData?.data ?? []
  const categories = data?.data ?? []

  const create = useMutation({
    mutationFn: adminCreateCategory,
    onSuccess: () => { qc.invalidateQueries(['admin-categories']); qc.invalidateQueries(['games-nav']); setCreating(false) },
  })
  const update = useMutation({
    mutationFn: ({ id, data }) => adminUpdateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-categories']); qc.invalidateQueries(['games-nav']); setEditing(null) },
  })
  const del = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => { qc.invalidateQueries(['admin-categories']); qc.invalidateQueries(['games-nav']) },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorie</h1>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)}>+ Nuova categoria</Button>
      </div>

      <div className="mb-4">
        <Select value={filterGame} onChange={(e) => setFilterGame(e.target.value)} className="w-48">
          <option value="">Tutti i giochi</option>
          {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </Select>
      </div>

      {creating && (
        <div className="mb-4">
          <CategoryForm games={games} onSave={(d) => create.mutate(d)} onCancel={() => setCreating(false)} />
        </div>
      )}

      {isLoading ? <PageSpinner /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Gioco</th>
                <th className="text-center px-4 py-3">Ordine</th>
                <th className="text-center px-4 py-3">Stato</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <>
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500">{cat.game?.name}</td>
                    <td className="px-4 py-3 text-center">{cat.sort_order}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {cat.is_active ? 'Attiva' : 'Nascosta'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" aria-label="Modifica" title="Modifica" className="!px-2" onClick={() => setEditing(cat.id)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="danger" size="sm" aria-label="Elimina" title="Elimina" className="!px-2" onClick={() => window.confirm('Eliminare?') && del.mutate(cat.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editing === cat.id && (
                    <tr key={`edit-${cat.id}`}>
                      <td colSpan={5} className="px-4 pb-4">
                        <CategoryForm
                          category={cat}
                          games={games}
                          onSave={(d) => update.mutate({ id: cat.id, data: d })}
                          onCancel={() => setEditing(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
