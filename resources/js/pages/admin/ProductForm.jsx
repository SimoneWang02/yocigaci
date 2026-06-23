import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, ArrowLeft, GripVertical, Upload } from "lucide-react";
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
    rectSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    adminGetProduct,
    adminCreateProduct,
    adminUpdateProduct,
    adminGetGames,
    adminGetCategories,
    adminUploadImage,
    adminReorderImages,
    adminDeleteImage,
} from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { LANGUAGES } from "../../components/ui/LanguageBadge";
import { PageSpinner } from "../../components/ui/Spinner";

// ─── Sortable image thumbnail ────────────────────────────────────────────────

function SortableImage({ id, url, isPrimary, onDelete, onPreview }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <button
                type="button"
                onClick={() => onPreview(url)}
                className="block w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden hover:ring-2 hover:ring-indigo-400 transition-shadow"
                title="Clicca per ingrandire"
            >
                <img src={url} alt="" className="w-full h-full object-contain" />
            </button>
            {isPrimary && (
                <span className="absolute top-1 left-1 text-xs bg-indigo-600 text-white px-1 rounded pointer-events-none">
                    principale
                </span>
            )}
            <button
                {...attributes}
                {...listeners}
                type="button"
                className="absolute bottom-1 left-1 p-0.5 rounded bg-white/80 text-gray-500 hover:text-gray-900 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Trascina per riordinare"
            >
                <GripVertical className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => onDelete(id)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const isEdit = !!id;
    const fileRef = useRef(null);
    const descriptionRef = useRef(null);
    const pendingUid = useRef(0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const [form, setForm] = useState({
        game_id: "",
        category_id: "",
        language: "ENG",
        name: "",
        description: "",
        price: "",
        stock: 0,
        is_preorder: false,
        is_limited: false,
        preorder_release_date: "",
        preorder_note: "",
    });
    const [images, setImages] = useState([]);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        const el = descriptionRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, [form.description]);

    const { data: gamesData } = useQuery({
        queryKey: ["admin-games"],
        queryFn: adminGetGames,
    });
    const { data: categoriesData } = useQuery({
        queryKey: ["admin-categories", form.game_id],
        queryFn: () =>
            adminGetCategories(form.game_id ? { game_id: form.game_id } : {}),
        enabled: !!form.game_id,
    });

    const { data: productData, isLoading } = useQuery({
        queryKey: ["admin-product", id],
        queryFn: () => adminGetProduct(id),
        enabled: isEdit,
    });

    useEffect(() => {
        if (productData?.data) {
            const p = productData.data;
            setForm({
                game_id: String(p.game?.id ?? p.game_id ?? ""),
                category_id: String(p.category?.id ?? p.category_id ?? ""),
                language: p.language ?? "ENG",
                name: p.name ?? "",
                description: p.description ?? "",
                price: String(p.price ?? ""),
                stock: p.stock ?? 0,
                is_preorder: p.is_preorder ?? false,
                is_limited: p.is_limited ?? false,
                preorder_release_date: p.preorder_release_date ?? "",
                preorder_note: p.preorder_note ?? "",
            });
            setImages(p.images ?? []);
        }
    }, [productData]);

    const games = gamesData?.data ?? [];
    const categories = categoriesData?.data ?? [];

    const imageItems = isEdit
        ? images.map((i) => ({ id: i.id, url: i.url }))
        : pendingFiles.map((p) => ({ id: p.id, url: p.previewUrl }));

    const handleGameChange = (gameId) => {
        setForm((f) => ({ ...f, game_id: gameId, category_id: "" }));
    };

    const handleUpload = async (files) => {
        const imageFiles = files.filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length === 0) return;
        if (!isEdit) {
            const entries = imageFiles.map((file) => ({
                id: `pending-${pendingUid.current++}`,
                file,
                previewUrl: URL.createObjectURL(file),
            }));
            setPendingFiles((prev) => [...prev, ...entries]);
            return;
        }
        setUploading(true);
        try {
            for (const file of imageFiles) {
                const result = await adminUploadImage(id, file);
                setImages((imgs) => [...imgs, result.data]);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePending = useCallback((pendingId) => {
        setPendingFiles((prev) => {
            const entry = prev.find((e) => e.id === pendingId);
            if (entry) URL.revokeObjectURL(entry.previewUrl);
            return prev.filter((e) => e.id !== pendingId);
        });
    }, []);

    const handleDeleteImage = async (imageId) => {
        await adminDeleteImage(id, imageId);
        setImages((imgs) => imgs.filter((i) => i.id !== imageId));
    };

    const handleReorder = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        if (isEdit) {
            setImages((imgs) => {
                const ids = imgs.map((i) => i.id);
                const oldIndex = ids.indexOf(active.id);
                const newIndex = ids.indexOf(over.id);
                const next = arrayMove(imgs, oldIndex, newIndex);
                adminReorderImages(id, next.map((i) => i.id));
                return next;
            });
        } else {
            setPendingFiles((files) => {
                const ids = files.map((f) => f.id);
                return arrayMove(files, ids.indexOf(active.id), ids.indexOf(over.id));
            });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const files = [...(e.dataTransfer?.files ?? [])];
        if (files.length) handleUpload(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.stock),
                game_id: parseInt(form.game_id),
                category_id: parseInt(form.category_id),
                preorder_release_date: form.is_preorder
                    ? form.preorder_release_date
                    : null,
            };
            if (isEdit) {
                await adminUpdateProduct(id, payload);
            } else {
                const res = await adminCreateProduct(payload);
                const newId = res.data.id;
                for (const { file } of pendingFiles) {
                    await adminUploadImage(newId, file);
                }
                qc.invalidateQueries(["admin-products"]);
                const params = new URLSearchParams();
                if (form.game_id) params.set("game_id", form.game_id);
                if (form.category_id) params.set("category_id", form.category_id);
                navigate(`/admin/prodotti?${params.toString()}`);
                return;
            }
            qc.invalidateQueries(["admin-products"]);
            const editParams = new URLSearchParams();
            if (form.game_id) editParams.set("game_id", form.game_id);
            if (form.category_id) editParams.set("category_id", form.category_id);
            navigate(`/admin/prodotti?${editParams.toString()}`);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError(
                errors
                    ? Object.values(errors).flat().join(" ")
                    : "Errore nel salvataggio.",
            );
        } finally {
            setSaving(false);
        }
    };

    if (isEdit && isLoading) return <PageSpinner />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/prodotti")}
                    className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? "Modifica prodotto" : "Nuovo prodotto"}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800">
                        Informazioni base
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Nome prodotto"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Select
                            label="Gioco"
                            value={form.game_id}
                            onChange={(e) => handleGameChange(e.target.value)}
                            required
                        >
                            <option value="">Seleziona gioco</option>
                            {games.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name}
                                </option>
                            ))}
                        </Select>
                        <Select
                            label="Categoria"
                            value={form.category_id}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    category_id: e.target.value,
                                })
                            }
                            required
                            disabled={!form.game_id}
                        >
                            <option value="">Seleziona categoria</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                        <Select
                            label="Lingua"
                            value={form.language}
                            onChange={(e) =>
                                setForm({ ...form, language: e.target.value })
                            }
                        >
                            <option value="">Nessuna</option>
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.code} - {l.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Descrizione
                        </label>
                        <textarea
                            ref={descriptionRef}
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                            style={{ resize: "none", overflow: "hidden" }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800">
                        Prezzi e disponibilità
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Prezzo (€)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.price}
                            onChange={(e) =>
                                setForm({ ...form, price: e.target.value })
                            }
                            required
                        />
                        <Input
                            label="Stock"
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={(e) =>
                                setForm({ ...form, stock: e.target.value })
                            }
                        />
                    </div>
                    <div className="flex gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_preorder}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        is_preorder: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Preordine
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_limited}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        is_limited: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Limitato 1 ad account
                            </span>
                        </label>
                    </div>
                    {form.is_preorder && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Input
                                label="Data uscita prevista"
                                type="date"
                                value={form.preorder_release_date}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        preorder_release_date: e.target.value,
                                    })
                                }
                            />
                            <Input
                                label="Nota preordine (es. Spedizione marzo 2025)"
                                value={form.preorder_note}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        preorder_note: e.target.value,
                                    })
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800">Immagini</h2>
                    <p className="text-xs text-gray-500">
                        {isEdit
                            ? "La prima immagine è quella principale. Trascina per riordinare, clicca per ingrandire."
                            : "Le immagini verranno caricate al salvataggio del prodotto. Trascina per riordinare."}
                    </p>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleReorder}
                    >
                        <SortableContext
                            items={imageItems.map((i) => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    if (e.currentTarget.contains(e.relatedTarget)) return;
                                    setDragActive(false);
                                }}
                                onDrop={handleDrop}
                                className={`flex flex-wrap gap-3 rounded-lg p-1 transition-colors ${dragActive ? "ring-2 ring-indigo-400 bg-indigo-50/50" : ""}`}
                            >
                                {imageItems.map((item, idx) => (
                                    <SortableImage
                                        key={item.id}
                                        id={item.id}
                                        url={item.url}
                                        isPrimary={idx === 0}
                                        onPreview={setPreviewImage}
                                        onDelete={
                                            isEdit
                                                ? (imgId) =>
                                                      window.confirm("Eliminare?") &&
                                                      handleDeleteImage(imgId)
                                                : handleRemovePending
                                        }
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        "..."
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            <span className="text-[10px]">Carica</span>
                                        </>
                                    )}
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        handleUpload([...e.target.files]);
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/admin/prodotti")}
                    >
                        Annulla
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving
                            ? "Salvataggio..."
                            : isEdit
                              ? "Salva modifiche"
                              : "Crea prodotto"}
                    </Button>
                </div>
            </form>

            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-lg max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100 transition-colors"
                            aria-label="Chiudi"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={previewImage}
                            alt=""
                            className="max-w-full max-h-[90vh] object-contain rounded-lg bg-white"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
