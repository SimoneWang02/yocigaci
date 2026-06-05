import { useState } from 'react'
import { Pencil, Trash2, X, GripVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminReorderCategories,
} from '../../api/admin'
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

function SortableRow({ cat, editing, games, onEdit, onDelete, onSave, onCancelEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
      <tr ref={setNodeRef} style={style} className="border-t border-gray-100 first:border-t-0 hover:bg-gray-50">
        <td className="px-3 py-3 w-8">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
            aria-label="Trascina per riordinare"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </td>
        <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
        <td className="px-4 py-3 text-center">
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {cat.is_active ? 'Attiva' : 'Nascosta'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" aria-label="Modifica" title="Modifica" className="!px-2" onClick={() => onEdit(cat.id)}>
              {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </Button>
            <Button variant="danger" size="sm" aria-label="Elimina" title="Elimina" className="!px-2"
              onClick={() => window.confirm('Eliminare?') && onDelete(cat.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={4} className="px-4 pb-4 bg-white">
            <CategoryForm
              category={cat}
              games={games}
              onSave={(d) => onSave(cat.id, d)}
              onCancel={onCancelEdit}
            />
          </td>
        </tr>
      )}
    </>
  )
}

function GameCategoryTable({ game, categories, games, search, editing, onEdit, onDelete, onSave, onCancelEdit, onReorder }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const filtered = categories.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (search && filtered.length === 0) return null

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const ids = categories.map((c) => c.id)
    const oldIndex = ids.indexOf(active.id)
    const newIndex = ids.indexOf(over.id)
    onReorder(game.id, arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{game.name}</span>
        <span className="text-xs text-gray-400">{categories.length} categorie</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
          <tr>
            <th className="px-3 py-2.5 w-8"></th>
            <th className="text-left px-4 py-2.5">Nome</th>
            <th className="text-center px-4 py-2.5">Stato</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {filtered.map((cat) => (
                <SortableRow
                  key={cat.id}
                  cat={cat}
                  editing={editing === cat.id}
                  games={games}
                  onEdit={(id) => onEdit(editing === id ? null : id)}
                  onDelete={onDelete}
                  onSave={onSave}
                  onCancelEdit={onCancelEdit}
                />
              ))}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
    </div>
  )
}

export default function AdminCategories() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [localOrders, setLocalOrders] = useState({})

  const { data: gamesData } = useQuery({ queryKey: ['admin-games'], queryFn: adminGetGames })
  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminGetCategories(),
  })

  const games = gamesData?.data ?? []
  const allCategories = data?.data ?? []

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
  const reorder = useMutation({
    mutationFn: adminReorderCategories,
    onSuccess: () => { qc.invalidateQueries(['admin-categories']); qc.invalidateQueries(['games-nav']) },
  })

  const handleReorder = (gameId, newIds) => {
    setLocalOrders((prev) => ({ ...prev, [gameId]: newIds }))
    reorder.mutate(newIds)
  }

  const categoriesForGame = (gameId) => {
    const base = allCategories.filter((c) => c.game_id === gameId)
    const order = localOrders[gameId]
    if (!order) return base
    return order.map((id) => base.find((c) => c.id === id)).filter(Boolean)
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorie</h1>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)}>+ Nuova categoria</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Cerca categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
      </div>

      {creating && (
        <div className="mb-4">
          <CategoryForm games={games} onSave={(d) => create.mutate(d)} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div className="space-y-4">
        {games.map((game) => (
          <GameCategoryTable
            key={game.id}
            game={game}
            categories={categoriesForGame(game.id)}
            games={games}
            search={search}
            editing={editing}
            onEdit={setEditing}
            onDelete={(id) => del.mutate(id)}
            onSave={(id, d) => update.mutate({ id, data: d })}
            onCancelEdit={() => setEditing(null)}
            onReorder={handleReorder}
          />
        ))}
      </div>
    </div>
  )
}
