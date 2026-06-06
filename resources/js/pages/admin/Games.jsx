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
    adminGetGames,
    adminCreateGame,
    adminUpdateGame,
    adminDeleteGame,
    adminReorderGames,
    adminGetProducts,
    adminUpdateProduct,
} from "../../api/admin";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";
import { Link } from "react-router-dom";
import { useTableSort } from "../../hooks/useTableSort";
import { SortTh } from "../../components/ui/SortTh";

function GameForm({ game, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: game?.name ?? "",
        slug: game?.slug ?? "",
    });

    const autoSlug = (name) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    return (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                required
            />
            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Annulla
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSave(form)}
                >
                    {game ? "Salva modifiche" : "Crea gioco"}
                </Button>
            </div>
        </div>
    );
}

function GameProducts({ gameId }) {
    const qc = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["admin-products-by-game", gameId],
        queryFn: () => adminGetProducts({ game_id: gameId, per_page: 100 }),
    });
    const raw = data?.data ?? [];
    const { sort, sorted: products, onSort } = useTableSort(raw, "name");

    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) =>
            adminUpdateProduct(id, { is_active }),
        onSuccess: () =>
            qc.invalidateQueries({
                queryKey: ["admin-products-by-game", gameId],
            }),
    });

    if (isLoading)
        return (
            <div className="px-6 py-3 text-sm text-gray-400">
                Caricamento...
            </div>
        );
    if (raw.length === 0)
        return (
            <div className="px-6 py-3 text-sm text-gray-400">
                Nessun prodotto per questo gioco.
            </div>
        );

    return (
        <div className="border-t border-gray-100 bg-gray-50">
            <table className="w-full text-sm">
                <thead className="bg-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                        <th className="text-left px-6 py-2 w-10"></th>
                        <SortTh
                            column="name"
                            sort={sort}
                            onSort={onSort}
                            compact
                        >
                            Prodotto
                        </SortTh>
                        <SortTh
                            column="price"
                            sort={sort}
                            onSort={onSort}
                            align="right"
                            compact
                        >
                            Prezzo
                        </SortTh>
                        <SortTh
                            column="stock"
                            sort={sort}
                            onSort={onSort}
                            align="center"
                            compact
                        >
                            Stock
                        </SortTh>
                        <SortTh
                            column="is_active"
                            sort={sort}
                            onSort={onSort}
                            align="center"
                            compact
                        >
                            Stato
                        </SortTh>
                        <th className="px-4 py-2"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80">
                            <td className="px-6 py-2">
                                {p.primary_image?.url ? (
                                    <img
                                        src={p.primary_image.url}
                                        alt=""
                                        className="w-8 h-10 object-cover rounded shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-10 bg-gray-200 rounded shrink-0" />
                                )}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                                <span className="flex items-center gap-2">
                                    {p.name}
                                    {p.is_preorder && (
                                        <Badge variant="preorder">
                                            Preordine
                                        </Badge>
                                    )}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-right text-gray-500">
                                € {Number(p.price).toFixed(2).replace(".", ",")}
                            </td>
                            <td className="px-4 py-2 text-center text-xs font-semibold tabular-nums">
                                {p.stock === 0 ? (
                                    <span className="text-gray-400">-</span>
                                ) : (
                                    <span className="text-gray-700">
                                        {p.stock}
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-2 text-center">
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleActive.mutate({
                                            id: p.id,
                                            is_active: !p.is_active,
                                        })
                                    }
                                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${p.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                    title={
                                        p.is_active
                                            ? "Clicca per nascondere"
                                            : "Clicca per rendere visibile"
                                    }
                                >
                                    {p.is_active ? "Attivo" : "Nascosto"}
                                </button>
                            </td>
                            <td className="px-4 py-2 text-right">
                                <Link to={`/admin/prodotti/${p.id}/modifica`}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="!px-2"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SortableRow({
    game,
    expanded,
    onToggleExpand,
    onSave,
    onDelete,
    onToggleActive,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: game.id });

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
                    {game.name}
                </td>
                <td className="px-4 py-3 text-center">
                    <button
                        type="button"
                        onClick={() => onToggleActive(game)}
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${game.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                        title={
                            game.is_active
                                ? "Clicca per nascondere"
                                : "Clicca per rendere visibile"
                        }
                    >
                        {game.is_active ? "Attivo" : "Nascosto"}
                    </button>
                </td>
                <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label={expanded ? "Chiudi" : "Modifica"}
                            title={expanded ? "Chiudi" : "Modifica"}
                            className="!px-2"
                            onClick={() => onToggleExpand(game.id)}
                        >
                            {expanded ? (
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
                                window.confirm("Eliminare questo gioco?") &&
                                onDelete(game.id)
                            }
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={4} className="p-0">
                        <div className="px-4 py-3 border-t border-gray-100 bg-white">
                            <GameForm
                                game={game}
                                onSave={(d) => onSave(game.id, d)}
                                onCancel={() => onToggleExpand(game.id)}
                            />
                        </div>
                        <GameProducts gameId={game.id} />
                    </td>
                </tr>
            )}
        </>
    );
}

export default function AdminGames() {
    const qc = useQueryClient();
    const [creating, setCreating] = useState(false);
    const [expandedGame, setExpandedGame] = useState(null);
    const [search, setSearch] = useState("");
    const [localOrder, setLocalOrder] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const { data, isLoading } = useQuery({
        queryKey: ["admin-games"],
        queryFn: adminGetGames,
        onSuccess: () => setLocalOrder(null),
    });

    const rawGames = data?.data ?? [];
    const orderedGames = localOrder
        ? localOrder
              .map((id) => rawGames.find((g) => g.id === id))
              .filter(Boolean)
        : rawGames;

    const games = orderedGames.filter(
        (g) => !search || g.name.toLowerCase().includes(search.toLowerCase()),
    );

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["admin-games"] });
        qc.invalidateQueries({ queryKey: ["games-nav"] });
    };

    const create = useMutation({
        mutationFn: adminCreateGame,
        onSuccess: () => {
            invalidate();
            setCreating(false);
        },
    });
    const update = useMutation({
        mutationFn: ({ id, data }) => adminUpdateGame(id, data),
        onSuccess: () => {
            invalidate();
            setExpandedGame(null);
        },
    });
    const del = useMutation({
        mutationFn: adminDeleteGame,
        onSuccess: invalidate,
    });
    const reorder = useMutation({
        mutationFn: adminReorderGames,
        onSuccess: invalidate,
    });
    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) => adminUpdateGame(id, { is_active }),
        onSuccess: invalidate,
    });

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const ids = orderedGames.map((g) => g.id);
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
                <h1 className="text-2xl font-bold text-gray-900">Giochi</h1>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCreating(true)}
                >
                    + Nuovo gioco
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Cerca gioco..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                />
            </div>

            {creating && (
                <div className="mb-4">
                    <GameForm
                        onSave={(d) => create.mutate(d)}
                        onCancel={() => setCreating(false)}
                    />
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                        <tr>
                            <th className="px-3 py-3 w-8"></th>
                            <th className="text-left px-4 py-3">Nome</th>
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
                            items={games.map((g) => g.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <tbody>
                                {games.map((game) => (
                                    <SortableRow
                                        key={game.id}
                                        game={game}
                                        expanded={expandedGame === game.id}
                                        onToggleExpand={(id) =>
                                            setExpandedGame(
                                                expandedGame === id ? null : id,
                                            )
                                        }
                                        onSave={(id, d) =>
                                            update.mutate({ id, data: d })
                                        }
                                        onDelete={(id) => del.mutate(id)}
                                        onToggleActive={(g) =>
                                            toggleActive.mutate({
                                                id: g.id,
                                                is_active: !g.is_active,
                                            })
                                        }
                                    />
                                ))}
                            </tbody>
                        </SortableContext>
                    </DndContext>
                </table>
            </div>
        </div>
    );
}
