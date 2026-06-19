import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { ProductCard } from '../product/ProductCard'

export default function ProductCarousel({ title, products = [], ctaLink, itemClassName }) {
  const itemClass =
    itemClassName ?? 'snap-start shrink-0 w-[38%] sm:w-[30%] md:w-[23%] lg:w-[18.5%]'
  const scrollRef = useRef(null)
  const dragRef = useRef({ down: false, startX: 0, startLeft: 0, moved: false })
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

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
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', endDrag)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', endDrag)
    }
  }, [products])

  const scrollBy = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  // Drag-to-scroll con inerzia: trascina col tasto sinistro, al rilascio continua e rallenta.
  const onMouseDown = (e) => {
    if (e.button !== 0) return
    const el = scrollRef.current
    if (!el) return
    e.preventDefault() // blocca il drag nativo di immagini/testo che rende il movimento a scatti
    if (dragRef.current.raf) cancelAnimationFrame(dragRef.current.raf) // ferma un'eventuale inerzia in corso
    dragRef.current = {
      down: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      target: el.scrollLeft,
      moved: false,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
      raf: null,
    }
    setIsDragging(true)
  }

  const dragScroll = () => {
    const d = dragRef.current
    const el = scrollRef.current
    if (d.down && el) {
      el.scrollLeft = d.target
      d.raf = requestAnimationFrame(dragScroll)
    } else {
      d.raf = null
    }
  }

  const onMouseMove = (e) => {
    const d = dragRef.current
    if (!d.down) return
    const dx = e.clientX - d.startX
    if (Math.abs(dx) > 4) d.moved = true
    d.target = d.startLeft - dx

    // velocità istantanea (px/ms) per l'inerzia al rilascio
    const now = performance.now()
    const dt = now - d.lastT
    if (dt > 0) d.velocity = (d.lastX - e.clientX) / dt
    d.lastX = e.clientX
    d.lastT = now

    if (!d.raf) d.raf = requestAnimationFrame(dragScroll)
  }

  // Decelerazione esponenziale dopo il rilascio (effetto "flick").
  const momentum = () => {
    const d = dragRef.current
    const el = scrollRef.current
    if (!el) return
    d.velocity *= 0.95 // attrito: più alto = scivola più a lungo
    el.scrollLeft += d.velocity * 16 // ~16ms per frame
    const atEnd = el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth
    if (Math.abs(d.velocity) > 0.02 && !atEnd) {
      d.raf = requestAnimationFrame(momentum)
    } else {
      d.raf = null
      setIsDragging(false) // fine interazione: riattiva snap + scroll-smooth
    }
  }

  const endDrag = () => {
    const d = dragRef.current
    if (!d.down) return
    d.down = false
    if (d.raf) {
      cancelAnimationFrame(d.raf)
      d.raf = null
    }
    if (Math.abs(d.velocity) > 0.05) {
      d.raf = requestAnimationFrame(momentum) // avvia l'inerzia (snap/smooth restano off finché non finisce)
    } else {
      setIsDragging(false)
    }
  }

  // Evita che il trascinamento faccia scattare il click su carte/link.
  const onClickCapture = (e) => {
    if (dragRef.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current.moved = false
    }
  }

  if (!products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {ctaLink && (
            <Link
              to={ctaLink}
              className="group inline-flex items-center gap-1 text-sm font-medium leading-none text-indigo-600 hover:text-indigo-700"
            >
              <span className="group-hover:underline">Vedi tutto</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-3">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              aria-label="Precedente"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              aria-label="Successivo"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
        className={`flex gap-4 overflow-x-auto pt-3 pb-4 -mx-1 px-1
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
                   ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-proximity scroll-smooth'}`}
      >
        {products.map((p) => (
          <div key={p.id} className={itemClass}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
