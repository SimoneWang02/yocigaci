import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { createSession } from "../api/checkout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ShoppingCart, Lock, Truck, ChevronRight, Package } from "lucide-react";

const SHIPPING_THRESHOLD = 60;

function ShippingProgress({ subtotal }) {
    const remaining = SHIPPING_THRESHOLD - subtotal;
    const pct = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);
    const free = subtotal >= SHIPPING_THRESHOLD;

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

function AddressForm({ onSubmit, loading }) {
    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        postal_code: "",
        province: "",
        country: "IT",
    });
    const [errors, setErrors] = useState({});

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
        if (validate()) onSubmit(form);
    };

    const field = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dati personali */}
            <div>
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
                        placeholder="+39 333 1234567"
                        required
                    />
                </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Indirizzo */}
            <div>
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
                            onChange={(e) =>
                                field("postal_code", e.target.value)
                            }
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
            </div>

            {/* CTA */}
            <div className="pt-2">
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full gap-2"
                    disabled={loading}
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
                <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Pagamento sicuro con Stripe
                </p>
            </div>
        </form>
    );
}

export default function Checkout() {
    const { items } = useCartStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 5.9;
    const total = subtotal + shipping;

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

    const handleAddressSubmit = async (address) => {
        setLoading(true);
        setError(null);
        try {
            const data = await createSession({
                items: items.map((i) => ({
                    product_id: i.id,
                    quantity: i.quantity,
                })),
                shipping_address: address,
            });
            window.location.href = data.url;
        } catch (err) {
            setError(err.response?.data?.message ?? "Errore. Riprova.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            {/* Breadcrumb */}
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
                <span className="text-gray-700 font-medium">Spedizione</span>
            </nav>

            <h1 className="text-2xl font-bold text-gray-900 mb-8">
                Completa l&apos;ordine
            </h1>

            <div className="grid md:grid-cols-3 gap-8 items-start">
                {/* Form */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <AddressForm
                            onSubmit={handleAddressSubmit}
                            loading={loading}
                        />
                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                                {error}
                            </div>
                        )}
                    </div>
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

                        <ShippingProgress subtotal={subtotal} />

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

                        <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotale</span>
                                <span>
                                    € {subtotal.toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Spedizione</span>
                                <span
                                    className={
                                        shipping === 0
                                            ? "text-green-600 font-medium"
                                            : ""
                                    }
                                >
                                    {shipping === 0
                                        ? "Gratuita"
                                        : `€ ${shipping.toFixed(2).replace(".", ",")}`}
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
