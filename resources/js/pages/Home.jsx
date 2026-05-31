import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getGames } from "../api/products";
import { ProductCard } from "../components/product/ProductCard";
import { PageSpinner } from "../components/ui/Spinner";
import HeroCarousel from "../components/home/HeroCarousel";

const HERO_BANNERS = [
    {
        id: "pokemon",
        image: "/images/banners/banner-1.svg",
        alt: "Nuove uscite Pokémon",
        href: "/catalogo?game=pokemon",
    },
    {
        id: "one-piece",
        image: "/images/banners/banner-2.svg",
        alt: "One Piece Card Game — preordini",
        href: "/catalogo?preorder=true",
    },
    {
        id: "magic-riftbound",
        image: "/images/banners/banner-3.svg",
        alt: "Magic e Riftbound",
        href: "/catalogo",
    },
];

function CountdownTimer({ targetDate }) {
    const diff = new Date(targetDate) - new Date();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    return (
        <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            {days > 0 ? `${days} giorni` : "Disponibile a breve"}
        </span>
    );
}

export default function Home() {
    const { data: latestData, isLoading: loadingLatest } = useQuery({
        queryKey: ["products", "latest"],
        queryFn: () => getProducts({ sort: "newest", per_page: 8 }),
    });

    const { data: preorderData, isLoading: loadingPreorders } = useQuery({
        queryKey: ["products", "preorders"],
        queryFn: () => getProducts({ preorder: true, per_page: 4 }),
    });

    const { data: gamesData } = useQuery({
        queryKey: ["games-nav"],
        queryFn: () => getGames(true),
    });

    const latest = latestData?.data ?? [];
    const preorders = preorderData?.data ?? [];
    const games = gamesData?.data ?? [];

    return (
        <div>
            {/* Hero — carousel di banner */}
            <HeroCarousel slides={HERO_BANNERS} />

            {/* Ultime uscite */}
            <section className="max-w-7xl mx-auto px-4 py-14">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Ultime uscite
                    </h2>
                    <Link
                        to="/catalogo?sort=newest"
                        className="text-sm text-indigo-600 hover:underline font-medium"
                    >
                        Vedi tutto →
                    </Link>
                </div>
                {loadingLatest ? (
                    <PageSpinner />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                        {latest.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </section>

            {/* Preordini aperti */}
            {(loadingPreorders || preorders.length > 0) && (
                <section className="bg-amber-50 py-14">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Preordini aperti
                            </h2>
                            <Link
                                to="/catalogo?preorder=true"
                                className="text-sm text-amber-700 hover:underline font-medium"
                            >
                                Vedi tutti →
                            </Link>
                        </div>
                        {loadingPreorders ? (
                            <PageSpinner />
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {preorders.map((p) => (
                                    <div key={p.id} className="relative">
                                        <ProductCard product={p} />
                                        {p.preorder_release_date && (
                                            <div className="mt-1 text-center">
                                                <CountdownTimer
                                                    targetDate={
                                                        p.preorder_release_date
                                                    }
                                                />
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Esplora per gioco
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {games.map((game) => (
                        <Link
                            key={game.id}
                            to={`/catalogo?game=${game.slug}`}
                            className="group bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                            <div className="text-4xl mb-3">
                                {game.slug === "pokemon" && "⚡"}
                                {game.slug === "one-piece" && "☠️"}
                                {game.slug === "magic" && "🧙"}
                                {game.slug === "riftbound" && "🌀"}
                                {![
                                    "pokemon",
                                    "one-piece",
                                    "magic",
                                    "riftbound",
                                ].includes(game.slug) && "🃏"}
                            </div>
                            <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                {game.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
