import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, X, Truck } from "lucide-react";
import {
    adminGetShippingMethods,
    adminCreateShippingMethod,
    adminUpdateShippingMethod,
    adminDeleteShippingMethod,
} from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageSpinner } from "../../components/ui/Spinner";

const EMPTY_FORM = {
    name: "",
    description: "",
    cost: "",
    free_threshold: "",
    is_active: true,
};

function ShippingMethodForm({ method, onSave, onCancel, saving }) {
    const [form, setForm] = useState(
        method
            ? {
                  name: method.name,
                  description: method.description ?? "",
                  cost: method.cost,
                  free_threshold: method.free_threshold ?? "",
                  is_active: method.is_active,
              }
            : EMPTY_FORM,
    );
    const [errors, setErrors] = useState({});

    const field = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Obbligatorio";
        if (form.cost === "" || isNaN(form.cost) || Number(form.cost) < 0)
            e.cost = "Inserisci un costo valido (0 = gratuita)";
        if (
            form.free_threshold !== "" &&
            (isNaN(form.free_threshold) || Number(form.free_threshold) < 0)
        )
            e.free_threshold = "Inserisci una soglia valida";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            name: form.name.trim(),
            description: form.description.trim() || null,
            cost: Number(form.cost),
            free_threshold:
                form.free_threshold !== "" ? Number(form.free_threshold) : null,
            is_active: form.is_active,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">
                        {method
                            ? "Modifica metodo di spedizione"
                            : "Nuovo metodo di spedizione"}
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
                        label="Nome"
                        value={form.name}
                        onChange={(e) => field("name", e.target.value)}
                        error={errors.name}
                        placeholder="Es. DHL Express, Posta ordinaria"
                        required
                    />

                    <Input
                        label="Descrizione (opzionale)"
                        value={form.description}
                        onChange={(e) => field("description", e.target.value)}
                        placeholder="Consegna in 1-2 giorni lavorativi"
                    />

                    <Input
                        label="Costo spedizione (€)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.cost}
                        onChange={(e) => field("cost", e.target.value)}
                        error={errors.cost}
                        placeholder="7.90"
                        required
                    />

                    <div>
                        <Input
                            label="Soglia spedizione gratuita (€)"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.free_threshold}
                            onChange={(e) =>
                                field("free_threshold", e.target.value)
                            }
                            error={errors.free_threshold}
                            placeholder="Es. 60.00"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            Lascia vuoto se non applicabile. Se il subtotale
                            supera questa cifra, la spedizione sarà gratuita.
                        </p>
                    </div>

                    {method && (
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) =>
                                    field("is_active", e.target.checked)
                                }
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">
                                Attivo
                            </span>
                        </label>
                    )}

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
                                : method
                                  ? "Salva modifiche"
                                  : "Crea metodo"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminShippingMethods() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const { data: methods = [], isLoading } = useQuery({
        queryKey: ["admin-shipping-methods"],
        queryFn: adminGetShippingMethods,
    });

    const create = useMutation({
        mutationFn: adminCreateShippingMethod,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
            setShowForm(false);
        },
    });

    const update = useMutation({
        mutationFn: ({ id, data }) => adminUpdateShippingMethod(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-shipping-methods"] });
            setEditing(null);
        },
    });

    const toggleActive = useMutation({
        mutationFn: ({ id, is_active }) =>
            adminUpdateShippingMethod(id, { is_active }),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["admin-shipping-methods"] }),
    });

    const destroy = useMutation({
        mutationFn: adminDeleteShippingMethod,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["admin-shipping-methods"] }),
    });

    if (isLoading) return <PageSpinner />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-gray-600" />
                    <h1 className="text-2xl font-bold text-gray-900">
                        Metodi di spedizione
                    </h1>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowForm(true)}
                >
                    + Nuovo metodo
                </Button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="text-left px-4 py-3">Nome</th>
                                <th className="text-left px-4 py-3">
                                    Descrizione
                                </th>
                                <th className="text-right px-4 py-3">Costo</th>
                                <th className="text-right px-4 py-3">
                                    Gratuita oltre
                                </th>
                                <th className="text-center px-4 py-3">Stato</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {methods.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        {m.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {m.description || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">
                                        {Number(m.cost) === 0
                                            ? "Gratuita"
                                            : `€ ${Number(m.cost).toFixed(2).replace(".", ",")}`}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-500">
                                        {m.free_threshold !== null
                                            ? `€ ${Number(m.free_threshold).toFixed(2).replace(".", ",")}`
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleActive.mutate({
                                                    id: m.id,
                                                    is_active: !m.is_active,
                                                })
                                            }
                                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium transition-colors hover:opacity-75 ${
                                                m.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                            title={
                                                m.is_active
                                                    ? "Clicca per disattivare"
                                                    : "Clicca per attivare"
                                            }
                                        >
                                            {m.is_active
                                                ? "Attivo"
                                                : "Disattivo"}
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
                                                onClick={() => setEditing(m)}
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
                                                        `Eliminare "${m.name}"? Gli ordini esistenti non saranno modificati.`,
                                                    ) && destroy.mutate(m.id)
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
                {methods.length === 0 && (
                    <p className="text-center py-12 text-gray-400">
                        Nessun metodo di spedizione configurato. Aggiungine uno
                        per abilitare la spedizione al checkout.
                    </p>
                )}
            </div>

            {showForm && (
                <ShippingMethodForm
                    onSave={(data) => create.mutate(data)}
                    onCancel={() => setShowForm(false)}
                    saving={create.isPending}
                />
            )}

            {editing && (
                <ShippingMethodForm
                    method={editing}
                    onSave={(data) => update.mutate({ id: editing.id, data })}
                    onCancel={() => setEditing(null)}
                    saving={update.isPending}
                />
            )}
        </div>
    );
}
