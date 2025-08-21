import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProducts, fetchReviews, submitReview } from '../api'
import { useCart } from '../state/CartContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import '../App.css'

function StarDisplay({ value = 0 }) {
  return (
    <div className="rating" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'star filled' : 'star'}>★</span>
      ))}
    </div>
  )
}

function StarInput({ value, onChange }) {
  return (
    <div className="rating input" aria-label="Rate this product">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          type="button"
          key={i}
          className={`star-btn ${i < value ? 'filled' : ''}`}
          aria-label={`${i + 1} star`}
          onClick={() => onChange(i + 1)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ProductDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const { addItem } = useCart()
  const { user } = useAuth()

  const [reviews, setReviews] = useState([])
  const [average, setAverage] = useState(0)
  const [reviewName, setReviewName] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const list = await fetchProducts(200)
        if (!mounted) return
        setAllProducts(list)

        // Try to find by numeric id, otherwise by name slug
        const numericId = Number(decodeURIComponent(id))
        let found = null
        if (!Number.isNaN(numericId)) {
          found = list.find((p) => p.id === numericId)
        }
        if (!found) {
          const byName = decodeURIComponent(id)
          found = list.find((p) => String(p.name).toLowerCase() === String(byName).toLowerCase())
        }
        setProduct(found || null)
        setError(found ? null : 'Product not found')
      } catch (e) {
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Load reviews from backend
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const numericId = Number(decodeURIComponent(id))
      if (Number.isNaN(numericId)) return
      const res = await fetchReviews(numericId)
      if (!mounted) return
      if (res?.ok) {
        setReviews(res.reviews || [])
        setAverage(res.average || 0)
      }
    })()
    return () => { mounted = false }
  }, [id])

  const suggestions = useMemo(() => {
    if (!product) return []
    const currentId = product.id
    const mapped = allProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      img: p.image_128 ? `data:image/png;base64,${p.image_128}` : null,
    }))
    return mapped.filter((p) => p.id !== currentId).slice(0, 8)
  }, [allProducts, product])

  const averageRating = average

  async function onSubmitReview(e) {
    e.preventDefault()
    if (!reviewName.trim() || !reviewText.trim()) return
    const numericId = Number(decodeURIComponent(id))
    if (Number.isNaN(numericId)) return
    const res = await submitReview(numericId, { name: reviewName.trim(), text: reviewText.trim(), rating: reviewRating })
    if (res?.ok) {
      setReviews((prev) => [res.review, ...prev])
      // Recompute average by refetching or local calc
      const rlist = [res.review, ...reviews]
      const sum = rlist.reduce((a, r) => a + (r.rating || 0), 0)
      setAverage(Math.round((sum / rlist.length) * 10) / 10)
      setReviewName('')
      setReviewText('')
      setReviewRating(5)
    }
  }

  if (loading) {
    return (
      <main className="page">
        <section className="section"><div>Loading…</div></section>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="page">
        <section className="section">
          <div className="hint">{error || 'Product not found'}</div>
          <Link to="/shop" className="btn ghost" style={{ marginTop: 12 }}>Back to Shop</Link>
        </section>
      </main>
    )
  }

  const displayProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency || 'QAR',
    img: product.image_128 ? `data:image/png;base64,${product.image_128}` : null,
  }

  return (
    <main className="page">
      <section className="section">
        <nav style={{ marginBottom: 16 }} aria-label="Breadcrumbs">
          <Link to="/shop" className="link">Shop</Link>
          <span style={{ margin: '0 6px' }}>/</span>
          <span>{displayProduct.name}</span>
        </nav>

        <div className="product-details">
          <div className="product-media-large">
            {displayProduct.img ? (
              <img src={displayProduct.img} alt={displayProduct.name} />
            ) : (
              <div className="placeholder" aria-label={displayProduct.name} />
            )}
          </div>
          <div className="product-meta">
            <h2 className="section-title" style={{ marginTop: 0 }}>{displayProduct.name}</h2>
            <div className="product-price" style={{ fontSize: 18, marginBottom: 8 }}>
              {typeof displayProduct.price === 'number' ? `${displayProduct.currency} ${displayProduct.price.toFixed(2)}` : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StarDisplay value={Math.round(averageRating)} />
              <span style={{ fontSize: 14, color: '#666' }}>{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
            </div>
            <div className="form-actions" style={{ marginTop: 16 }}>
              <button
                className="btn primary"
                onClick={() => {
                  if (!user) { alert('Please login to add items to cart'); return }
                  addItem({ id: displayProduct.id || displayProduct.name, name: displayProduct.name, price: displayProduct.price, currency: displayProduct.currency, img: displayProduct.img })
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        <div className="reviews" style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 12 }}>Customer Reviews</h3>
          <form className="review-form" onSubmit={onSubmitReview} style={{ marginBottom: 16 }}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="r-name">Name</label>
                <input id="r-name" type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="form-field">
                <label>Rating</label>
                <StarInput value={reviewRating} onChange={setReviewRating} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="r-text">Review</label>
              <textarea id="r-text" rows={4} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your thoughts" required />
            </div>
            <div className="form-actions">
              <button className="btn ghost" type="submit">Submit Review</button>
            </div>
          </form>

          {reviews.length === 0 ? (
            <div className="hint">No reviews yet. Be the first to review this product.</div>
          ) : (
            <div className="review-list">
              {reviews.map((r) => (
                <div key={r.id} className="review-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong>{r.name}</strong>
                    <StarDisplay value={r.rating} />
                  </div>
                  <div style={{ fontSize: 13, color: '#666', margin: '4px 0 8px' }}>{new Date(r.date).toLocaleDateString()}</div>
                  <div>{r.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section" style={{ padding: 0, marginTop: 32 }}>
          <h3 style={{ marginBottom: 12 }}>You might also like</h3>
          <div className="products-grid">
            {suggestions.map((p) => {
              const to = `/product/${encodeURIComponent(p.id || p.name)}`
              return (
                <div key={p.id || p.name} className="product-card">
                  <Link to={to} className="product-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="product-thumb">
                      {p.img ? <img src={p.img} alt={p.name} /> : <div className="placeholder" aria-label={p.name} />}
                    </div>
                    <div className="product-info">
                      <div className="product-name">{p.name}</div>
                      <div className="product-price">{typeof p.price === 'number' ? `${p.currency || 'QAR'} ${p.price.toFixed(2)}` : ''}</div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}


