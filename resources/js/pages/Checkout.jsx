import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { createSession } from "../api/checkout";
import { getSettings } from "../api/products";
import { getAddresses, saveAddress, deleteAddress } from "../api/addresses";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
    ShoppingCart,
    Lock,
    Truck,
    Store,
    ChevronRight,
    Package,
    MapPin,
    Plus,
    Check,
    Clock,
    Trash2,
} from "lucide-react";

const EMPTY_FORM = {
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    province: "",
    country: "IT",
};

function ShippingProgress({ subtotal, threshold }) {
    const remaining = threshold - subtotal;
    const pct = Math.min((subtotal / threshold) * 100, 100);
    const free = subtotal >= threshold;

    return (
        <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-indigo-700">
                    {free
                        ? "Spedizione gratuita applicata!"
                        : `Aggiungi € ${remaining.toFixed(2).replace(".", ",")} per la spedizione gratuita`}
                </span>
                <Truck
                    className={`w-4 h-4 ${free ? "text-indigo-600" : "text-indigo-400"}`}
                />
            </div>
            <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function SavedAddressCard({ address, selected, onSelect, onDelete }) {
    return (
        <div
            className={`w-full rounded-xl border-2 px-4 py-3 transition-all ${
                selected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <button
                    type="button"
                    onClick={() => onSelect(address)}
                    className="flex-1 min-w-0 text-left"
                >
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {address.full_name}
                    </p>
                    {address.phone && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            {address.phone}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {address.address_line1}
                        {address.address_line2
                            ? `, ${address.address_line2}`
                            : ""}{" "}
                        - {address.postal_code} {address.city} (
                        {address.province})
                    </p>
                </button>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                    {selected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => onDelete(address.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Elimina indirizzo"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddressForm({
    initialValues,
    onSubmit,
    loading,
    isLoggedIn,
    isNewAddress,
}) {
    const [form, setForm] = useState(initialValues ?? EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saveForNext, setSaveForNext] = useState(true);

    useEffect(() => {
        if (initialValues) setForm(initialValues);
    }, [initialValues]);

    const validate = () => {
        const e = {};
        if (!form.full_name) e.full_name = "Campo obbligatorio";
        if (!form.phone) e.phone = "Campo obbligatorio";
        if (!form.address_line1) e.address_line1 = "Campo obbligatorio";
        if (!form.city) e.city = "Campo obbligatorio";
        if (!form.postal_code) e.postal_code = "Campo obbligatorio";
        if (!form.province) e.province = "Campo obbligatorio";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate())
            onSubmit(form, isLoggedIn && isNewAddress && saveForNext);
    };

    const field = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <Input
                    label="Nome e Cognome"
                    value={form.full_name}
                    onChange={(e) => field("full_name", e.target.value)}
                    error={errors.full_name}
                    placeholder="Mario Rossi"
                    required
                />
                <Input
                    label="Telefono"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => field("phone", e.target.value)}
                    error={errors.phone}
                    placeholder="333 1234567"
                    required
                />
            </div>

            <div className="border-t border-gray-100" />

            <div className="space-y-3">
                <Input
                    label="Indirizzo"
                    value={form.address_line1}
                    onChange={(e) => field("address_line1", e.target.value)}
                    error={errors.address_line1}
                    placeholder="Via Roma 1"
                    required
                />
                <Input
                    label="Interno / Appartamento"
                    value={form.address_line2}
                    onChange={(e) => field("address_line2", e.target.value)}
                    placeholder="Scala A, Interno 3 (opzionale)"
                />
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Città"
                        value={form.city}
                        onChange={(e) => field("city", e.target.value)}
                        error={errors.city}
                        placeholder="Milano"
                        required
                    />
                    <Input
                        label="CAP"
                        value={form.postal_code}
                        onChange={(e) => field("postal_code", e.target.value)}
                        error={errors.postal_code}
                        placeholder="20100"
                        required
                    />
                </div>
                <Input
                    label="Provincia"
                    value={form.province}
                    onChange={(e) => field("province", e.target.value)}
                    error={errors.province}
                    placeholder="MI"
                    maxLength={2}
                    className="uppercase"
                    required
                />
            </div>

            {isLoggedIn && isNewAddress && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={saveForNext}
                        onChange={(e) => setSaveForNext(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">
                        Salva indirizzo per i prossimi acquisti
                    </span>
                </label>
            )}

            <PayButton loading={loading} />
        </form>
    );
}

// Bottone di pagamento condiviso tra spedizione e ritiro in negozio.
function PayButton({ loading }) {
    const [termsAccepted, setTermsAccepted] = useState(false);

    return (
        <div className="pt-2 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                    Ho letto e accetto i{" "}
                    <a
                        href="/p/termini-e-condizioni"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 underline hover:text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Termini e Condizioni
                    </a>{" "}
                    e l&apos;
                    <a
                        href="/p/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 underline hover:text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Informativa sulla Privacy
                    </a>
                    .
                </span>
            </label>

            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full gap-2"
                disabled={loading || !termsAccepted}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            />
                        </svg>
                        Caricamento...
                    </span>
                ) : (
                    <>
                        <Lock className="w-4 h-4" />
                        Procedi al pagamento
                    </>
                )}
            </Button>
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Pagamento sicuro con Stripe
            </p>
        </div>
    );
}

// Form leggero per il ritiro in negozio: solo nominativo e telefono, niente indirizzo.
function PickupForm({ initialValues, onSubmit, loading }) {
    const [form, setForm] = useState({
        full_name: initialValues?.full_name ?? "",
        phone: initialValues?.phone ?? "",
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.full_name) e.full_name = "Campo obbligatorio";
        if (!form.phone) e.phone = "Campo obbligatorio";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
    };

    const field = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-start gap-3 bg-indigo-50 rounded-xl px-4 py-3">
                <Store className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-medium text-indigo-800">
                        Ritiro gratuito in negozio
                    </p>
                    <p className="text-indigo-600/80 text-xs mt-0.5">
                        Ti avviseremo via email quando il tuo ordine sarà pronto
                        per il ritiro.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <Input
                    label="Nome e Cognome"
                    value={form.full_name}
                    onChange={(e) => field("full_name", e.target.value)}
                    error={errors.full_name}
                    placeholder="Mario Rossi"
                    required
                />
                <Input
                    label="Telefono"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => field("phone", e.target.value)}
                    error={errors.phone}
                    placeholder="333 1234567"
                    required
                />
            </div>

            <PayButton loading={loading} />
        </form>
    );
}

// Opzione selezionabile del metodo di consegna (spedizione / ritiro).
function DeliveryOption({ selected, onClick, icon: Icon, title, subtitle }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 text-left rounded-xl border-2 px-4 py-3 transition-all ${
                selected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
            <div className="flex items-center gap-2">
                <Icon
                    className={`w-5 h-5 ${selected ? "text-indigo-600" : "text-gray-400"}`}
                />
                <span className="text-sm font-semibold text-gray-900">
                    {title}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </button>
    );
}

export default function Checkout() {
    const { items } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState("shipping");

    const { data: settingsData } = useQuery({
        queryKey: ["public-settings"],
        queryFn: getSettings,
    });
    const shippingThreshold = settingsData?.data?.shipping_free_threshold ?? null;
    const shippingCost = settingsData?.data?.shipping_cost ?? null;
    const shippingConfigured = shippingThreshold !== null && shippingCost !== null;

    const isPickup = deliveryMethod === "pickup";
    const hasMixedCart =
        items.some((i) => i.is_preorder) && items.some((i) => !i.is_preorder);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = isPickup
        ? 0
        : shippingConfigured
          ? subtotal >= shippingThreshold ? 0 : shippingCost
          : null;
    const total = subtotal + (shipping ?? 0);

    const chooseDelivery = (method) => {
        setDeliveryMethod(method);
        setError(null);
    };

    useEffect(() => {
        if (!user) return;
        getAddresses()
            .then((list) => {
                setSavedAddresses(list);
                if (list.length > 0) {
                    const def = list.find((a) => a.is_default) ?? list[0];
                    setSelectedAddress(def);
                    setShowNewForm(false);
                } else {
                    setShowNewForm(true);
                }
            })
            .catch(() => setShowNewForm(true));
    }, [user]);

    if (items.length === 0) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <ShoppingCart
                        className="w-9 h-9 text-gray-400"
                        strokeWidth={1.5}
                    />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Carrello vuoto
                </h2>
                <p className="text-gray-500 mb-6">
                    Aggiungi qualche prodotto prima di procedere.
                </p>
                <Button
                    onClick={() => navigate("/catalogo")}
                    variant="primary"
                    size="lg"
                >
                    Vai al catalogo
                </Button>
            </div>
        );
    }

    const startCheckout = async (address, shouldSave) => {
        if (!isPickup && !shippingConfigured) {
            setError("Spedizione non configurata. Contatta l'amministratore.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (shouldSave) {
                await saveAddress({
                    ...address,
                    is_default: savedAddresses.length === 0,
                });
            }
            const data = await createSession({
                items: items.map((i) => ({
                    product_id: i.id,
                    quantity: i.quantity,
                })),
                delivery_method: deliveryMethod,
                shipping_address: address,
            });
            window.location.href = data.url;
        } catch (err) {
            setError(err.response?.data?.message ?? "Errore. Riprova.");
            setLoading(false);
        }
    };

    const handleSelectSaved = (address) => {
        setSelectedAddress(address);
        setShowNewForm(false);
    };

    const handleUseNewAddress = () => {
        setSelectedAddress(null);
        setShowNewForm(true);
    };

    const handleDeleteAddress = async (id) => {
        await deleteAddress(id);
        const updated = savedAddresses.filter((a) => a.id !== id);
        setSavedAddresses(updated);
        if (selectedAddress?.id === id) {
            if (updated.length > 0) {
                setSelectedAddress(updated[0]);
                setShowNewForm(false);
            } else {
                setSelectedAddress(null);
                setShowNewForm(true);
            }
        }
    };

    const hasSaved = savedAddresses.length > 0;
    const formInitialValues = selectedAddress
        ? {
              full_name: selectedAddress.full_name,
              phone: selectedAddress.phone ?? "",
              address_line1: selectedAddress.address_line1,
              address_line2: selectedAddress.address_line2 ?? "",
              city: selectedAddress.city,
              postal_code: selectedAddress.postal_code,
              province: selectedAddress.province,
              country: selectedAddress.country,
          }
        : EMPTY_FORM;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
                <button
                    onClick={() => navigate("/catalogo")}
                    className="hover:text-gray-600 transition-colors"
                >
                    Catalogo
                </button>
                <ChevronRight className="w-3.5 h-3.5" />
                <button
                    onClick={() => navigate(-1)}
                    className="hover:text-gray-600 transition-colors"
                >
                    Carrello
                </button>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-700 font-medium">Consegna</span>
            </nav>

            <h1 className="text-2xl font-bold text-gray-900 mb-8">
                Completa l&apos;ordine
            </h1>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2 space-y-4">
                    {/* Metodo di consegna */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Truck className="w-4 h-4 text-gray-500" />
                            <h2 className="font-semibold text-gray-900">
                                Metodo di consegna
                            </h2>
                        </div>
                        <div className="flex gap-3">
                            <DeliveryOption
                                selected={!isPickup}
                                onClick={() => chooseDelivery("shipping")}
                                icon={Truck}
                                title="Spedizione"
                                subtitle={
                                    !shippingConfigured
                                        ? "Non configurata"
                                        : shippingCost === 0
                                          ? "Spedizione gratuita"
                                          : `Gratuita oltre € ${Number(shippingThreshold).toFixed(2).replace(".", ",")}`
                                }
                            />
                            <DeliveryOption
                                selected={isPickup}
                                onClick={() => chooseDelivery("pickup")}
                                icon={Store}
                                title="Ritiro in negozio"
                                subtitle="Nessun costo"
                            />
                        </div>
                    </div>

                    {/* Ritiro in negozio: solo contatti, niente indirizzo */}
                    {isPickup ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <PickupForm
                                initialValues={{
                                    full_name:
                                        selectedAddress?.full_name ??
                                        user?.name ??
                                        "",
                                    phone: selectedAddress?.phone ?? "",
                                }}
                                onSubmit={(address) =>
                                    startCheckout(address, false)
                                }
                                loading={loading}
                            />
                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Indirizzi salvati */}
                            {hasSaved && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <h2 className="font-semibold text-gray-900">
                                            Indirizzi salvati
                                        </h2>
                                    </div>
                                    <div className="space-y-2">
                                        {savedAddresses.map((addr) => (
                                            <SavedAddressCard
                                                key={addr.id}
                                                address={addr}
                                                selected={
                                                    !showNewForm &&
                                                    selectedAddress?.id ===
                                                        addr.id
                                                }
                                                onSelect={handleSelectSaved}
                                                onDelete={handleDeleteAddress}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleUseNewAddress}
                                        className={`mt-3 w-full flex items-center gap-2 justify-center rounded-xl border-2 border-dashed px-4 py-2.5 text-sm transition-all ${
                                            showNewForm
                                                ? "border-indigo-400 text-indigo-600 bg-indigo-50"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        }`}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Usa un nuovo indirizzo
                                    </button>
                                </div>
                            )}

                            {/* Form indirizzo */}
                            {(!hasSaved || showNewForm || selectedAddress) && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                    {hasSaved &&
                                        !showNewForm &&
                                        selectedAddress && (
                                            <p className="text-xs text-gray-400 mb-4">
                                                Modifica i dati se necessario
                                                prima di procedere.
                                            </p>
                                        )}
                                    {showNewForm && hasSaved && (
                                        <p className="text-sm font-semibold text-gray-900 mb-4">
                                            Nuovo indirizzo
                                        </p>
                                    )}
                                    <AddressForm
                                        key={selectedAddress?.id ?? "new"}
                                        initialValues={
                                            showNewForm
                                                ? EMPTY_FORM
                                                : formInitialValues
                                        }
                                        onSubmit={startCheckout}
                                        loading={loading}
                                        isLoggedIn={!!user}
                                        isNewAddress={showNewForm || !hasSaved}
                                    />
                                    {error && (
                                        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Riepilogo */}
                <div className="sticky top-24">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-4 h-4 text-gray-500" />
                            <h3 className="font-semibold text-gray-900">
                                Riepilogo ordine
                            </h3>
                            <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                                {items.length}{" "}
                                {items.length === 1 ? "articolo" : "articoli"}
                            </span>
                        </div>

                        {!isPickup && shippingConfigured && (
                            <ShippingProgress
                                subtotal={subtotal}
                                threshold={shippingThreshold}
                            />
                        )}

                        <div className="space-y-3 mb-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    {item.primary_image?.url ? (
                                        <img
                                            src={item.primary_image.url}
                                            alt=""
                                            className="w-11 h-14 object-cover rounded-lg flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-11 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-800 font-medium leading-snug truncate">
                                            {item.name}
                                        </p>
                                        {item.is_preorder && (
                                            <span className="inline-block text-xs text-amber-600 bg-amber-50 rounded px-1 py-0.5 mt-0.5">
                                                Preordine
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Qtà: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                                        €{" "}
                                        {(item.price * item.quantity)
                                            .toFixed(2)
                                            .replace(".", ",")}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {hasMixedCart && (
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-3">
                                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-snug">
                                    Il carrello contiene preordini: l&apos;intero ordine verra&apos; spedito quando tutti i prodotti saranno disponibili.
                                </p>
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotale</span>
                                <span>
                                    € {subtotal.toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>
                                    {isPickup
                                        ? "Ritiro in negozio"
                                        : "Spedizione"}
                                </span>
                                <span
                                    className={
                                        shipping === 0
                                            ? "text-green-600 font-medium"
                                            : ""
                                    }
                                >
                                    {shipping === null
                                        ? "—"
                                        : shipping === 0
                                          ? isPickup
                                              ? "Gratuito"
                                              : "Gratuita"
                                          : `€ ${Number(shipping).toFixed(2).replace(".", ",")}`}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                            <span className="font-bold text-gray-900">
                                Totale
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                                € {total.toFixed(2).replace(".", ",")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
