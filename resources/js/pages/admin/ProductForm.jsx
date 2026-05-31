import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { PageSpinner } from "../../components/ui/Spinner";

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const isEdit = !!id;
    const fileRef = useRef(null);

    const [form, setForm] = useState({
        game_id: "",
        category_id: "",
        name: "",
        slug: "",
        description: "",
        price: "",
        stock: 0,
        is_preorder: false,
        preorder_release_date: "",
        preorder_note: "",
        is_active: true,
        sort_order: 0,
    });
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

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
                game_id: String(p.game_id ?? ""),
                category_id: String(p.category_id ?? ""),
                name: p.name ?? "",
                slug: p.slug ?? "",
                description: p.description ?? "",
                price: String(p.price ?? ""),
                stock: p.stock ?? 0,
                is_preorder: p.is_preorder ?? false,
                preorder_release_date: p.preorder_release_date ?? "",
                preorder_note: p.preorder_note ?? "",
                is_active: p.is_active ?? true,
                sort_order: p.sort_order ?? 0,
            });
            setImages(p.images ?? []);
        }
    }, [productData]);

    const games = gamesData?.data ?? [];
    const categories = categoriesData?.data ?? [];

    const autoSlug = (name) =>
        name
            .toLowerCase()
            .replace(/[àáâãäå]/g, "a")
            .replace(/[èéêë]/g, "e")
            .replace(/[ìíîï]/g, "i")
            .replace(/[òóôõö]/g, "o")
            .replace(/[ùúûü]/g, "u")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    const handleGameChange = (gameId) => {
        setForm((f) => ({ ...f, game_id: gameId, category_id: "" }));
    };

    const handleUpload = async (files) => {
        setUploading(true);
        try {
            for (const file of files) {
                const result = await adminUploadImage(id, file);
                setImages((imgs) => [...imgs, result.data]);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        await adminDeleteImage(id, imageId);
        setImages((imgs) => imgs.filter((i) => i.id !== imageId));
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
                sort_order: parseInt(form.sort_order),
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
                navigate(`/admin/prodotti/${res.data.id}/modifica`);
                return;
            }
            qc.invalidateQueries(["admin-products"]);
            navigate("/admin/prodotti");
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
                    className="text-gray-500 hover:text-gray-700"
                >
                    ← Prodotti
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
                                setForm({
                                    ...form,
                                    name: e.target.value,
                                    slug: autoSlug(e.target.value),
                                })
                            }
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Descrizione
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h2 className="font-semibold text-gray-800">
                        Prezzi e disponibilità
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
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
                            disabled={form.is_preorder}
                        />
                        <Input
                            label="Ordine visualizzazione"
                            type="number"
                            min="0"
                            value={form.sort_order}
                            onChange={(e) =>
                                setForm({ ...form, sort_order: e.target.value })
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
                                        stock: 0,
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
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        is_active: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Visibile nel negozio
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

                {/* Images - solo in edit mode */}
                {isEdit && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="font-semibold text-gray-800">
                            Immagini
                        </h2>
                        <p className="text-xs text-gray-500">
                            La prima immagine (ordine più basso) è quella
                            principale.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {images.map((img, idx) => (
                                <div key={img.id} className="relative group">
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="w-20 h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    {idx === 0 && (
                                        <span className="absolute top-1 left-1 text-xs bg-indigo-600 text-white px-1 rounded">
                                            principale
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            window.confirm("Eliminare?") &&
                                            handleDeleteImage(img.id)
                                        }
                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="w-20 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                disabled={uploading}
                            >
                                {uploading ? "..." : "+"}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) =>
                                    handleUpload([...e.target.files])
                                }
                            />
                        </div>
                    </div>
                )}

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
        </div>
    );
}
