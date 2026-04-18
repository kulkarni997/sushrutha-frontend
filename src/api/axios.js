import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sushrutha_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sushrutha_token')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      window.location.href = '/unauthorized'
    }
    return Promise.reject(error)
  }
)

export default api
