import { useEffect, useState } from 'react'
import { fetchAdminOrders, openAdminEventStream } from '../api'
import { useAuth } from '../state/AuthContext.jsx'
import '../App.css'

export default function AdminOrders() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await fetchAdminOrders()
      if (!mounted) return
      if (res?.ok) setOrders(res.orders || [])
      else setError(res?.error || 'Failed to load')
      setLoading(false)
    })()
    // Subscribe to real-time admin events
    const ev = openAdminEventStream()
    if (ev) {
      ev.addEventListener('message', (e) => {
        try {
          const payload = JSON.parse(e.data)
          if (payload?.type === 'order.created' && payload?.order) {
            setOrders((prev) => [payload.order, ...prev])
          }
        } catch {}
      })
      ev.addEventListener('error', () => {})
    }
    return () => { mounted = false; if (ev) ev.close() }
  }, [])

  if (!user?.isAdmin) {
    return (
      <main className="page"><section className="section"><div className="hint">Access denied.</div></section></main>
    )
  }

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Admin: Orders</h2>
        {loading && <div>Loading…</div>}
        {error && <div className="hint">{error}</div>}
        <div style={{ display: 'grid', gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} className="order-card" style={{ background: 'var(--card)', borderRadius: '14px', boxShadow: 'var(--shadow)', padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><strong>#{o.id}</strong> — {o.customer?.name}</div>
                <div style={{ color: '#666' }}>{new Date(o.date).toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <div>{o.customer?.phone}</div>
                <div>Total: QAR {Number(o.totals?.total || 0).toFixed(2)}</div>
                <div>Status: {o.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}



