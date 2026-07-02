import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminGetCatalogs,
    adminCreateCatalog,
    adminUpdateCatalog,
    adminDeleteCatalog,
} from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";
import { ProductPicker } from "../../components/admin/ProductPicker";

// ─── Catalog form ───────────────────────────────────────────────────────────

function CatalogForm({ catalog, onSave, onCancel, saving }) {
    const [form, setForm] = useState({
        title: catalog?.title ?? "",
        is_active: catalog?.is_active ?? true,
    });
    const [products, setProducts] = useState(catalog?.products ?? []);

    const submit = () => {
        onSave({ ...form, product_ids: products.map((p) => p.id) });
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <Input
                label="Titolo catalogo"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
            />

            <ProductPicker selected={products} onChange={setProducts} />

            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Annulla
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={submit}
                    disabled={saving || !form.title}
                >
                    {catalog ? "Salva modifiche" : "Crea catalogo"}
                </Button>
            </div>
        </div>
    );
}

// ─── Catalog row ────────────────────────────────────────────────────────────

function CatalogRow({
    catalog,
    editing,
    onEdit,
    onDelete,
    onCancelEdit,
    onSave,
    onToggleActive,
    saving,
}) {
    return (
        <>
            <tr className="border-t border-gray-100 first:border-t-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                    {catalog.title}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                    {catalog.products?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-center">
                    <button
                        type="button"
                        onClick={() => onToggleActive(catalog)}
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${catalog.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                        title={
                            catalog.is_active
                                ? "Clicca per disattivare"
                                : "Clicca per attivare"
                        }
                    >
                        {catalog.is_active ? "Attivo" : "Disattivo"}
                    </button>
                </td>
                <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label={editing ? "Chiudi" : "Modifica"}
                            title={editing ? "Chiudi" : "Modifica"}
                            className="!px-2"
                            onClick={() => onEdit(catalog.id)}
                        >
                            {editing ? (
                                <X className="w-4 h-4" />
                            ) : (
                                <Pencil className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            aria-label="Elimina"
                            title="Elimina"
                            className="!px-2"
                            onClick={() =>
                                window.confirm("Eliminare questo catalogo?") &&
                                onDelete(catalog.id)
                            }
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </td>
            </tr>
            {editing && (
                <tr>
                    <td colSpan={4} className="px-4 pb-4 bg-white">
                        <CatalogForm
                            catalog={catalog}
                            onSave={(d) => onSave(catalog.id, d)}
                            onCancel={onCancelEdit}
                            saving={saving}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function AdminCatalogs() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-catalogs"],
        queryFn: adminGetCatalogs,
    });

    const catalogs = (data?.data ?? []).filter(
        (c) => !search || c.title.toLowerCase().includes(search.toLowerCase()),
    );

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["admin-catalogs"] });
    };

    const create = useMutation({
        mutationFn: adminCreateCatalog,
        onSuccess: () => {
            invalidate();
            setCreating(false);
        },
    });
    const update = useMutation({
        mutationFn: ({ id, data }) => adminUpdateCatalog(id, data),
        onSuccess: () => {
            invalidate();
            setEditing(null);
        },
    });
    const del = useMutation({
        mutationFn: adminDeleteCatalog,
        onSuccess: invalidate,
    });
    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) =>
            adminUpdateCatalog(id, { is_active }),
        onSuccess: invalidate,
    });

    if (isLoading) return <PageSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Cataloghi
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Collezioni di prodotti da associare ai banner della
                        homepage. Cliccando un banner l&apos;utente atterra su
                        una pagina catalogo senza filtri in sidebar.
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        setCreating(true);
                        setEditing(null);
                    }}
                >
                    + Nuovo catalogo
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Cerca catalogo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                />
            </div>

            {creating && (
                <div className="mb-4">
                    <CatalogForm
                        onSave={(d) => create.mutate(d)}
                        onCancel={() => setCreating(false)}
                        saving={create.isPending}
                    />
                </div>
            )}

            {catalogs.length === 0 && !creating ? (
                <div className="text-center py-16 text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                    Nessun catalogo. Creane uno per associarlo a un banner.
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="text-left px-4 py-3">Titolo</th>
                                <th className="text-center px-4 py-3">
                                    Prodotti
                                </th>
                                <th className="text-center px-4 py-3">Stato</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {catalogs.map((catalog) => (
                                <CatalogRow
                                    key={catalog.id}
                                    catalog={catalog}
                                    editing={editing === catalog.id}
                                    onEdit={(id) =>
                                        setEditing(
                                            editing === id ? null : id,
                                        )
                                    }
                                    onDelete={(id) => del.mutate(id)}
                                    onCancelEdit={() => setEditing(null)}
                                    onSave={(id, d) =>
                                        update.mutate({ id, data: d })
                                    }
                                    onToggleActive={(c) =>
                                        toggleActive.mutate({
                                            id: c.id,
                                            is_active: !c.is_active,
                                        })
                                    }
                                    saving={update.isPending}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
