import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import { Suspense } from 'react'
import { renderRoutes } from 'react-router-config'
import PageLoadingFallback from 'components/PageLoadingFallback'

// 顧客端外框（手機優先，多半由 LINE 開啟）：淺灰底、內容置中、最大寬 480px
function Auth({ route }) {
  return (
    <>
      <Snackbar />
      {/* 手機上輸入框字級需 ≥16px，否則 iOS（含 LINE 內開啟）聚焦時會自動放大畫面 */}
      <div className="ui-root min-h-screen overflow-x-hidden bg-canvas max-sm:[&_input]:!text-[16px] max-sm:[&_select]:!text-[16px] max-sm:[&_[data-ui-select]]:!text-[16px] max-sm:[&_textarea]:!text-[16px]">
        <div className="mx-auto w-full max-w-[480px] px-4 py-6">
          <Suspense fallback={<PageLoadingFallback />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
    </>
  )
}

Auth.propTypes = {
  route: PropTypes.object,
}

export default Auth
