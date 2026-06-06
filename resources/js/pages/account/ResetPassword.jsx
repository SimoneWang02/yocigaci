import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";
import { Input } from "../../components/ui/Input";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";
    const email = searchParams.get("email") ?? "";

    const [form, setForm] = useState({ password: "", password_confirmation: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clientError, setClientError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setClientError(null);
        if (form.password !== form.password_confirmation) {
            setClientError("Le password non coincidono.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await api.post("/auth/reset-password", {
                token,
                email,
                password: form.password,
                password_confirmation: form.password_confirmation,
            });
            navigate("/login?reset=ok");
        } catch (err) {
            const msg =
                err.response?.data?.errors?.token?.[0] ??
                err.response?.data?.errors?.password?.[0] ??
                "Si e verificato un errore. Riprova.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
                <div className="w-full max-w-sm text-center">
                    <p className="text-gray-500 mb-4">Link non valido o mancante.</p>
                    <Link to="/recupera-password" className="text-sm text-gray-900 underline">
                        Richiedi un nuovo link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-8">
                    <Link to="/">
                        <img src="/images/square_logo.svg" alt="Yocigaci" className="h-16 w-auto" />
                    </Link>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Nuova password</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Scegli una nuova password per <strong className="text-gray-700">{email}</strong>.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    {(clientError || error) && (
                        <p className="text-sm text-red-500">{clientError ?? error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Salvataggio..." : "Salva nuova password"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-4">
                    Link scaduto?{" "}
                    <Link to="/recupera-password" className="text-gray-700 hover:underline">
                        Richiedine uno nuovo
                    </Link>
                </p>
            </div>
        </div>
    );
}
