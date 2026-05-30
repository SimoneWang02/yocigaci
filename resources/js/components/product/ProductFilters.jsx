import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getGames } from '../../api/products'

export function ProductFilters() {
  const [params, setParams] = useSearchParams()
  const { data } = useQuery({ queryKey: ['games-nav'], queryFn: () => getGames(true) })
  const games = data?.data ?? []

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'game') next.delete('category')
    next.delete('page')
    setParams(next)
  }

  const currentGame = params.get('game') ?? ''
  const currentCategory = params.get('category') ?? ''
  const currentSort = params.get('sort') ?? ''
  const isPreorder = params.get('preorder') === 'true'

  const selectedGame = games.find((g) => g.slug === currentGame)
  const categories = selectedGame?.categories ?? []

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gioco</p>
        <div className="space-y-1">
          <button
            onClick={() => set('game', '')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentGame ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Tutti
          </button>
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => set('game', game.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentGame === game.slug ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {game.name}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoria</p>
          <div className="space-y-1">
            <button
              onClick={() => set('category', '')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Tutte
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => set('category', cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat.slug ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ordinamento</p>
        <select
          value={currentSort}
          onChange={(e) => set('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">Rilevanza</option>
          <option value="price_asc">Prezzo crescente</option>
          <option value="price_desc">Prezzo decrescente</option>
          <option value="newest">Più recenti</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPreorder}
            onChange={(e) => set('preorder', e.target.checked ? 'true' : '')}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Solo preordini</span>
        </label>
      </div>
    </div>
  )
}
