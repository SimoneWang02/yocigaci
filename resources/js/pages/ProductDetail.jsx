import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/products";
import { useCartStore } from "../store/cartStore";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";

export default function ProductDetail() {
    const { slug } = useParams();
    const { addItem, openCart } = useCartStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["product", slug],
        queryFn: () => getProduct(slug),
    });

    const product = data?.data;

    if (isLoading) return <PageSpinner />;
    if (isError || !product)
        return (
            <div className="text-center py-32 text-gray-500">
                <p className="text-6xl mb-4">😕</p>
                <p className="mb-4">Prodotto non trovato.</p>
                <Link
                    to="/catalogo"
                    className="text-indigo-600 hover:underline"
                >
                    Torna al catalogo
                </Link>
            </div>
        );

    const images = product.images ?? [];
    const isOutOfStock = !product.is_preorder && product.stock === 0;

    const handleAdd = () => {
        addItem(product, qty);
        openCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6 flex gap-1">
                <Link to="/" className="hover:text-indigo-600">
                    Home
                </Link>
                <span>/</span>
                <Link to="/catalogo" className="hover:text-indigo-600">
                    Catalogo
                </Link>
                {product.game && (
                    <>
                        <span>/</span>
                        <Link
                            to={`/catalogo?game=${product.game.slug}`}
                            className="hover:text-indigo-600"
                        >
                            {product.game.name}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span className="text-gray-800 truncate">{product.name}</span>
            </nav>

            <div className="grid md:grid-cols-2 gap-10">
                {/* Gallery */}
                <div>
                    <div className="relative aspect-[3/4] mb-3 flex items-start justify-center">
                        {images[selectedImage]?.url ? (
                            <img
                                src={images[selectedImage].url}
                                alt={product.name}
                                className="max-h-full w-auto object-contain drop-shadow-xl"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
                                <ImageIcon
                                    className="w-24 h-24"
                                    strokeWidth={1}
                                />
                            </div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-indigo-500" : "border-transparent"}`}
                                >
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="flex gap-2 mb-3">
                        {product.is_preorder && (
                            <Badge variant="preorder">Preordine</Badge>
                        )}
                        {isOutOfStock && (
                            <Badge variant="sold_out">Esaurito</Badge>
                        )}
                        {product.game && <Badge>{product.game.name}</Badge>}
                        {product.category && (
                            <Badge>{product.category.name}</Badge>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h1>

                    <p className="text-4xl font-extrabold text-indigo-700 mb-4">
                        € {Number(product.price).toFixed(2).replace(".", ",")}
                    </p>

                    {product.is_preorder && product.preorder_release_date && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                            <p className="text-amber-800 font-semibold text-sm">
                                Uscita prevista:{" "}
                                {new Date(
                                    product.preorder_release_date,
                                ).toLocaleDateString("it-IT", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                            {product.preorder_note && (
                                <p className="text-amber-700 text-sm mt-1">
                                    {product.preorder_note}
                                </p>
                            )}
                        </div>
                    )}

                    {!isOutOfStock && !product.is_preorder && (
                        <p className="text-sm text-green-600 mb-4">
                            ✓ Disponibile - {product.stock} in magazzino
                        </p>
                    )}

                    {!isOutOfStock && (
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                                >
                                    −
                                </button>
                                <span className="px-4 py-2 text-sm font-medium">
                                    {qty}
                                </span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {isOutOfStock ? (
                        <Button
                            variant="secondary"
                            size="lg"
                            disabled
                            className="w-full"
                        >
                            Esaurito
                        </Button>
                    ) : (
                        <Button
                            onClick={handleAdd}
                            variant={
                                added
                                    ? "secondary"
                                    : product.is_preorder
                                      ? "primary"
                                      : "primary"
                            }
                            size="lg"
                            className="w-full"
                        >
                            {added
                                ? "✓ Aggiunto al carrello"
                                : product.is_preorder
                                  ? "Preordina ora"
                                  : "Aggiungi al carrello"}
                        </Button>
                    )}

                    {product.description && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Descrizione
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
