import { LoaderCircle } from 'lucide-react'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'

// 頁面程式（lazy chunk）下載中的佔位（2026/10/28）：原本只有頂端一條 2px 細線，內容區全白，
// 網路慢時看起來像白頁。頂端細線維持；超過 delay 毫秒還沒載完，才在內容區中央顯示轉圈與「載入中…」，
// 快的時候不會閃一下。轉圈規格依 STYLE.md §6（LoaderCircle、h-10 w-10、text-accent、strokeWidth 1.75）。
export const SHOW_SPINNER_DELAY = 300

export default function PageLoadingFallback({ delay = SHOW_SPINNER_DELAY }) {
  const [showSpinner, setShowSpinner] = useState(delay <= 0)
  useEffect(() => {
    if (delay <= 0) return undefined
    const timer = setTimeout(() => setShowSpinner(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  return (
    <div className="ui-root" role="status" aria-live="polite">
      <div aria-hidden="true" className="h-0.5 w-full animate-pulse bg-accent" />
      {showSpinner ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-text-secondary">
          <LoaderCircle aria-hidden="true" className="h-10 w-10 animate-spin text-accent" strokeWidth={1.75} />
          <span className="text-body">載入中…</span>
        </div>
      ) : (
        <span className="sr-only">載入中…</span>
      )}
    </div>
  )
}

PageLoadingFallback.propTypes = {
  delay: PropTypes.number,
}
