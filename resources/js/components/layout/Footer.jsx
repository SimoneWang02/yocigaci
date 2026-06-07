import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "../../api/products";

function InstagramIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6 shrink-0"
        >
            <defs>
                <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#f9ce34" />
                    <stop offset="25%" stopColor="#ee2a7b" />
                    <stop offset="60%" stopColor="#c026d3" />
                    <stop offset="100%" stopColor="#4f46e5" />
                </radialGradient>
            </defs>
            <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                fill="url(#ig-gradient)"
            />
            <circle
                cx="12"
                cy="12"
                r="4.2"
                fill="none"
                stroke="#fff"
                strokeWidth="1.7"
            />
            <circle cx="17.4" cy="6.6" r="1.1" fill="#fff" />
        </svg>
    );
}

const DEFAULT_HOURS = [
    { day: "Lunedi", hours: "15:30 - 19:30" },
    { day: "Martedi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Mercoledi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Giovedi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Venerdi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Sabato", hours: "11:00 - 19:30" },
    { day: "Domenica", hours: "11:00 - 13:00, 15:30 - 19:30" },
];

export function Footer() {
    const { data: settings } = useQuery({
        queryKey: ["public-settings"],
        queryFn: getSettings,
        staleTime: 1000 * 60 * 5,
    });

    const hours = settings?.data?.opening_hours ?? DEFAULT_HOURS;
    const whatsappNumber = settings?.data?.whatsapp_number || null;

    return (
        <footer className="bg-gray-900 text-gray-400 mt-auto">
            {/* Orari + Dove siamo */}
            <div className="max-w-5xl mx-auto px-6 pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Orari */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Orari
                        </div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                            Quando siamo aperti
                        </h2>
                        <ul className="mt-6 divide-y divide-gray-700 rounded-2xl bg-gray-800 ring-1 ring-gray-700">
                            {hours.map(({ day, hours }) => (
                                <li
                                    key={day}
                                    className="flex items-center justify-between px-5 py-3 text-sm"
                                >
                                    <span className="font-medium text-gray-200">
                                        {day}
                                    </span>
                                    <span className="text-gray-400">
                                        {hours}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Dove siamo + Social */}
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Dove siamo
                        </div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                            Vieni a trovarci
                        </h2>
                        <div className="mt-6 space-y-3">
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Yocigaci+Trading+Card+Shop"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-2xl bg-gray-800 px-5 py-4 ring-1 ring-gray-700 transition hover:bg-gray-700/60 text-sm"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 shrink-0 text-gray-400"
                                >
                                    <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
                                    <circle cx="12" cy="10" r="2.5" />
                                </svg>
                                <span className="font-medium text-gray-200">
                                    Corso Manfredo Fanti, 99, 41012 Carpi (MO)
                                </span>
                            </a>
                            <a
                                href="https://www.instagram.com/yocigaci/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-2xl bg-gray-800 px-5 py-4 ring-1 ring-gray-700 transition hover:bg-gray-700/60 text-sm"
                            >
                                <InstagramIcon />
                                <span className="font-medium text-gray-200">
                                    @yocigaci
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800" />

            {/* Link */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center">
                        <p className="text-white font-semibold mb-3">
                            Informazioni
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/p/resi-e-rimborsi"
                                    className="hover:text-white transition-colors"
                                >
                                    Resi e Rimborsi
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/p/spedizioni"
                                    className="hover:text-white transition-colors"
                                >
                                    Spedizioni
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/p/diritto-di-recesso"
                                    className="hover:text-white transition-colors"
                                >
                                    Diritto di Recesso
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <p className="text-white font-semibold mb-3">
                            Assistenza
                        </p>
                        <ul className="space-y-2 text-sm">
                            {whatsappNumber && (
                                <li>
                                    <a
                                        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        Assistenza WhatsApp
                                    </a>
                                </li>
                            )}
                            <li>
                                <Link
                                    to="/tracking"
                                    className="hover:text-white transition-colors"
                                >
                                    Tracking Ordine
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/p/recapiti"
                                    className="hover:text-white transition-colors"
                                >
                                    Recapiti
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center text-center">
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
                    <div className="flex flex-col items-center text-center">
                        <p className="text-white font-semibold mb-3">Legale</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/p/privacy"
                                    className="hover:text-white transition-colors"
                                >
                                    Informativa sulla Privacy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/p/termini-e-condizioni"
                                    className="hover:text-white transition-colors"
                                >
                                    Termini e Condizioni
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/p/cookie"
                                    className="hover:text-white transition-colors"
                                >
                                    Informativa Cookie
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800" />

            <div className="py-6 text-xs text-center space-y-1">
                <p>
                    © {new Date().getFullYear()} Yocigaci Srl - P.IVA
                    03118860356 - Sede legale: Via Zanichelli, 13 - 42015
                    Correggio (RE)
                </p>
                <p>Tutti i diritti riservati.</p>
            </div>
        </footer>
    );
}
