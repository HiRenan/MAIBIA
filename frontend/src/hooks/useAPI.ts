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
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetcherRef.current().then((result) => {
      if (cancelled) return
      if (result !== null) {
        setData(result)
      } else {
        setError(true)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}
