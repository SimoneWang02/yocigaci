const STORAGE_KEY = "checkout_contact_info";

// Ricorda i dati di consegna inseriti al checkout per pre-compilarli al prossimo ordine.
export function loadCheckoutInfo() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveCheckoutInfo(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // storage non disponibile (es. navigazione privata): ignora
    }
}

const PENDING_SESSION_KEY = "checkout_pending_session";

// Ultima sessione Stripe avviata da questo browser: se il cliente torna indietro e
// riprova, il backend la annulla e ne libera lo stock prenotato.
export function loadPendingSession() {
    try {
        return localStorage.getItem(PENDING_SESSION_KEY);
    } catch {
        return null;
    }
}

export function savePendingSession(sessionId) {
    try {
        if (sessionId) localStorage.setItem(PENDING_SESSION_KEY, sessionId);
        else localStorage.removeItem(PENDING_SESSION_KEY);
    } catch {
        // storage non disponibile (es. navigazione privata): ignora
    }
}
