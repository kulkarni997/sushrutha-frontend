import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-6">
      <span className="font-display text-9xl text-border font-normal">404</span>
      <h1 className="font-display text-3xl text-cream mt-4">Page not found</h1>
      <p className="font-sans text-sm text-muted mt-2 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-turmeric text-bg font-sans text-sm px-8 py-3 rounded-full hover:bg-sandalwood transition-all duration-300"
      >
        Go Home
      </button>
    </div>
  )
}
