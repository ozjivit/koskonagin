import { Link } from 'react-router-dom'
import { useWishlist } from '../state/WishlistContext.jsx'
import '../App.css'

export default function Wishlist() {
  const { items, remove, clear } = useWishlist()
  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Wishlist</h2>
        {items.length === 0 ? (
          <div className="hint">Your wishlist is empty.</div>
        ) : (
          <>
            <button className="btn ghost" onClick={clear} style={{ marginBottom: 12 }}>Clear All</button>
            <div className="products-grid">
              {items.map((p) => (
                <div key={p.id || p.name} className="product-card">
                  <Link to={`/product/${encodeURIComponent(p.id || p.name)}`} className="product-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="product-thumb">{p.img ? <img src={p.img} alt={p.name} /> : <div className="placeholder" aria-label={p.name} />}</div>
                    <div className="product-info">
                      <div className="product-name">{p.name}</div>
                      <div className="product-price">{typeof p.price === 'number' ? `QAR ${p.price.toFixed(2)}` : ''}</div>
                    </div>
                  </Link>
                  <button className="btn" onClick={() => remove(p.id)}>Remove</button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}


