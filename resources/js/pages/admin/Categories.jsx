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

function CategoryForm({ category, games, defaultNavColumn, onSave, onCancel }) {
  const game = games.find((g) => g.id === (category?.game_id ?? games[0]?.id))
  const maxColumns = game?.navbar_columns ?? 1

  const [form, setForm] = useState({
    game_id: category?.game_id ?? (games[0]?.id ?? ''),
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    is_active: category?.is_active ?? true,
    sort_order: category?.sort_order ?? 0,
    nav_column: category?.nav_column ?? defaultNavColumn ?? 1,
  })

  const currentGame = games.find((g) => g.id == form.game_id)
  const currentMaxCols = currentGame?.navbar_columns ?? 1

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Gioco"
          value={form.game_id}
          onChange={(e) => setForm({ ...form, game_id: e.target.value, nav_column: 1 })}
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
        <Select
          label="Colonna nav"
          value={form.nav_column}
          onChange={(e) => setForm({ ...form, nav_column: parseInt(e.target.value) })}
        >
          {Array.from({ length: currentMaxCols }, (_, i) => i + 1).map((col) => (
            <option key={col} value={col}>Colonna {col}</option>
          ))}
        </Select>
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

function ColumnTable({ game, column, categories, games, search, editing, onEdit, onDelete, onSave, onCancelEdit, onReorder }) {
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
    onReorder(game.id, column, arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Colonna {column}</span>
        <span className="text-xs text-indigo-400">{categories.length} {categories.length === 1 ? 'categoria' : 'categorie'}</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
          <tr>
            <th className="px-3 py-2 w-8"></th>
            <th className="text-left px-4 py-2">Nome</th>
            <th className="text-center px-4 py-2">Stato</th>
            <th className="px-4 py-2"></th>
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-sm text-gray-400 text-center">Nessuna categoria</td>
                </tr>
              )}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
    </div>
  )
}

function GameSection({ game, categories, games, search, editing, onEdit, onDelete, onSave, onCancelEdit, onReorder }) {
  const numCols = game.navbar_columns ?? 1

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{game.name}</span>
        <span className="text-xs text-gray-400">{categories.length} categorie · {numCols} {numCols === 1 ? 'colonna' : 'colonne'}</span>
      </div>
      <div className={`p-4 grid gap-4`} style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}>
        {Array.from({ length: numCols }, (_, i) => i + 1).map((col) => (
          <ColumnTable
            key={col}
            game={game}
            column={col}
            categories={categories.filter((c) => (c.nav_column ?? 1) === col)}
            games={games}
            search={search}
            editing={editing}
            onEdit={onEdit}
            onDelete={onDelete}
            onSave={onSave}
            onCancelEdit={onCancelEdit}
            onReorder={onReorder}
          />
        ))}
      </div>
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

  const invalidate = () => {
    qc.invalidateQueries(['admin-categories'])
    qc.invalidateQueries(['games-nav'])
  }

  const create = useMutation({
    mutationFn: adminCreateCategory,
    onSuccess: () => { invalidate(); setCreating(false) },
  })
  const update = useMutation({
    mutationFn: ({ id, data }) => adminUpdateCategory(id, data),
    onSuccess: () => { invalidate(); setEditing(null) },
  })
  const del = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: invalidate,
  })
  const reorder = useMutation({
    mutationFn: adminReorderCategories,
    onSuccess: invalidate,
  })

  // localOrders: { [gameId]: { [col]: [id, id, ...] } }
  const handleReorder = (gameId, column, newIds) => {
    setLocalOrders((prev) => ({
      ...prev,
      [gameId]: { ...(prev[gameId] ?? {}), [column]: newIds },
    }))

    // Build full columns map for this game from current state + this change
    const gameCategories = allCategories.filter((c) => c.game_id === gameId)
    const game = games.find((g) => g.id === gameId)
    const numCols = game?.navbar_columns ?? 1
    const columns = {}
    for (let col = 1; col <= numCols; col++) {
      if (col === column) {
        columns[col] = newIds
      } else {
        const prev = localOrders[gameId]?.[col]
        if (prev) {
          columns[col] = prev
        } else {
          columns[col] = gameCategories.filter((c) => (c.nav_column ?? 1) === col).map((c) => c.id)
        }
      }
    }
    reorder.mutate(columns)
  }

  const categoriesForGame = (gameId) => {
    const base = allCategories.filter((c) => c.game_id === gameId)
    const gameLocal = localOrders[gameId]
    if (!gameLocal) return base

    return base.map((cat) => {
      const col = cat.nav_column ?? 1
      const colOrder = gameLocal[col]
      return colOrder ? { ...cat, sort_order: colOrder.indexOf(cat.id) } : cat
    }).sort((a, b) => a.sort_order - b.sort_order)
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
          <CategoryForm games={games} defaultNavColumn={1} onSave={(d) => create.mutate(d)} onCancel={() => setCreating(false)} />
        </div>
      )}

      <div className="space-y-4">
        {games.map((game) => (
          <GameSection
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
