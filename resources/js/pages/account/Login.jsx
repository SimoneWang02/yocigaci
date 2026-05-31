import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { Input } from "../../components/ui/Input";

export default function Login() {
    const { setAuth, user } = useAuthStore();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Appena c'è un utente (dopo il login o se già autenticato) → redirect.
    useEffect(() => {
        if (user) {
            navigate(user.role === "admin" ? "/admin/prodotti" : "/", {
                replace: true,
            });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await login(form);
            setAuth(data.user, data.token);
        } catch (err) {
            setError(err.response?.data?.message ?? "Credenziali non valide.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
            <div className="w-full max-w-sm">
                <Link
                    to="/"
                    aria-label="Torna alla home"
                    className="inline-flex items-center gap-1 mb-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                        />
                    </svg>
                    <span>Home</span>
                </Link>
                <div className="flex justify-center mb-8">
                    <Link to="/">
                        <img
                            src="/images/square_logo.svg"
                            alt="Yocigaci"
                            className="h-16 w-auto"
                        />
                    </Link>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                        required
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? "Accesso..." : "Accedi"}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-6">
                    Non hai un Account?{" "}
                    <Link
                        to="/registrati"
                        className="text-gray-900 hover:underline font-medium"
                    >
                        Registrati
                    </Link>
                </p>
            </div>
        </div>
    );
}
