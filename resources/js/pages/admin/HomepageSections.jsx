import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminGetHomepageSections,
  adminCreateHomepageSection,
  adminUpdateHomepageSection,
  adminDeleteHomepageSection,
  adminGetProducts,
} from '../../api/admin'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'

function ProductPicker({ selected, onChange }) {
  const [search, setSearch] = useState('')
  const { data, isFetching } = useQuery({
    queryKey: ['admin-product-search', search],
    queryFn: () => adminGetProducts({ search, per_page: 20 }),
    enabled: search.length >= 2,
  })

  const results = data?.data ?? []
  const selectedIds = new Set(selected.map((p) => p.id))

  const add = (product) => {
    if (selectedIds.has(product.id)) return
    onChange([...selected, product])
  }
  const remove = (id) => onChange(selected.filter((p) => p.id !== id))
  const move = (index, dir) => {
    const next = [...selected]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700">Prodotti associati</label>
        {selected.length === 0 ? (
          <p className="text-sm text-gray-400 mt-1">Nessun prodotto. Cercane uno qui sotto.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {selected.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                  {p.primary_image?.url && (
                    <img src={p.primary_image.url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="flex-1 text-sm text-gray-800 truncate">{p.name}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                    className="px-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1}
                    className="px-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => remove(p.id)}
                    className="px-1.5 text-red-500 hover:text-red-700">✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <Input
          label="Cerca prodotti da aggiungere"
          placeholder="Digita almeno 2 caratteri…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search.length >= 2 && (
          <div className="mt-2 border border-gray-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
            {isFetching ? (
              <p className="text-sm text-gray-400 px-3 py-2">Ricerca…</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-gray-400 px-3 py-2">Nessun risultato.</p>
            ) : (
              results.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => add(p)}
                  disabled={selectedIds.has(p.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                    {p.primary_image?.url && (
                      <img src={p.primary_image.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="flex-1 text-sm text-gray-800 truncate">{p.name}</span>
                  <span className="text-xs text-gray-400">{selectedIds.has(p.id) ? 'Aggiunto' : '+ Aggiungi'}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionForm({ section, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title: section?.title ?? '',
    cta_link: section?.cta_link ?? '',
    is_active: section?.is_active ?? true,
    sort_order: section?.sort_order ?? 0,
  })
  const [products, setProducts] = useState(section?.products ?? [])

  const submit = () => {
    onSave({ ...form, product_ids: products.map((p) => p.id) })
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Titolo sezione"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Input
          label="Link 'Vedi tutto' (opzionale)"
          placeholder="/catalogo?game=pokemon"
          value={form.cta_link}
          onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Ordine"
          type="number"
          min={0}
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
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
            <span className="text-sm text-gray-700">Visibile in homepage</span>
          </label>
        </div>
      </div>

      <ProductPicker selected={products} onChange={setProducts} />

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Annulla</Button>
        <Button variant="primary" size="sm" onClick={submit} disabled={saving || !form.title}>
          {section ? 'Salva modifiche' : 'Crea sezione'}
        </Button>
      </div>
    </div>
  )
}

export default function AdminHomepageSections() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['admin-homepage-sections'], queryFn: adminGetHomepageSections })
  const sections = data?.data ?? []

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-homepage-sections'] })
    qc.invalidateQueries({ queryKey: ['homepage-sections'] })
  }

  const create = useMutation({
    mutationFn: adminCreateHomepageSection,
    onSuccess: () => { invalidate(); setCreating(false) },
  })
  const update = useMutation({
    mutationFn: ({ id, data }) => adminUpdateHomepageSection(id, data),
    onSuccess: () => { invalidate(); setEditing(null) },
  })
  const del = useMutation({
    mutationFn: adminDeleteHomepageSection,
    onSuccess: invalidate,
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sezioni homepage</h1>
          <p className="text-sm text-gray-500">Gestisci le sezioni di prodotti mostrate sotto la hero.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { setCreating(true); setEditing(null) }}>+ Nuova sezione</Button>
      </div>

      {creating && (
        <div className="mb-4">
          <SectionForm
            onSave={(d) => create.mutate(d)}
            onCancel={() => setCreating(false)}
            saving={create.isPending}
          />
        </div>
      )}

      {sections.length === 0 && !creating ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
          Nessuna sezione. Creane una per popolare la homepage.
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 truncate">{section.title}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${section.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {section.is_active ? 'Visibile' : 'Nascosta'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(section.products?.length ?? 0)} prodotti · ordine {section.sort_order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(editing === section.id ? null : section.id); setCreating(false) }}>
                    {editing === section.id ? 'Chiudi' : 'Modifica'}
                  </Button>
                  <Button variant="danger" size="sm"
                    onClick={() => window.confirm('Eliminare questa sezione?') && del.mutate(section.id)}>
                    Elimina
                  </Button>
                </div>
              </div>
              {editing === section.id && (
                <div className="px-4 pb-4">
                  <SectionForm
                    section={section}
                    onSave={(d) => update.mutate({ id: section.id, data: d })}
                    onCancel={() => setEditing(null)}
                    saving={update.isPending}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
