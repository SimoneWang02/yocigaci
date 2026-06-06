import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../api/orders";
import { Badge } from "../../components/ui/Badge";
import { PageSpinner } from "../../components/ui/Spinner";
import { Package, ArrowRight, ChevronRight, Truck, MapPin } from "lucide-react";

const STATUS_CONFIG = {
    pending: {
        label: "In Attesa",
        variant: "default",
        border: "border-l-gray-300",
    },
    paid: { label: "Pagato", variant: "success", border: "border-l-green-400" },
    processing: {
        label: "In Preparazione",
        variant: "info",
        border: "border-l-blue-400",
    },
    shipped: {
        label: "Spedito",
        variant: "success",
        border: "border-l-green-500",
    },
    delivered: {
        label: "Consegnato",
        variant: "success",
        border: "border-l-green-600",
    },
    cancelled: {
        label: "Annullato",
        variant: "sold_out",
        border: "border-l-red-400",
    },
    refunded: {
        label: "Rimborsato",
        variant: "default",
        border: "border-l-gray-400",
    },
    preorder_confirmed: {
        label: "Preordine Confermato",
        variant: "preorder",
        border: "border-l-amber-400",
    },
    preorder_ready: {
        label: "Pronto per Spedizione",
        variant: "info",
        border: "border-l-blue-500",
    },
};

function formatDate(iso) {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return "Oggi";
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatMonth(iso) {
    return new Date(iso).toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
    });
}

function groupByMonth(orders) {
    const groups = {};
    for (const order of orders) {
        const key = formatMonth(order.created_at);
        if (!groups[key]) groups[key] = [];
        groups[key].push(order);
    }
    return Object.entries(groups);
}

export default function Orders() {
    const { data, isLoading } = useQuery({
        queryKey: ["my-orders"],
        queryFn: getOrders,
    });
    const orders = data?.data ?? [];

    if (isLoading) return <PageSpinner />;

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="flex items-baseline justify-between mb-7">
                <h1 className="text-2xl font-bold text-gray-900">
                    I miei ordini
                </h1>
                {orders.length > 0 && (
                    <span className="text-sm text-gray-400">
                        {orders.length}{" "}
                        {orders.length === 1 ? "ordine" : "ordini"}
                    </span>
                )}
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <p className="font-medium text-gray-500 mb-1">
                        Nessun ordine ancora
                    </p>
                    <p className="text-sm mb-5">
                        Esplora il catalogo e fai il tuo primo acquisto.
                    </p>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Vai al catalogo <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupByMonth(orders).map(([month, monthOrders]) => (
                        <div key={month}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
                                {month}
                            </p>
                            <div className="space-y-2">
                                {monthOrders.map((order) => {
                                    const status = STATUS_CONFIG[
                                        order.status
                                    ] ?? {
                                        label: order.status,
                                        variant: "default",
                                        border: "border-l-gray-300",
                                    };
                                    const addr = order.shipping_address;
                                    return (
                                        <Link
                                            key={order.id}
                                            to={`/account/ordini/${order.order_number}`}
                                            className={`group block bg-white border border-gray-200 border-l-4 ${status.border} rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    {/* Top row */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-mono font-bold text-sm text-gray-900 tracking-wide">
                                                            {order.order_number}
                                                        </span>
                                                        {order.type ===
                                                            "preorder" && (
                                                            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-px rounded">
                                                                Preordine
                                                            </span>
                                                        )}
                                                        {order.tracking_code && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-1.5 py-px rounded">
                                                                <Truck className="w-3 h-3" />
                                                                Tracciabile
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Status + date */}
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={
                                                                status.variant
                                                            }
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                        <span className="text-xs text-gray-400">
                                                            {formatDate(
                                                                order.created_at,
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Address */}
                                                    {addr?.full_name && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {addr.full_name}{" "}
                                                                - {addr.city}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0 self-center">
                                                    <span className="font-bold text-gray-900 tabular-nums">
                                                        €{" "}
                                                        {Number(order.total)
                                                            .toFixed(2)
                                                            .replace(".", ",")}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
