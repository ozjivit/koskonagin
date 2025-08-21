import { useState } from 'react'
import { useAuth } from '../state/AuthContext.jsx'
import '../components/Auth.css'

export default function Login() {
  const { login } = useAuth()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const creds = emailOrUsername.includes('@') ? { email: emailOrUsername, password } : { username: emailOrUsername, password }
    const res = await login(creds)
    if (!res.ok) setError(res.error || 'Login failed')
    setLoading(false)
  }

  return (
    <main className="page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label htmlFor="id">Email or Username</label>
            <input id="id" value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} placeholder="you@example.com or yourname" required />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="hint error">{error}</div>}
          <div className="auth-actions">
            <div className="auth-switch">No account? <a href="/signup">Sign up</a></div>
            <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
          </div>
        </form>
      </div>
    </main>
  )
}


