import { useToastStore } from "../../store/toastStore";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

const STYLES = {
    success: "text-green-600",
    error: "text-red-500",
    info: "text-gray-600",
};

export function Toaster() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => {
                const Icon = ICONS[t.type] ?? Info;
                return (
                    <div
                        key={t.id}
                        role="status"
                        className="pointer-events-auto flex items-center gap-3 bg-white border border-gray-200 shadow-lg rounded-lg pl-3 pr-2 py-3 min-w-[240px] max-w-sm animate-[toast-in_0.2s_ease-out]"
                    >
                        <Icon
                            className={`h-5 w-5 flex-shrink-0 ${STYLES[t.type] ?? STYLES.info}`}
                        />
                        <span className="text-sm text-gray-800 flex-1">
                            {t.message}
                        </span>
                        <button
                            type="button"
                            aria-label="Chiudi"
                            onClick={() => removeToast(t.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
