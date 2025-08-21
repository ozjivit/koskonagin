import './App.css'
import { useEffect, useState } from 'react'
import { fetchProducts as fetchProductsApi } from './api'
import { Link } from 'react-router-dom'
import { useAuth } from './state/AuthContext.jsx'
import { useUi } from './state/UiContext.jsx'
import { useWishlist } from './state/WishlistContext.jsx'
import HeroBanner from './components/HeroBanner.jsx'

import { useCart } from './state/CartContext.jsx'
import cat1 from './assets/category/1.jpg'
import cat2 from './assets/category/2.jpg'
import cat3 from './assets/category/3.jpg'
import cat4 from './assets/category/4.jpg'
import cat5 from './assets/category/5.jpg'
import promoImg from './assets/pictur/1.jpg'
import promoFallback from './assets/pictur/2.jpg'
// Only 1-5 exist in assets/category

const categories = [
  { 
    name: 'Honest Glow', 
    img: cat1, 
    description: 'Natural skincare for radiant beauty',
    productCount: '24 products',
    color: '#FF6B9D',
    link: '/shop?category=honest-glow'
  },
  { 
    name: 'Doctor Alvim', 
    img: cat2, 
    description: 'Professional dermatological solutions',
    productCount: '18 products',
    color: '#4ECDC4',
    link: '/shop?category=doctor-alvim'
  },
  { 
    name: 'Beauty Quality', 
    img: cat3, 
    description: 'Premium beauty essentials',
    productCount: '32 products',
    color: '#45B7D1',
    link: '/shop?category=beauty-quality'
  },
  { 
    name: 'B', 
    img: cat4, 
    description: 'Minimalist beauty collection',
    productCount: '15 products',
    color: '#96CEB4',
    link: '/shop?category=b'
  },
  { 
    name: 'Brilliant Sky', 
    img: cat5, 
    description: 'Innovative beauty technology',
    productCount: '28 products',
    color: '#FFEAA7',
    link: '/shop?category=brilliant-sky'
  },
]

const fallbackProducts = [
  { name: 'Hydrating Face Cream', price: 18.0, rating: 5, img: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=600&auto=format&fit=crop' },
  { name: 'Revitalizing Serum', price: 30.0, rating: 4, img: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa0?q=80&w=600&auto=format&fit=crop' },
  { name: 'Matte Lipstick', price: 18.0, rating: 5, img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop' },
  { name: 'Blush Palette', price: 24.0, rating: 5, img: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=600&auto=format&fit=crop' },
  { name: 'Scented Body Oil', price: 29.0, rating: 4, img: 'https://images.unsplash.com/photo-1556228453-efd1a8e6dfcf?q=80&w=600&auto=format&fit=crop' },
]

function StarRating({ value = 5 }) {
  return (
    <div className="rating" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'star filled' : 'star'}>★</span>
      ))}
    </div>
  )
}

function Categories() {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Discover your perfect beauty routine</p>
      </div>
      <div className="categories-grid">
        {categories.map((c) => (
          <Link key={c.name} to={c.link} className="category-card" style={{ '--category-color': c.color }}>
            <div className="category-thumb">
              <img src={c.img} alt={c.name} loading="lazy" decoding="async" />
              <div className="category-overlay">
                <div className="category-icon">✨</div>
              </div>
            </div>
            <div className="category-content">
            <div className="category-name">{c.name}</div>
              <div className="category-description">{c.description}</div>
              <div className="category-product-count">{c.productCount}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="section-footer">
        <Link to="/shop" className="btn primary view-all-btn">
          View All Categories
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </section>
  )
}

function UspCarousel() {
  const items = [
    { icon: '🚚', title: 'Free Shipping', sub: 'Over QAR 200' },
    { icon: '↩️', title: 'Easy Returns', sub: '30-day guarantee' },
    { icon: '🕑', title: 'Fast Support', sub: '9am–9pm daily' },
    { icon: '🔒', title: 'Secure Checkout', sub: '256-bit SSL' },
  ]

  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, 3000)
    return () => clearInterval(id)
  }, [items.length])

  return (
    <div className="usp-carousel" role="region" aria-label="Store benefits" aria-live="polite">
      <div className="usp-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {items.map((it, i) => (
          <div key={i} className="usp-slide">
            <div className="usp-item">
              <div className="usp-icon">{it.icon}</div>
              <div className="usp-text">
                <div className="usp-title">{it.title}</div>
                <div className="usp-sub">{it.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BestSellers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const { addItem } = useCart()
  const { user } = useAuth()
  const { openCart } = useUi()
  const wishlist = useWishlist()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchProductsApi(5)
        if (!mounted) return
        setItems(data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          currency: p.currency,
          img: p.image_128 ? `data:image/png;base64,${p.image_128}` : null,
          rating: 5,
          stock: Math.floor(Math.random() * 20) + 1, // Random stock for demo
          isNew: Math.random() > 0.7, // 30% chance of being new
          isSale: Math.random() > 0.8, // 20% chance of being on sale
          originalPrice: p.price * (Math.random() > 0.8 ? 1.3 : 1), // Random original price for sale items
        })))
      } catch (e) {
        setError('Showing demo products')
        setItems(fallbackProducts.map(p => ({
          ...p,
          stock: Math.floor(Math.random() * 20) + 1,
          isNew: Math.random() > 0.7,
          isSale: Math.random() > 0.8,
          originalPrice: p.price * (Math.random() > 0.8 ? 1.3 : 1),
        })))
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: '#dc2626', bg: '#fef2f2' }
    if (stock <= 5) return { text: 'Low Stock', color: '#ea580c', bg: '#fff7ed' }
    return { text: 'In Stock', color: '#16a34a', bg: '#f0fdf4' }
  }

  const getDiscountPercentage = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
  }

  return (
    <section className="section">
      <div className="section-header">
      <h2 className="section-title">Best Sellers</h2>
        <p className="section-subtitle">Our most loved beauty products</p>
      </div>
      
      {loading && (
        <div className="skeleton-grid" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-thumb" />
              <div className="skeleton-line" />
              <div className="skeleton-line sm" />
              <div className="skeleton-line sm" />
            </div>
          ))}
        </div>
      )}
      
      {error && <div className="hint error">{error}</div>}
      
      <div className="products-grid">
        {items.map((p) => {
          const stockStatus = getStockStatus(p.stock)
          const discount = p.isSale ? getDiscountPercentage(p.originalPrice, p.price) : 0
          
          return (
          <div key={p.id || p.name} className="product-card">
              <div className="product-badges">
                {p.isNew && <span className="product-badge new">New</span>}
                {p.isSale && <span className="product-badge sale">-{discount}%</span>}
                {p.stock <= 5 && p.stock > 0 && <span className="product-badge low-stock">Low Stock</span>}
              </div>
              
            <Link to={`/product/${encodeURIComponent(p.id || p.name)}`} className="product-link" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="product-thumb">
                {p.img ? (
                  <img src={p.img} alt={p.name} loading="lazy" decoding="async" />
                ) : (
                  <div className="placeholder" aria-label={p.name} />
                )}
                  <div className="product-overlay">
                    <button 
                      className="quick-view-btn"
                      onClick={(e) => {
                        e.preventDefault()
                        setQuickViewProduct(p)
                      }}
                      aria-label={`Quick view ${p.name}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Quick View
                    </button>
                  </div>
              </div>
                
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                  <div className="product-price-container">
                    {p.isSale && (
                      <span className="product-original-price">
                        {typeof p.originalPrice === 'number' ? `QAR ${p.originalPrice.toFixed(2)}` : ''}
                      </span>
                    )}
                    <div className="product-price">
                      {typeof p.price === 'number' ? `QAR ${p.price.toFixed(2)}` : ''}
                    </div>
                  </div>
                  <div className="product-rating">
                <div className="rating" aria-label={`${p.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < p.rating ? 'star filled' : 'star'}>★</span>
                  ))}
                </div>
                    <span className="rating-count">(24 reviews)</span>
                  </div>
                  <div className="product-stock" style={{ color: stockStatus.color, backgroundColor: stockStatus.bg }}>
                    {stockStatus.text}
                  </div>
                </div>
              </Link>
              
              <div className="product-actions">
                <button 
                  className={`btn ${p.stock === 0 ? 'disabled' : 'primary'}`}
                  disabled={p.stock === 0}
                  onClick={() => { 
                    if (!user) { 
                      alert('Please login to add items to cart'); 
                      return 
                    } 
                    addItem({ id: p.id || p.name, name: p.name, price: p.price, currency: p.currency, img: p.img }); 
                    openCart() 
                  }}
                >
                  {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button 
                  className="btn ghost wishlist-btn" 
                  aria-pressed={wishlist.isInWishlist(p.id)} 
                  onClick={() => wishlist.toggle({ id: p.id, name: p.name, price: p.price, img: p.img })}
                  aria-label={wishlist.isInWishlist(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlist.isInWishlist(p.id) ? '♥' : '♡'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="section-footer">
        <Link to="/shop" className="btn primary view-all-btn">
          View All Products
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="quick-view-modal" onClick={() => setQuickViewProduct(null)}>
          <div className="quick-view-content" onClick={(e) => e.stopPropagation()}>
            <button className="quick-view-close" onClick={() => setQuickViewProduct(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="quick-view-grid">
              <div className="quick-view-image">
                {quickViewProduct.img ? (
                  <img src={quickViewProduct.img} alt={quickViewProduct.name} />
                ) : (
                  <div className="placeholder" />
                )}
              </div>
              
              <div className="quick-view-details">
                <h3 className="quick-view-title">{quickViewProduct.name}</h3>
                <div className="quick-view-price">
                  {typeof quickViewProduct.price === 'number' ? `QAR ${quickViewProduct.price.toFixed(2)}` : ''}
                </div>
                <div className="quick-view-rating">
                  <StarRating value={quickViewProduct.rating} />
                  <span>(24 reviews)</span>
                </div>
                <p className="quick-view-description">
                  Experience the ultimate in beauty with this premium product. Perfect for daily use and designed to enhance your natural beauty.
                </p>
                <div className="quick-view-stock">
                  Stock: {getStockStatus(quickViewProduct.stock).text}
                </div>
                <div className="quick-view-actions">
                  <button 
                    className="btn primary"
                    disabled={quickViewProduct.stock === 0}
                    onClick={() => {
                      if (!user) {
                        alert('Please login to add items to cart')
                        return
                      }
                      addItem({ 
                        id: quickViewProduct.id || quickViewProduct.name, 
                        name: quickViewProduct.name, 
                        price: quickViewProduct.price, 
                        currency: quickViewProduct.currency, 
                        img: quickViewProduct.img 
                      })
                      openCart()
                      setQuickViewProduct(null)
                    }}
                  >
                    {quickViewProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <Link to={`/product/${encodeURIComponent(quickViewProduct.id || quickViewProduct.name)}`} className="btn ghost">
                    View Details
            </Link>
                </div>
              </div>
            </div>
          </div>
      </div>
      )}
    </section>
  )
}

function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [currentPromo, setCurrentPromo] = useState(0)
  
  const promos = [
    {
      id: 1,
      title: 'Summer Sale',
      subtitle: 'Up to 40% OFF',
      description: 'Refresh your beauty routine with our hottest deals',
      image: promoImg,
      fallback: promoFallback,
      color: '#FF6B9D',
      cta: 'Shop Sale',
      ctaLink: '/shop?sale=summer',
      badge: 'Limited Time'
    },
    {
      id: 2,
      title: 'New Arrivals',
      subtitle: 'Fresh Beauty',
      description: 'Discover the latest trends in beauty and skincare',
      image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa0?q=80&w=1600&auto=format&fit=crop',
      fallback: promoFallback,
      color: '#4ECDC4',
      cta: 'Explore New',
      ctaLink: '/shop?new=true',
      badge: 'Just In'
    },
    {
      id: 3,
      title: 'Free Shipping',
      subtitle: 'Over QAR 200',
      description: 'Get free delivery on all orders above QAR 200',
      image: 'https://images.unsplash.com/photo-1556228453-efd1a8e6dfcf?q=80&w=1600&auto=format&fit=crop',
      fallback: promoFallback,
      color: '#45B7D1',
      cta: 'Shop Now',
      ctaLink: '/shop',
      badge: 'Always Free'
    }
  ]

  useEffect(() => {
    const end = new Date()
    end.setDate(end.getDate() + 7)
    const t = setInterval(() => {
      const now = new Date()
      const diff = Math.max(0, end.getTime() - now.getTime())
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)
      setTimeLeft({ d, h, m, s })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Auto-rotate promos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length)
    }, 8000) // Change every 8 seconds
    return () => clearInterval(interval)
  }, [promos.length])

  const currentPromoData = promos[currentPromo]

  return (
    <section className="promo-section">
      <div className="promo">
      <div className="promo-media">
          <img 
            src={currentPromoData.image} 
            alt={currentPromoData.title} 
            onError={(e) => { e.currentTarget.src = currentPromoData.fallback }} 
          />
          <div className="promo-overlay" style={{ background: `linear-gradient(45deg, ${currentPromoData.color}20, ${currentPromoData.color}10)` }} />
      </div>
      <div className="promo-content">
          <div className="promo-badge" style={{ backgroundColor: currentPromoData.color }}>
            {currentPromoData.badge}
          </div>
          <div className="promo-title">{currentPromoData.title}</div>
          <div className="promo-subtitle">{currentPromoData.subtitle}</div>
          <p className="promo-description">{currentPromoData.description}</p>
          <Link to={currentPromoData.ctaLink} className="btn primary promo-cta">
            {currentPromoData.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          {currentPromo === 0 && (
        <div className="countdown" aria-label="Sale ends in">
          <span aria-hidden="true" style={{ opacity: 0.9 }}>Ends in</span>
          <span className="pill">{String(timeLeft.d).padStart(2, '0')}d</span>
          <span className="pill">{String(timeLeft.h).padStart(2, '0')}h</span>
          <span className="pill">{String(timeLeft.m).padStart(2, '0')}m</span>
          <span className="pill">{String(timeLeft.s).padStart(2, '0')}s</span>
        </div>
          )}
        </div>
      </div>

      {/* Promo Navigation Dots */}
      <div className="promo-dots">
        {promos.map((_, index) => (
          <button
            key={index}
            className={`promo-dot ${index === currentPromo ? 'active' : ''}`}
            onClick={() => setCurrentPromo(index)}
            aria-label={`Go to promo ${index + 1}`}
          />
        ))}
      </div>

      {/* Promo Navigation Arrows */}
      <button 
        className="promo-nav promo-prev" 
        onClick={() => setCurrentPromo((prev) => (prev - 1 + promos.length) % promos.length)}
        aria-label="Previous promo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <button 
        className="promo-nav promo-next" 
        onClick={() => setCurrentPromo((prev) => (prev + 1) % promos.length)}
        aria-label="Next promo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </section>
  )
}

function Testimonials() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const testimonials = [
    {
      id: 1,
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
      text: 'I absolutely love these products! They make my skin feel amazing and the quality is outstanding. The delivery was super fast too!',
      name: 'Sara M.',
      rating: 5,
      location: 'Doha, Qatar',
      product: 'Skincare Collection'
    },
    {
      id: 2,
      img: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=300&auto=format&fit=crop',
      text: 'Great quality and super fast delivery. The customer service is exceptional and they really care about their customers. Highly recommended!',
      name: 'Aisha K.',
      rating: 5,
      location: 'Al Wakrah, Qatar',
      product: 'Makeup Essentials'
    },
    {
      id: 3,
      img: 'https://images.unsplash.com/photo-1546456073-6712f79251bb?q=80&w=300&auto=format&fit=crop',
      text: 'My go-to store for skincare. The products are authentic and the prices are reasonable. I\'m excited every time I order!',
      name: 'Noora A.',
      rating: 5,
      location: 'Al Khor, Qatar',
      product: 'Beauty Products'
    },
    {
      id: 4,
      img: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=300&auto=format&fit=crop',
      text: 'The best beauty store in Qatar! Their range of products is incredible and the quality is always top-notch. Love shopping here!',
      name: 'Fatima R.',
      rating: 5,
      location: 'Lusail, Qatar',
      product: 'Luxury Beauty'
    },
    {
      id: 5,
      img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop',
      text: 'Amazing customer service and authentic products. The delivery is always on time and the packaging is beautiful. 10/10!',
      name: 'Layla S.',
      rating: 5,
      location: 'The Pearl, Qatar',
      product: 'Premium Skincare'
    },
    {
      id: 6,
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      text: 'Found my perfect skincare routine here! The staff is knowledgeable and helped me choose the right products for my skin type.',
      name: 'Ahmed M.',
      rating: 5,
      location: 'West Bay, Qatar',
      product: 'Men\'s Grooming'
    }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 6000) // Change every 6 seconds
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const totalSlides = Math.ceil(testimonials.length / 3)
  const startIndex = currentSlide * 3
  const visibleTestimonials = testimonials.slice(startIndex, startIndex + 3)

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex)
    setIsAutoPlaying(false)
    // Resume auto-play after 15 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 15000)
  }

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % totalSlides)
  }

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides)
  }

  return (
    <section className="section">
      <div className="section-header">
      <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">Real reviews from real customers</p>
      </div>
      
      <div className="testimonials-container">
        <div className="testimonials-carousel">
          <div className="testimonials-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {Array.from({ length: totalSlides }).map((_, slideIndex) => {
              const slideTestimonials = testimonials.slice(slideIndex * 3, (slideIndex + 1) * 3)
              return (
                <div key={slideIndex} className="testimonials-slide">
      <div className="testimonial-list">
                    {slideTestimonials.map((t) => (
                      <div key={t.id} className="testimonial-card">
                        <div className="testimonial-header">
            <div className="avatar">
              <img src={t.img} alt={t.name} loading="lazy" decoding="async" />
                          </div>
                          <div className="testimonial-meta">
                            <div className="testimonial-name">{t.name}</div>
                            <div className="testimonial-location">{t.location}</div>
                            <div className="testimonial-product">{t.product}</div>
                          </div>
            </div>
            <div className="testimonial-content">
                          <p className="testimonial-text">"{t.text}"</p>
                          <div className="testimonial-rating">
                            <StarRating value={t.rating} />
                            <span className="rating-text">Verified Purchase</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          className="testimonial-nav testimonial-prev" 
          onClick={prevSlide}
          aria-label="Previous testimonials"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="testimonial-nav testimonial-next" 
          onClick={nextSlide}
          aria-label="Next testimonials"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="testimonial-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`testimonial-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonials ${index + 1}`}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <button 
          className="testimonial-play-pause" 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          aria-label={isAutoPlaying ? 'Pause testimonials' : 'Play testimonials'}
        >
          {isAutoPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
              <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
            </svg>
          )}
        </button>
      </div>

      <div className="section-footer">
        <Link to="/reviews" className="btn primary view-all-btn">
          Read All Reviews
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </section>
  )
}

function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSubscribed(true)
      setEmail('')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    {
      icon: '🎁',
      title: 'Exclusive Offers',
      description: 'Get 10% off your first order'
    },
    {
      icon: '🚀',
      title: 'Early Access',
      description: 'Be the first to know about new products'
    },
    {
      icon: '💎',
      title: 'VIP Perks',
      description: 'Special discounts and free shipping'
    },
    {
      icon: '📱',
      title: 'Mobile Updates',
      description: 'Get notified about flash sales'
    }
  ]

  if (isSubscribed) {
    return (
      <section className="newsletter-section">
        <div className="newsletter-success">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="success-title">Welcome to the Family! 🎉</h2>
          <p className="success-message">
            Thank you for subscribing! Check your email for your exclusive 10% discount code.
          </p>
          <button 
            className="btn primary"
            onClick={() => setIsSubscribed(false)}
          >
            Subscribe Another Email
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <div className="newsletter-header">
            <h2 className="newsletter-title">Stay in the Loop</h2>
            <p className="newsletter-subtitle">
              Subscribe to our newsletter and never miss out on exclusive offers, new arrivals, and beauty tips!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="newsletter-form">
            <div className="form-group">
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="newsletter-input"
                  required
                  disabled={isLoading}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            
            <button 
              type="submit" 
              className={`btn primary newsletter-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe Now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="newsletter-benefits">
            <h3 className="benefits-title">What you'll get:</h3>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <div className="benefit-icon">{benefit.icon}</div>
                  <div className="benefit-content">
                    <h4 className="benefit-title">{benefit.title}</h4>
                    <p className="benefit-description">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="newsletter-footer">
            <p className="privacy-note">
              🔒 We respect your privacy. Unsubscribe at any time.
            </p>
            <div className="social-proof">
              <span className="subscriber-count">Join 10,000+ beauty lovers</span>
            </div>
          </div>
        </div>

        <div className="newsletter-visual">
          <div className="visual-container">
            <div className="floating-card card-1">
              <div className="card-content">
                <div className="card-icon">💄</div>
                <div className="card-text">New Arrivals</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-content">
                <div className="card-icon">🎁</div>
                <div className="card-text">Exclusive Offers</div>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-content">
                <div className="card-icon">⭐</div>
                <div className="card-text">VIP Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  return (
    <main className="page">
      <HeroBanner />
      <section className="section">
        {/* Desktop/tablet static strip */}
        <div className="usp-strip">
          <div className="usp-item"><div className="usp-icon">🚚</div><div className="usp-text"><div className="usp-title">Free Shipping</div><div className="usp-sub">Over QAR 200</div></div></div>
          <div className="usp-item"><div className="usp-icon">↩️</div><div className="usp-text"><div className="usp-title">Easy Returns</div><div className="usp-sub">30-day guarantee</div></div></div>
          <div className="usp-item"><div className="usp-icon">🕑</div><div className="usp-text"><div className="usp-title">Fast Support</div><div className="usp-sub">9am–9pm daily</div></div></div>
          <div className="usp-item"><div className="usp-icon">🔒</div><div className="usp-text"><div className="usp-title">Secure Checkout</div><div className="usp-sub">256-bit SSL</div></div></div>
        </div>
        {/* Mobile auto-sliding carousel */}
        <UspCarousel />
      </section>
      <Categories />
      <BestSellers />
      <PromoBanner />
      <Testimonials />
      <NewsletterSignup />
    </main>
  )
}

export default App
