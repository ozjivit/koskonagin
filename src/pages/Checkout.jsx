import { useEffect, useState } from 'react'
import { createOrder, fetchRewardBalance } from '../api'
import { useCart } from '../state/CartContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import '../App.css'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice, clear } = useCart()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postal, setPostal] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [reward, setReward] = useState({ loading: false, points: 0, redeemRate: 0.05, earnRate: 1, tier: 'Bronze', maxRedeemPct: 0.5 })
  const [redeemPoints, setRedeemPoints] = useState(0)

  useEffect(() => {
    let mounted = true
    if (!user) return
    setReward((r) => ({ ...r, loading: true }))
    ;(async () => {
      const res = await fetchRewardBalance()
      if (!mounted) return
      if (res?.ok) setReward({ loading: false, points: res.points, redeemRate: res.redeemRate, earnRate: res.earnRate, tier: res.tier, maxRedeemPct: res.maxRedeemPct })
      else setReward((r) => ({ ...r, loading: false }))
    })()
    return () => { mounted = false }
  }, [user])

  async function onSubmit(e) {
    e.preventDefault()
    if (items.length === 0) {
      setResult({ ok: false, msg: 'Your cart is empty.' })
      return
    }
    setSubmitting(true)
    setResult(null)
    try {
      const payload = {
        customer: { name, phone, email, address, city, postal, note },
        items: items.map((it) => ({ id: it.id, name: it.name, price: it.price, qty: it.qty, currency: it.currency })),
        totals: { subtotal: totalPrice, shipping: 0, total: totalPrice },
        rewards: user ? { redeemPoints: redeemPoints || 0 } : undefined,
        payment: { method: 'cod' },
      }
      const res = await createOrder(payload)
      if (res && res.ok) {
        clear()
        const rw = res.rewards
        const rewardMsg = rw ? ` Earned ${rw.earnedPoints} pts${rw.appliedDiscountQar > 0 ? `, used ${rw.appliedRedeemPoints} pts (-QAR ${rw.appliedDiscountQar.toFixed(2)})` : ''}.` : ''
        setResult({ ok: true, msg: `Order placed! Pay cash on delivery.${rewardMsg}` })
        setTimeout(() => navigate('/'), 1200)
      } else {
        setResult({ ok: false, msg: res?.error || 'Failed to place order' })
      }
    } catch (err) {
      setResult({ ok: false, msg: err.message || 'Failed to place order' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Checkout</h2>
        <div className="contact-card">
          <form className="contact-form" onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="email">Email (optional)</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="postal">Postal code</label>
                <input id="postal" value={postal} onChange={(e) => setPostal(e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="address">Address</label>
              <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="city">City</label>
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="note">Note to courier (optional)</label>
              <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Payment method</label>
              <div className="hint">Cash on delivery only</div>
            </div>
            <div className="form-actions">
              <button className="btn primary" type="submit" disabled={submitting}>
                {submitting ? 'Placing order…' : 'Place order (COD)'}
              </button>
            </div>
            {result && (
              <div className={`hint ${result.ok ? 'success' : 'error'}`}>{result.msg}</div>
            )}
          </form>

          <div className="contact-aside">
            <div className="contact-aside-title">Order summary</div>
            <div className="contact-aside-list">
              {items.map((it) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it.name} × {it.qty}</span>
                  <span>QAR {(Number(it.price || 0) * it.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Total</span>
                <span>QAR {totalPrice.toFixed(2)}</span>
              </div>
              {user && (
                <div style={{ marginTop: 12 }}>
                  <div className="contact-aside-title" style={{ marginBottom: 6 }}>Rewards</div>
                  {reward.loading ? (
                    <div>Loading rewards…</div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Balance</span>
                        <span>{reward.points} pts • {reward.tier}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Redeem rate</span>
                        <span>1 pt = QAR {reward.redeemRate.toFixed(2)}</span>
                      </div>
                      <div className="form-field" style={{ marginTop: 8 }}>
                        <label htmlFor="redeem">Redeem points</label>
                        <input
                          id="redeem"
                          type="number"
                          min="0"
                          max={reward.points}
                          value={redeemPoints}
                          onChange={(e) => setRedeemPoints(Math.max(0, Math.min(Number(e.target.value || 0), reward.points)))}
                        />
                        <div className="hint">Discount: QAR {(redeemPoints * reward.redeemRate).toFixed(2)} (max {(reward.maxRedeemPct * 100).toFixed(0)}% of order)</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="hint">Pay cash upon delivery.</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


