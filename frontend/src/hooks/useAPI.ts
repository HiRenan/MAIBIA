import { useState, useEffect, useRef } from 'react'

/**
 * Hook for fetching API data with graceful fallback.
 * If the API call fails, returns the fallback value.
 */
export function useAPI<T>(fetcher: () => Promise<T | null>, fallback: T): {
  data: T
  loading: boolean
  error: boolean
} {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    let cancelled = false

    fetcherRef.current()
      .then((result) => {
        if (cancelled) return
        if (result !== null) {
          setData(result)
        } else {
          setError(true)
        }
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
