import { useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../api/products'
import { ProductCard } from '../components/product/ProductCard'
import { ProductFilters } from '../components/product/ProductFilters'
import { PageSpinner } from '../components/ui/Spinner'
import { Package, Search } from 'lucide-react'

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const searchRef = useRef(null)

  const sectionId = params.get('sezione') || undefined

  const filters = {
    section_id: sectionId,
    game: params.get('game') || undefined,
    category: params.get('category') || undefined,
    preorder: params.get('preorder') || undefined,
    sort: params.get('sort') || undefined,
    search: params.get('search') || undefined,
    page: params.get('page') || 1,
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
  })

  const products = data?.data ?? []
  const meta = data?.meta ?? {}

  const setPage = (page) => {
    const next = new URLSearchParams(params)
    next.set('page', page)
    setParams(next)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Catalogo</h1>

      {/* Search */}
      <div className="mb-6 flex gap-2">
        <input
          ref={searchRef}
          type="search"
          placeholder="Cerca prodotti..."
          defaultValue={params.get('search') ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const next = new URLSearchParams(params)
              const val = e.target.value.trim()
              if (val) next.set('search', val)
              else next.delete('search')
              next.delete('page')
              setParams(next)
            }
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => {
            const next = new URLSearchParams(params)
            const val = searchRef.current?.value.trim() ?? ''
            if (val) next.set('search', val)
            else next.delete('search')
            next.delete('page')
            setParams(next)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Search size={16} />
          Cerca
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        {!sectionId && (
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <ProductFilters />
            </div>
          </aside>
        )}

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <PageSpinner />
          ) : isError ? (
            <p className="text-center py-16 text-red-500">Errore nel caricamento dei prodotti.</p>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-14 h-14 mx-auto mb-4" strokeWidth={1.5} />
              <p className="text-lg">Nessun prodotto trovato.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-4">
                {meta.total} prodotti trovati
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 mb-8">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {meta.last_page > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        page === meta.current_page
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
