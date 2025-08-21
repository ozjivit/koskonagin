import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../state/CartContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useToast } from '../state/ToastContext.jsx'
import { fetchProducts } from '../api'
import '../App.css'

function StarRating({ value = 5 }) {
  return (
    <div className="rating" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'star filled' : 'star'}>★</span>
      ))}
    </div>
  )
}

export default function Shop() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [sort, setSort] = useState('')
  const { addItem } = useCart()
  const { user } = useAuth()
  const toast = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchProducts(200)
        if (!mounted) return
        setItems(data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          currency: p.currency,
          img: p.image_128 ? `data:image/png;base64,${p.image_128}` : null,
          rating: 5,
        })))
      } catch (e) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const filtered = items.filter((p) => {
    const nameOk = q ? String(p.name).toLowerCase().includes(q.toLowerCase()) : true
    const minOk = min ? Number(p.price) >= Number(min) : true
    const maxOk = max ? Number(p.price) <= Number(max) : true
    return nameOk && minOk && maxOk
  }).sort((a, b) => {
    if (sort === 'price_asc') return (a.price||0) - (b.price||0)
    if (sort === 'price_desc') return (b.price||0) - (a.price||0)
    if (sort === 'name_asc') return String(a.name).localeCompare(String(b.name))
    if (sort === 'name_desc') return String(b.name).localeCompare(String(a.name))
    return 0
  })

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Shop</h2>
        <div className="search-controls">
          <input className="filter-input" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className="filter-input" placeholder="Min QAR" value={min} onChange={(e) => setMin(e.target.value)} />
          <input className="filter-input" placeholder="Max QAR" value={max} onChange={(e) => setMax(e.target.value)} />
          <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
          </select>
        </div>
        {loading && <div>Loading products…</div>}
        {error && <div className="hint">{error}</div>}
        <div className="products-grid">
          {filtered.map((p) => (
            <div key={p.id || p.name} className="product-card">
              <Link to={`/product/${encodeURIComponent(p.id || p.name)}`} className="product-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-thumb">
                  {p.img ? (
                    <img src={p.img} alt={p.name} />
                  ) : (
                    <div className="placeholder" aria-label={p.name} />
                  )}
                </div>
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-price">{typeof p.price === 'number' ? `QAR ${p.price.toFixed(2)}` : ''}</div>
                  <StarRating value={p.rating} />
                </div>
              </Link>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                className="btn ghost"
                onClick={() => {
                  if (!user) { toast.error('Please login to add items to cart'); return }
                  addItem({ id: p.id || p.name, name: p.name, price: p.price, currency: 'QAR', img: p.img });
                  toast.success('Added to cart')
                }}
              >
                Add to Cart
              </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
} 