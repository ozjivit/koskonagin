import { useState } from 'react'
import { useAuth } from '../state/AuthContext.jsx'
import '../components/Auth.css'

export default function Signup() {
  const { signup } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signup({ username, email, password })
    if (!res.ok) setError(res.error || 'Signup failed')
    setLoading(false)
  }

  return (
    <main className="page">
      <div className="auth-card">
        <h2 className="auth-title">Create account</h2>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" required />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="hint error">{error}</div>}
          <div className="auth-actions">
            <div className="auth-switch">Already have an account? <a href="/login">Log in</a></div>
            <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
          </div>
        </form>
      </div>
    </main>
  )
}


