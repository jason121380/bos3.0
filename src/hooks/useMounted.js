import React from 'react'

export default function (callback) {
  const isMounted = React.useRef(false)
  React.useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const useCallbackRef = React.useRef(callback)

  React.useEffect(() => {
    if (isMounted.current) {
      useCallbackRef.current()
    }
  }, [isMounted])
  return isMounted.current
}
