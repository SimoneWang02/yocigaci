import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Informazioni */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-white font-semibold mb-3">Informazioni</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/p/resi-e-rimborsi" className="hover:text-white transition-colors">
                                    Resi e Rimborsi
                                </Link>
                            </li>
                            <li>
                                <Link to="/p/spedizioni" className="hover:text-white transition-colors">
                                    Spedizioni
                                </Link>
                            </li>
                            <li>
                                <Link to="/p/diritto-di-recesso" className="hover:text-white transition-colors">
                                    Diritto di Recesso
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Assistenza */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-white font-semibold mb-3">Assistenza</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://wa.me/390000000000"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    Assistenza WhatsApp
                                </a>
                            </li>
                            <li>
                                <Link to="/account/ordini" className="hover:text-white transition-colors">
                                    Tracking Ordine
                                </Link>
                            </li>
                            <li>
                                <Link to="/p/recapiti" className="hover:text-white transition-colors">
                                    Recapiti
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Area Personale */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-white font-semibold mb-3">Area Personale</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/account/ordini" className="hover:text-white transition-colors">
                                    Account
                                </Link>
                            </li>
                            <li>
                                <Link to="/account/ordini" className="hover:text-white transition-colors">
                                    I Miei Ordini
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legale */}
                    <div className="flex flex-col items-center text-center">
                        <p className="text-white font-semibold mb-3">Legale</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/p/privacy" className="hover:text-white transition-colors">
                                    Informativa sulla Privacy
                                </Link>
                            </li>
                            <li>
                                <Link to="/p/termini-e-condizioni" className="hover:text-white transition-colors">
                                    Termini e Condizioni
                                </Link>
                            </li>
                            <li>
                                <Link to="/p/cookie" className="hover:text-white transition-colors">
                                    Informativa Cookie
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800 text-xs text-center">
                    © {new Date().getFullYear()} Yocigaci - Tutti i diritti riservati.
                </div>
            </div>
        </footer>
    );
}
