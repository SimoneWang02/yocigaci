import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../../api/auth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { KeyRound, CheckCircle, ArrowLeft } from "lucide-react";

export default function Profile() {
    const [form, setForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [clientError, setClientError] = useState(null);
    const [success, setSuccess] = useState(false);

    const mutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setSuccess(true);
            setForm({ current_password: "", password: "", password_confirmation: "" });
        },
    });

    const serverError =
        mutation.error?.response?.data?.errors
            ? Object.values(mutation.error.response.data.errors).flat().join(" ")
            : mutation.isError
              ? "Errore durante l'aggiornamento."
              : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSuccess(false);
        if (form.password !== form.password_confirmation) {
            setClientError("Le nuove password non coincidono.");
            return;
        }
        setClientError(null);
        mutation.mutate(form);
    };

    return (
        <div className="max-w-md mx-auto px-4 py-10">
            <Link
                to="/account/ordini"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                I miei ordini
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center">
                        <KeyRound className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Cambia password</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Password attuale"
                        type="password"
                        autoComplete="current-password"
                        value={form.current_password}
                        onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                        required
                    />
                    <Input
                        label="Nuova password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />
                    <Input
                        label="Conferma nuova password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password_confirmation}
                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                        required
                    />

                    {(clientError || serverError) && (
                        <p className="text-sm text-red-500">{clientError ?? serverError}</p>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            Password aggiornata.
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Salvataggio..." : "Aggiorna password"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
