import { useEffect, useRef } from "react";
import { Button } from "./Button";

export function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = "Conferma",
    confirmVariant = "primary",
    cancelLabel = "Annulla",
    isPending = false,
    onConfirm,
    onCancel,
}) {
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") onCancel(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
        >
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
                <div className="space-y-1">
                    <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                    {description && (
                        <p className="text-sm text-gray-500">{description}</p>
                    )}
                </div>
                <div className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        size="md"
                        disabled={isPending}
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        size="md"
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {isPending ? "Attendere..." : confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
