import { useCart } from '../state/CartContext.jsx'
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function Cart() {
  const { items, totalPrice, setQty, removeItem, clear } = useCart()
  const navigate = useNavigate()

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Your Cart</h2>
        {items.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          <div className="cart-list">
            {items.map((it) => (
              <div key={it.id} className="cart-row">
                <div className="cart-thumb">
                  {it.img ? <img src={it.img} alt={it.name} /> : <div className="placeholder" />}
                </div>
                <div className="cart-info">
                  <div className="cart-name">{it.name}</div>
                  <div className="cart-price">{it.currency ? it.currency + ' ' : '$'}{Number(it.price || 0).toFixed(2)}</div>
                </div>
                <div className="cart-qty">
                  <button className="btn" onClick={() => setQty(it.id, Math.max(0, it.qty - 1))}>-</button>
                  <div className="qty-num">{it.qty}</div>
                  <button className="btn" onClick={() => setQty(it.id, it.qty + 1)}>+</button>
                </div>
                <button className="btn ghost" onClick={() => removeItem(it.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
        <div className="cart-summary">
          <div className="cart-total">Total: QAR {totalPrice.toFixed(2)}</div>
          <div className="cart-actions">
            <button className="btn ghost" onClick={clear}>Clear</button>
            <button className="btn primary" onClick={() => navigate('/checkout')}>Checkout (COD)</button>
          </div>
        </div>
      </section>
    </main>
  )
} 