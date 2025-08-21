import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { useCart } from '../state/CartContext.jsx'
import '../App.css'
import CartDrawer from './CartDrawer.jsx'
import { useUi } from '../state/UiContext.jsx'

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
          <span>Support: +974 5027 9565</span>
        </div>
      </div>
      <header className="navbar">
        <div className="brand">
          <NavLink to="/" className="logo">TB Beauty</NavLink>
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
          <div className="footer-brand">TB Beauty</div>
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
                href="https://wa.me/97450279565"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.5 3.5A10 10 0 0 0 4.5 17.6L3 21l3.5-1.4A10 10 0 1 0 20.5 3.5Zm-8.4 14c-1.6 0-3.1-.5-4.3-1.4l-.3-.2-1.7.6.6-1.7-.2-.3a7 7 0 1 1 6 3Zm3.3-3.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1s-.6.7-.7.8c-.1.1-.3.2-.5.1-1-.5-1.8-1.1-2.5-2-.2-.3.2-.3.4-1 .1-.1 0-.3 0-.4l-.6-1c-.1-.2-.3-.3-.5-.3h-.4c-.2 0-.4.2-.5.4-.2.5-.5 1.2-.5 2 0 .8.5 1.6 1.1 2.1 1 .9 2.2 1.5 3.5 1.8.4.1.8.1 1.1.1.3 0 .7-.2.9-.5.3-.4.5-.8.6-1.3 0-.3 0-.5-.2-.6Z"/>
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
        href="https://wa.me/97450279565"
        className="whatsapp-fab"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.5 3.5A10 10 0 0 0 4.5 17.6L3 21l3.5-1.4A10 10 0 1 0 20.5 3.5Zm-8.4 14c-1.6 0-3.1-.5-4.3-1.4l-.3-.2-1.7.6.6-1.7-.2-.3a7 7 0 1 1 6 3Zm3.3-3.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1s-.6.7-.7.8c-.1.1-.3.2-.5.1-1-.5-1.8-1.1-2.5-2-.2-.3.2-.3.4-1 .1-.1 0-.3 0-.4l-.6-1c-.1-.2-.3-.3-.5-.3h-.4c-.2 0-.4.2-.5.4-.2.5-.5 1.2-.5 2 0 .8.5 1.6 1.1 2.1 1 .9 2.2 1.5 3.5 1.8.4.1.8.1 1.1.1.3 0 .7-.2.9-.5.3-.4.5-.8.6-1.3 0-.3 0-.5-.2-.6Z"/>
        </svg>
      </a>

      <CartDrawer />
    </div>
  )
} 