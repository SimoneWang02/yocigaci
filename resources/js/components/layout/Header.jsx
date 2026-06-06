import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGames, getSettings } from "../../api/products";
import { logout } from "../../api/auth";
import { adminGetNewOrdersCount } from "../../api/admin";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export function Header() {
    const { user, clearAuth } = useAuthStore();
    const { items, openCart } = useCartStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeGame, setActiveGame] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    const count = items.reduce((s, i) => s + i.quantity, 0);

    const { data: gamesData } = useQuery({
        queryKey: ["games-nav"],
        queryFn: () => getGames(true),
    });
    const games = gamesData?.data ?? [];

    const { data: settingsData } = useQuery({
        queryKey: ["public-settings"],
        queryFn: getSettings,
    });

    const { data: newOrdersData } = useQuery({
        queryKey: ["admin-new-orders-count"],
        queryFn: adminGetNewOrdersCount,
        enabled: user?.role === "admin",
        refetchInterval: 60_000,
    });
    const newOrdersCount = newOrdersData?.count ?? 0;
    const cardtraderLabel = settingsData?.data?.cardtrader_label || "CardTrader";
    const cardtraderUrl =
        settingsData?.data?.cardtrader_url ||
        "https://www.cardtrader.com/en/users/yocigaci888";

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    const handleLogout = async () => {
        await logout();
        clearAuth();
        setUserMenuOpen(false);
        navigate("/");
    };

    const submitSearch = (e) => {
        e.preventDefault();
        const val = searchValue.trim();
        navigate(
            val ? `/catalogo?search=${encodeURIComponent(val)}` : "/catalogo",
        );
        setSearchOpen(false);
        setMobileOpen(false);
        setSearchValue("");
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img
                            src="/images/logo.svg"
                            alt="Yocigaci"
                            className="h-7 w-auto"
                        />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1 h-16">
                        {games.map((game) => (
                            <div
                                key={game.id}
                                className="static self-stretch flex items-center"
                                onMouseEnter={() => setActiveGame(game.id)}
                                onMouseLeave={() => setActiveGame(null)}
                            >
                                <Link
                                    to={`/catalogo?game=${game.slug}`}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeGame === game.id
                                            ? "text-indigo-600"
                                            : "text-gray-700 hover:text-indigo-600"
                                    }`}
                                >
                                    {game.name}
                                </Link>
                                {activeGame === game.id &&
                                    game.categories?.length > 0 && (
                                        /* Dropdown stile jpycollectibles: pannello a tutta larghezza, accento superiore, colonne */
                                        <div className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-xl z-50">
                                            <div className="max-w-7xl mx-auto px-4 py-6">
                                                <div className="mb-4">
                                                    <Link
                                                        to={`/catalogo?game=${game.slug}`}
                                                        className="text-sm font-semibold text-indigo-700 hover:underline"
                                                    >
                                                        Tutti i prodotti{" "}
                                                        {game.name}{" "}
                                                        <ArrowRight className="inline-block w-4 h-4 align-middle" />
                                                    </Link>
                                                </div>
                                                <div className="flex gap-8">
                                                    {Array.from({ length: Math.max(game.navbar_columns || 1, 1) }, (_, i) => i + 1).map((col) => {
                                                        const colCats = game.categories
                                                            .filter((c) => (c.nav_column ?? 1) === col)
                                                            .sort((a, b) => a.sort_order - b.sort_order)
                                                        return (
                                                            <div key={col} className="flex-1 space-y-0.5">
                                                                {colCats.map((cat) => (
                                                                    <Link
                                                                        key={cat.id}
                                                                        to={`/catalogo?game=${game.slug}&category=${cat.slug}`}
                                                                        className="block px-2 py-1.5 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                                    >
                                                                        {cat.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        ))}
                        <a
                            href={cardtraderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 rounded-md transition-colors"
                        >
                            {cardtraderLabel}
                        </a>
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <button
                                onClick={() => setSearchOpen((o) => !o)}
                                aria-label="Cerca"
                                className="p-2 text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                            {searchOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setSearchOpen(false)}
                                    />
                                    <form
                                        onSubmit={submitSearch}
                                        className="absolute right-0 top-full mt-2 z-50 flex items-center bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-72"
                                    >
                                        <input
                                            ref={searchInputRef}
                                            type="search"
                                            value={searchValue}
                                            onChange={(e) =>
                                                setSearchValue(e.target.value)
                                            }
                                            placeholder="Cerca tra tutti i prodotti..."
                                            className="flex-1 px-3 py-1.5 text-sm focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="p-2 text-gray-500 hover:text-indigo-600 cursor-pointer"
                                            aria-label="Cerca"
                                        >
                                            <Search className="w-5 h-5" />
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* User / account */}
                        {user ? (
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setUserMenuOpen((o) => !o)}
                                    aria-label="Account"
                                    className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
                                >
                                    <User className="w-6 h-6" />
                                    {newOrdersCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                            {newOrdersCount > 99 ? "99+" : newOrdersCount}
                                        </span>
                                    )}
                                </button>
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() =>
                                                setUserMenuOpen(false)
                                            }
                                        />
                                        <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-white border border-gray-200 shadow-lg rounded-lg py-2">
                                            {user.role === "admin" && (
                                                <Link
                                                    to="/admin/homepage"
                                                    onClick={() =>
                                                        setUserMenuOpen(false)
                                                    }
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Pannello Admin
                                                </Link>
                                            )}
                                            {user.role !== "admin" && (
                                                <>
                                                    <Link
                                                        to="/account/profilo"
                                                        onClick={() =>
                                                            setUserMenuOpen(false)
                                                        }
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Profilo
                                                    </Link>
                                                    <Link
                                                        to="/account/ordini"
                                                        onClick={() =>
                                                            setUserMenuOpen(false)
                                                        }
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        I miei ordini
                                                    </Link>
                                                </>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 cursor-pointer"
                                            >
                                                Esci
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                aria-label="Accedi o registrati"
                                className="p-2 text-gray-700 hover:text-indigo-600 transition-colors hidden md:block"
                            >
                                <User className="w-6 h-6" />
                            </Link>
                        )}

                        {/* Cart button */}
                        <button
                            onClick={openCart}
                            aria-label="Carrello"
                            className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            {count > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {count}
                                </span>
                            )}
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Menu"
                            className="md:hidden p-2 text-gray-700 cursor-pointer"
                        >
                            {mobileOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
                        {games.map((game) => (
                            <div key={game.id}>
                                <Link
                                    to={`/catalogo?game=${game.slug}`}
                                    className="block px-3 py-2 font-medium text-gray-800"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {game.name}
                                </Link>
                                {game.categories?.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        to={`/catalogo?game=${game.slug}&category=${cat.slug}`}
                                        className="block px-6 py-1.5 text-sm text-gray-600"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        ))}
                        <a
                            href={cardtraderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-3 py-2 text-gray-800"
                        >
                            {cardtraderLabel}
                        </a>
                        <div className="pt-2 border-t border-gray-100">
                            {user ? (
                                <>
                                    {user.role === "admin" && (
                                        <Link
                                            to="/admin/homepage"
                                            className="block px-3 py-2 text-indigo-600"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Admin
                                        </Link>
                                    )}
                                    {user.role !== "admin" && (
                                        <>
                                            <Link
                                                to="/account/profilo"
                                                className="block px-3 py-2 text-gray-700"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Profilo
                                            </Link>
                                            <Link
                                                to="/account/ordini"
                                                className="block px-3 py-2 text-gray-700"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                I miei ordini
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 text-red-500"
                                    >
                                        Esci
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 text-gray-700"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Accedi
                                    </Link>
                                    <Link
                                        to="/registrati"
                                        className="block px-3 py-2 text-indigo-600 font-medium"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Registrati
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
