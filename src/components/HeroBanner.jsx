import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import localSlide3 from '../assets/pictur/5.jpg'

export default function HeroBanner() {
  const slides = useMemo(() => ([
    { 
      id: 1, 
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop', 
      title: 'NEW\nLOOK\nNEW\nROUTINE', 
      tagline: 'A New Era of Beauty Begins',
      cta: 'Shop Now',
      ctaLink: '/shop',
      secondaryCta: 'Learn More',
      secondaryCtaLink: '/about'
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1600&auto=format&fit=crop', 
      title: 'SKIN\nCARE\nESSENTIALS', 
      tagline: 'Radiance that starts today',
      cta: 'Shop Skincare',
      ctaLink: '/shop?category=skincare',
      secondaryCta: 'Get Consultation',
      secondaryCtaLink: '/consultation'
    },
    { 
      id: 3, 
      image: localSlide3, 
      title: 'MAKEUP\nYOU\nLOVE', 
      tagline: 'Express your best self',
      cta: 'Shop Makeup',
      ctaLink: '/shop?category=makeup',
      secondaryCta: 'View Tutorials',
      secondaryCtaLink: '/tutorials'
    },
  ]), [])

  const [index, setIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return
    
    let id
    if (isAutoPlaying) {
      id = setInterval(() => {
        setIndex((v) => (v + 1) % slides.length)
      }, 5000)
    }
    
    return () => {
      if (id) clearInterval(id)
    }
  }, [slides.length, isAutoPlaying])

  const goToSlide = (newIndex) => {
    setIndex(newIndex)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const nextSlide = () => {
    goToSlide((index + 1) % slides.length)
  }

  const prevSlide = () => {
    goToSlide((index - 1 + slides.length) % slides.length)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide()
    } else if (e.key === 'ArrowRight') {
      nextSlide()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [index])

  return (
    <section className="hero" aria-label="Featured promotions">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`hero-slide ${i === index ? 'active' : ''}`}
          aria-hidden={i !== index}
        >
          <div className="hero-image">
            <img
              src={s.image}
              alt="Beauty banner"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding={i === 0 ? 'sync' : 'async'}
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa0?q=80&w=1600&auto=format&fit=crop' }}
            />
            <div className="hero-vignette" />
          </div>
          <div className="hero-content">
            <div className="hero-title" aria-live="polite">
              {s.title.split('\n').map((line, idx) => (
                <span key={idx}>{line}</span>
              ))}
            </div>
            <div className="hero-tagline">{s.tagline} <em>Act fast!</em></div>
            <div className="hero-actions">
              <Link to={s.ctaLink} className="btn primary hero-cta">
                {s.cta}
              </Link>
              <Link to={s.secondaryCtaLink} className="btn ghost hero-secondary-cta">
                {s.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        className="hero-nav hero-prev" 
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <button 
        className="hero-nav hero-next" 
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="hero-indicators" role="tablist" aria-label="Select banner slide">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-indicator ${i === index ? 'active' : ''}`}
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goToSlide(i)}
          />
        ))}
      </div>

      {/* Pause/Play Button */}
      <button 
        className="hero-play-pause" 
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isAutoPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
            <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <polygon points="5,3 19,12 5,21" fill="currentColor"/>
          </svg>
        )}
      </button>
    </section>
  )
}


