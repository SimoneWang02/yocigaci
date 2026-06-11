import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getProducts, getGames, getSearchSuggestions } from '../api/products'
import { ProductCard } from '../components/product/ProductCard'
import { ProductFilters } from '../components/product/ProductFilters'
import { PageSpinner } from '../components/ui/Spinner'
import { Package, Search } from 'lucide-react'

export default function Catalog() {
  const { gameSlug, categorySlug } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  const sectionId = params.get('sezione') || undefined

  const [searchValue, setSearchValue] = useState(params.get('search') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchValue), 300)
    return () => clearTimeout(t)
  }, [searchValue])

  const { data: suggestionsData } = useQuery({
    queryKey: ['search-suggestions', debouncedSearch],
    queryFn: () => getSearchSuggestions(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 10_000,
  })
  const suggestions = suggestionsData?.data ?? []

  const { data: gamesData } = useQuery({
    queryKey: ['games-nav'],
    queryFn: () => getGames(true),
    staleTime: 60_000,
  })
  const games = gamesData?.data ?? []

  const currentGame = games.find((g) => g.slug === gameSlug)
  const currentCategory = currentGame?.categories?.find((c) => c.slug === categorySlug)

  const filters = {
    section_id: sectionId,
    game: gameSlug || undefined,
    category: categorySlug || undefined,
    language: params.get('language') || undefined,
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

  const metaTitle = currentCategory
    ? `${currentCategory.name} ${currentGame.name} a Carpi - Yocigaci`
    : currentGame
    ? `${currentGame.name} a Carpi - Yocigaci`
    : 'Catalogo TCG a Carpi - Yocigaci'

  const metaDescription = currentCategory
    ? `Acquista ${currentCategory.name} di ${currentGame.name} a Carpi. Yocigaci è il negozio TCG di Carpi con carte, buste, mazzi e accessori.`
    : currentGame
    ? `Acquista prodotti ${currentGame.name} a Carpi. Yocigaci è il negozio TCG di riferimento a Carpi con carte, buste, mazzi e accessori.`
    : 'Esplora il catalogo completo di Yocigaci: Magic The Gathering, Pokémon, One Piece e altri giochi di carte collezionabili a Carpi.'

  const setPage = (page) => {
    const next = new URLSearchParams(params)
    next.set('page', page)
    setParams(next)
    window.scrollTo({ top: 0 })
  }

  const applySearch = () => {
    const next = new URLSearchParams(params)
    const val = searchValue.trim()
    if (val) next.set('search', val)
    else next.delete('search')
    next.delete('page')
    setParams(next)
    setShowSuggestions(false)
  }

  const goToSuggestion = (slug) => {
    navigate(`/prodotti/${slug}`)
    setShowSuggestions(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
      </Helmet>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {currentCategory
          ? `${currentCategory.name} – ${currentGame.name}`
          : currentGame
          ? currentGame.name
          : 'Catalogo'}
      </h1>

      {/* Search */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Cerca prodotti..."
            value={searchValue}
            onChange={(e) => { setSearchValue(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); if (e.key === 'Escape') setShowSuggestions(false) }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToSuggestion(s.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  {s.primary_image ? (
                    <img src={s.primary_image} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-10 bg-gray-100 rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate leading-snug">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.is_preorder && <span className="text-amber-500 mr-1.5">Preordine</span>}
                      € {Number(s.price).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={applySearch}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 border-t border-gray-100 transition-colors font-medium"
              >
                <Search className="w-3.5 h-3.5" />
                Vedi tutti i risultati per &quot;{searchValue}&quot;
              </button>
            </div>
          )}
        </div>
        <button
          onClick={applySearch}
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
