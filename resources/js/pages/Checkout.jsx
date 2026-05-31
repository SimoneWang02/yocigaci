import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { createIntent, confirmCheckout } from "../api/checkout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY ?? "");
const SHIPPING_THRESHOLD = 60;

function AddressForm({ onSubmit, loading }) {
    const [form, setForm] = useState({
        full_name: "",
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Nome e cognome"
                value={form.full_name}
                onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                }
                error={errors.full_name}
                required
            />
            <Input
                label="Indirizzo"
                value={form.address_line1}
                onChange={(e) =>
                    setForm({ ...form, address_line1: e.target.value })
                }
                error={errors.address_line1}
                required
            />
            <Input
                label="Interno / appartamento (opzionale)"
                value={form.address_line2}
                onChange={(e) =>
                    setForm({ ...form, address_line2: e.target.value })
                }
            />
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Città"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    error={errors.city}
                    required
                />
                <Input
                    label="CAP"
                    value={form.postal_code}
                    onChange={(e) =>
                        setForm({ ...form, postal_code: e.target.value })
                    }
                    error={errors.postal_code}
                    required
                />
            </div>
            <Input
                label="Provincia (sigla)"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                error={errors.province}
                placeholder="MI"
                maxLength={2}
                required
            />
            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
            >
                Continua al pagamento
            </Button>
        </form>
    );
}

function PaymentStep({
    clientSecret,
    items,
    shippingAddress,
    notes,
    onSuccess,
}) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { clear } = useCartStore();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 5.9;
    const hasPreorder = items.some((i) => i.is_preorder);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError(null);

        const { error: stripeError, paymentIntent } =
            await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            });

        if (stripeError) {
            setError(stripeError.message);
            setLoading(false);
            return;
        }

        try {
            const result = await confirmCheckout({
                items: items.map((i) => ({
                    product_id: i.id,
                    quantity: i.quantity,
                })),
                shipping_address: shippingAddress,
                notes,
                payment_intent_id: paymentIntent.id,
            });
            clear();
            navigate(`/ordine-confermato/${result.order_number}`);
        } catch {
            setError(
                "Errore nella conferma dell'ordine. Contatta il supporto.",
            );
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {hasPreorder && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-800 text-sm font-medium">
                        ⚠️ Questo ordine contiene preordini - il pagamento viene
                        addebitato ora, la spedizione avviene all&apos;arrivo
                        della merce.
                    </p>
                </div>
            )}
            <PaymentElement />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading || !stripe}
            >
                {loading
                    ? "Elaborazione..."
                    : `Paga € ${(subtotal + shipping).toFixed(2).replace(".", ",")}`}
            </Button>
        </form>
    );
}

export default function Checkout() {
    const { items } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [step, setStep] = useState("address");
    const [shippingAddress, setShippingAddress] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 5.9;

    if (items.length === 0) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <p className="text-5xl mb-4">🛒</p>
                <p className="text-gray-600 mb-6">Il carrello è vuoto.</p>
                <Button onClick={() => navigate("/catalogo")} variant="primary">
                    Vai al catalogo
                </Button>
            </div>
        );
    }

    const handleAddressSubmit = async (address) => {
        setLoading(true);
        try {
            const data = await createIntent({
                items: items.map((i) => ({
                    product_id: i.id,
                    quantity: i.quantity,
                })),
                shipping_address: address,
                notes,
            });
            setShippingAddress(address);
            setClientSecret(data.client_secret);
            setStep("payment");
        } catch (err) {
            alert(err.response?.data?.message ?? "Errore. Riprova.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-2">
                    {step === "address" ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold mb-5">
                                Indirizzo di spedizione
                            </h2>
                            <AddressForm
                                onSubmit={handleAddressSubmit}
                                loading={loading}
                            />
                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Note per l&apos;ordine (opzionale)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Istruzioni di consegna..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold">
                                    Pagamento
                                </h2>
                                <button
                                    onClick={() => setStep("address")}
                                    className="text-sm text-indigo-600 hover:underline"
                                >
                                    ← Modifica indirizzo
                                </button>
                            </div>
                            {clientSecret && (
                                <Elements
                                    stripe={stripePromise}
                                    options={{ clientSecret, locale: "it" }}
                                >
                                    <PaymentStep
                                        clientSecret={clientSecret}
                                        items={items}
                                        shippingAddress={shippingAddress}
                                        notes={notes}
                                    />
                                </Elements>
                            )}
                        </div>
                    )}
                </div>

                {/* Order summary */}
                <div>
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-24">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Riepilogo ordine
                        </h3>
                        <div className="space-y-3 mb-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-2">
                                    {item.primary_image?.url && (
                                        <img
                                            src={item.primary_image.url}
                                            alt=""
                                            className="w-10 h-12 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-800 font-medium truncate">
                                            {item.name}
                                        </p>
                                        {item.is_preorder && (
                                            <p className="text-xs text-amber-600">
                                                Preordine
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            x{item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        €{" "}
                                        {(item.price * item.quantity)
                                            .toFixed(2)
                                            .replace(".", ",")}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-3 space-y-1 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotale</span>
                                <span>
                                    € {subtotal.toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Spedizione</span>
                                <span>
                                    {shipping === 0
                                        ? "Gratuita"
                                        : `€ ${shipping.toFixed(2).replace(".", ",")}`}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t">
                                <span>Totale</span>
                                <span>
                                    €{" "}
                                    {(subtotal + shipping)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
