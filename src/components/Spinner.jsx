export default function Spinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-border
                      border-t-turmeric rounded-full animate-spin" />
      {message && (
        <p className="font-sans text-sm text-muted animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}
