import { useEffect, useState } from 'react'

export default function usePageLoading() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(false)
  }, [])
  return {
    loading,
  }
}
