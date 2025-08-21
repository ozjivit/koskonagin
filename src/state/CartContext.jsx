import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const STORAGE_KEY = 'kos_cart_v1'

const CartContext = createContext(null)

function cartReducer(state, action) {
	switch (action.type) {
		case 'INIT': {
			return action.payload
		}
		case 'ADD_ITEM': {
			const { id } = action.payload
			const existing = state.items.find((it) => it.id === id)
			let items
			if (existing) {
				items = state.items.map((it) => (it.id === id ? { ...it, qty: it.qty + (action.payload.qty || 1) } : it))
			} else {
				items = [...state.items, { ...action.payload, qty: action.payload.qty || 1 }]
			}
			return { ...state, items }
		}
		case 'REMOVE_ITEM': {
			return { ...state, items: state.items.filter((it) => it.id !== action.payload.id) }
		}
		case 'SET_QTY': {
			const { id, qty } = action.payload
			const items = state.items
				.map((it) => (it.id === id ? { ...it, qty } : it))
				.filter((it) => it.qty > 0)
			return { ...state, items }
		}
		case 'CLEAR': {
			return { ...state, items: [] }
		}
		default:
			return state
	}
}

function loadInitialState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) return JSON.parse(raw)
	} catch {}
	return { items: [] }
}

export function CartProvider({ children }) {
	const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState)

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
		} catch {}
	}, [state])

	const api = useMemo(() => ({
		items: state.items,
		totalQuantity: state.items.reduce((s, it) => s + it.qty, 0),
		totalPrice: state.items.reduce((s, it) => s + (it.price || 0) * it.qty, 0),
		addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
		removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: { id } }),
		setQty: (id, qty) => dispatch({ type: 'SET_QTY', payload: { id, qty } }),
		clear: () => dispatch({ type: 'CLEAR' }),
	}), [state])

	return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
	const ctx = useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within CartProvider')
	return ctx
} 