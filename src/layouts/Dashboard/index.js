import ChangePassword from 'components/ChangePassword'
import PageErrorBoundary from 'components/PageErrorBoundary'
import PageLoadingFallback from 'components/PageLoadingFallback'
import { getDeviceTimeZone, isBusinessTimeZoneInstalled } from 'lib/business-timezone'
import { applyStoredTheme } from 'lib/theme-mode'
import Snackbar, { openSnackbar } from 'elements/snackbars'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import React, { Suspense, useEffect, useLayoutEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { renderRoutes } from 'react-router-config'
import useFetchCheckPageAuthority from 'hooks/useFetchCheckPageAuthority'
import { shouldBypassPageAuthority } from 'helper/engineeringMode'
import useFetchGetUserMerchant from 'hooks/useFetchGetUserMerchant'
import useAfterFirstLoad, { useHoldFirstLoad } from 'lib/after-first-load'
import idx from 'idx'
import { Sidebar, SidebarHeader, SIDEBAR_EXPANDED_MAIN_CLASS, SIDEBAR_RAIL_MAIN_CLASS } from 'ui/sidebar'
import { cn } from 'ui/utils'

import { MobileAppBar, MobileTabBar, useMobileTabs, useShowTabBar } from './MobileNav'
import NavBar from './NavBar'
import TopBar from './TopBar'

// 頁面程式（lazy chunk）下載中的佔位：存在期間不放行首屏延後的查詢（lib/after-first-load）
function PageLoading() {
  useHoldFirstLoad()
  return <PageLoadingFallback />
}

function Dashboard({ route, location }) {
  const [openNavBarMobile, setOpenNavBarMobile] = useState(false)
  const [openNavBarDesktop, setOpenNavBarDesktop] = useState(true)
  const [url, setUrl] = useState(location.pathname)
  const { open, toggle } = useToggle()
  const history = useHistory()
  const [checkPageAuthorityLazy, checkPageAuthorityData] = useFetchCheckPageAuthority()
  // 切換店家清單只在開啟對話框時用到，延後到首屏完成後再查（lib/after-first-load）
  const userMerchants = useFetchGetUserMerchant({ skip: !useAfterFirstLoad() })
  const mobileTabs = useMobileTabs()
  const showTabBar = useShowTabBar(mobileTabs)

  // 深淺色：繪製前先套用此使用者上次的主題，不必等個人資料查詢回來（避免深色使用者先看到淺色）
  useLayoutEffect(() => {
    applyStoredTheme()
  }, [])

  // 回傳 unlisten：原本每次換頁都多掛一個永不釋放的監聽
  useEffect(() => history.listen((location) => {
    setUrl(location.pathname)
  }), [history])

  // 裝置不在台灣時區時，每次開啟提示一次：畫面上的日期時間與報表區間都以台灣時間為準（避免出國時誤以為是當地時間）
  useEffect(() => {
    if (!isBusinessTimeZoneInstalled()) return
    try {
      if (sessionStorage.getItem('businessTimeZoneNotice')) return
      sessionStorage.setItem('businessTimeZoneNotice', '1')
    } catch (e) {
      // 無法使用 sessionStorage 時仍提示
    }
    openSnackbar({
      message: `此裝置時區為 ${getDeviceTimeZone() || '非台灣時區'}。系統的日期時間與報表區間一律以台灣時間顯示與計算。`,
      variant: 'info',
      disableHide: true,
    })
  }, [])

  useEffect(() => {
    // 工程模式沒有後端頁面權限項目。若仍送 checkPageAuthority，未知網址會被導回個人頁，高階主管也進不去。
    if (shouldBypassPageAuthority(url)) return
    const user = JSON.parse(localStorage.getItem('user'))
    // 未登入（無 user）時由 NavBar 導向登入頁；這裡直接略過，避免讀 null.id 拋錯
    if (!user) return
    const input = {
      id: user.id,
      url: url,
      page: null,
      currentTab: null
    }
    const tab = url.split('/').pop()
    if (url.includes('/profile/')) {
      input.page = 'PROFILE'
      input.currentTab = tab
      if (tab === 'pinnedTable') return
    } else if (url.includes('/management/employee/') && url.length > 21) {
      input.page = 'EMPLOYEE'
      input.currentTab = tab
    }
    checkPageAuthorityLazy({
      variables: {
        input: input
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（checkPageAuthorityLazy）；只在 [url] 變動時呼叫，補上會每次 render 重跑
  }, [url])

  useEffect(() => {
    if (shouldBypassPageAuthority(url)) return
    if (!checkPageAuthorityData.loading && checkPageAuthorityData.data) {
      const data = idx(checkPageAuthorityData, _ => _.data.checkPageAuthority)
      if (!data && url === '/profile/general') {
        // 使用者連個人詳細頁基本資料都沒權限的話
        openSnackbar({
          message: '權限異常！請洽詢各店主管',
          variant: 'warning'
        })
      } else if (!data) {
        history.push('/profile/general')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [checkPageAuthorityData.loading, history] 變動時執行；checkPageAuthorityData、url 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [checkPageAuthorityData.loading, history])

  const handleToggleNavBar = () => {
    if (window.innerWidth >= 1024) { // Tailwind lg 斷點，與側欄常駐的斷點一致
      setOpenNavBarDesktop(!openNavBarDesktop)
    } else {
      setOpenNavBarMobile(true)
    }
  }

  // 跳至主要內容：只移動焦點，不改網址（hash 會觸發 router 的 location 變更）；main 臨時可聚焦，失焦後還原
  const skipToMain = event => {
    const main = document.getElementById('main-content')
    if (!main) return
    event.preventDefault()
    main.setAttribute('tabindex', '-1')
    main.focus()
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true })
  }

  // 骨架（STYLE.md §4）：左側 Sidebar（Logo / 商家切換 / 導覽 / 使用者）＋右側內容
  return (
    <>
      {/* 鍵盤第一個可聚焦元素；平時隱藏、聚焦時出現（STYLE §9） */}
      <a
        href="#main-content"
        onClick={skipToMain}
        className="ui-root noprint fixed left-3 top-3 z-[1500] -translate-y-24 rounded-full bg-primary px-4 py-2 text-label text-primary-foreground no-underline shadow-float outline-none ring-accent ring-offset-2 transition-transform focus:translate-y-0 focus-visible:ring-2"
      >
        跳至主要內容
      </a>
      <Snackbar />
      <Sidebar mobileOpen={openNavBarMobile} onMobileClose={() => setOpenNavBarMobile(false)} desktopOpen={openNavBarDesktop}>
        <SidebarHeader>
          <TopBar userMerchants={userMerchants} onOpenNavBarMobile={handleToggleNavBar} desktopOpen={openNavBarDesktop} />
        </SidebarHeader>
        <NavBar onMobileClose={() => setOpenNavBarMobile(false)} openMobile={openNavBarMobile} openDesktop={openNavBarDesktop} />
      </Sidebar>
      {/* 平板與手機：App 式頂部列＋底部分頁列（選單鈕開啟側欄抽屜） */}
      <MobileAppBar tabs={mobileTabs} showTabBar={showTabBar} onOpenMenu={handleToggleNavBar} />
      {showTabBar && <MobileTabBar tabs={mobileTabs} menuOpen={openNavBarMobile} onOpenMenu={handleToggleNavBar} />}
      {/* 全站唯一的 main（Page 元件是 div，不會再產生第二個）；--sidebar-w 供底部固定列（如打帳單合計列）在 lg 以上讓出側欄：展開 264px、收合 80px 圖示欄 */}
      <main
        id="main-content"
        className={cn(
          'flow-root min-h-screen bg-canvas outline-none transition-[padding] duration-200 print:pl-0',
          openNavBarDesktop ? SIDEBAR_EXPANDED_MAIN_CLASS : SIDEBAR_RAIL_MAIN_CLASS,
          // iOS：輸入框字級小於 16px 時聚焦會自動放大畫面
          'max-sm:[&_input]:!text-[16px] max-sm:[&_select]:!text-[16px] max-sm:[&_[data-ui-select]]:!text-[16px] max-sm:[&_textarea]:!text-[16px]',
          showTabBar && 'max-lg:pb-[calc(56px+env(safe-area-inset-bottom))] print:pb-0'
        )}
      >
        <div id="printContainer" className="max-w-full overflow-x-hidden">
          <PageErrorBoundary resetKey={location.pathname}>
            <Suspense fallback={<PageLoading />}>{renderRoutes(route.routes)}</Suspense>
          </PageErrorBoundary>
        </div>
      </main>
      <ChangePassword open={open} handleClose={toggle} />
    </>
  )
}

Dashboard.propTypes = {
  route: PropTypes.object,
}

export default React.memo(Dashboard)
