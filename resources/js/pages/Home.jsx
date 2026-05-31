import { useQuery } from "@tanstack/react-query";
import { getHomepageSections } from "../api/products";
import { PageSpinner } from "../components/ui/Spinner";
import HeroCarousel from "../components/home/HeroCarousel";
import ProductCarousel from "../components/home/ProductCarousel";

const HERO_BANNERS = [
    {
        id: "pokemon",
        image: "/images/banners/banner-1.svg",
        alt: "Nuove uscite Pokémon",
        href: "/catalogo?game=pokemon",
    },
    {
        id: "one-piece",
        image: "/images/banners/banner-2.svg",
        alt: "One Piece Card Game - preordini",
        href: "/catalogo?preorder=true",
    },
    {
        id: "magic-riftbound",
        image: "/images/banners/banner-3.svg",
        alt: "Magic e Riftbound",
        href: "/catalogo",
    },
];

export default function Home() {
    const { data: sectionsData, isLoading } = useQuery({
        queryKey: ["homepage-sections"],
        queryFn: getHomepageSections,
    });

    const sections = sectionsData?.data ?? [];

    return (
        <div>
            {/* Hero - carousel di banner */}
            <HeroCarousel slides={HERO_BANNERS} />

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
                            ctaLink={section.cta_link}
                        />
                    </div>
                ))
            )}
        </div>
    );
}
