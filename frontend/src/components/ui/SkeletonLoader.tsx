interface SkeletonLoaderProps {
  lines?: number
  className?: string
}

export default function SkeletonLoader({ lines = 3, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-border-subtle/30"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl border border-border-subtle/20 bg-bg-card/15 p-5 ${className}`}>
      <div className="mb-3 h-4 w-1/3 rounded-full bg-border-subtle/30" />
      <div className="mb-2 h-3 w-2/3 rounded-full bg-border-subtle/20" />
      <div className="h-3 w-1/2 rounded-full bg-border-subtle/20" />
    </div>
  )
}
