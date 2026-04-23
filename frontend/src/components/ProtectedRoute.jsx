import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const unlocked = localStorage.getItem('tr_admin_unlocked') === 'true'
  if (!unlocked) return <Navigate to="/" replace />
  return children
}
