import { useEffect, useState } from 'react'
import { fetchMyOrders } from '../api'
import { useAuth } from '../state/AuthContext.jsx'
import '../App.css'

export default function Orders() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError('')
      const res = await fetchMyOrders()
      if (!mounted) return
      if (res?.ok) setOrders(res.orders || [])
      else setError(res?.error || 'Failed to load orders')
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  if (!user) {
    return (
      <main className="page">
        <section className="section"><div className="hint">Please login to view your orders.</div></section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">My Orders</h2>
        {loading && <div>Loading orders…</div>}
        {error && <div className="hint">{error}</div>}
        <div className="orders-list" style={{ display: 'grid', gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} className="order-card" style={{ background: 'var(--card)', borderRadius: '14px', boxShadow: 'var(--shadow)', padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div><strong>Order #{o.id}</strong></div>
                <div style={{ color: '#666' }}>{new Date(o.date || o.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {(o.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{it.name} × {it.qty}</span>
                    <span>QAR {(Number(it.price || 0) * (it.qty || 1)).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 6 }}>
                  <span>Total</span>
                  <span>QAR {Number(o.totals?.total || 0).toFixed(2)}</span>
                </div>
                {o.status && <div className="hint">Status: {o.status}</div>}
              </div>
            </div>
          ))}
          {!loading && orders.length === 0 && <div className="hint">No orders yet.</div>}
        </div>
      </section>
    </main>
  )
}


