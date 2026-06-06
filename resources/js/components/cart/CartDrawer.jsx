import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    X,
    Image as ImageIcon,
    Trash2,
    ShoppingCart,
    Clock,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { getSettings } from "../../api/products";
import { Button } from "../ui/Button";

// Fallback finche' le impostazioni admin non sono caricate.
const DEFAULT_SHIPPING_THRESHOLD = 250;

export function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity } =
        useCartStore();
    const { data: settingsData } = useQuery({
        queryKey: ["public-settings"],
        queryFn: getSettings,
    });
    const shippingThreshold = Number(
        settingsData?.data?.shipping_free_threshold ??
            DEFAULT_SHIPPING_THRESHOLD,
    );
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const toFreeShipping = Math.max(0, shippingThreshold - total);
    const hasMixedCart =
        items.some((i) => i.is_preorder) && items.some((i) => !i.is_preorder);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={closeCart}
                />
            )}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold">Carrello</h2>
                    <button
                        onClick={closeCart}
                        className="p-1 text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <ShoppingCart
                                className="w-12 h-12 mx-auto mb-4"
                                strokeWidth={1.5}
                            />
                            <p>Il carrello è vuoto</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 py-3 border-b border-gray-100 last:border-0"
                            >
                                {item.primary_image?.url ? (
                                    <img
                                        src={item.primary_image.url}
                                        alt={item.name}
                                        className="w-16 h-20 object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-300">
                                        <ImageIcon
                                            className="w-8 h-8"
                                            strokeWidth={1}
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {item.name}
                                    </p>
                                    {item.is_preorder && (
                                        <span className="text-xs text-amber-600 font-medium">
                                            Preordine
                                        </span>
                                    )}
                                    <p className="text-sm font-bold text-indigo-700 mt-1">
                                        €{" "}
                                        {(item.price * item.quantity)
                                            .toFixed(2)
                                            .replace(".", ",")}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity - 1,
                                                )
                                            }
                                            className="w-7 h-7 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-50"
                                        >
                                            −
                                        </button>
                                        <span className="text-sm w-6 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity + 1,
                                                )
                                            }
                                            disabled={
                                                !item.is_preorder &&
                                                item.quantity >= item.stock
                                            }
                                            className="w-7 h-7 border rounded flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="ml-auto text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-gray-100 space-y-3">
                        {hasMixedCart && (
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-snug">
                                    Il carrello contiene preordini:
                                    l&apos;intero ordine verra&apos; spedito
                                    quando tutti i prodotti saranno disponibili.
                                </p>
                            </div>
                        )}
                        {toFreeShipping > 0 ? (
                            <p className="text-xs text-center text-gray-500 bg-gray-50 rounded py-2">
                                Aggiungi{" "}
                                <span className="font-semibold text-indigo-600">
                                    €{" "}
                                    {toFreeShipping
                                        .toFixed(2)
                                        .replace(".", ",")}
                                </span>{" "}
                                per la spedizione gratuita
                            </p>
                        ) : (
                            <p className="text-xs text-center text-green-600 bg-green-50 rounded py-2 font-medium">
                                Spedizione gratuita!
                            </p>
                        )}
                        <div className="flex justify-between font-semibold">
                            <span>Subtotale</span>
                            <span>€ {total.toFixed(2).replace(".", ",")}</span>
                        </div>
                        <Button
                            as={Link}
                            to="/checkout"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            onClick={closeCart}
                        >
                            Vai al checkout
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
