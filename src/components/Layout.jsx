import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { useCart } from '../state/CartContext.jsx'
import '../App.css'
import CartDrawer from './CartDrawer.jsx'
import { useUi } from '../state/UiContext.jsx'
import logoImage from '../assets/logo.png'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { totalQuantity } = useCart()
  const { toggleCart } = useUi()
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showPromoRibbon, setShowPromoRibbon] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('promoRibbonDismissed') === '1'
    if (dismissed) setShowPromoRibbon(false)
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (!profileRef.current) return
      if (!profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setOpen(false)
      }
    }
    function onScroll() {
      const shouldShow = window.scrollY > 400
      setShowBackToTop(shouldShow)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleDismissPromo = () => {
    setShowPromoRibbon(false)
    localStorage.setItem('promoRibbonDismissed', '1')
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText('WELCOME20')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      setCopied(false)
    }
  }

  return (
    <div className={`site-wrapper${showPromoRibbon ? ' has-promo' : ''}`}>
      {showPromoRibbon && (
        <div className="promo-ribbon" role="region" aria-label="Promotion">
          <div className="promo-ribbon-inner">
            <span className="promo-ribbon-text">
              Get QAR 20 OFF your first order — Use code
            </span>
            <button type="button" className={`code-pill ${copied ? 'copied' : ''}`} onClick={copyCode} aria-label="Copy coupon code WELCOME20">
              WELCOME20
              {!copied ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <Link to="/shop?sale=welcome" className="promo-ribbon-cta">Shop Now</Link>
          </div>
          <button type="button" className="promo-ribbon-close" aria-label="Dismiss promotion" onClick={handleDismissPromo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
      <div className="announcement-bar" role="region" aria-label="Announcements">
        <div className="announcement-inner">
          <span>Free delivery over QAR 200</span>
          <span className="badge-dot" aria-hidden="true" />
          <span>Cash on Delivery available</span>
          <span className="badge-dot" aria-hidden="true" />
          <span>Support: +974 3080 0691</span>
        </div>
      </div>
      <header className="navbar">
        <div className="brand">
          <NavLink to="/" className="logo">
            <img src={logoImage} alt="Toronto Beauty TB" className="logo-image" />
          </NavLink>
        </div>
        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => { setOpen(false); setProfileOpen(false) }}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/rewards">Rewards</NavLink>
        </nav>
        <div className="nav-icons">
          <Link to="/search" className="icon-btn circle" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div className="profile" onClick={(e) => e.stopPropagation()} ref={profileRef}>
            <button
              className="icon-btn circle profile-btn"
              aria-label="Account"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((v) => !v)}
            >
              {user ? (
                <span className="avatar-circle" aria-hidden="true">{(user.username || user.email || '?').charAt(0).toUpperCase()}</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 20c0-3.3137 3.134  -6 7 -6s7 2.6863 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
            {profileOpen && (
              <div className="profile-menu" role="menu">
                {user ? (
                  <>
                    <div className="profile-header">Signed in as <strong>{user.username}</strong></div>
                    <NavLink to="/orders" className="menu-item" onClick={() => setProfileOpen(false)}>My Orders</NavLink>
                    {user?.isAdmin && <NavLink to="/admin" className="menu-item" onClick={() => setProfileOpen(false)}>Admin Dashboard</NavLink>}
                    <button className="menu-item" onClick={() => { setProfileOpen(false); logout() }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="menu-item" onClick={() => setProfileOpen(false)}>Login</Link>
                    <Link to="/signup" className="menu-item" onClick={() => setProfileOpen(false)}>Sign up</Link>
                  </>
                )}
              </div>
            )}
          </div>
          <button onClick={toggleCart} className="icon-btn cart-icon" aria-label="Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-1 5h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="20" r="1.5" fill="currentColor"/>
              <circle cx="17" cy="20" r="1.5" fill="currentColor"/>
            </svg>
            {totalQuantity > 0 && <span className="cart-badge-dot" aria-hidden="true">{totalQuantity}</span>}
          </button>
          <button className="nav-toggle icon-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={logoImage} alt="Toronto Beauty TB" className="footer-logo" />
          </div>
          <div className="footer-social" aria-label="Social links">
            <div className="social-links">
              <a
                className="social-link facebook"
                href="https://www.facebook.com/search/top?q=toronto%20beauty"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.6c0-2 1.2-3.1 3-3.1.9 0 1.8.1 2 .1v2.3h-1.2c-1 0-1.3.6-1.3 1.2V12H18l-.4 3h-2.3v7A10 10 0 0 0 22 12z"/>
                </svg>
              </a>
              <a
                className="social-link tiktok"
                href="https://www.tiktok.com/@torontobeauty.qa"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                aria-label="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 3v7.8a3.7 3.7 0 1 1-2.9 3.6c0-.7.2-1.4.6-2V9.4a6.7 6.7 0 1 0 9.6 5.9v-4.3a6.5 6.5 0 0 0 3 1v-2.6a6.5 6.5 0 0 1-3-1.2 6.6 6.6 0 0 1-1.9-2.4A6.5 6.5 0 0 1 17.1 3H12z"/>
                </svg>
              </a>
              <a
                className="social-link instagram"
                href="https://www.instagram.com/torontobeauty.qa"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4.5" fill="#fff"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="#fff"/>
                </svg>
              </a>
              <a
                className="social-link whatsapp"
                href="https://wa.me/97430800691"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-meta">© {new Date().getFullYear()} TB Beauty. All rights reserved.</div>
        </div>
      </footer>

      {showBackToTop && (
        <button
          className="back-to-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Back to top"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4l-7 7h4v9h6v-9h4z" fill="currentColor"/>
          </svg>
        </button>
      )}

      <a
        href="https://wa.me/97430800691"
        className="whatsapp-fab"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </a>

      <CartDrawer />
    </div>
  )
} 