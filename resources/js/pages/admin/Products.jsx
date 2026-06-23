import { Fragment, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Pencil, Trash2, AlertTriangle, X, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetProducts, adminDeleteProduct, adminUpdateProduct, adminDecrementStock, adminIncrementStock, adminGetGames, adminGetCategories } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";
import { SortTh } from "../../components/ui/SortTh";
import { LANGUAGES } from "../../components/ui/LanguageBadge";

export default function AdminProducts() {
    const qc = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [editingStockId, setEditingStockId] = useState(null);
    const [stockDraft, setStockDraft] = useState("");
    const [editingNameId, setEditingNameId] = useState(null);
    const [nameDraft, setNameDraft] = useState("");
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [priceDraft, setPriceDraft] = useState("");

    const search = searchParams.get("search") ?? "";
    const filterGame = searchParams.get("game_id") ?? "";
    const filterCategory = searchParams.get("category_id") ?? "";
    const filterLanguage = searchParams.get("language") ?? "";
    const filterActive = searchParams.get("is_active") ?? "";
    const sortBy = searchParams.get("sort_by") ?? "";
    const sortDir = searchParams.get("sort_dir") ?? "asc";
    const page = parseInt(searchParams.get("page") ?? "1", 10);

    const sort = { column: sortBy || null, dir: sortDir };

    const setParam = (key, value) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value !== "" && value !== null && value !== undefined) {
                next.set(key, value);
            } else {
                next.delete(key);
            }
            next.delete("page");
            return next;
        });
    };

    const setPage = (p) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (p > 1) next.set("page", p);
            else next.delete("page");
            return next;
        });
    };

    const onSort = (column) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            const currentSortBy = prev.get("sort_by");
            const currentSortDir = prev.get("sort_dir") ?? "asc";
            const newDir = currentSortBy === column && currentSortDir === "asc" ? "desc" : "asc";
            next.set("sort_by", column);
            next.set("sort_dir", newDir);
            next.delete("page");
            return next;
        });
    };

    const handleGameChange = (value) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (value) {
                next.set("game_id", value);
            } else {
                next.delete("game_id");
            }
            next.delete("category_id");
            next.delete("page");
            return next;
        });
    };

    const handleReset = () => setSearchParams({});

    const hasFilters = search || filterGame || filterCategory || filterLanguage || filterActive !== "";

    const { data: gamesData } = useQuery({
        queryKey: ["admin-games"],
        queryFn: adminGetGames,
    });
    const { data: categoriesData } = useQuery({
        queryKey: ["admin-categories", filterGame],
        queryFn: () => adminGetCategories({ game_id: filterGame }),
        enabled: !!filterGame,
    });
    const { data, isLoading } = useQuery({
        queryKey: ["admin-products", filterGame, filterCategory, filterLanguage, search, filterActive, sortBy, sortDir, page],
        queryFn: () =>
            adminGetProducts({
                ...(filterGame ? { game_id: filterGame } : {}),
                ...(filterCategory ? { category_id: filterCategory } : {}),
                ...(filterLanguage ? { language: filterLanguage } : {}),
                ...(search ? { search } : {}),
                ...(filterActive !== "" ? { is_active: filterActive === "1" } : {}),
                ...(sortBy ? { sort_by: sortBy, sort_dir: sortDir } : {}),
                ...(page > 1 ? { page } : {}),
            }),
    });

    const games = gamesData?.data ?? [];
    const categories = categoriesData?.data ?? [];
    const products = data?.data ?? [];
    const meta = data?.meta ?? {};

    const today = new Date().toISOString().slice(0, 10);
    const expiredPreorders = products.filter(
        (p) => p.is_preorder && p.preorder_release_date && p.preorder_release_date < today,
    );

    const del = useMutation({
        mutationFn: adminDeleteProduct,
        onSuccess: () => qc.invalidateQueries(["admin-products"]),
    });
    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) => adminUpdateProduct(id, { is_active }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    });
    const decreaseStock = useMutation({
        mutationFn: (id) => adminDecrementStock(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    });
    const increaseStock = useMutation({
        mutationFn: (id) => adminIncrementStock(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
    });
    const setStock = useMutation({
        mutationFn: ({ id, stock }) => adminUpdateProduct(id, { stock }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            setEditingStockId(null);
        },
    });
    const setName = useMutation({
        mutationFn: ({ id, name }) => adminUpdateProduct(id, { name }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            setEditingNameId(null);
        },
    });
    const setPrice = useMutation({
        mutationFn: ({ id, price }) => adminUpdateProduct(id, { price }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-products"] });
            setEditingPriceId(null);
        },
    });

    const startEditStock = (p) => {
        setEditingStockId(p.id);
        setStockDraft(String(p.stock));
    };

    const startEditName = (p) => {
        setEditingNameId(p.id);
        setNameDraft(p.name);
    };

    const startEditPrice = (p) => {
        setEditingPriceId(p.id);
        setPriceDraft(Number(p.price).toFixed(2));
    };

    const commitPrice = (id) => {
        const val = parseFloat(priceDraft.replace(",", "."));
        if (!isNaN(val) && val >= 0) {
            setPrice.mutate({ id, price: val.toFixed(2) });
        } else {
            setEditingPriceId(null);
        }
    };

    const commitName = (id) => {
        const trimmed = nameDraft.trim();
        if (trimmed) {
            setName.mutate({ id, name: trimmed });
        } else {
            setEditingNameId(null);
        }
    };

    const commitStock = (id) => {
        const val = parseInt(stockDraft, 10);
        if (!isNaN(val) && val >= 0) {
            setStock.mutate({ id, stock: val });
        } else {
            setEditingStockId(null);
        }
    };

    const stockRowClass = (p) => {
        if (p.stock === 0) return "bg-red-50";
        return "";
    };

    const pageNumbers = meta.last_page
        ? Array.from({ length: meta.last_page }, (_, i) => i + 1).filter(
              (p) => p === 1 || p === meta.last_page || Math.abs(p - meta.current_page) <= 2,
          )
        : [];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Prodotti</h1>
                <Link to="/admin/prodotti/nuovo">
                    <Button variant="primary" size="sm">
                        + Nuovo prodotto
                    </Button>
                </Link>
            </div>

            {expiredPreorders.length > 0 && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-sm font-semibold text-amber-800">
                            {expiredPreorders.length === 1
                                ? "1 preordine ha superato la data di uscita"
                                : `${expiredPreorders.length} preordini hanno superato la data di uscita`}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        {expiredPreorders.map((p) => (
                            <div key={p.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-lg px-3 py-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    {p.primary_image?.url ? (
                                        <img src={p.primary_image.url} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                                    ) : (
                                        <div className="w-8 h-10 bg-gray-100 rounded shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                                        <p className="text-xs text-amber-600">
                                            Data uscita: {new Date(p.preorder_release_date + "T00:00:00").toLocaleDateString("it-IT")}
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/admin/prodotti/${p.id}/modifica`}>
                                    <Button variant="ghost" size="sm" className="!px-2 shrink-0">
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6">
                <Input
                    placeholder="Cerca prodotto..."
                    value={search}
                    onChange={(e) => setParam("search", e.target.value)}
                />
            </div>

            <div className="flex gap-6">
                {/* Sidebar filtri */}
                <aside className="w-60 flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-700">Filtri</p>
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={!hasFilters}
                                className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Reset
                            </button>
                        </div>

                        {/* Gioco */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Gioco
                            </p>
                            <div className="space-y-1">
                                <FilterOption
                                    active={!filterGame}
                                    onClick={() => handleGameChange("")}
                                    label="Tutti"
                                />
                                {games.map((g) => (
                                    <FilterOption
                                        key={g.id}
                                        active={filterGame === String(g.id)}
                                        onClick={() => handleGameChange(filterGame === String(g.id) ? "" : g.id)}
                                        label={g.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Categoria */}
                        {filterGame && categories.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Categoria
                                </p>
                                <div className="space-y-1">
                                    <FilterOption
                                        active={!filterCategory}
                                        onClick={() => setParam("category_id", "")}
                                        label="Tutte"
                                    />
                                    {categories.map((c) => (
                                        <FilterOption
                                            key={c.id}
                                            active={filterCategory === String(c.id)}
                                            onClick={() => setParam("category_id", filterCategory === String(c.id) ? "" : c.id)}
                                            label={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lingua */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Lingua
                            </p>
                            <div className="space-y-1">
                                <FilterOption
                                    active={!filterLanguage}
                                    onClick={() => setParam("language", "")}
                                    label="Tutte"
                                />
                                {LANGUAGES.map((l) => (
                                    <FilterOption
                                        key={l.code}
                                        active={filterLanguage === l.code}
                                        onClick={() => setParam("language", filterLanguage === l.code ? "" : l.code)}
                                        label={l.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Stato */}
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Stato
                            </p>
                            <div className="space-y-1">
                                <FilterOption
                                    active={filterActive === ""}
                                    onClick={() => setParam("is_active", "")}
                                    label="Tutti"
                                />
                                <FilterOption
                                    active={filterActive === "1"}
                                    onClick={() => setParam("is_active", filterActive === "1" ? "" : "1")}
                                    label="Attivi"
                                />
                                <FilterOption
                                    active={filterActive === "0"}
                                    onClick={() => setParam("is_active", filterActive === "0" ? "" : "0")}
                                    label="Nascosti"
                                />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Contenuto */}
                <div className="flex-1 min-w-0">
            {isLoading ? (
                <PageSpinner />
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="text-left px-4 py-3 w-12"></th>
                                <SortTh column="name" sort={sort} onSort={onSort}>Prodotto</SortTh>
                                <SortTh column="game.name" sort={sort} onSort={onSort}>Gioco</SortTh>
                                <SortTh column="price" sort={sort} onSort={onSort} align="right">Prezzo</SortTh>
                                <SortTh column="stock" sort={sort} onSort={onSort} align="center">Stock</SortTh>
                                <SortTh column="is_active" sort={sort} onSort={onSort} align="center">Stato</SortTh>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((p) => (
                                <tr key={p.id} className={`hover:bg-gray-50 ${stockRowClass(p)}`}>
                                    <td className="px-4 py-3">
                                        {p.primary_image?.url ? (
                                            <img
                                                src={p.primary_image.url}
                                                alt=""
                                                className="w-10 h-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-10 h-12 bg-gray-100 rounded" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingNameId === p.id ? (
                                            <input
                                                type="text"
                                                className="w-full text-sm font-medium border border-blue-400 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={nameDraft}
                                                onChange={(e) => setNameDraft(e.target.value)}
                                                onBlur={() => commitName(p.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") commitName(p.id);
                                                    if (e.key === "Escape") setEditingNameId(null);
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <p
                                                className="font-medium text-gray-800 cursor-text hover:bg-blue-50 hover:text-blue-700 rounded px-1 -mx-1 transition-colors"
                                                onClick={() => startEditName(p)}
                                                title="Clicca per modificare il nome"
                                            >
                                                {p.name}
                                            </p>
                                        )}
                                        {p.is_preorder && (
                                            <Badge variant="preorder">
                                                Preordine
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {p.game?.name}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">
                                        {editingPriceId === p.id ? (
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                className="w-20 text-right text-sm font-semibold border border-blue-400 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={priceDraft}
                                                onChange={(e) => setPriceDraft(e.target.value)}
                                                onBlur={() => commitPrice(p.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") commitPrice(p.id);
                                                    if (e.key === "Escape") setEditingPriceId(null);
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <span
                                                className="cursor-text hover:bg-blue-50 hover:text-blue-700 rounded px-1 transition-colors"
                                                onClick={() => startEditPrice(p)}
                                                title="Clicca per modificare il prezzo"
                                            >
                                                €{" "}
                                                {Number(p.price)
                                                    .toFixed(2)
                                                    .replace(".", ",")}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                className="w-8 h-8 flex items-center justify-center rounded text-base font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                disabled={p.stock <= 0 || decreaseStock.isPending || increaseStock.isPending || editingStockId === p.id}
                                                onClick={() => decreaseStock.mutate(p.id)}
                                                title="Diminuisci stock di 1"
                                            >
                                                -
                                            </button>
                                            {editingStockId === p.id ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-12 text-center text-sm font-medium border border-blue-400 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={stockDraft}
                                                    onChange={(e) => setStockDraft(e.target.value)}
                                                    onBlur={() => commitStock(p.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") commitStock(p.id);
                                                        if (e.key === "Escape") setEditingStockId(null);
                                                    }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="w-8 text-center font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                                                    onClick={() => startEditStock(p)}
                                                    title="Clicca per modificare lo stock"
                                                >
                                                    {p.stock}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="w-8 h-8 flex items-center justify-center rounded text-base font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                disabled={decreaseStock.isPending || increaseStock.isPending || editingStockId === p.id}
                                                onClick={() => increaseStock.mutate(p.id)}
                                                title="Aumenta stock di 1"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${p.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                            title={p.is_active ? "Clicca per nascondere" : "Clicca per rendere visibile"}
                                        >
                                            {p.is_active ? "Attivo" : "Nascosto"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-end">
                                            <a
                                                href={`/prodotti/${p.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label="Vedi sul sito"
                                                    title="Vedi sul sito"
                                                    className="!px-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </a>
                                            <Link
                                                to={`/admin/prodotti/${p.id}/modifica`}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label="Modifica"
                                                    title="Modifica"
                                                    className="!px-2"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                aria-label="Elimina"
                                                title="Elimina"
                                                className="!px-2"
                                                onClick={() =>
                                                    window.confirm(
                                                        "Eliminare questo prodotto?",
                                                    ) && del.mutate(p.id)
                                                }
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                    {products.length === 0 && (
                        <p className="text-center py-12 text-gray-400">
                            Nessun prodotto trovato.
                        </p>
                    )}
                    {meta.last_page > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                {meta.from}-{meta.to} di {meta.total} prodotti
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={meta.current_page <= 1}
                                    onClick={() => setPage(meta.current_page - 1)}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Precedente
                                </button>
                                {pageNumbers.map((p, idx) => (
                                    <Fragment key={p}>
                                        {idx > 0 && pageNumbers[idx - 1] !== p - 1 && (
                                            <span className="px-1 text-gray-400 text-sm">...</span>
                                        )}
                                        <button
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${p === meta.current_page ? "bg-indigo-600 text-white" : "hover:bg-gray-50 border border-gray-200"}`}
                                        >
                                            {p}
                                        </button>
                                    </Fragment>
                                ))}
                                <button
                                    disabled={meta.current_page >= meta.last_page}
                                    onClick={() => setPage(meta.current_page + 1)}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Successivo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
                </div>
            </div>
        </div>
    );
}

function FilterOption({ active, onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
        >
            {label}
        </button>
    );
}
