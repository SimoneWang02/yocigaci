import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, X } from "lucide-react";
import {
    adminGetCoupons,
    adminCreateCoupon,
    adminUpdateCoupon,
    adminDeleteCoupon,
} from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";

const EMPTY_FORM = {
    code: "",
    type: "percentage",
    value: "",
    valid_from: "",
    valid_to: "",
    usage_limit: "",
};

function CouponForm({ coupon, onSave, onCancel, saving }) {
    const [form, setForm] = useState(
        coupon
            ? {
                  code: coupon.code,
                  type: coupon.type,
                  value: coupon.value,
                  valid_from: coupon.valid_from ?? "",
                  valid_to: coupon.valid_to ?? "",
                  usage_limit: coupon.usage_limit ?? "",
              }
            : EMPTY_FORM,
    );
    const [errors, setErrors] = useState({});

    const field = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const validate = () => {
        const e = {};
        if (!form.code) e.code = "Obbligatorio";
        if (!form.value || isNaN(form.value) || Number(form.value) <= 0)
            e.value = "Inserisci un valore valido";
        if (form.type === "percentage" && Number(form.value) > 100)
            e.value = "La percentuale non può superare 100";
        if (form.valid_from && form.valid_to && form.valid_to < form.valid_from)
            e.valid_to = "La data fine deve essere dopo la data inizio";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            code: form.code.toUpperCase(),
            type: form.type,
            value: Number(form.value),
            valid_from: form.valid_from || null,
            valid_to: form.valid_to || null,
            usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">
                        {coupon ? "Modifica coupon" : "Nuovo coupon"}
                    </h2>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="!px-2"
                        onClick={onCancel}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <Input
                        label="Codice"
                        value={form.code}
                        onChange={(e) =>
                            field("code", e.target.value.toUpperCase())
                        }
                        error={errors.code}
                        placeholder="ESTATE20"
                        className="uppercase"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo sconto
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => field("type", "percentage")}
                                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                    form.type === "percentage"
                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                Percentuale (%)
                            </button>
                            <button
                                type="button"
                                onClick={() => field("type", "fixed")}
                                className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                    form.type === "fixed"
                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                Fisso (€)
                            </button>
                        </div>
                    </div>

                    <Input
                        label={
                            form.type === "percentage"
                                ? "Percentuale sconto"
                                : "Importo sconto (€)"
                        }
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={form.type === "percentage" ? 100 : undefined}
                        value={form.value}
                        onChange={(e) => field("value", e.target.value)}
                        error={errors.value}
                        placeholder={form.type === "percentage" ? "20" : "5.00"}
                        required
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valido dal
                            </label>
                            <input
                                type="date"
                                value={form.valid_from}
                                onChange={(e) =>
                                    field("valid_from", e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valido fino al
                            </label>
                            <input
                                type="date"
                                value={form.valid_to}
                                onChange={(e) =>
                                    field("valid_to", e.target.value)
                                }
                                min={form.valid_from || undefined}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.valid_to && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.valid_to}
                                </p>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Limite utilizzi (lascia vuoto = illimitato)"
                        type="number"
                        min="1"
                        value={form.usage_limit}
                        onChange={(e) => field("usage_limit", e.target.value)}
                        placeholder="Es. 100"
                    />

                    <div className="flex gap-2 justify-end pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                        >
                            Annulla
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={saving}
                        >
                            {saving
                                ? "Salvataggio..."
                                : coupon
                                  ? "Salva modifiche"
                                  : "Crea coupon"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("it-IT") : "—");

export default function AdminCoupons() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ["admin-coupons"],
        queryFn: adminGetCoupons,
    });

    const create = useMutation({
        mutationFn: adminCreateCoupon,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-coupons"] });
            setShowForm(false);
        },
    });

    const update = useMutation({
        mutationFn: ({ id, data }) => adminUpdateCoupon(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-coupons"] });
            setEditing(null);
        },
    });

    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) => adminUpdateCoupon(id, { is_active }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
    });

    const destroy = useMutation({
        mutationFn: adminDeleteCoupon,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
    });

    if (isLoading) return <PageSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Coupon</h1>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowForm(true)}
                >
                    + Nuovo coupon
                </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                        <tr>
                            <th className="text-left px-4 py-3">Codice</th>
                            <th className="text-left px-4 py-3">Sconto</th>
                            <th className="text-left px-4 py-3">Validità</th>
                            <th className="text-left px-4 py-3">Utilizzi</th>
                            <th className="text-center px-4 py-3">Stato</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {coupons.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                                    {c.code}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {c.type === "percentage"
                                        ? `${Number(c.value).toFixed(0)}%`
                                        : `€ ${Number(c.value).toFixed(2).replace(".", ",")}`}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {!c.valid_from && !c.valid_to
                                        ? "Illimitata"
                                        : `${formatDate(c.valid_from)} → ${formatDate(c.valid_to)}`}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {c.used_count}
                                    {c.usage_limit ? ` / ${c.usage_limit}` : ""}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleActive.mutate({
                                                id: c.id,
                                                is_active: !c.is_active,
                                            })
                                        }
                                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${
                                            c.is_active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                        title={
                                            c.is_active
                                                ? "Clicca per disattivare"
                                                : "Clicca per attivare"
                                        }
                                    >
                                        {c.is_active ? "Attivo" : "Disattivo"}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Modifica"
                                            title="Modifica"
                                            className="!px-2"
                                            onClick={() => setEditing(c)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            aria-label="Elimina"
                                            title="Elimina"
                                            className="!px-2"
                                            onClick={() =>
                                                window.confirm(
                                                    `Eliminare il coupon ${c.code}?`,
                                                ) && destroy.mutate(c.id)
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                {coupons.length === 0 && (
                    <p className="text-center py-12 text-gray-400">
                        Nessun coupon creato.
                    </p>
                )}
            </div>

            {showForm && (
                <CouponForm
                    onSave={(data) => create.mutate(data)}
                    onCancel={() => setShowForm(false)}
                    saving={create.isPending}
                />
            )}

            {editing && (
                <CouponForm
                    coupon={editing}
                    onSave={(data) => update.mutate({ id: editing.id, data })}
                    onCancel={() => setEditing(null)}
                    saving={update.isPending}
                />
            )}
        </div>
    );
}
