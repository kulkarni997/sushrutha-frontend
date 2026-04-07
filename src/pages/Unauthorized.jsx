import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Unauthorized() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user?.role

  function handleDashboard() {
    if (role === 'patient') navigate('/scan')
    else if (role === 'doctor') navigate('/doctor/dashboard')
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
      <span className="font-display text-9xl text-border font-normal">403</span>
      <h1 className="font-display text-3xl text-cream mt-4">Access restricted</h1>
      <p className="font-sans text-sm text-muted mt-2 mb-8">
        You don&apos;t have permission to view this page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-turmeric text-bg font-sans text-sm px-8 py-3 rounded-full hover:bg-sandalwood transition-all duration-300"
        >
          Go Home
        </button>
        <button
          onClick={handleDashboard}
          className="border border-turmeric text-turmeric font-sans text-sm px-8 py-3 rounded-full hover:bg-turmeric hover:text-bg transition-all duration-300"
        >
          My dashboard
        </button>
      </div>
    </div>
  )
}
