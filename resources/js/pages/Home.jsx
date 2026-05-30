import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducts, getGames } from '../api/products'
import { ProductCard } from '../components/product/ProductCard'
import { PageSpinner } from '../components/ui/Spinner'

function CountdownTimer({ targetDate }) {
  const diff = new Date(targetDate) - new Date()
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  return (
    <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
      {days > 0 ? `${days} giorni` : 'Disponibile a breve'}
    </span>
  )
}

export default function Home() {
  const { data: latestData, isLoading: loadingLatest } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: () => getProducts({ sort: 'newest', per_page: 8 }),
  })

  const { data: preorderData, isLoading: loadingPreorders } = useQuery({
    queryKey: ['products', 'preorders'],
    queryFn: () => getProducts({ preorder: true, per_page: 4 }),
  })

  const { data: gamesData } = useQuery({
    queryKey: ['games-nav'],
    queryFn: () => getGames(true),
  })

  const latest = latestData?.data ?? []
  const preorders = preorderData?.data ?? []
  const games = gamesData?.data ?? []

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Yocigaci
          </h1>
          <p className="text-xl text-indigo-200 mb-8">
            Il tuo negozio TCG — Pokémon, One Piece, Magic e Riftbound
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="px-8 py-4 bg-white text-indigo-800 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-lg"
            >
              Vai al catalogo
            </Link>
            <Link
              to="/catalogo?preorder=true"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              Preordini aperti
            </Link>
          </div>
        </div>
      </section>

      {/* Ultime uscite */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ultime uscite</h2>
          <Link to="/catalogo?sort=newest" className="text-sm text-indigo-600 hover:underline font-medium">
            Vedi tutto →
          </Link>
        </div>
        {loadingLatest ? <PageSpinner /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Preordini aperti */}
      {(loadingPreorders || preorders.length > 0) && (
        <section className="bg-amber-50 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Preordini aperti</h2>
              <Link to="/catalogo?preorder=true" className="text-sm text-amber-700 hover:underline font-medium">
                Vedi tutti →
              </Link>
            </div>
            {loadingPreorders ? <PageSpinner /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {preorders.map((p) => (
                  <div key={p.id} className="relative">
                    <ProductCard product={p} />
                    {p.preorder_release_date && (
                      <div className="mt-1 text-center">
                        <CountdownTimer targetDate={p.preorder_release_date} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Per gioco */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Esplora per gioco</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/catalogo?game=${game.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="text-4xl mb-3">
                {game.slug === 'pokemon' && '⚡'}
                {game.slug === 'one-piece' && '☠️'}
                {game.slug === 'magic' && '🧙'}
                {game.slug === 'riftbound' && '🌀'}
                {!['pokemon','one-piece','magic','riftbound'].includes(game.slug) && '🃏'}
              </div>
              <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                {game.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Banner Carte Singole */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-white text-2xl font-bold mb-2">Cerchi carte singole?</p>
          <p className="text-gray-400 mb-6">Trova milioni di carte su CardTrader, il marketplace di riferimento per i collezionisti TCG.</p>
          <a
            href="https://www.cardtrader.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-lg"
          >
            Vai su CardTrader →
          </a>
        </div>
      </section>
    </div>
  )
}
