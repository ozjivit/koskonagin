import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'kos_wishlist_v1'

const WishlistContext = createContext(null)

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { items: [] }
}

export function WishlistProvider({ children }) {
  const [state, setState] = useState(loadInitial)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, [state])

  const api = useMemo(() => ({
    items: state.items,
    isInWishlist: (id) => state.items.some((it) => String(it.id) === String(id)),
    add: (product) => setState((s) => s.items.some((it) => String(it.id) === String(product.id)) ? s : { ...s, items: [...s.items, product] }),
    remove: (id) => setState((s) => ({ ...s, items: s.items.filter((it) => String(it.id) !== String(id)) })),
    toggle: (product) => setState((s) => s.items.some((it) => String(it.id) === String(product.id)) ? { ...s, items: s.items.filter((it) => String(it.id) !== String(product.id)) } : { ...s, items: [...s.items, product] }),
    clear: () => setState({ items: [] }),
  }), [state])

  return <WishlistContext.Provider value={api}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}


