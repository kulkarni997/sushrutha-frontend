import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
          <h1 className="font-display text-2xl text-textMain">Something went wrong</h1>
          <p className="text-muted text-sm">Please reload the page</p>
          <button
            className="rounded-full border border-primary text-primary px-6 py-2 text-sm hover:bg-primary hover:text-bg transition-all duration-200"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
