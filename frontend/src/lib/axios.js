import axios from "axios";

// Correct the environment check
const RENDER_BASE = 'https://backend-r5ha.onrender.com'
const axiosInstance = axios.create({
  // Prefer explicit VITE_API_BASE; fallback to Render; keep /api for same-origin production if needed
  baseURL: (import.meta.env.VITE_API_BASE || RENDER_BASE) + '/api',
  withCredentials: true,
});

export default axiosInstance;
