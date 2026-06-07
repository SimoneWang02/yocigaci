import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { adminGetDashboardStats } from "../../api/admin";
import { PageSpinner } from "../../components/ui/Spinner";
import {
    TrendingUp,
    ReceiptText,
    ChevronLeft,
    ChevronRight,
    TrendingDown,
    Truck,
    Store,
    CalendarClock,
    PackageCheck,
} from "lucide-react";

const PERIODS = [
    { value: "today", label: "Oggi" },
    { value: "week", label: "Settimana" },
    { value: "month", label: "Mese" },
    { value: "year", label: "Anno" },
];

const MONTHS_IT = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
];

function periodLabel(period, offset) {
    const d = new Date();
    if (period === "today") {
        d.setDate(d.getDate() + offset);
        if (offset === 0) return "Oggi";
        if (offset === -1) return "Ieri";
        return d.toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }
    if (period === "week") {
        d.setDate(d.getDate() + offset * 7);
        if (offset === 0) return "Questa settimana";
        if (offset === -1) return "Settimana scorsa";
        const mon = new Date(d);
        mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        return `${mon.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} – ${sun.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}`;
    }
    if (period === "month") {
        d.setDate(1);
        d.setMonth(d.getMonth() + offset);
        return `${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
    }
    if (period === "year") {
        return String(new Date().getFullYear() + offset);
    }
    return "";
}

function delta(curr, prev) {
    if (prev === 0 && curr === 0) return null;
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
}

const formatEur = (v) =>
    Number(v).toLocaleString("it-IT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + " €";

function Delta({ value }) {
    if (value === null || value === undefined) return null;
    const up = value >= 0;
    const Icon = up ? TrendingUp : TrendingDown;
    return (
        <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}
        >
            <Icon className="w-3 h-3" />
            {up ? "+" : ""}
            {value}%
        </span>
    );
}

function KpiCard({ icon: Icon, label, value, deltaValue, color = "indigo" }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600",
        green: "bg-green-50 text-green-600",
        blue: "bg-blue-50 text-blue-600",
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}
            >
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {label}
                </p>
                <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900 leading-tight">
                        {value}
                    </p>
                    <Delta value={deltaValue} />
                </div>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-medium text-gray-700 mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.dataKey === "revenue"
                        ? formatEur(p.value)
                        : `${p.value} ordini`}
                </p>
            ))}
        </div>
    );
}

export default function AdminDashboard() {
    const [period, setPeriod] = useState("month");
    const [offset, setOffset] = useState(0);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-dashboard", period, offset],
        queryFn: () => adminGetDashboardStats(period, offset),
    });

    if (isLoading) return <PageSpinner />;

    const {
        revenue = 0,
        avg_order = 0,
        prev_revenue = 0,
        prev_avg_order = 0,
        orders_to_ship = 0,
        orders_to_pickup = 0,
        orders_preorder = 0,
        orders_completed = 0,
        expired_preorders = [],
        chart = [],
    } = data ?? {};

    const label = periodLabel(period, offset);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                            onClick={() => setOffset((o) => o - 1)}
                            className="px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
                            {label}
                        </span>
                        <button
                            onClick={() => setOffset((o) => o + 1)}
                            disabled={offset >= 0}
                            className="px-2 py-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        {PERIODS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => {
                                    setPeriod(p.value);
                                    setOffset(0);
                                }}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    period === p.value
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ordini da gestire */}
            <div className="grid grid-cols-3 gap-4">
                <Link
                    to="/admin/ordini?status=paid"
                    className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Da Spedire
                        </p>
                        <p className="text-2xl font-bold text-gray-900 leading-tight">
                            {orders_to_ship}
                        </p>
                    </div>
                </Link>
                <Link
                    to="/admin/ordini?status=ready_for_pickup"
                    className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Da Ritirare
                        </p>
                        <p className="text-2xl font-bold text-gray-900 leading-tight">
                            {orders_to_pickup}
                        </p>
                    </div>
                </Link>
                <Link
                    to="/admin/ordini?status=preorder_confirmed"
                    className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                    <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <CalendarClock className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Preordini
                        </p>
                        <p className="text-2xl font-bold text-gray-900 leading-tight">
                            {orders_preorder}
                        </p>
                    </div>
                </Link>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard
                    icon={PackageCheck}
                    label="Completati"
                    value={orders_completed}
                    color="indigo"
                />
                <KpiCard
                    icon={TrendingUp}
                    label="Fatturato"
                    value={formatEur(revenue)}
                    deltaValue={delta(revenue, prev_revenue)}
                    color="green"
                />
                <KpiCard
                    icon={ReceiptText}
                    label="Valore medio ordine"
                    value={formatEur(avg_order)}
                    deltaValue={delta(avg_order, prev_avg_order)}
                    color="blue"
                />
            </div>

            {/* Chart fatturato */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                    Fatturato nel periodo
                </p>
                {chart.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">
                        Nessun dato
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart
                            data={chart}
                            margin={{ top: 4, right: 4, bottom: 0, left: 10 }}
                        >
                            <defs>
                                <linearGradient
                                    id="revenueGrad"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#6366f1"
                                        stopOpacity={0.18}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#6366f1"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) =>
                                    v.toLocaleString("it-IT") + " €"
                                }
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fill="url(#revenueGrad)"
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Preordini scaduti */}
            {expired_preorders.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarClock className="w-4 h-4 text-red-500" />
                        <p className="text-sm font-semibold text-gray-700">
                            Preordini scaduti
                        </p>
                    </div>
                    <table className="w-full text-sm">
                        <tbody>
                            {expired_preorders.map((p) => (
                                <tr
                                    key={p.id}
                                    className="border-b border-gray-50 last:border-0"
                                >
                                    <td className="py-2">
                                        <Link
                                            to={`/admin/prodotti/${p.id}/modifica`}
                                            className="text-gray-800 hover:text-indigo-600 transition-colors font-medium"
                                        >
                                            {p.name}
                                        </Link>
                                    </td>
                                    <td className="py-2 text-right text-red-500 text-xs font-medium tabular-nums">
                                        {new Date(
                                            p.preorder_release_date,
                                        ).toLocaleDateString("it-IT", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
