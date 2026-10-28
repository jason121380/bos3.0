import { implicitApiNotice } from 'lib/api-base'

// 未設定 REACT_APP_API_URL 且網址會被擋下（IP、預覽、認不得的網域）時，固定在畫面上方說明目前連的是測試環境。
// 核准的正式站與 localhost／含 dev 的開發網域不顯示。envUrl 傳 null 表示忽略環境變數（測試用）。
function ApiEnvBanner({ href, envUrl = process.env.REACT_APP_API_URL }) {
  const notice = implicitApiNotice(envUrl, href)
  if (!notice) return null
  return (
    <div
      role="status"
      data-testid="api-env-banner"
      className="ui-root border-b border-warning/40 bg-warning/15 px-4 py-2 text-center text-label text-text"
    >
      {notice}
    </div>
  )
}

export default ApiEnvBanner
