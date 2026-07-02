import { useState } from "react";
import { X, ArrowUp, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminGetProducts } from "../../api/admin";
import { Input } from "../ui/Input";

export function ProductPicker({ selected, onChange }) {
    const [search, setSearch] = useState("");
    const { data, isFetching } = useQuery({
        queryKey: ["admin-product-search", search],
        queryFn: () => adminGetProducts({ search, per_page: 20 }),
        enabled: search.length >= 2,
    });

    const results = data?.data ?? [];
    const selectedIds = new Set(selected.map((p) => p.id));

    const add = (product) => {
        if (selectedIds.has(product.id)) return;
        onChange([...selected, product]);
    };
    const remove = (id) => onChange(selected.filter((p) => p.id !== id));
    const move = (index, dir) => {
        const next = [...selected];
        const target = index + dir;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="text-sm font-medium text-gray-700">
                    Prodotti associati
                </label>
                {selected.length === 0 ? (
                    <p className="text-sm text-gray-400 mt-1">
                        Nessun prodotto. Cercane uno qui sotto.
                    </p>
                ) : (
                    <ul className="mt-2 space-y-1.5">
                        {selected.map((p, i) => (
                            <li
                                key={p.id}
                                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5"
                            >
                                <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                                    {p.primary_image?.url && (
                                        <img
                                            src={p.primary_image.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <span className="flex-1 text-sm text-gray-800 truncate">
                                    {p.name}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => move(i, -1)}
                                        disabled={i === 0}
                                        className="px-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(i, 1)}
                                        disabled={i === selected.length - 1}
                                        className="px-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(p.id)}
                                        className="px-1.5 text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <Input
                    label="Cerca prodotti da aggiungere"
                    placeholder="Digita almeno 2 caratteri…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search.length >= 2 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
                        {isFetching ? (
                            <p className="text-sm text-gray-400 px-3 py-2">
                                Ricerca…
                            </p>
                        ) : results.length === 0 ? (
                            <p className="text-sm text-gray-400 px-3 py-2">
                                Nessun risultato.
                            </p>
                        ) : (
                            results.map((p) => (
                                <button
                                    type="button"
                                    key={p.id}
                                    onClick={() => add(p)}
                                    disabled={selectedIds.has(p.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                                        {p.primary_image?.url && (
                                            <img
                                                src={p.primary_image.url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <span className="flex-1 text-sm text-gray-800 truncate">
                                        {p.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {selectedIds.has(p.id)
                                            ? "Aggiunto"
                                            : "+ Aggiungi"}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
