import { useEffect, useState } from 'react'
import { fetchRewardBalance, fetchRewardHistory } from '../api'
import '../App.css'

export default function Rewards() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [balance, setBalance] = useState({ points: 0, tier: 'Bronze', earnRate: 1, redeemRate: 0.05, maxRedeemPct: 0.5, expiryMonths: 24, nextExpiryAt: null })
  const [history, setHistory] = useState([])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const [b, h] = await Promise.all([
          fetchRewardBalance(),
          fetchRewardHistory(),
        ])
        if (!mounted) return
        if (!b?.ok) throw new Error(b?.error || 'Failed to load balance')
        if (!h?.ok) throw new Error(h?.error || 'Failed to load history')
        setBalance({ points: b.points, tier: b.tier, earnRate: b.earnRate, redeemRate: b.redeemRate, maxRedeemPct: b.maxRedeemPct, expiryMonths: b.expiryMonths, nextExpiryAt: b.nextExpiryAt })
        setHistory(h.history || [])
        setError(null)
      } catch (e) {
        setError(e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <main className="page">
      <section className="section">
        <h2 className="section-title">Rewards</h2>
        {loading && <div>Loading rewards…</div>}
        {error && <div className="hint error">{error}</div>}
        {!loading && !error && (
          <>
            <div className="contact-card" style={{ marginBottom: 16 }}>
              <div className="contact-aside" style={{ width: '100%' }}>
                <div className="contact-aside-title">Your balance</div>
                <div className="contact-aside-list">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Points</span>
                    <strong>{balance.points} pts</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tier</span>
                    <strong>{balance.tier}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Earn rate</span>
                    <span>1 QAR = {balance.earnRate} pt</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Redeem rate</span>
                    <span>1 pt = QAR {balance.redeemRate.toFixed(2)}</span>
                  </div>
                  <div className="hint">Redeem up to {(balance.maxRedeemPct * 100).toFixed(0)}% of an order. Points expire after {balance.expiryMonths} months{balance.nextExpiryAt ? `; next expiry: ${new Date(balance.nextExpiryAt).toLocaleDateString()}` : ''}.</div>
                </div>
              </div>
            </div>
            <h3 style={{ margin: '12px 0' }}>History</h3>
            {history.length === 0 ? (
              <div className="hint">No reward activity yet.</div>
            ) : (
              <div className="contact-card">
                <div className="contact-aside-list" style={{ width: '100%' }}>
                  {history.map((t) => (
                    <div key={t._id || `${t.type}_${t.createdAt}_${t.delta}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{new Date(t.createdAt).toLocaleDateString()} — {t.type === 'earn' ? 'Earned' : 'Redeemed'}</span>
                      <span style={{ color: t.type === 'earn' ? 'green' : 'crimson' }}>{t.delta > 0 ? `+${t.delta}` : t.delta} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}


