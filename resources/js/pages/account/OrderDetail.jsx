import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../../api/orders";
import { Badge } from "../../components/ui/Badge";
import { PageSpinner } from "../../components/ui/Spinner";
import {
    ArrowLeft,
    Hash,
    Package,
    MapPin,
    Truck,
    Store,
    Receipt,
} from "lucide-react";

const STATUS_LABELS = {
    paid: { label: "Pagato", variant: "success" },
    shipped: { label: "Spedito", variant: "success" },
    ready_for_pickup: { label: "Pronto al ritiro", variant: "warning" },
    picked_up: { label: "Ritirato", variant: "success" },
    refunded: { label: "Rimborsato", variant: "default" },
    preorder_confirmed: { label: "Preordine Confermato", variant: "preorder" },
};

function SectionHeader({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
    );
}

export default function OrderDetail() {
    const { orderNumber } = useParams();
    const { data, isLoading } = useQuery({
        queryKey: ["order", orderNumber],
        queryFn: () => getOrder(orderNumber),
    });

    if (isLoading) return <PageSpinner />;

    const order = data?.data;
    if (!order)
        return (
            <p className="text-center py-16 text-gray-500">
                Ordine non trovato.
            </p>
        );

    const status = STATUS_LABELS[order.status] ?? {
        label: order.status,
        variant: "default",
    };
    const addr = order.shipping_address;
    const isPickup = order.delivery_method === "pickup";

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <Link
                to="/account/ordini"
                className="text-sm text-indigo-600 hover:underline mb-4 inline-flex items-center gap-1"
            >
                <ArrowLeft className="w-4 h-4" /> Tutti gli ordini
            </Link>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-indigo-300" />
                                <span className="font-mono text-white font-bold text-base tracking-wide">
                                    {order.order_number}
                                </span>
                                {order.type === "preorder" && (
                                    <span className="text-xs bg-amber-400/20 text-amber-200 border border-amber-400/30 px-1.5 py-0.5 rounded font-medium">
                                        Preordine
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={status.variant}>
                                    {status.label}
                                </Badge>
                                <span className="text-indigo-200 text-xs">
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString("it-IT", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-6">
                    {/* Tracking */}
                    {order.tracking_code && (
                        <div>
                            <SectionHeader icon={Truck} title="Tracciamento" />
                            <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm font-mono font-semibold text-green-800 truncate">
                                        {order.tracking_code}
                                    </span>
                                </div>
                                <a
                                    href={`https://www.dhl.com/it-it/home/tracking.html?tracking-id=${order.tracking_code}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 text-xs font-semibold text-green-700 border border-green-300 bg-white rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
                                >
                                    Traccia su DHL
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Products */}
                    <div>
                        <SectionHeader icon={Package} title="Prodotti" />
                        <div className="bg-gray-50 rounded-xl overflow-hidden divide-y divide-gray-100">
                            {order.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 px-4 py-3"
                                >
                                    {item.product_snapshot?.image_url ? (
                                        <img
                                            src={
                                                item.product_snapshot.image_url
                                            }
                                            alt=""
                                            className="w-11 h-14 object-cover rounded-lg flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-11 h-14 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <Package className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800">
                                            {item.product_snapshot?.name}
                                        </p>
                                        {item.product_snapshot?.is_preorder && (
                                            <p className="text-xs text-amber-600">
                                                Preordine
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Quantità: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 ml-3 flex-shrink-0">
                                        €{" "}
                                        {Number(item.total_price)
                                            .toFixed(2)
                                            .replace(".", ",")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <SectionHeader icon={Receipt} title="Riepilogo" />
                        <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotale</span>
                                <span>
                                    €{" "}
                                    {Number(order.subtotal)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>
                                    {isPickup
                                        ? "Ritiro in negozio"
                                        : "Spedizione"}
                                </span>
                                <span>
                                    {Number(order.shipping_cost) === 0
                                        ? isPickup
                                            ? "Gratuito"
                                            : "Gratuita"
                                        : `€ ${Number(order.shipping_cost).toFixed(2).replace(".", ",")}`}
                                </span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-gray-900 text-base pt-2 mt-1 border-t border-gray-200">
                                <span>Totale</span>
                                <span className="text-indigo-600">
                                    €{" "}
                                    {Number(order.total)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping address / pickup */}
                    {addr &&
                        (isPickup ? (
                            <div>
                                <SectionHeader
                                    icon={Store}
                                    title="Ritiro in negozio"
                                />
                                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 space-y-0.5">
                                    <p className="font-semibold text-gray-800">
                                        {addr.full_name}
                                    </p>
                                    {addr.phone && <p>{addr.phone}</p>}
                                    <p className="text-gray-400">
                                        Ritiro presso il negozio
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <SectionHeader
                                    icon={MapPin}
                                    title="Indirizzo di spedizione"
                                />
                                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 space-y-0.5">
                                    <p className="font-semibold text-gray-800">
                                        {addr.full_name}
                                    </p>
                                    <p>
                                        {addr.address_line1}
                                        {addr.address_line2
                                            ? `, ${addr.address_line2}`
                                            : ""}
                                    </p>
                                    <p>
                                        {addr.postal_code} {addr.city}
                                        {addr.province
                                            ? ` (${addr.province})`
                                            : ""}
                                    </p>
                                    <p>{addr.country}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
