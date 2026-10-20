import * as Sentry from '@sentry/react'
import { TriangleAlert } from 'lucide-react'
import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'ui/button'
import { EmptyState } from 'ui/empty-state'

// 頁面層級錯誤邊界：單一頁面渲染出錯（例如 API 暫時失敗、資料為空）時，只在內容區顯示說明，
// 側欄與頂列照常可用、可切到其他頁面——原本沒有錯誤邊界，任何一頁出錯整個後台就白畫面。
// 錯誤同時回報 Sentry；以路徑當 key，換頁即重置。
export const PageErrorFallback = () => (
  <div className="ui-root" role="alert">
    <EmptyState
      icon={TriangleAlert}
      title="這個頁面發生錯誤"
      description="資料可能暫時無法載入。請重新整理，或先切換到其他頁面；若持續發生請聯絡系統管理員。"
      action={
        <Button variant="primary" onClick={() => window.location.reload()}>
          重新整理
        </Button>
      }
    />
  </div>
)

export default function PageErrorBoundary({ resetKey, children }) {
  return (
    <Sentry.ErrorBoundary key={resetKey} fallback={<PageErrorFallback />}>
      {children}
    </Sentry.ErrorBoundary>
  )
}

PageErrorBoundary.propTypes = {
  resetKey: PropTypes.string,
  children: PropTypes.node,
}
