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
