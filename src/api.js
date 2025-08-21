// Use Render backend by default; can be overridden with VITE_API_BASE
const API_BASE = import.meta.env.VITE_API_BASE || 'https://backend-r5ha.onrender.com'

export async function fetchProducts(limit = 24) {
  const res = await fetch(`${API_BASE}/api/products?limit=${encodeURIComponent(limit)}`)
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  const data = await res.json()
  return data.products || []
}

export async function searchProducts({ q, min, max, categoryId, inStock, sort, limit = 200 } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (typeof min === 'number') params.set('min', String(min))
  if (typeof max === 'number') params.set('max', String(max))
  if (typeof categoryId === 'number') params.set('categoryId', String(categoryId))
  if (typeof inStock === 'boolean') params.set('inStock', inStock ? '1' : '0')
  if (sort) params.set('sort', sort)
  if (limit) params.set('limit', String(limit))
  const res = await fetch(`${API_BASE}/api/products?${params.toString()}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.products || []
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.categories || []
} 

export async function submitContact({ name, email, message }) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
  if (!res.ok) {
    const err = await safeJson(res)
    return { ok: false, error: err?.error || `API error: ${res.status}` }
  }
  const data = await res.json()
  return data
}

export async function fetchReviews(productId) {
  const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(productId)}/reviews`)
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function submitReview(productId, { name, text, rating }) {
  const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, text, rating }),
  })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

async function safeJson(res) {
  try { return await res.json() } catch { return null }
}

// Auth APIs
export async function signup({ username, email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password })
  })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function login({ email, username, password }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, username, password })
  })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function fetchMe(token) {
  const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function logout(token) {
  const res = await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

// Orders (COD only)
export async function createOrder(payload) {
  const token = localStorage.getItem('auth_token') || ''
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function fetchMyOrders() {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return { ok: false, error: 'Not authenticated' }
  const res = await fetch(`${API_BASE}/api/orders/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function fetchAdminOrders() {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return { ok: false, error: 'Not authenticated' }
  const res = await fetch(`${API_BASE}/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

// Real-time admin events (SSE)
export function openAdminEventStream() {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return null
  const url = new URL(`${API_BASE}/api/admin/events`)
  url.searchParams.set('token', token)
  const ev = new EventSource(url.toString())
  return ev
}

// Admin: users and order status
export async function fetchAdminUsers() {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return { ok: false, error: 'Not authenticated' }
  const res = await fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function updateOrderStatus(orderId, status) {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return { ok: false, error: 'Not authenticated' }
  const res = await fetch(`${API_BASE}/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function setUserAdmin(userId, isAdmin) {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return { ok: false, error: 'Not authenticated' }
  const res = await fetch(`${API_BASE}/api/auth/users/${encodeURIComponent(userId)}/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isAdmin: !!isAdmin }),
  })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

// Rewards
export async function fetchRewardBalance() {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return { ok: false, error: 'Not authenticated' }
  const res = await fetch(`${API_BASE}/api/rewards/balance`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}

export async function fetchRewardHistory() {
  const token = localStorage.getItem('auth_token') || ''
  if (!token) return { ok: false, error: 'Not authenticated' }
  const res = await fetch(`${API_BASE}/api/rewards/history`, { headers: { Authorization: `Bearer ${token}` } })
  const data = await safeJson(res)
  if (!res.ok) return { ok: false, error: data?.error || `API error: ${res.status}` }
  return data
}