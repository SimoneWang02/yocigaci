import { useState } from "react";
import { Link } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { Badge } from "../ui/Badge";

export function ProductCard({ product }) {
    const { addItem, openCart } = useCartStore();
    const [added, setAdded] = useState(false);
    const [imageIdx, setImageIdx] = useState(0);

    const images = product.images ?? [product.primary_image].filter(Boolean);
    const currentImage = images[imageIdx];

    const handleAddToCart = () => {
        addItem(product);
        openCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const isOutOfStock = !product.is_preorder && product.stock === 0;

    return (
        <div className="group relative flex h-full flex-col">
            {/* Immagine prodotto - PNG che galleggia, senza sfondo */}
            <Link
                to={`/prodotti/${product.slug}`}
                className="relative z-10 block px-4"
                onMouseEnter={() => images.length > 1 && setImageIdx(1)}
                onMouseLeave={() => setImageIdx(0)}
            >
                <div className="relative flex h-48 items-end justify-center">
                    {/* Ombra/pedana morbida sotto il prodotto */}
                    <div className="absolute bottom-2 left-1/2 h-5 w-2/3 -translate-x-1/2 rounded-[50%] bg-black/25 blur-lg transition-all duration-300 group-hover:w-3/4 group-hover:bg-black/30" />

                    {currentImage?.url ? (
                        <img
                            src={currentImage.url}
                            alt={product.name}
                            className="relative max-h-48 w-auto object-contain drop-shadow-xl transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-40 w-32 items-center justify-center rounded-lg bg-gray-100">
                            <ImageIcon
                                className="h-14 w-14 text-gray-300"
                                strokeWidth={1}
                            />
                        </div>
                    )}

                    {/* Badge */}
                    <div className="absolute left-0 top-0 flex flex-col gap-1">
                        {product.is_preorder && (
                            <Badge variant="preorder">Preordine</Badge>
                        )}
                        {isOutOfStock && (
                            <Badge variant="sold_out">Esaurito</Badge>
                        )}
                    </div>
                </div>
            </Link>

            {/* Titolo, prezzo, CTA - senza riquadro */}
            <div className="flex flex-1 flex-col px-2 pt-4">
                <Link to={`/prodotti/${product.slug}`}>
                    <h3 className="mb-2 line-clamp-2 text-center text-sm font-semibold leading-tight text-gray-800 transition-colors hover:text-indigo-600">
                        {product.name}
                    </h3>
                </Link>

                <div className="mt-auto">
                    <div className="mb-3 flex flex-col items-center gap-0.5">
                        <p className="text-sm font-bold text-indigo-700">
                            €{" "}
                            {Number(product.price).toFixed(2).replace(".", ",")}
                        </p>
                        {product.is_preorder &&
                            product.preorder_release_date && (
                                <p className="text-xs text-amber-600">
                                    Uscita:{" "}
                                    {new Date(
                                        product.preorder_release_date,
                                    ).toLocaleDateString("it-IT", {
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                            )}
                    </div>

                    {isOutOfStock ? (
                        <button
                            disabled
                            className="w-full cursor-not-allowed rounded-lg border border-gray-200 py-2 text-sm text-gray-400"
                        >
                            Esaurito
                        </button>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                                added
                                    ? "bg-green-100 text-green-700"
                                    : product.is_preorder
                                      ? "bg-amber-600 text-white hover:bg-amber-700"
                                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                        >
                            {added
                                ? "✓ Aggiunto"
                                : product.is_preorder
                                  ? "Preordina"
                                  : "Aggiungi al carrello"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
