import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Image as ImageIcon, Check, Frown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getProduct, getRelatedProducts } from "../api/products";
import { useCartStore } from "../store/cartStore";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PageSpinner } from "../components/ui/Spinner";
import ProductCarousel from "../components/home/ProductCarousel";

export default function ProductDetail() {
    const { slug } = useParams();
    const { addItem, openCart, items } = useCartStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["product", slug],
        queryFn: () => getProduct(slug),
    });

    const { data: relatedData } = useQuery({
        queryKey: ["product-related", slug],
        queryFn: () => getRelatedProducts(slug),
    });

    const product = data?.data;
    const related = relatedData?.data ?? [];

    if (isLoading) return <PageSpinner />;
    if (isError || !product)
        return (
            <div className="text-center py-32 text-gray-500">
                <Frown className="w-14 h-14 mx-auto mb-4" strokeWidth={1.5} />
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

    // Quantità già presente nel carrello e massimo ancora aggiungibile
    const inCart = items.find((i) => i.id === product.id)?.quantity ?? 0;
    const maxAddable = product.is_preorder
        ? Infinity
        : Math.max(0, product.stock - inCart);
    const reachedMax = !product.is_preorder && maxAddable <= 0;

    const handleAdd = () => {
        if (reachedMax) return;
        addItem(product, qty);
        openCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const metaTitle = `${product.name} - Yocigaci`;
    const metaDescription = product.description
        ? product.description.slice(0, 155)
        : `Acquista ${product.name} su Yocigaci, negozio TCG a Carpi. € ${Number(product.price).toFixed(2).replace(".", ",")}.`;
    const metaImage = product.primary_image?.url ?? product.images?.[0]?.url;

    return (
        <>
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="product" />
                <meta
                    property="og:url"
                    content={`${window.location.origin}/prodotti/${product.slug}`}
                />
                {metaImage && <meta property="og:image" content={metaImage} />}
            </Helmet>
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
                                to={`/catalogo/${product.game.slug}`}
                                className="hover:text-indigo-600"
                            >
                                {product.game.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-gray-800 truncate">
                        {product.name}
                    </span>
                </nav>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Gallery */}
                    <div className="md:sticky md:top-20 md:self-start">
                        <div className="relative mb-3 flex justify-center">
                            {images[selectedImage]?.url ? (
                                <img
                                    src={images[selectedImage].url}
                                    alt={product.name}
                                    className="max-h-[70vh] max-w-full w-auto object-contain drop-shadow-xl"
                                />
                            ) : (
                                <div className="aspect-[3/4] w-full flex items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
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

                        <p className="text-4xl font-extrabold text-indigo-700 mb-1">
                            €{" "}
                            {Number(product.price).toFixed(2).replace(".", ",")}
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                            IVA inclusa
                        </p>

                        {product.is_preorder &&
                            product.preorder_release_date && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                    <p className="text-amber-800 font-semibold text-sm">
                                        Uscita Prevista:{" "}
                                        {new Date(product.preorder_release_date)
                                            .toLocaleDateString("it-IT", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })
                                            .replace(
                                                /\p{L}+/u,
                                                (m) =>
                                                    m.charAt(0).toUpperCase() +
                                                    m.slice(1),
                                            )}
                                    </p>
                                    {product.preorder_note && (
                                        <p className="text-amber-700 text-sm mt-1">
                                            {product.preorder_note}
                                        </p>
                                    )}
                                </div>
                            )}

                        {!isOutOfStock && !product.is_preorder && (
                            <p className="text-sm text-green-600 mb-4 flex items-center gap-1.5">
                                <Check className="w-4 h-4" strokeWidth={2.5} />
                                {product.stock}{" "}
                                {product.stock === 1
                                    ? "Disponibile"
                                    : "Disponibili"}
                            </p>
                        )}

                        {!isOutOfStock && (
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() =>
                                            setQty(Math.max(1, qty - 1))
                                        }
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                                    >
                                        −
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQty(
                                                Math.min(maxAddable, qty + 1),
                                            )
                                        }
                                        disabled={qty >= maxAddable}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                    >
                                        +
                                    </button>
                                </div>
                                {!product.is_preorder && inCart > 0 && (
                                    <span className="text-xs text-gray-500">
                                        {inCart} già nel carrello
                                    </span>
                                )}
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
                            <>
                                <Button
                                    onClick={handleAdd}
                                    disabled={reachedMax}
                                    variant={added ? "secondary" : "primary"}
                                    size="lg"
                                    className="w-full"
                                >
                                    {added ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <Check className="w-5 h-5" />{" "}
                                            Aggiunto al carrello
                                        </span>
                                    ) : product.is_preorder ? (
                                        "Preordina ora"
                                    ) : (
                                        "Aggiungi al carrello"
                                    )}
                                </Button>
                                {reachedMax && (
                                    <p className="text-xs text-amber-600 mt-2 text-center">
                                        Hai già la quantità massima disponibile
                                        nel carrello
                                    </p>
                                )}
                            </>
                        )}

                        {product.description && (
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prodotti correlati: riga piena su desktop, carosello quando non ci stanno */}
                {related.length > 0 && (
                    <div className="mt-12 pt-6 border-t border-gray-200">
                        <ProductCarousel
                            title="Prodotti Correlati"
                            products={related}
                            itemClassName="snap-start shrink-0 w-[55%] sm:w-[42%] md:w-[31%] lg:w-[calc(25%-0.75rem)]"
                        />
                    </div>
                )}
            </div>
        </>
    );
}
