import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchProducts, fetchCategories } from '../api'
import { useToast } from '../state/ToastContext.jsx'
import { useCart } from '../state/CartContext.jsx'
import '../App.css'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialMin = searchParams.get('min')
  const initialMax = searchParams.get('max')
  const initialSort = searchParams.get('sort') || 'relevance'
  const initialCategoryId = searchParams.get('categoryId')
  const initialInStock = searchParams.get('inStock') === '1' || searchParams.get('inStock') === 'true'

  const [query, setQuery] = useState(initialQuery)
  const [minPrice, setMinPrice] = useState(initialMin ? Number(initialMin) : '')
  const [maxPrice, setMaxPrice] = useState(initialMax ? Number(initialMax) : '')
  const [sortBy, setSortBy] = useState(initialSort)
  const [categoryId, setCategoryId] = useState(initialCategoryId ? Number(initialCategoryId) : '')
  const [inStock, setInStock] = useState(initialInStock)

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addItem } = useCart()
  const toast = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const list = await fetchCategories()
        if (!mounted) return
        const tbOnly = (list || []).filter((c) => String(c.name || '').toLowerCase().includes('toronto beauty tb'))
        setCategories(tbOnly)
        if (tbOnly.length > 0) {
          setCategoryId(tbOnly[0].id)
        } else {
          setCategoryId('')
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  // Sync URL
  useEffect(() => {
    const trimmed = query.trim()
    const params = {}
    if (trimmed) params.q = trimmed
    if (minPrice !== '' && !Number.isNaN(Number(minPrice))) params.min = String(minPrice)
    if (maxPrice !== '' && !Number.isNaN(Number(maxPrice))) params.max = String(maxPrice)
    if (sortBy && sortBy !== 'relevance') params.sort = sortBy
    if (categoryId !== '' && !Number.isNaN(Number(categoryId))) params.categoryId = String(categoryId)
    if (inStock) params.inStock = '1'
    setSearchParams(params)
  }, [query, minPrice, maxPrice, sortBy, categoryId, inStock, setSearchParams])

  // Fetch server-side
  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const list = await searchProducts({
          q: query.trim() || undefined,
          min: minPrice !== '' ? Number(minPrice) : undefined,
          max: maxPrice !== '' ? Number(maxPrice) : undefined,
          categoryId: categoryId !== '' ? Number(categoryId) : undefined,
          inStock,
          sort: sortBy === 'relevance' ? undefined : sortBy,
          limit: 200,
        })
        if (!mounted) return
        setProducts(list.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          currency: p.currency,
          img: p.image_128 ? `data:image/png;base64,${p.image_128}` : null,
          rating: 5,
        })))
        setError(null)
      } catch (e) {
        setError('Failed to load products')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [query, minPrice, maxPrice, categoryId, inStock, sortBy])

  const resultCount = products.length

  function clearAll() {
    setQuery('')
    setMinPrice('')
    setMaxPrice('')
    setSortBy('relevance')
    // keep Toronto Beauty TB enforced if present
    if (categories.length > 0) {
      setCategoryId(categories[0].id)
    } else {
      setCategoryId('')
    }
    setInStock(false)
  }

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Search</h2>
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search products"
          />
        </div>
        <div className="search-controls">
          <input
            className="filter-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
            aria-label="Minimum price"
          />
          <input
            className="filter-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
            aria-label="Maximum price"
          />
          {categories.length > 0 && (
            <select
              className="filter-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
              aria-label="Filter by category"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            In stock only
          </label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort results"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A → Z</option>
            <option value="name_desc">Name: Z → A</option>
          </select>
          <button className="btn ghost" onClick={clearAll}>Clear</button>
        </div>
        {!loading && <div className="search-meta">{resultCount} result{resultCount === 1 ? '' : 's'}</div>}
        {loading && <div>Loading products…</div>}
        {error && <div className="hint">{error}</div>}
        {!loading && (
          <div className="products-grid">
            {products.map((p) => (
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
                  </div>
                </Link>
                <button
                  className="btn ghost"
                  onClick={() => { addItem({ id: p.id || p.name, name: p.name, price: p.price, currency: p.currency, img: p.img }); toast.success('Added to cart') }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
} 