import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// Attach token from localStorage on every request
client.interceptors.request.use(config => {
  const token = localStorage.getItem('tr_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default client
