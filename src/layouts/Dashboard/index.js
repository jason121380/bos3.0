import ChangePassword from 'components/ChangePassword'
import Snackbar, { openSnackbar } from 'elements/snackbars'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import React, { Suspense, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { renderRoutes } from 'react-router-config'
import useFetchCheckPageAuthority from 'hooks/useFetchCheckPageAuthority'
import useFetchGetUserMerchant from 'hooks/useFetchGetUserMerchant'
import idx from 'idx'
import { PanelLeftOpen } from 'lucide-react'
import { Button } from 'ui/button'
import { Sidebar, SidebarHeader } from 'ui/sidebar'
import { cn } from 'ui/utils'

import { MobileAppBar, MobileTabBar, useMobileTabs, useShowTabBar } from './MobileNav'
import NavBar from './NavBar'
import TopBar from './TopBar'

function Dashboard({ route, location }) {
  const [openNavBarMobile, setOpenNavBarMobile] = useState(false)
  const [openNavBarDesktop, setOpenNavBarDesktop] = useState(true)
  const [url, setUrl] = useState(location.pathname)
  const { open, toggle } = useToggle()
  const history = useHistory()
  const [checkPageAuthorityLazy, checkPageAuthorityData] = useFetchCheckPageAuthority()
  const userMerchants = useFetchGetUserMerchant()
  const mobileTabs = useMobileTabs()
  const showTabBar = useShowTabBar(mobileTabs)

  useEffect(() => {
    history.listen((location) => {
      setUrl(location.pathname)
    })
  }, [history, url])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
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
  }, [url])

  useEffect(() => {
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
  }, [checkPageAuthorityData.loading])

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
          <TopBar userMerchants={userMerchants} onOpenNavBarMobile={handleToggleNavBar} />
        </SidebarHeader>
        <NavBar onMobileClose={() => setOpenNavBarMobile(false)} openMobile={openNavBarMobile} openDesktop={openNavBarDesktop} />
      </Sidebar>
      {/* 平板與手機：App 式頂部列＋底部分頁列（選單鈕開啟側欄抽屜） */}
      <MobileAppBar tabs={mobileTabs} showTabBar={showTabBar} onOpenMenu={handleToggleNavBar} />
      {showTabBar && <MobileTabBar tabs={mobileTabs} menuOpen={openNavBarMobile} onOpenMenu={handleToggleNavBar} />}
      {!openNavBarDesktop && (
        <Button
          variant="secondary"
          size="icon"
          aria-label="展開側欄"
          className="ui-root noprint fixed left-3 top-3 z-[1100] hidden bg-background lg:inline-flex"
          onClick={handleToggleNavBar}
        >
          <PanelLeftOpen strokeWidth={1.75} />
        </Button>
      )}
      {/* 全站唯一的 main（Page 元件是 div，不會再產生第二個）；--sidebar-w 供底部固定列（如打帳單合計列）在 lg 以上讓出側欄：展開 264px、收合 0 */}
      <main
        id="main-content"
        className={cn(
          'flow-root min-h-screen bg-canvas outline-none transition-[padding] duration-200 print:pl-0',
          openNavBarDesktop ? '[--sidebar-w:264px]' : '[--sidebar-w:0px]',
          // iOS：輸入框字級小於 16px 時聚焦會自動放大畫面
          'max-sm:[&_input]:!text-[16px] max-sm:[&_select]:!text-[16px] max-sm:[&_textarea]:!text-[16px]',
          showTabBar && 'max-lg:pb-[calc(56px+env(safe-area-inset-bottom))] print:pb-0',
          openNavBarDesktop && 'lg:pl-[264px]'
        )}
      >
        <div id="printContainer" className="max-w-full overflow-x-hidden">
          <Suspense fallback={<div className="ui-root h-0.5 w-full animate-pulse bg-accent" />}>{renderRoutes(route.routes)}</Suspense>
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
