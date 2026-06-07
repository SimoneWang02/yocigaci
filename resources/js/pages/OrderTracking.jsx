import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { trackOrder } from "../api/orders";
import { Truck, Package, Search, ExternalLink, CheckCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
    paid:               { label: "Pagato",               color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
    shipped:            { label: "Spedito",              color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
    ready_for_pickup:   { label: "Pronto al ritiro",     color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
    picked_up:          { label: "Ritirato",             color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
    refunded:           { label: "Rimborsato",           color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200" },
    preorder_confirmed: { label: "Preordine Confermato", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
};

function DirectDhlTracking() {
    const [code, setCode] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        window.open(
            `https://www.dhl.com/it-it/home/tracking.html?tracking-id=${encodeURIComponent(code.trim())}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                Hai gia' il codice DHL?
            </p>
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Es. 1234567890"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    disabled={!code.trim()}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl px-4 py-2.5 transition-colors flex-shrink-0"
                >
                    Traccia
                    <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>
        </form>
    );
}

export default function OrderTracking() {
    const [form, setForm] = useState({ order_number: "", email: "" });

    const { mutate, data, isPending, error, reset } = useMutation({
        mutationFn: trackOrder,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        reset();
        mutate(form);
    };

    const order = data?.data;
    const statusCfg = order
        ? (STATUS_CONFIG[order.status] ?? { label: order.status_label, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" })
        : null;

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-start pt-16 px-4 pb-16">
            <div className="w-full max-w-md space-y-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-4">
                        <Truck className="w-7 h-7 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Tracking Ordine</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Inserisci il numero ordine e l'email con cui hai acquistato.
                    </p>
                </div>

                {/* Form ricerca ordine */}
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Numero ordine
                        </label>
                        <input
                            type="text"
                            placeholder="ORD-2025-0001"
                            value={form.order_number}
                            onChange={(e) => setForm((f) => ({ ...f, order_number: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="la-tua@email.it"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        {isPending ? "Ricerca..." : "Cerca ordine"}
                    </button>

                    {error && (
                        <p className="text-sm text-center text-red-600">
                            {error.response?.data?.message ?? "Ordine non trovato. Verifica i dati inseriti."}
                        </p>
                    )}
                </form>

                {/* Risultato */}
                {order && statusCfg && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className={`px-5 py-4 flex items-center justify-between ${statusCfg.bg} border-b ${statusCfg.border}`}>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stato ordine</p>
                                <p className={`mt-0.5 text-base font-bold ${statusCfg.color}`}>{statusCfg.label}</p>
                            </div>
                            <p className="text-xs font-mono text-gray-500">{order.order_number}</p>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span>
                                    Ordinato il{" "}
                                    {new Date(order.created_at).toLocaleDateString("it-IT", {
                                        day: "2-digit", month: "long", year: "numeric",
                                    })}
                                </span>
                            </div>

                            {order.shipped_at && (
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>
                                        Spedito il{" "}
                                        {new Date(order.shipped_at).toLocaleDateString("it-IT", {
                                            day: "2-digit", month: "long", year: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}

                            {order.tracking_code && (
                                <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        <span className="text-sm font-mono font-semibold text-green-800 truncate">
                                            {order.tracking_code}
                                        </span>
                                    </div>
                                    <a
                                        href={`https://www.dhl.com/it-it/home/tracking.html?tracking-id=${order.tracking_code}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-green-700 border border-green-300 bg-white rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
                                    >
                                        Traccia su DHL
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            {order.delivery_method === "pickup" && !order.tracking_code && (
                                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                                    <Package className="w-4 h-4 flex-shrink-0" />
                                    <span>Il tuo ordine e' disponibile per il ritiro in negozio.</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Separatore */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">oppure</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Tracciamento diretto DHL */}
                <DirectDhlTracking />
            </div>
        </div>
    );
}
