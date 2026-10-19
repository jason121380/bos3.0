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
import { MuiScope } from 'ui/mui-theme'
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

  // 骨架（STYLE.md §4）：左側 Sidebar（Logo / 商家切換 / 導覽 / 使用者）＋右側內容
  // 全站套用 MUI 橋接主題：尚未改版頁面中的 MUI 元件也採用新配色與尺寸（STYLE.md §10）
  return (
    <MuiScope>
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
      <div
        className={cn(
          'flow-root min-h-screen bg-canvas transition-[padding] duration-200 print:pl-0',
          // iOS：輸入框字級小於 16px 時聚焦會自動放大畫面
          'max-sm:[&_input]:!text-[16px] max-sm:[&_select]:!text-[16px] max-sm:[&_textarea]:!text-[16px]',
          showTabBar && 'max-lg:pb-[calc(56px+env(safe-area-inset-bottom))] print:pb-0',
          openNavBarDesktop && 'lg:pl-60'
        )}
      >
        <div id="printContainer" className="max-w-full overflow-x-hidden">
          <Suspense fallback={<div className="ui-root h-0.5 w-full animate-pulse bg-accent" />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
      <ChangePassword open={open} handleClose={toggle} />
    </MuiScope>
  )
}

Dashboard.propTypes = {
  route: PropTypes.object,
}

export default React.memo(Dashboard)
