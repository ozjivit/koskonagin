import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import '../components/Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    const creds = emailOrUsername.includes('@') ? { email: emailOrUsername, password } : { username: emailOrUsername, password }
    const res = await login(creds)
    
    if (res.ok) {
      setSuccess('Login successful! Redirecting to home page...')
      // Redirect to home page after 1.5 seconds
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } else {
      setError(res.error || 'Login failed')
    }
    
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
          {success && <div className="hint success">{success}</div>}
          <div className="auth-actions">
            <div className="auth-switch">No account? <Link to="/signup">Sign up</Link></div>
            <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</button>
          </div>
        </form>
      </div>
    </main>
  )
}


