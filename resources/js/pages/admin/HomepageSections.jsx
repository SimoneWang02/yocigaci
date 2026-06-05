import { useState } from "react";
import { Pencil, Trash2, X, GripVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    adminGetHomepageSections,
    adminCreateHomepageSection,
    adminUpdateHomepageSection,
    adminDeleteHomepageSection,
    adminReorderHomepageSections,
    adminGetProducts,
} from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";

function ProductPicker({ selected, onChange }) {
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

function SectionForm({ section, onSave, onCancel, saving }) {
    const [form, setForm] = useState({
        title: section?.title ?? "",
        is_active: section?.is_active ?? true,
    });
    const [products, setProducts] = useState(section?.products ?? []);

    const submit = () => {
        onSave({ ...form, product_ids: products.map((p) => p.id) });
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <Input
                label="Titolo sezione"
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
                    {section ? "Salva modifiche" : "Crea sezione"}
                </Button>
            </div>
        </div>
    );
}

function SortableRow({
    section,
    editing,
    onEdit,
    onDelete,
    onCancelEdit,
    onSave,
    onToggleActive,
    saving,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <>
            <tr
                ref={setNodeRef}
                style={style}
                className="border-t border-gray-100 first:border-t-0 hover:bg-gray-50"
            >
                <td className="px-3 py-3 w-8">
                    <button
                        {...attributes}
                        {...listeners}
                        className="text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                        aria-label="Trascina per riordinare"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                    {section.title}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                    {section.products?.length ?? 0}
                </td>
                <td className="px-4 py-3 text-center">
                    <button
                        type="button"
                        onClick={() => onToggleActive(section)}
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${section.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                        title={
                            section.is_active
                                ? "Clicca per nascondere"
                                : "Clicca per rendere visibile"
                        }
                    >
                        {section.is_active ? "Visibile" : "Nascosta"}
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
                            onClick={() => onEdit(section.id)}
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
                                window.confirm("Eliminare questa sezione?") &&
                                onDelete(section.id)
                            }
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </td>
            </tr>
            {editing && (
                <tr>
                    <td colSpan={5} className="px-4 pb-4 bg-white">
                        <SectionForm
                            section={section}
                            onSave={(d) => onSave(section.id, d)}
                            onCancel={onCancelEdit}
                            saving={saving}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}

export default function AdminHomepageSections() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");
    const [localOrder, setLocalOrder] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const { data, isLoading } = useQuery({
        queryKey: ["admin-homepage-sections"],
        queryFn: adminGetHomepageSections,
        onSuccess: () => setLocalOrder(null),
    });

    const rawSections = data?.data ?? [];
    const orderedSections = localOrder
        ? localOrder
              .map((id) => rawSections.find((s) => s.id === id))
              .filter(Boolean)
        : rawSections;

    const sections = orderedSections.filter(
        (s) => !search || s.title.toLowerCase().includes(search.toLowerCase()),
    );

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
        qc.invalidateQueries({ queryKey: ["homepage-sections"] });
    };

    const create = useMutation({
        mutationFn: adminCreateHomepageSection,
        onSuccess: () => {
            invalidate();
            setCreating(false);
        },
    });
    const update = useMutation({
        mutationFn: ({ id, data }) => adminUpdateHomepageSection(id, data),
        onSuccess: () => {
            invalidate();
            setEditing(null);
        },
    });
    const del = useMutation({
        mutationFn: adminDeleteHomepageSection,
        onSuccess: invalidate,
    });
    const reorder = useMutation({
        mutationFn: adminReorderHomepageSections,
        onSuccess: invalidate,
    });
    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) =>
            adminUpdateHomepageSection(id, { is_active }),
        onSuccess: invalidate,
    });

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const ids = orderedSections.map((s) => s.id);
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        const newIds = arrayMove(ids, oldIndex, newIndex);
        setLocalOrder(newIds);
        reorder.mutate(newIds);
    };

    if (isLoading) return <PageSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Sezioni Homepage
                    </h1>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        setCreating(true);
                        setEditing(null);
                    }}
                >
                    + Nuova sezione
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Cerca sezione..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                />
            </div>

            {creating && (
                <div className="mb-4">
                    <SectionForm
                        onSave={(d) => create.mutate(d)}
                        onCancel={() => setCreating(false)}
                        saving={create.isPending}
                    />
                </div>
            )}

            {sections.length === 0 && !creating ? (
                <div className="text-center py-16 text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl">
                    Nessuna sezione. Creane una per popolare la homepage.
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="px-3 py-3 w-8"></th>
                                <th className="text-left px-4 py-3">Titolo</th>
                                <th className="text-center px-4 py-3">
                                    Prodotti
                                </th>
                                <th className="text-center px-4 py-3">Stato</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sections.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody>
                                    {sections.map((section) => (
                                        <SortableRow
                                            key={section.id}
                                            section={section}
                                            editing={editing === section.id}
                                            onEdit={(id) =>
                                                setEditing(
                                                    editing === id ? null : id,
                                                )
                                            }
                                            onDelete={(id) => del.mutate(id)}
                                            onCancelEdit={() =>
                                                setEditing(null)
                                            }
                                            onSave={(id, d) =>
                                                update.mutate({ id, data: d })
                                            }
                                            onToggleActive={(s) =>
                                                toggleActive.mutate({
                                                    id: s.id,
                                                    is_active: !s.is_active,
                                                })
                                            }
                                            saving={update.isPending}
                                        />
                                    ))}
                                </tbody>
                            </SortableContext>
                        </DndContext>
                    </table>
                </div>
            )}
        </div>
    );
}
