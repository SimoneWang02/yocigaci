import { useState, useCallback, useRef } from "react";
import { Pencil, Trash2, X, GripVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DndContext,
    closestCorners,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    adminGetCategories,
    adminCreateCategory,
    adminUpdateCategory,
    adminDeleteCategory,
    adminReorderCategories,
    adminGetGames,
} from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { PageSpinner } from "../../components/ui/Spinner";

function CategoryForm({ category, games, onSave, onCancel }) {
    const [form, setForm] = useState({
        game_id: category?.game_id ?? games[0]?.id ?? "",
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        is_active: category?.is_active ?? true,
        sort_order: category?.sort_order ?? 0,
        nav_column: category?.nav_column ?? 1,
    });

    const autoSlug = (name) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <Select
                    label="Gioco"
                    value={form.game_id}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            game_id: e.target.value,
                            nav_column: 1,
                        })
                    }
                >
                    {games.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.name}
                        </option>
                    ))}
                </Select>
                <Input
                    label="Nome"
                    value={form.name}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            name: e.target.value,
                            slug: autoSlug(e.target.value),
                        })
                    }
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Annulla
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSave(form)}
                >
                    {category ? "Salva" : "Crea"}
                </Button>
            </div>
        </div>
    );
}

function SortableRow({
    cat,
    editing,
    games,
    onEdit,
    onDelete,
    onSave,
    onCancelEdit,
}) {
    const qc = useQueryClient();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: cat.id });

    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) =>
            adminUpdateCategory(id, { is_active }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-categories"] });
            qc.invalidateQueries({ queryKey: ["games-nav"] });
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
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
                    {cat.name}
                </td>
                <td className="px-4 py-3 text-center">
                    <button
                        type="button"
                        onClick={() =>
                            toggleActive.mutate({
                                id: cat.id,
                                is_active: !cat.is_active,
                            })
                        }
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${cat.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                        title={
                            cat.is_active
                                ? "Clicca per nascondere"
                                : "Clicca per rendere visibile"
                        }
                    >
                        {cat.is_active ? "Attiva" : "Nascosta"}
                    </button>
                </td>
                <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Modifica"
                            title="Modifica"
                            className="!px-2"
                            onClick={() => onEdit(cat.id)}
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
                                window.confirm("Eliminare?") && onDelete(cat.id)
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
                        <CategoryForm
                            category={cat}
                            games={games}
                            onSave={(d) => onSave(cat.id, d)}
                            onCancel={onCancelEdit}
                        />
                    </td>
                </tr>
            )}
        </>
    );
}

function DroppableColumn({
    colId,
    column,
    itemIds,
    categories,
    games,
    search,
    editing,
    onEdit,
    onDelete,
    onSave,
    onCancelEdit,
}) {
    const { setNodeRef, isOver } = useDroppable({ id: colId });

    const filtered = itemIds
        .map((id) => categories.find((c) => c.id === id))
        .filter(Boolean)
        .filter(
            (c) =>
                !search || c.name.toLowerCase().includes(search.toLowerCase()),
        );

    return (
        <div
            className={`overflow-hidden transition-colors ${isOver ? "bg-indigo-50/40" : "bg-white"}`}
        >
            <div
                className={`px-4 py-2 border-b flex items-center justify-between transition-colors ${isOver ? "bg-indigo-100 border-indigo-200" : "bg-indigo-50 border-indigo-100"}`}
            >
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                    Colonna {column}
                </span>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <tr>
                        <th className="px-3 py-2 w-8"></th>
                        <th className="text-left px-4 py-2">Nome</th>
                        <th className="text-center px-4 py-2">Stato</th>
                        <th className="px-4 py-2"></th>
                    </tr>
                </thead>
                <SortableContext
                    items={itemIds}
                    strategy={verticalListSortingStrategy}
                >
                    <tbody ref={setNodeRef}>
                        {filtered.map((cat) => (
                            <SortableRow
                                key={cat.id}
                                cat={cat}
                                editing={editing === cat.id}
                                games={games}
                                onEdit={(id) =>
                                    onEdit(editing === id ? null : id)
                                }
                                onDelete={onDelete}
                                onSave={onSave}
                                onCancelEdit={onCancelEdit}
                            />
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-6 text-sm text-gray-400 text-center"
                                >
                                    Nessuna categoria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </SortableContext>
            </table>
        </div>
    );
}

function GameSection({
    game,
    categories,
    games,
    search,
    editing,
    onEdit,
    onDelete,
    onSave,
    onCancelEdit,
    onReorder,
}) {
    const numCols = 2;
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );
    const [activeId, setActiveId] = useState(null);
    const [dragColItems, setDragColItems] = useState(null);
    const dragStateRef = useRef(null);

    const buildColItems = useCallback(() => {
        const result = {};
        for (let col = 1; col <= numCols; col++) {
            result[col] = categories
                .filter((c) => (c.nav_column ?? 1) === col)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((c) => c.id);
        }
        return result;
    }, [categories]);

    const findColInItems = (id, items) => {
        for (let col = 1; col <= numCols; col++) {
            if (items[col]?.includes(id)) return col;
        }
        const match = String(id).match(/^col-\d+-(\d+)$/);
        if (match) return parseInt(match[1]);
        return null;
    };

    const handleDragStart = ({ active }) => {
        const colItems = buildColItems();
        dragStateRef.current = colItems;
        setActiveId(active.id);
        setDragColItems(colItems);
    };

    const handleDragOver = ({ active, over }) => {
        if (!over || !dragStateRef.current) return;
        const colItems = dragStateRef.current;
        const activeCol = findColInItems(active.id, colItems);
        const overCol = findColInItems(over.id, colItems);
        if (!activeCol || !overCol || activeCol === overCol) return;

        const next = { ...colItems };
        next[activeCol] = colItems[activeCol].filter((id) => id !== active.id);
        const overIndex = colItems[overCol].indexOf(over.id);
        const insertAt = overIndex >= 0 ? overIndex : colItems[overCol].length;
        next[overCol] = [
            ...colItems[overCol].slice(0, insertAt),
            active.id,
            ...colItems[overCol].slice(insertAt),
        ];

        dragStateRef.current = next;
        setDragColItems(next);
    };

    const handleDragEnd = ({ active, over }) => {
        const snapshot = dragStateRef.current;
        dragStateRef.current = null;
        setActiveId(null);
        setDragColItems(null);

        if (!over || !snapshot) return;

        const activeCol = findColInItems(active.id, snapshot);
        const overCol = findColInItems(over.id, snapshot);
        let finalItems = { ...snapshot };

        if (activeCol && overCol && activeCol === overCol) {
            const ids = snapshot[activeCol] ?? [];
            const oldIdx = ids.indexOf(active.id);
            const newIdx = ids.indexOf(over.id);
            if (oldIdx !== newIdx && newIdx >= 0) {
                finalItems[activeCol] = arrayMove(ids, oldIdx, newIdx);
            }
        }

        onReorder(game.id, finalItems);
    };

    const currentColItems = dragColItems ?? buildColItems();
    const activeCat = activeId
        ? categories.find((c) => c.id === activeId)
        : null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                    {game.name}
                </span>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div
                    className="grid divide-x divide-gray-200"
                    style={{
                        gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: numCols }, (_, i) => i + 1).map(
                        (col) => (
                            <DroppableColumn
                                key={col}
                                colId={`col-${game.id}-${col}`}
                                column={col}
                                itemIds={currentColItems[col] ?? []}
                                categories={categories}
                                games={games}
                                search={search}
                                editing={editing}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onSave={onSave}
                                onCancelEdit={onCancelEdit}
                            />
                        ),
                    )}
                </div>
                <DragOverlay>
                    {activeCat && (
                        <div className="bg-white border border-indigo-300 rounded-lg shadow-lg px-4 py-2.5 text-sm font-medium text-gray-800 flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            {activeCat.name}
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

export default function AdminCategories() {
    const qc = useQueryClient();
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState("");
    const [localOrders, setLocalOrders] = useState({});

    const { data: gamesData } = useQuery({
        queryKey: ["admin-games"],
        queryFn: adminGetGames,
    });
    const { data, isLoading } = useQuery({
        queryKey: ["admin-categories"],
        queryFn: () => adminGetCategories(),
    });

    const games = gamesData?.data ?? [];
    const allCategories = data?.data ?? [];

    const invalidate = () => {
        qc.invalidateQueries(["admin-categories"]);
        qc.invalidateQueries(["games-nav"]);
    };

    const create = useMutation({
        mutationFn: adminCreateCategory,
        onSuccess: () => {
            invalidate();
            setCreating(false);
        },
    });
    const update = useMutation({
        mutationFn: ({ id, data }) => adminUpdateCategory(id, data),
        onSuccess: () => {
            invalidate();
            setEditing(null);
        },
    });
    const del = useMutation({
        mutationFn: adminDeleteCategory,
        onSuccess: invalidate,
    });
    const reorder = useMutation({
        mutationFn: adminReorderCategories,
        onSuccess: invalidate,
    });

    const handleReorder = (gameId, colItems) => {
        setLocalOrders((prev) => ({ ...prev, [gameId]: colItems }));
        reorder.mutate(colItems);
    };

    const categoriesForGame = (gameId) => {
        const base = allCategories.filter((c) => c.game_id === gameId);
        const gameLocal = localOrders[gameId];
        if (!gameLocal) return base;

        return base
            .map((cat) => {
                for (const [col, ids] of Object.entries(gameLocal)) {
                    const idx = ids.indexOf(cat.id);
                    if (idx >= 0)
                        return {
                            ...cat,
                            nav_column: parseInt(col),
                            sort_order: idx,
                        };
                }
                return cat;
            })
            .sort((a, b) => a.sort_order - b.sort_order);
    };

    if (isLoading) return <PageSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Categorie</h1>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCreating(true)}
                >
                    + Nuova categoria
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Cerca categoria..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-56"
                />
            </div>

            {creating && (
                <div className="mb-4">
                    <CategoryForm
                        games={games}
                        onSave={(d) => create.mutate(d)}
                        onCancel={() => setCreating(false)}
                    />
                </div>
            )}

            <div className="space-y-4">
                {games.map((game) => (
                    <GameSection
                        key={game.id}
                        game={game}
                        categories={categoriesForGame(game.id)}
                        games={games}
                        search={search}
                        editing={editing}
                        onEdit={setEditing}
                        onDelete={(id) => del.mutate(id)}
                        onSave={(id, d) => update.mutate({ id, data: d })}
                        onCancelEdit={() => setEditing(null)}
                        onReorder={handleReorder}
                    />
                ))}
            </div>
        </div>
    );
}
