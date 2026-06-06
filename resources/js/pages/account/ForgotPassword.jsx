import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { Input } from "../../components/ui/Input";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch {
            setError("Si e verificato un errore. Riprova tra qualche minuto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
            <div className="w-full max-w-sm">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-1 mb-6 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    <span>Torna al login</span>
                </Link>

                <div className="flex justify-center mb-8">
                    <Link to="/">
                        <img src="/images/square_logo.svg" alt="Yocigaci" className="h-16 w-auto" />
                    </Link>
                </div>

                {sent ? (
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Controlla la tua email</h1>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Se esiste un account con <strong className="text-gray-700">{email}</strong>, riceverai un link per reimpostare la password.
                        </p>
                        <p className="text-xs text-gray-400 mt-3">Il link scade dopo 60 minuti.</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Password dimenticata?</h1>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Inserisci la tua email e ti mandiamo un link per reimpostare la password.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 text-white rounded-lg py-3 text-sm font-medium transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? "Invio in corso..." : "Invia link di reset"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
