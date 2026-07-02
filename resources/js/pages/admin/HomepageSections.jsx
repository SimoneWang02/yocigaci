import { useState, useRef } from "react";
import {
    Pencil,
    Trash2,
    X,
    GripVertical,
    Upload,
    ImageOff,
} from "lucide-react";
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
    horizontalListSortingStrategy,
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
    adminGetCatalogs,
    adminGetCarouselBanners,
    adminUploadCarouselBanner,
    adminUpdateCarouselBanner,
    adminDeleteCarouselBanner,
    adminReorderCarouselBanners,
    adminGetSettings,
    adminUpdateSettings,
} from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";
import { ProductPicker } from "../../components/admin/ProductPicker";

// ─── Section form ──────────────────────────────────────────────────────────────

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

// ─── Sortable section row ──────────────────────────────────────────────────────

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

// ─── Sortable banner card ──────────────────────────────────────────────────────

function SortableBannerCard({
    banner,
    catalogs,
    editing,
    onToggleEdit,
    onSaveTarget,
    onToggleActive,
    onDelete,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: banner.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const [catalogId, setCatalogId] = useState(banner.catalog_id ?? "");
    const [link, setLink] = useState(banner.link ?? "");

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group rounded-xl overflow-hidden border-2 bg-gray-100 ${banner.is_active ? "border-transparent" : "border-gray-200"}`}
        >
            <div className="aspect-[21/9] overflow-hidden">
                <img
                    src={banner.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                    }}
                />
                <div className="hidden w-full h-full items-center justify-center text-gray-400">
                    <ImageOff className="w-8 h-8" />
                </div>
            </div>

            {!banner.is_active && (
                <div className="absolute inset-0 bg-white/60 pointer-events-none" />
            )}

            {/* drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1 rounded bg-white/80 text-gray-500 hover:text-gray-900 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Trascina per riordinare"
            >
                <GripVertical className="w-4 h-4" />
            </button>

            {/* actions */}
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={() => onToggleActive(banner)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${banner.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    title={
                        banner.is_active
                            ? "Clicca per nascondere"
                            : "Clicca per rendere visibile"
                    }
                >
                    {banner.is_active ? "Visibile" : "Nascosto"}
                </button>
                <button
                    type="button"
                    onClick={() => onToggleEdit(banner.id)}
                    className={`p-1 rounded hover:bg-white ${editing ? "bg-white text-indigo-600" : "bg-white/90 text-gray-600"}`}
                    aria-label="Modifica destinazione"
                    title="Modifica destinazione"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() =>
                        window.confirm("Eliminare questo banner?") &&
                        onDelete(banner.id)
                    }
                    className="p-1 rounded bg-white/90 text-red-500 hover:text-red-700 hover:bg-white"
                    aria-label="Elimina banner"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {editing && (
                <div className="p-3 bg-white space-y-2 border-t border-gray-100">
                    <div>
                        <label className="text-xs font-medium text-gray-700">
                            Catalogo di destinazione
                        </label>
                        <select
                            value={catalogId}
                            onChange={(e) => setCatalogId(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Nessuno (usa link esterno)</option>
                            {catalogs.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {!catalogId && (
                        <Input
                            label="Link esterno (opzionale)"
                            placeholder="https://... oppure /catalogo"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    )}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onToggleEdit(null)}
                        >
                            Annulla
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                                onSaveTarget(banner.id, {
                                    catalog_id: catalogId || null,
                                    link: catalogId ? null : link,
                                })
                            }
                        >
                            Salva
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Carousel section ──────────────────────────────────────────────────────────

function CarouselSection() {
    const qc = useQueryClient();
    const fileRef = useRef(null);
    const [localOrder, setLocalOrder] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const { data: settingsData } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminGetSettings,
    });

    const { data: bannersData, isLoading } = useQuery({
        queryKey: ["admin-carousel-banners"],
        queryFn: adminGetCarouselBanners,
        onSuccess: () => setLocalOrder(null),
    });

    const { data: catalogsData } = useQuery({
        queryKey: ["admin-catalogs"],
        queryFn: adminGetCatalogs,
    });
    const catalogs = catalogsData?.data ?? [];

    const carouselEnabled = settingsData?.data?.carousel_enabled === "1";
    const rawBanners = bannersData?.data ?? [];
    const banners = localOrder
        ? localOrder
              .map((id) => rawBanners.find((b) => b.id === id))
              .filter(Boolean)
        : rawBanners;

    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["admin-carousel-banners"] });
        qc.invalidateQueries({ queryKey: ["carousel-banners"] });
    };

    const toggleCarousel = useMutation({
        mutationFn: (enabled) =>
            adminUpdateSettings({ carousel_enabled: enabled }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
    });

    const upload = useMutation({
        mutationFn: adminUploadCarouselBanner,
        onSuccess: invalidate,
    });

    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) =>
            adminUpdateCarouselBanner(id, { is_active }),
        onSuccess: invalidate,
    });

    const saveTarget = useMutation({
        mutationFn: ({ id, data }) => adminUpdateCarouselBanner(id, data),
        onSuccess: () => {
            invalidate();
            setEditingId(null);
        },
    });

    const del = useMutation({
        mutationFn: adminDeleteCarouselBanner,
        onSuccess: invalidate,
    });

    const reorder = useMutation({
        mutationFn: adminReorderCarouselBanners,
        onSuccess: invalidate,
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) upload.mutate(file);
        e.target.value = "";
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const ids = banners.map((b) => b.id);
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        const newIds = arrayMove(ids, oldIndex, newIndex);
        setLocalOrder(newIds);
        reorder.mutate(newIds);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">
                        Banner Carousel
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Immagini mostrate nel carousel in cima alla homepage.
                        Risoluzione (21/9).
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* toggle carousel visibilità */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-sm text-gray-600">
                            Mostra carousel
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={carouselEnabled}
                            onClick={() =>
                                toggleCarousel.mutate(!carouselEnabled)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${carouselEnabled ? "bg-indigo-600" : "bg-gray-200"}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${carouselEnabled ? "translate-x-6" : "translate-x-1"}`}
                            />
                        </button>
                    </label>

                    {/* upload button */}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                        disabled={upload.isPending}
                    >
                        <Upload className="w-4 h-4 mr-1.5" />
                        {upload.isPending ? "Caricamento…" : "Aggiungi banner"}
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="py-8 flex justify-center">
                    <PageSpinner />
                </div>
            ) : banners.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-xl py-10 text-center text-gray-400 text-sm">
                    Nessun banner. Caricane uno con il pulsante qui sopra.
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={banners.map((b) => b.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {banners.map((banner) => (
                                <SortableBannerCard
                                    key={banner.id}
                                    banner={banner}
                                    catalogs={catalogs}
                                    editing={editingId === banner.id}
                                    onToggleEdit={(id) =>
                                        setEditingId((current) =>
                                            current === id ? null : id,
                                        )
                                    }
                                    onSaveTarget={(id, data) =>
                                        saveTarget.mutate({ id, data })
                                    }
                                    onToggleActive={(b) =>
                                        toggleActive.mutate({
                                            id: b.id,
                                            is_active: !b.is_active,
                                        })
                                    }
                                    onDelete={(id) => del.mutate(id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}

// ─── Navbar (CardTrader) ─────────────────────────────────────────────────────────

function NavbarSettingsSection() {
    const qc = useQueryClient();
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    const [hydrated, setHydrated] = useState(false);

    const { data } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminGetSettings,
    });

    if (data && !hydrated) {
        setLabel(data.data?.cardtrader_label ?? "");
        setUrl(data.data?.cardtrader_url ?? "");
        setHydrated(true);
    }

    const save = useMutation({
        mutationFn: () =>
            adminUpdateSettings({
                cardtrader_label: label.trim(),
                cardtrader_url: url.trim(),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-settings"] });
            qc.invalidateQueries({ queryKey: ["public-settings"] });
        },
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Link CardTrader
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Voce e indirizzo del pulsante CardTrader nella barra di
                    navigazione
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                    label="Testo voce"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="CardTrader"
                    maxLength={50}
                />
                <Input
                    label="URL di destinazione"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.cardtrader.com/..."
                />
            </div>

            <div className="flex items-center gap-3 mt-4">
                <Button
                    size="sm"
                    onClick={() => save.mutate()}
                    disabled={save.isPending || !label.trim() || !url.trim()}
                >
                    {save.isPending ? "Salvataggio…" : "Salva"}
                </Button>
                {save.isSuccess && (
                    <span className="text-sm text-green-600">Salvato.</span>
                )}
                {save.isError && (
                    <span className="text-sm text-red-600">
                        Errore nel salvataggio.
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Orari di apertura ───────────────────────────────────────────────────────────

const DEFAULT_HOURS = [
    { day: "Lunedi", hours: "15:30 - 19:30" },
    { day: "Martedi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Mercoledi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Giovedi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Venerdi", hours: "11:00 - 13:00, 15:30 - 19:30" },
    { day: "Sabato", hours: "11:00 - 19:30" },
    { day: "Domenica", hours: "11:00 - 13:00, 15:30 - 19:30" },
];

function OpeningHoursSection() {
    const qc = useQueryClient();
    const [rows, setRows] = useState(DEFAULT_HOURS);
    const [hydrated, setHydrated] = useState(false);

    const { data } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminGetSettings,
    });

    if (data && !hydrated) {
        setRows(data.data?.opening_hours ?? DEFAULT_HOURS);
        setHydrated(true);
    }

    const updateHours = (index, value) => {
        setRows((prev) =>
            prev.map((r, i) => (i === index ? { ...r, hours: value } : r)),
        );
    };

    const save = useMutation({
        mutationFn: () => adminUpdateSettings({ opening_hours: rows }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-settings"] });
            qc.invalidateQueries({ queryKey: ["public-settings"] });
        },
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Orari di apertura
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Orari visualizzati nel footer del sito
                </p>
            </div>

            <div className="space-y-2">
                {rows.map((row, i) => (
                    <div key={row.day} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-sm font-medium text-gray-700">
                            {row.day}
                        </span>
                        <input
                            type="text"
                            value={row.hours}
                            onChange={(e) => updateHours(i, e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="es. 10:00 - 13:00, 15:00 - 19:00"
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 mt-4">
                <Button
                    size="sm"
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                >
                    {save.isPending ? "Salvataggio..." : "Salva"}
                </Button>
                {save.isSuccess && (
                    <span className="text-sm text-green-600">Salvato.</span>
                )}
                {save.isError && (
                    <span className="text-sm text-red-600">
                        Errore nel salvataggio.
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── WhatsApp assistenza ─────────────────────────────────────────────────────────

function WhatsAppSettingsSection() {
    const qc = useQueryClient();
    const [number, setNumber] = useState("");
    const [hydrated, setHydrated] = useState(false);

    const { data } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminGetSettings,
    });

    if (data && !hydrated) {
        setNumber(data.data?.whatsapp_number ?? "");
        setHydrated(true);
    }

    const save = useMutation({
        mutationFn: () =>
            adminUpdateSettings({ whatsapp_number: number.trim() || null }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-settings"] });
            qc.invalidateQueries({ queryKey: ["public-settings"] });
        },
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Assistenza WhatsApp
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Numero visualizzato nel footer. Lascia vuoto per nascondere
                    il link.
                </p>
            </div>

            <Input
                label="Numero WhatsApp"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="393401234567"
                maxLength={30}
            />

            <div className="flex items-center gap-3 mt-4">
                <Button
                    size="sm"
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                >
                    {save.isPending ? "Salvataggio…" : "Salva"}
                </Button>
                {save.isSuccess && (
                    <span className="text-sm text-green-600">Salvato.</span>
                )}
                {save.isError && (
                    <span className="text-sm text-red-600">
                        Errore nel salvataggio.
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Email di assistenza ─────────────────────────────────────────────────────────

function SupportEmailSection() {
    const qc = useQueryClient();
    const [email, setEmail] = useState("");
    const [hydrated, setHydrated] = useState(false);

    const { data } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminGetSettings,
    });

    if (data && !hydrated) {
        setEmail(data.data?.support_email ?? "assistenza.yocigaci@gmail.com");
        setHydrated(true);
    }

    const save = useMutation({
        mutationFn: () =>
            adminUpdateSettings({ support_email: email.trim() || null }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-settings"] });
        },
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Email di assistenza
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Indirizzo mostrato nel footer delle email transazionali.
                    Lascia vuoto per usare il valore predefinito
                    (assistenza.yocigaci@gmail.com).
                </p>
            </div>

            <Input
                label="Email assistenza"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="assistenza.yocigaci@gmail.com"
                maxLength={100}
            />

            <div className="flex items-center gap-3 mt-4">
                <Button
                    size="sm"
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                >
                    {save.isPending ? "Salvataggio…" : "Salva"}
                </Button>
                {save.isSuccess && (
                    <span className="text-sm text-green-600">Salvato.</span>
                )}
                {save.isError && (
                    <span className="text-sm text-red-600">
                        Errore nel salvataggio.
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Email notifiche ordini ───────────────────────────────────────────────────────

function OrderNotificationEmailSection() {
    const qc = useQueryClient();
    const [email, setEmail] = useState("");
    const [hydrated, setHydrated] = useState(false);

    const { data } = useQuery({
        queryKey: ["admin-settings"],
        queryFn: adminGetSettings,
    });

    if (data && !hydrated) {
        setEmail(data.data?.order_notification_email ?? "");
        setHydrated(true);
    }

    const save = useMutation({
        mutationFn: () =>
            adminUpdateSettings({ order_notification_email: email.trim() || null }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-settings"] });
        },
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Email notifiche ordini
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Indirizzo a cui inviare una notifica ad ogni nuovo ordine confermato.
                    Lascia vuoto per disabilitare le notifiche al venditore.
                </p>
            </div>

            <Input
                label="Email venditore"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ordini@yocigaci.it"
                maxLength={100}
            />

            <div className="flex items-center gap-3 mt-4">
                <Button
                    size="sm"
                    onClick={() => save.mutate()}
                    disabled={save.isPending}
                >
                    {save.isPending ? "Salvataggio…" : "Salva"}
                </Button>
                {save.isSuccess && (
                    <span className="text-sm text-green-600">Salvato.</span>
                )}
                {save.isError && (
                    <span className="text-sm text-red-600">
                        Errore nel salvataggio.
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

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
                        Homepage
                    </h1>
                </div>
            </div>

            {/* Carousel banners */}
            <CarouselSection />

            {/* Sezioni prodotti */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                    Sezioni prodotti
                </h2>
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

            {/* Link CardTrader navbar */}
            <div className="mt-8">
                <NavbarSettingsSection />
            </div>

            {/* Orari di apertura */}
            <OpeningHoursSection />

            {/* WhatsApp assistenza */}
            <WhatsAppSettingsSection />

            {/* Email di assistenza */}
            <SupportEmailSection />

            {/* Email notifiche ordini */}
            <OrderNotificationEmailSection />
        </div>
    );
}
