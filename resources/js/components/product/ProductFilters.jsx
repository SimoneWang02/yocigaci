import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGames, getProductFacets } from "../../api/products";
import { LANGUAGES } from "../ui/LanguageBadge";

export function ProductFilters() {
    const navigate = useNavigate();
    const { gameSlug, categorySlug } = useParams();
    const [params, setParams] = useSearchParams();

    const { data } = useQuery({
        queryKey: ["games-nav"],
        queryFn: () => getGames(true),
    });
    const games = data?.data ?? [];

    const currentLanguage = params.get("language") ?? "";
    const currentSort = params.get("sort") ?? "";
    const isPreorder = params.get("preorder") === "true";
    const currentGame = gameSlug ?? "";
    const currentCategory = categorySlug ?? "";

    const facetParams = {
        game: currentGame || undefined,
        category: currentCategory || undefined,
        preorder: isPreorder ? "true" : undefined,
        search: params.get("search") || undefined,
    };

    const { data: facetsData } = useQuery({
        queryKey: ["product-facets", facetParams],
        queryFn: () => getProductFacets(facetParams),
        staleTime: 30_000,
    });
    const gameCounts = facetsData?.games ?? {};
    const categoryCounts = facetsData?.categories ?? {};
    const languageCounts = facetsData?.languages ?? {};

    const preservedQuery = () => {
        const next = new URLSearchParams();
        if (params.get("sort")) next.set("sort", params.get("sort"));
        if (params.get("preorder")) next.set("preorder", params.get("preorder"));
        if (params.get("language")) next.set("language", params.get("language"));
        return next.toString();
    };

    const buildPath = (path) => {
        const qs = preservedQuery();
        return qs ? `${path}?${qs}` : path;
    };

    const selectGame = (slug) => {
        navigate(buildPath(slug ? `/catalogo/${slug}` : "/catalogo"));
    };

    const selectCategory = (catSlug) => {
        navigate(buildPath(catSlug ? `/catalogo/${gameSlug}/${catSlug}` : `/catalogo/${gameSlug}`));
    };

    const setQueryParam = (key, value) => {
        const next = new URLSearchParams(params);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete("page");
        setParams(next);
    };

    const selectedGame = games.find((g) => g.slug === currentGame);
    const categories = selectedGame?.categories ?? [];

    const availableLanguages = LANGUAGES.filter((l) => languageCounts[l.code] > 0);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-5">
            {/* Gioco */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Gioco
                </p>
                <div className="space-y-1">
                    <button
                        onClick={() => selectGame("")}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${!currentGame ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                        <span>Tutti</span>
                    </button>
                    {games.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => selectGame(game.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${currentGame === game.slug ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            <span>{game.name}</span>
                            {gameCounts[game.id] != null && (
                                <span className="text-xs text-gray-400">({gameCounts[game.id]})</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categoria */}
            {categories.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Categoria
                    </p>
                    <div className="space-y-1">
                        <button
                            onClick={() => selectCategory("")}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${!currentCategory ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            <span>Tutte</span>
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => selectCategory(cat.slug)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${currentCategory === cat.slug ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                <span>{cat.name}</span>
                                {categoryCounts[cat.id] != null && (
                                    <span className="text-xs text-gray-400">({categoryCounts[cat.id]})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Lingua */}
            {availableLanguages.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Lingua
                    </p>
                    <div className="space-y-1">
                        <button
                            onClick={() => setQueryParam("language", "")}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${!currentLanguage ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            <span>Tutte</span>
                        </button>
                        {availableLanguages.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => setQueryParam("language", currentLanguage === l.code ? "" : l.code)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${currentLanguage === l.code ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                <span>{l.label}</span>
                                <span className="text-xs text-gray-400">({languageCounts[l.code]})</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Ordinamento */}
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Ordinamento
                </p>
                <select
                    value={currentSort}
                    onChange={(e) => setQueryParam("sort", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Rilevanza</option>
                    <option value="price_asc">Prezzo crescente</option>
                    <option value="price_desc">Prezzo decrescente</option>
                    <option value="newest">Piu recenti</option>
                </select>
            </div>

            {/* Preordini */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPreorder}
                        onChange={(e) =>
                            setQueryParam("preorder", e.target.checked ? "true" : "")
                        }
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Solo Preordini</span>
                </label>
            </div>
        </div>
    );
}
