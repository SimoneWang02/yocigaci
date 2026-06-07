import { useQuery } from "@tanstack/react-query";
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
                sections.map((section, idx) => (
                    <div
                        key={section.id}
                        className={idx % 2 === 1 ? "bg-gray-100" : "bg-white"}
                    >
                        <ProductCarousel
                            title={section.title}
                            products={section.products ?? []}
                            ctaLink={`/catalogo?sezione=${section.id}`}
                        />
                    </div>
                ))
            )}
        </div>
    );
}
