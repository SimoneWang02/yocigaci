import { Link } from "react-router-dom";

const paymentMethods = [
    "American Express",
    "Apple Pay",
    "Google Pay",
    "Klarna",
    "Maestro",
    "Mastercard",
    "PayPal",
    "Visa",
];

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {/* Informazioni */}
                    <div>
                        <p className="text-white font-semibold mb-3">
                            Informazioni
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/resi-e-rimborsi"
                                    className="hover:text-white transition-colors"
                                >
                                    Resi e Rimborsi
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/spedizioni"
                                    className="hover:text-white transition-colors"
                                >
                                    Spedizioni
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/diritto-di-recesso"
                                    className="hover:text-white transition-colors"
                                >
                                    Diritto di Recesso
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Assistenza */}
                    <div>
                        <p className="text-white font-semibold mb-3">
                            Assistenza
                        </p>
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
                                <Link
                                    to="/account/ordini"
                                    className="hover:text-white transition-colors"
                                >
                                    Tracking Ordine
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Area Personale */}
                    <div>
                        <p className="text-white font-semibold mb-3">
                            Area Personale
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/account/ordini"
                                    className="hover:text-white transition-colors"
                                >
                                    Account
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/account/ordini"
                                    className="hover:text-white transition-colors"
                                >
                                    I Miei Ordini
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800 text-xs text-center">
                    © {new Date().getFullYear()} Yocigaci - Tutti i diritti
                    riservati.
                </div>
            </div>
        </footer>
    );
}
