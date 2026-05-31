import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../product/ProductCard'

export default function ProductCarousel({ title, products = [], ctaLink }) {
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [products])

  const scrollBy = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (!products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3">
          {ctaLink && (
            <Link to={ctaLink} className="text-sm text-indigo-600 hover:underline font-medium">
              Vedi tutto →
            </Link>
          )}
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              aria-label="Precedente"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              aria-label="Successivo"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pt-3 pb-4 -mx-1 px-1
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="snap-start shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
