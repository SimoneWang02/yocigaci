import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    adminGetOrders,
    adminGetOrder,
    adminAddTracking,
    adminNotifyPickupReady,
    adminConfirmPickup,
    adminRefundOrder,
    adminMarkOrdersSeen,
} from "../../api/admin";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";
import {
    X,
    Package,
    User,
    MapPin,
    Truck,
    Store,
    Hash,
    RotateCcw,
    AlertCircle,
    Bell,
    Pencil,
} from "lucide-react";
import { useTableSort } from "../../hooks/useTableSort";
import { SortTh } from "../../components/ui/SortTh";

const STATUS_LABELS = {
    paid: { label: "Pagato", variant: "success" },
    shipped: { label: "Spedito", variant: "success" },
    ready_for_pickup: { label: "Pronto al ritiro", variant: "warning" },
    picked_up: { label: "Ritirato", variant: "success" },
    partially_refunded: { label: "Rimborso Parziale", variant: "warning" },
    refunded: { label: "Rimborsato", variant: "default" },
    preorder_confirmed: { label: "Preordine", variant: "preorder" },
};

const ALL_STATUSES = Object.entries(STATUS_LABELS).map(
    ([value, { label }]) => ({ value, label }),
);

const REFUND_REASONS = [
    { value: "requested_by_customer", label: "Richiesto dal cliente" },
    { value: "duplicate", label: "Pagamento duplicato" },
    { value: "fraudulent", label: "Pagamento fraudolento" },
];

const formatEur = (value) => Number(value).toFixed(2).replace(".", ",");

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

function OrderDrawer({ orderId, onClose }) {
    const qc = useQueryClient();
    const [tracking, setTracking] = useState("");
    const [editingTracking, setEditingTracking] = useState(false);
    const [editTrackingValue, setEditTrackingValue] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [refundReason, setRefundReason] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-order", orderId],
        queryFn: () => adminGetOrder(orderId),
        enabled: !!orderId,
    });

    const invalidate = () => {
        qc.invalidateQueries(["admin-orders"]);
        qc.invalidateQueries(["admin-order", orderId]);
    };

    const addTracking = useMutation({
        mutationFn: ({ id, code }) => adminAddTracking(id, code),
        onSuccess: invalidate,
    });

    const notifyPickup = useMutation({
        mutationFn: (id) => adminNotifyPickupReady(id),
        onSuccess: invalidate,
    });

    const confirmPickup = useMutation({
        mutationFn: (id) => adminConfirmPickup(id),
        onSuccess: invalidate,
    });

    const refund = useMutation({
        mutationFn: ({ id, amount, reason }) =>
            adminRefundOrder(id, { amount, reason }),
        onSuccess: () => {
            invalidate();
            setRefundAmount("");
            setRefundReason("");
        },
    });

    const refundError =
        refund.error?.response?.data?.message ??
        (refund.isError ? "Rimborso non riuscito." : null);

    const order = data?.data;
    const status = order
        ? (STATUS_LABELS[order.status] ?? {
              label: order.status,
              variant: "default",
          })
        : null;

    const initials = order?.user?.name
        ? order.user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
        : null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-indigo-300" />
                                <span className="font-mono text-white font-bold text-base tracking-wide">
                                    {order?.order_number ?? "-"}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {status && (
                                    <Badge variant={status.variant}>
                                        {status.label}
                                    </Badge>
                                )}
                                {order && (
                                    <span className="text-indigo-200 text-xs">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString("it-IT", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="mt-0.5 p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <PageSpinner />
                    ) : (
                        order && (
                            <div className="p-5 space-y-6">
                                {/* Products */}
                                <div>
                                    <SectionHeader
                                        icon={Package}
                                        title="Prodotti"
                                    />
                                    <div className="bg-gray-50 rounded-xl overflow-hidden divide-y divide-gray-100">
                                        {order.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-indigo-600">
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {
                                                            item
                                                                .product_snapshot
                                                                ?.name
                                                        }
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
                                        {Number(order.discount_amount) > 0 && (
                                            <div className="flex justify-between items-center px-4 py-2 text-sm text-green-700">
                                                <span>
                                                    Sconto coupon
                                                    {order.coupon_code
                                                        ? ` (${order.coupon_code})`
                                                        : ""}
                                                </span>
                                                <span>
                                                    −€{" "}
                                                    {Number(
                                                        order.discount_amount,
                                                    )
                                                        .toFixed(2)
                                                        .replace(".", ",")}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center px-4 py-3 bg-white">
                                            <span className="text-sm font-bold text-gray-900">
                                                Totale ordine
                                            </span>
                                            <span className="text-base font-bold text-indigo-600">
                                                €{" "}
                                                {Number(order.total)
                                                    .toFixed(2)
                                                    .replace(".", ",")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer */}
                                {order.user && (
                                    <div>
                                        <SectionHeader
                                            icon={User}
                                            title="Cliente"
                                        />
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {order.user.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {order.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Shipping address / pickup */}
                                {order.shipping_address &&
                                    (order.delivery_method === "pickup" ? (
                                        <div>
                                            <SectionHeader
                                                icon={Store}
                                                title="Ritiro in negozio"
                                            />
                                            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 space-y-0.5">
                                                <p className="font-semibold text-gray-800">
                                                    {
                                                        order.shipping_address
                                                            .full_name
                                                    }
                                                </p>
                                                {order.shipping_address
                                                    .phone && (
                                                    <p>
                                                        {
                                                            order
                                                                .shipping_address
                                                                .phone
                                                        }
                                                    </p>
                                                )}
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
                                                    {
                                                        order.shipping_address
                                                            .full_name
                                                    }
                                                </p>
                                                <p>
                                                    {
                                                        order.shipping_address
                                                            .address_line1
                                                    }
                                                </p>
                                                <p>
                                                    {
                                                        order.shipping_address
                                                            .postal_code
                                                    }{" "}
                                                    {
                                                        order.shipping_address
                                                            .city
                                                    }
                                                    {order.shipping_address
                                                        .province &&
                                                        ` (${order.shipping_address.province})`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                {/* Tracking */}
                                {order.tracking_code && (
                                    <div>
                                        <SectionHeader
                                            icon={Truck}
                                            title="Tracciamento"
                                        />
                                        {editingTracking ? (
                                            <div className="flex items-stretch gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={editTrackingValue}
                                                        onChange={(e) =>
                                                            setEditTrackingValue(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Nuovo codice di tracciamento..."
                                                    />
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    size="md"
                                                    disabled={
                                                        !editTrackingValue ||
                                                        addTracking.isPending
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `Aggiornare il codice di tracciamento per l'ordine ${order.order_number}?\nVerrà inviata una nuova email di spedizione al cliente.`,
                                                            )
                                                        ) {
                                                            addTracking.mutate(
                                                                {
                                                                    id: order.id,
                                                                    code: editTrackingValue,
                                                                },
                                                                {
                                                                    onSuccess:
                                                                        () =>
                                                                            setEditingTracking(
                                                                                false,
                                                                            ),
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {addTracking.isPending
                                                        ? "Salvataggio..."
                                                        : "Salva"}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="md"
                                                    onClick={() =>
                                                        setEditingTracking(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Annulla
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    <span className="text-sm font-mono font-semibold text-green-800">
                                                        {order.tracking_code}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setEditTrackingValue(
                                                            order.tracking_code,
                                                        );
                                                        setEditingTracking(
                                                            true,
                                                        );
                                                    }}
                                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-100 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="border-t border-gray-100 pt-5 space-y-5">
                                    {order.delivery_method === "pickup" ? (
                                        <div>
                                            <SectionHeader
                                                icon={Bell}
                                                title="Ritiro in negozio"
                                            />
                                            {order.status === "picked_up" ? (
                                                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                                    <Store className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    <span className="text-sm text-green-800">
                                                        Ordine ritirato dal
                                                        cliente
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-stretch gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="md"
                                                        className="flex-1"
                                                        disabled={
                                                            notifyPickup.isPending ||
                                                            order.status ===
                                                                "ready_for_pickup"
                                                        }
                                                        onClick={() => {
                                                            notifyPickup.mutate(
                                                                order.id,
                                                            );
                                                        }}
                                                    >
                                                        {order.status ===
                                                        "ready_for_pickup"
                                                            ? "Cliente notificato"
                                                            : notifyPickup.isPending
                                                              ? "Invio notifica..."
                                                              : "Notifica cliente"}
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        className="flex-1"
                                                        disabled={
                                                            confirmPickup.isPending
                                                        }
                                                        onClick={() => {
                                                            confirmPickup.mutate(
                                                                order.id,
                                                            );
                                                        }}
                                                    >
                                                        {confirmPickup.isPending
                                                            ? "Salvataggio..."
                                                            : "Conferma ritiro"}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : !order.tracking_code && (
                                        <div>
                                            <SectionHeader
                                                icon={Truck}
                                                title="Aggiungi tracking"
                                            />
                                            <div className="flex items-stretch gap-2">
                                                <div className="flex-1">
                                                    <Input
                                                        value={tracking}
                                                        onChange={(e) =>
                                                            setTracking(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Codice spedizione..."
                                                    />
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    size="md"
                                                    disabled={
                                                        !tracking ||
                                                        addTracking.isPending
                                                    }
                                                    onClick={() => {
                                                        addTracking.mutate({
                                                            id: order.id,
                                                            code: tracking,
                                                        });
                                                        setTracking("");
                                                    }}
                                                >
                                                    Salva
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {(order.is_refundable ||
                                        order.refunded_amount > 0) && (
                                        <div>
                                            <SectionHeader
                                                icon={RotateCcw}
                                                title="Rimborso"
                                            />

                                            {order.refunded_amount > 0 && (
                                                <div className="mb-3 flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl px-4 py-3">
                                                    <span className="text-sm text-sky-800">
                                                        Già rimborsato
                                                    </span>
                                                    <span className="text-sm font-semibold text-sky-900">
                                                        €{" "}
                                                        {formatEur(
                                                            order.refunded_amount,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {order.is_refundable ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-stretch gap-2">
                                                        <div className="flex-1">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                max={
                                                                    order.refundable_amount
                                                                }
                                                                value={
                                                                    refundAmount
                                                                }
                                                                onChange={(e) =>
                                                                    setRefundAmount(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder={`Tutto il residuo (€ ${formatEur(order.refundable_amount)})`}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Select
                                                                value={
                                                                    refundReason
                                                                }
                                                                onChange={(e) =>
                                                                    setRefundReason(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    Motivo
                                                                    (opzionale)
                                                                </option>
                                                                {REFUND_REASONS.map(
                                                                    (r) => (
                                                                        <option
                                                                            key={
                                                                                r.value
                                                                            }
                                                                            value={
                                                                                r.value
                                                                            }
                                                                        >
                                                                            {
                                                                                r.label
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="danger"
                                                        size="md"
                                                        className="w-full"
                                                        disabled={
                                                            refund.isPending
                                                        }
                                                        onClick={() => {
                                                            const amount =
                                                                refundAmount
                                                                    ? Number(
                                                                          refundAmount,
                                                                      )
                                                                    : null;
                                                            const label = amount
                                                                ? `€ ${formatEur(amount)}`
                                                                : `tutto il residuo (€ ${formatEur(order.refundable_amount)})`;
                                                            if (
                                                                window.confirm(
                                                                    `Emettere un rimborso Stripe di ${label} per l'ordine ${order.order_number}? L'operazione non è reversibile.`,
                                                                )
                                                            ) {
                                                                refund.mutate({
                                                                    id: order.id,
                                                                    amount,
                                                                    reason:
                                                                        refundReason ||
                                                                        null,
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        {refund.isPending
                                                            ? "Rimborso in corso..."
                                                            : "Emetti rimborso"}
                                                    </Button>
                                                    <p className="text-xs text-gray-400">
                                                        Lascia vuoto l'importo
                                                        per rimborsare tutto il
                                                        residuo. Lo stato passa
                                                        a "Rimborsato" solo a
                                                        rimborso totale.
                                                    </p>
                                                    {refundError && (
                                                        <div className="flex items-start gap-2 text-sm text-red-600">
                                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                            <span>
                                                                {refundError}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    Ordine interamente
                                                    rimborsato.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}

export default function AdminOrders() {
    const [searchParams] = useSearchParams();
    const [filterStatus, setFilterStatus] = useState(() => searchParams.get("status") ?? "");
    const [filterDelivery, setFilterDelivery] = useState(() => searchParams.get("delivery_method") ?? "");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    const qc = useQueryClient();

    useEffect(() => {
        adminMarkOrdersSeen().then(() => {
            qc.invalidateQueries({ queryKey: ["admin-new-orders-count"] });
        });
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-orders", filterStatus, filterDelivery, search, page],
        queryFn: () =>
            adminGetOrders({
                ...(filterStatus ? { status: filterStatus } : {}),
                ...(filterDelivery ? { delivery_method: filterDelivery } : {}),
                ...(search ? { search } : {}),
                page,
            }),
    });

    const meta = data?.meta;
    const {
        sort,
        sorted: orders,
        onSort,
    } = useTableSort(data?.data ?? [], "created_at", "desc");

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ordini</h1>

            <div className="flex gap-3 mb-4">
                <div className="flex-1">
                    <Input
                        placeholder="Cerca ordine o cliente..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <Select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    >
                        <option value="">Tutti gli stati</option>
                        {ALL_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <PageSpinner />
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <SortTh
                                    column="order_number"
                                    sort={sort}
                                    onSort={onSort}
                                >
                                    Numero
                                </SortTh>
                                <SortTh
                                    column="user.name"
                                    sort={sort}
                                    onSort={onSort}
                                >
                                    Cliente
                                </SortTh>
                                <SortTh
                                    column="created_at"
                                    sort={sort}
                                    onSort={onSort}
                                >
                                    Data acquisto
                                </SortTh>
                                <SortTh
                                    column="delivery_method"
                                    sort={sort}
                                    onSort={onSort}
                                    align="center"
                                >
                                    Data spedizione
                                </SortTh>
                                <SortTh
                                    column="total"
                                    sort={sort}
                                    onSort={onSort}
                                    align="right"
                                >
                                    Totale
                                </SortTh>
                                <SortTh
                                    column="status"
                                    sort={sort}
                                    onSort={onSort}
                                    align="center"
                                >
                                    Stato
                                </SortTh>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => {
                                const status = STATUS_LABELS[order.status] ?? {
                                    label: order.status,
                                    variant: "default",
                                };
                                return (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-indigo-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedId(order.id)}
                                    >
                                        <td className="px-4 py-3 font-mono font-semibold text-indigo-700">
                                            {order.order_number}
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.user ? (
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {order.user.name}
                                                    </p>
                                                    <p className="text-gray-500 text-sm">
                                                        {order.user.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">
                                                    Guest
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString("it-IT")}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {order.delivery_method ===
                                            "pickup" ? (
                                                order.status === "picked_up" ? (
                                                    order.picked_up_at ? (
                                                        <span className="text-gray-500">
                                                            {new Date(order.picked_up_at).toLocaleDateString("it-IT")}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                                            <Store className="w-3 h-3" />
                                                            Ritirato
                                                        </span>
                                                    )
                                                ) : order.status ===
                                                  "ready_for_pickup" ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                        <Bell className="w-3 h-3" />
                                                        Notificato
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                                                        <Store className="w-3 h-3" />
                                                        Ritiro
                                                    </span>
                                                )
                                            ) : order.shipped_at ? (
                                                <span className="text-gray-500">
                                                    {new Date(
                                                        order.shipped_at,
                                                    ).toLocaleDateString(
                                                        "it-IT",
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            €{" "}
                                            {Number(order.total)
                                                .toFixed(2)
                                                .replace(".", ",")}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={status.variant}>
                                                {status.label}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <p className="text-center py-12 text-gray-400">
                            Nessun ordine trovato.
                        </p>
                    )}
                </div>
            )}

            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                        {meta.from}–{meta.to} di {meta.total} ordini
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Precedente
                        </Button>
                        <span className="flex items-center px-3 text-sm text-gray-600">
                            Pagina {meta.current_page} / {meta.last_page}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={page >= meta.last_page}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Successiva
                        </Button>
                    </div>
                </div>
            )}

            {selectedId && (
                <OrderDrawer
                    orderId={selectedId}
                    onClose={() => setSelectedId(null)}
                />
            )}
        </div>
    );
}
