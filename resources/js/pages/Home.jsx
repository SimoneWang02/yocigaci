import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getHomepageSections, getCarouselBanners } from "../api/products";
import { PageSpinner } from "../components/ui/Spinner";
import HeroCarousel from "../components/home/HeroCarousel";
import ProductCarousel from "../components/home/ProductCarousel";

export default function Home() {
    const { data: sectionsData, isLoading } = useQuery({
        queryKey: ["homepage-sections"],
        queryFn: getHomepageSections,
    });

    const { data: carouselData } = useQuery({
        queryKey: ["carousel-banners"],
        queryFn: getCarouselBanners,
    });

    const sections = sectionsData?.data ?? [];
    const carouselEnabled = carouselData?.carousel_enabled ?? false;
    const bannerSlides = (carouselData?.data ?? []).map((b) => ({
        id: String(b.id),
        image: b.url,
        alt: "",
        href: b.link ?? undefined,
    }));

    return (
        <div>
            {carouselEnabled && bannerSlides.length > 0 && (
                <HeroCarousel slides={bannerSlides} />
            )}

            {/* Sezioni gestite dall'admin */}
            {isLoading ? (
                <div className="py-14">
                    <PageSpinner />
                </div>
            ) : (
                <>
                    {sections.map((section, idx) => (
                        <div key={section.id} className="bg-white">
                            {idx > 0 && <hr className="border-gray-200" />}
                            <ProductCarousel
                                title={section.title}
                                products={section.products ?? []}
                                ctaLink={`/catalogo?sezione=${section.id}`}
                            />
                        </div>
                    ))}

                    {sections.length > 0 && (
                        <div className="bg-white">
                            <hr className="border-gray-200" />
                            <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center gap-4 text-center">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Scopri tutto il catalogo
                                </h2>
                                <Link
                                    to="/catalogo"
                                    className="mt-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
                                >
                                    Vai al catalogo
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
