import { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext.jsx'
import { fetchAdminOrders, fetchAdminUsers, openAdminEventStream, updateOrderStatus, setUserAdmin } from '../api'
import '../App.css'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const [ordersRes, usersRes] = await Promise.all([fetchAdminOrders(), fetchAdminUsers()])
      if (!mounted) return
      if (ordersRes?.ok) setOrders(ordersRes.orders || [])
      else setError(ordersRes?.error || 'Failed to load')
      if (usersRes?.ok) setUsers(usersRes.users || [])
      else setError(usersRes?.error || 'Failed to load users')
      setLoading(false)
    })()
    const ev = openAdminEventStream()
    if (ev) {
      ev.addEventListener('message', (e) => {
        try {
          const payload = JSON.parse(e.data)
          if (payload?.type === 'order.created' && payload?.order) {
            setOrders((prev) => [payload.order, ...prev])
          }
          if (payload?.type === 'order.updated' && payload?.order) {
            setOrders((prev) => prev.map((o) => (String(o.id) === String(payload.order.id) ? payload.order : o)))
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
        <h2 className="section-title">Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className={`btn ${tab === 'orders' ? 'primary' : ''}`} style={{ padding: '8px 12px' }} onClick={() => setTab('orders')}>Orders</button>
          <button className={`btn ${tab === 'users' ? 'primary' : ''}`} style={{ padding: '8px 12px' }} onClick={() => setTab('users')}>Users</button>
        </div>

        {loading && <div>Loading…</div>}
        {error && <div className="hint">{error}</div>}

        {tab === 'orders' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {orders.map((o) => (
              <div key={o.id} className="order-card" style={{ background: 'var(--card)', borderRadius: '14px', boxShadow: 'var(--shadow)', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><strong>#{o.id}</strong> — {o.customer?.name}</div>
                  <div style={{ color: '#666' }}>{new Date(o.date).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'center' }}>
                  <div>{o.customer?.phone}</div>
                  <div>Total: QAR {Number(o.totals?.total || 0).toFixed(2)}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>Status:</span>
                    <select value={o.status} onChange={async (e) => {
                      const next = e.target.value
                      const res = await updateOrderStatus(o.id, next)
                      if (res?.ok) setOrders((prev) => prev.map((x) => (String(x.id) === String(o.id) ? res.order : x)))
                    }}>
                      <option value="placed">placed</option>
                      <option value="confirmed">confirmed</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div style={{ display: 'grid', gap: 8 }}>
            {users.map((u) => (
              <div key={u.id} style={{ background: 'var(--card)', borderRadius: '12px', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div><strong>{u.username}</strong> <span style={{ color: '#666' }}>({u.email})</span></div>
                  <div style={{ color: '#666', fontSize: 12 }}>Joined: {new Date(u.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="tag" style={{ marginRight: 10 }}>{u.isAdmin ? 'Admin' : 'User'}</span>
                  <button className="btn" onClick={async () => {
                    const next = !u.isAdmin
                    const res = await setUserAdmin(u.id, next)
                    if (res?.ok) setUsers((prev) => prev.map((x) => (String(x.id) === String(u.id) ? { ...x, isAdmin: next } : x)))
                  }}>{u.isAdmin ? 'Revoke Admin' : 'Make Admin'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}


