import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, AlertTriangle, PackageMinus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetProducts, adminDeleteProduct, adminUpdateProduct, adminDecrementStock } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";
import { adminGetGames } from "../../api/admin";
import { useTableSort } from "../../hooks/useTableSort";
import { SortTh } from "../../components/ui/SortTh";

export default function AdminProducts() {
    const qc = useQueryClient();
    const [filterGame, setFilterGame] = useState("");
    const [search, setSearch] = useState("");

    const { data: gamesData } = useQuery({
        queryKey: ["admin-games"],
        queryFn: adminGetGames,
    });
    const { data, isLoading } = useQuery({
        queryKey: ["admin-products", filterGame, search],
        queryFn: () =>
            adminGetProducts({
                ...(filterGame ? { game_id: filterGame } : {}),
                ...(search ? { search } : {}),
            }),
    });

    const games = gamesData?.data ?? [];
    const rawProducts = data?.data ?? [];
    const { sort, sorted: products, onSort } = useTableSort(rawProducts, 'name');

    const today = new Date().toISOString().slice(0, 10);
    const expiredPreorders = rawProducts.filter(
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

            <div className="grid grid-cols-2 gap-3 mb-4">
                <Input
                    placeholder="Cerca prodotto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                    value={filterGame}
                    onChange={(e) => setFilterGame(e.target.value)}
                >
                    <option value="">Tutti i giochi</option>
                    {games.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name}
                        </option>
                    ))}
                </Select>
            </div>

            {isLoading ? (
                <PageSpinner />
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
                                <tr key={p.id} className="hover:bg-gray-50">
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
                                        <p className="font-medium text-gray-800">
                                            {p.name}
                                        </p>
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
                                        €{" "}
                                        {Number(p.price)
                                            .toFixed(2)
                                            .replace(".", ",")}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {p.is_preorder || p.stock === 0 ? (
                                            <span className="text-gray-400">-</span>
                                        ) : (
                                            <span className="text-gray-700">{p.stock}</span>
                                        )}
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
                                            {!p.is_preorder && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label="Diminuisci stock"
                                                    title="Diminuisci stock di 1"
                                                    className="!px-2"
                                                    disabled={p.stock <= 0 || decreaseStock.isPending}
                                                    onClick={() => decreaseStock.mutate(p.id)}
                                                >
                                                    <PackageMinus className="w-4 h-4" />
                                                </Button>
                                            )}
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
                    {products.length === 0 && (
                        <p className="text-center py-12 text-gray-400">
                            Nessun prodotto trovato.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
