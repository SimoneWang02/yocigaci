import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-white text-xl font-bold mb-2">Yocigaci</p>
            <p className="text-sm">Il tuo negozio TCG di fiducia. Pokémon, Magic, One Piece, Riftbound.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Navigazione</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalogo" className="hover:text-white transition-colors">Catalogo</Link></li>
              <li><Link to="/catalogo?preorder=true" className="hover:text-white transition-colors">Preordini</Link></li>
              <li>
                <a href="https://www.cardtrader.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Carte Singole ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Account</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Accedi</Link></li>
              <li><Link to="/registrati" className="hover:text-white transition-colors">Registrati</Link></li>
              <li><Link to="/account/ordini" className="hover:text-white transition-colors">I miei ordini</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-center">
          © {new Date().getFullYear()} Yocigaci. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  )
}
