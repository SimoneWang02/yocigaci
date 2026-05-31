import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Carousel di banner per la hero della homepage.
 *
 * slides: [{ id, image, alt, href }]
 *   - image: URL dell'immagine banner (es. "/images/banners/banner-1.jpg")
 *   - href:  link opzionale (interno con react-router)
 */
export default function HeroCarousel({ slides = [], interval = 6000 }) {
    const [current, setCurrent] = useState(0);
    const timer = useRef(null);
    const count = slides.length;

    const goTo = useCallback(
        (index) => setCurrent(((index % count) + count) % count),
        [count]
    );
    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    // autoplay
    useEffect(() => {
        if (count <= 1) return;
        timer.current = setTimeout(next, interval);
        return () => clearTimeout(timer.current);
    }, [current, count, interval, next]);

    if (count === 0) return null;

    return (
        <section
            className="relative w-full overflow-hidden bg-gray-100"
            onMouseEnter={() => clearTimeout(timer.current)}
            onMouseLeave={() => (timer.current = setTimeout(next, interval))}
            aria-roledescription="carousel"
        >
            {/* track */}
            <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map((slide) => {
                    const inner = (
                        <img
                            src={slide.image}
                            alt={slide.alt ?? ""}
                            className="h-[220px] w-full object-cover sm:h-[320px] md:h-[420px] lg:h-[500px]"
                            loading="lazy"
                        />
                    );
                    return (
                        <div key={slide.id} className="w-full shrink-0">
                            {slide.href ? (
                                <Link to={slide.href} className="block">
                                    {inner}
                                </Link>
                            ) : (
                                inner
                            )}
                        </div>
                    );
                })}
            </div>

            {count > 1 && (
                <>
                    {/* arrows */}
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Banner precedente"
                        className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/70 text-gray-800 shadow backdrop-blur transition hover:bg-white md:left-5"
                    >
                        <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Banner successivo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/70 text-gray-800 shadow backdrop-blur transition hover:bg-white md:right-5"
                    >
                        <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                    </button>

                    {/* dots */}
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                        {slides.map((slide, i) => (
                            <button
                                key={slide.id}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Vai al banner ${i + 1}`}
                                className={`h-2 cursor-pointer rounded-full transition-all ${
                                    i === current
                                        ? "w-6 bg-white"
                                        : "w-2 bg-white/60 hover:bg-white/90"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
