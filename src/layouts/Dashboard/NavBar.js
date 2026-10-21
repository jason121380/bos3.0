import { CalendarDays, ChartColumn, Contact, CreditCard, Gift, LogOut, Megaphone, Package, Pin, Receipt, Search, Settings, Store, Users, X } from 'lucide-react'
import SlotPortal from 'components/SlotPortal'
import { SIDEBAR_SEARCH_SLOT_ID } from './TopBar'
import NavItem, { isWithinHref } from 'components/NavItem'
import useFetchProfile from 'hooks/useFetchProfile'
import idx from 'idx'
import PropTypes from 'prop-types'
import React, { useEffect, useState, Fragment } from 'react'
import { matchPath, useHistory, useLocation } from 'react-router'
import { Link as RouterLink } from 'react-router-dom'
import useFetchUser from 'hooks/useFetchUser'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetIsReportListExtended from 'hooks/useFetchGetIsReportListExtended'
import useFetchGetUserPinnedTable from 'hooks/useFetchGetUserPinnedTable'
import { useFetchGetDisablePendingOrder } from 'hooks/useFetchGetParameterAboutSettingFunction'
import { useDispatch, useSelector } from 'react-redux'
import { pinnedTableActions } from './../../store/pinnedTable'
import pageData from 'helper/pageData'
import { Button } from 'ui/button'
import { Input } from 'ui/input'
import { SidebarContent, SidebarFooter, SidebarLabel } from 'ui/sidebar'
import { cn, focusRing } from 'ui/utils'
import { syncThemeFromServer } from 'lib/theme-mode'

function renderNavItems({ items, subheader, key, reportListExtended, isPinned = false, ...rest }) {
  return (
    <div className="flex flex-col gap-0.5" key={key}>
      {items.reduce((acc, item) => reduceChildRoutes({ acc, item, reportListExtended, ...rest }), [])}
    </div>
  )
}

function reduceChildRoutes({ acc, pathname, item, reportListExtended, depth = 0 }) {
  if (item.items) {
    const open = matchPath(pathname, {
      path: item.href,
      exact: false,
    })
    // 群組本身沒有 href（上面恆為 null）：改看子項，目前頁面（含子頁）在群組內就展開，側欄揭露目前位置
    const containsCurrent = item.items.some(child => isWithinHref(pathname, child.href))
    acc.push(
      <NavItem
        depth={depth}
        icon={item.icon}
        key={item.title}
        label={item.label}
        open={Boolean(open) || item.forceOpen || containsCurrent}
        title={item.title}
        reportListExtended={reportListExtended}
      >
        {renderNavItems({
          depth: depth + 1,
          pathname,
          items: item.items,
          reportListExtended: reportListExtended
        })}
      </NavItem>
    )
  } else {
    acc.push(
      <NavItem
        depth={depth}
        href={item.href}
        icon={item.icon}
        key={item.href}
        label={item.label}
        title={item.title}
        reportListExtended={reportListExtended}
      />
    )
  }

  return acc
}

function NavBar({ openMobile, onMobileClose, openDesktop }) {
  const dispatch = useDispatch()
  let merchantName = localStorage.getItem('userMerchant')
  const getUserPinnedTable = useFetchGetUserPinnedTable()
  if (merchantName) merchantName = JSON.parse(merchantName).name
  // 宣告usestate變數
  const [status, setStatus] = useState('online')
  const [userPageAuth, setUserPageAuth] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  // 搜尋選單：頂列的放大鏡鈕開關搜尋框；關閉時清空關鍵字、恢復完整選單
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = () => setSearchOpen(true)
  const closeSearch = () => {
    setSearchTerm('')
    setSearchOpen(false)
  }

  // 拿個人全部的資料
  const profile = useFetchProfile()
  const theme = idx(profile, _ => _.data.me.theme)

  // 拿參數設定是否啟用會員卡功能
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(true)
  // 拿參數設定報表與分析是否展開細項
  const getIsReportListExtended = useFetchGetIsReportListExtended()
  const [reportListExtended, setReportListExtended] = useState(true)
  const pinnedTable = useSelector(state => state.pinnedTable.table)

  useEffect(() => {
    if (!getIsReportListExtended.loading) {
      const data = idx(getIsReportListExtended, _ => _.data.getIsReportListExtended)
      setReportListExtended(data)
    }
  }, [getIsReportListExtended.loading])

  // 拿參數設定是否啟用紅利點數功能
  const getIsCustomerBonusActive = useFetchGetIsCustomerBonusActive()
  const [customerBonusActive, setCustomerBonusActive] = useState(false)
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()
  // 查詢失敗（無資料）時比照載入中視為停用，避免讀 null 讓整個版面拋錯
  const disablePendingOrder = getDisablePendingOrder.loading
    ? true
    : idx(getDisablePendingOrder, _ => _.data.getParameterAboutSettingFunction.disablePendingOrder) ?? true

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])

  useEffect(() => {
    if (!getIsCustomerBonusActive.loading) {
      const data = idx(getIsCustomerBonusActive, _ => _.data.getIsCustomerBonusActive)
      setCustomerBonusActive(data)
    }
  }, [getIsCustomerBonusActive.loading])

  useEffect(() => {
    if (!getUserPinnedTable.loading) {
      const data = idx(getUserPinnedTable, _ => _.data.getUserPinnedTable)
      if (!Array.isArray(data)) return // 釘選頁查詢失敗時略過，不讓版面拋錯
      const pages = []
      data.forEach(name => {
        const findData = pageData.find(({ title }) => title === name)
        if (findData) {
          pages.push({ title: findData.title, href: findData.href })
        }
      })
      dispatch(pinnedTableActions.setPinnedTable(pages))
    }
  }, [getUserPinnedTable.loading])


  // Navbar Tab
  const config = []
  const memberShipCardItem = {
    title: '會員卡管理',
    icon: CreditCard,
    items: [
      { title: '會員卡分類設定', href: '/member-card-categories' },
      { title: '會員卡列表', href: '/member-card-record' },
    ],
  }
  const CustomerBonusItem = {
    title: '紅利點數設定',
    icon: Gift,
    items: [
      { title: '紅利點數紀錄', href: '/customer-bonus-record' },
    ],
  }
  const counterItem = {
    title: '櫃檯作業',
    icon: Receipt,
    items: [
      { title: '打帳單', href: '/order/create' },
      { title: '帳單列表', href: '/management/orders' },
      { title: '營業儀表板', href: '/merchant-business-dashboard' },
      { title: '現金收支登錄', href: '/general/accounting/records' },
      { title: '高階收支登錄', href: '/accounting/records' },
      { title: '材料自購登錄', href: '/employee/picking' },
      { title: '每日結帳', href: '/checkout/daily' },
      { title: '排班表', href: '/employee-schedule' },
      { title: '現場電腦打卡', href: '/employee-clock-in' },
      { title: '掃碼打卡', href: '/qrcode-clock-in' },
    ],
  }
  const reservationItem = {
    title: '預約管理',
    icon: CalendarDays,
    items: [
      { title: '預約管理', href: '/management/weborders' },
      { title: '單日預約紀錄', href: '/management/reservation/calendar' },
      { title: '單週預約紀錄', href: '/management/reservation/designers/calendar' },
    ],
  }
  const reportItem = {
    title: '報表及分析',
    icon: ChartColumn,
    items: [
      { title: '報表目錄', href: '/dashboard-list-detail' },
      { title: '消費分析儀表板', href: '/consumption-analytics-dashboard' },
      { title: '店家區間累計表', href: '/merchant-business-interval-report' },
      { title: '店家日報表', href: '/merchant-daily-report' },
      { title: '店家排行榜', href: '/merchant-leader-board' },
      { title: '互助日報表', href: '/decrease-daily-report' },
      { title: '互助月報表', href: '/helper-monthly-report' },
      { title: '互助排行榜', href: '/helper-leaderboard' },
      { title: '互助點數明細', href: '/decrease/detail' },
      { title: '互助業績報表', href: '/helper-performance' },
      { title: '全店業績分析表', href: '/designer/perform/overview' },
      { title: '每日業績分析表', href: '/merchant-daily-performance-report' },
      { title: '營業統計分析表', href: '/business-analysis-report' },
      { title: '營業項目月分析表', href: '/business-items-monthly-analyze-report' },
      { title: '設計師業績表', href: '/designer-performance-report' },
      { title: '設計師日報表', href: '/employee-daily-report' },
      { title: '設計師業績分析表', href: '/designer-perforamnce-analyze-report' },
      { title: '設計師業績月報表', href: '/designer-monthly-report' },
      { title: '設計師抽成報表', href: '/designer-rake-report' },
      { title: '設計師排行榜', href: '/designer-perform-basic' },
      { title: '商品銷售排行榜', href: '/product-leader-board' },
      { title: '商品消耗明細', href: '/product-consume-report' },
      { title: '商品進銷貨報表', href: '/product-invoicing-record-report' },
      { title: '商品庫存表', href: '/product-inventoryList' },
      { title: '商品庫存盤點表', href: '/product-reserve-check' },
      { title: '會員卡銷售報表', href: '/membership-sell-report' },
      { title: '服務扣項明細表', href: '/service-deduction-detail-report' },
      { title: '單一服務項目查詢', href: '/single-service-report' },
      { title: '店販抽成明細', href: '/merchant/sells/records' },
      { title: '店販分類抽成明細', href: '/merchant/category/sells/records' },
      { title: '顧客入金餘額表', href: '/customer-wallet-balance' },
      { title: '顧客卡券餘額表', href: '/customer-coupon-report' },
      { title: '每日非現金明細', href: '/payment-report' },
      { title: '每日收支明細', href: '/money-flow-daily-report' },
      { title: '收支分類明細表', href: '/money-flow-category-report' },
      { title: '收支匯款表', href: '/money-flow-transfer-report' },
      { title: '非現金明細對帳單', href: '/non-cash-statement-report' },
      { title: '費用分析表', href: '/cost-analysis-report' },
      { title: '損益表', href: '/income-statement-report' },
      { title: '多店業績統計表', href: '/overall-performance-analysis-report' },
      { title: '多店店販銷售排行', href: '/multi-merchants-leader-board' },
      { title: '顧客消費排行榜', href: '/customer-consumption-leaderboard' },
      { title: '顧客入金排行榜', href: '/customer-wallet-leaderboard' },
    ],
  }
  const customerItem = {
    title: '客戶管理',
    icon: Users,
    items: [
      { title: '客戶列表', href: '/management/customers' },
      { title: '客資篩選匯出', href: '/management/customer-filter-export' },
      { title: '卡券管理', href: '/management/coupons' },
      { title: '入金管理', href: '/topup' },
    ],
  }
  const employeeItem = {
    title: '員工及薪資',
    icon: Contact,
    items: [
      { title: '員工列表', href: '/management/employee' },
      { title: '員工離職列表', href: '/employee-resignation-list' },
      { title: '全店打卡記錄', href: '/attendance/records' },
      { title: '考勤排班總表', href: '/attendance-employee-schedule' },
      { title: '每月薪資維護', href: '/salary/overview' },
      { title: '薪資條', href: '/employee-payslip' },
      { title: '薪資明細表', href: '/designers-salary-detail' },
      { title: '薪資轉帳明細', href: '/merchant-bank-transfe-report' },
    ],
  }
  const productItem = {
    title: '商品管理',
    icon: Package,
    items: [
      { title: '商品分類設定', href: '/product/categories' },
      { title: '商品列表', href: '/products' },
      { title: '商品進貨作業', href: '/product/restock' },
      { title: '廠商列表', href: '/merchant-vendor' },
      { title: '盤點作業', href: '/inventory-work' },
    ],
  }
  const settingItem = {
    title: '資料設定',
    icon: Settings,
    items: [
      { title: '服務分類設定', href: '/service/categories' },
      { title: '服務項目設定', href: '/services' },
      { title: '預收卡設定', href: '/coupons' },
      { title: '組合設定', href: '/shortcut' },
      { title: '系統參數設定', href: '/parameter' },
      { title: '業績抽成參數設定', href: '/performanceDeductionParameter' },
      { title: '收支科目設定', href: '/accountingSetting' },
      { title: '支付方式設定', href: '/payments' },
      { title: '第三方卡券設定', href: '/third-party-coupons' },
      { title: '角色權限管理', href: '/authority' },
    ],
  }
  const marketingTools = {
    title: '行銷工具',
    icon: Megaphone,
    items: [
      { title: '活動列表', href: '/main-event-list' },
      { title: '活動店家參與列表', href: '/merchant-participating-list' },
      { title: '活動發券明細', href: '/event-coupon-issuance-details' }
    ],
  }
  const itemArr = []
  itemArr.push(counterItem)
  itemArr.push(reservationItem)
  itemArr.push(reportItem)
  itemArr.push(customerItem)
  itemArr.push(employeeItem)
  itemArr.push(productItem)
  itemArr.push(marketingTools)
  // 判斷是否啟用會員卡功能
  if (isMemberShipCardActive) {
    itemArr.push(memberShipCardItem)
  }
  if (customerBonusActive) {
    itemArr.push(CustomerBonusItem)
  }
  if (!disablePendingOrder) {
    const idx = itemArr.findIndex(d => {
      return d.title === '櫃檯作業'
    })
    if (idx !== -1) {
      itemArr[idx].items.splice(2, 0, ...[{ title: '掛單列表', href: '/management/draft-orders' }])
    }
  }
  itemArr.push(settingItem)
  // render出來的Array
  const filteredPinnedTable = pinnedTable.filter(d =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredItemArr = searchTerm.trim() === ''
    ? itemArr
    : itemArr.map(category => {
      const categoryMatches = category.title.toLowerCase().includes(searchTerm.toLowerCase())
      const filteredItems = category.items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (categoryMatches || filteredItems.length > 0) {
        return {
          ...category,
          items: categoryMatches ? category.items : filteredItems,
          forceOpen: true
        }
      }
      return null
    }).filter(Boolean)

  config.push({
    subheader: merchantName,
    items: filteredItemArr,
  })

  // 主題以後端個人資料為準：版面掛載時已先套用記住的主題（lib/theme-mode），這裡在後端回來後同步並記住；
  // 舊版全域樣式（initialize／initialize-dark.scss）與 html.dark 由 theme-mode 統一處理，切換不必重新整理
  useEffect(() => {
    if (!profile.loading && theme) syncThemeFromServer(theme)
  }, [theme, profile.loading])
  const location = useLocation()
  const history = useHistory()

  // 判斷登入者的狀態
  useEffect(() => {
    if (!profile.loading) {
      const statue = idx(profile, _ => _.data.me.status)
      if (statue === 'banned') {
        localStorage.clear()
        window.location = '/auth/login'
        // history.push('/auth/login')
        window.location.reload()
      }
    }
  }, [profile.loading])

  // 拿登入者的id
  const designerId =
    localStorage.getItem('user') === null
      ? (window.location = '/auth/login')
      : JSON.parse(localStorage.getItem('user')).id

  // 找登入者
  const userData = useFetchUser({ id: designerId === undefined ? null : designerId })

  // 從後端撈登入者的權限資料
  useEffect(() => {
    if (userData.data && !userData.loading) {
      const userPageAuth = idx(userData, _ => _.data.user.pageAuthority.pageAuthority)
      setUserPageAuth(userPageAuth)
    }
  }, [userData.data, userData.loading])

  // status按鈕
  const handleStatusToggle = () => {
    const statusSeq = {
      online: 'away',
      away: 'busy',
      busy: 'offline',
      offline: 'online',
    }
    setStatus(prevStatus => statusSeq[prevStatus])
  }
  // 登出按鈕
  const handleLogOut = () => {
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    localStorage.clear()
    history.push('/auth/login')
    window.location.reload()
  }

  const useOnMobileCloseRef = React.useRef(onMobileClose)

  useEffect(() => {
    useOnMobileCloseRef.current()
  }, [location.pathname])

  // 判斷localStorage是否有資料
  if (localStorage.getItem('userMerchant') !== null) {
    checkCookie()
    config.forEach(list => (list.subheader = JSON.parse(localStorage.getItem('userMerchant')).name))
  } else {
    localStorage.clear()
    window.location = '/auth/login'
  }
  // 判斷navbar的權限
  if (userPageAuth.length > 0) {
    userPageAuth.forEach(data => {
      config[0].items.forEach((list, index) => {
        if (list.title === data.pageTitle && !data.authority) {
          config[0].items.splice(index, 1)
        }
      })
    })
    const tmp = config[0].items.map(d => d.title)
    const tmpUserPageAuth = userPageAuth.filter(d => tmp.includes(d.pageTitle))
    tmpUserPageAuth.forEach(data => {
      config[0].items.forEach(list => {
        data.pageAuthority.forEach(data2 => {
          list.items.forEach((list2, index) => {
            if (data2.pageName === list2.title && !data2.authority) {
              list.items.splice(index, 1)
            }
          })
        })
      })
    })
  }
  // 判斷角色權限管理
  const userAuth = idx(profile, _ => _.data.me.merchantIdentity.authorityName)
  if (userAuth != undefined) {
    if (userAuth != '高階主管') {
      config[0].items.forEach(list => {
        list.items.forEach((list2, index) => {
          if (list2.title === '角色權限管理') {
            list.items.splice(index, 1)
          }
        })
      })
    }
  }
  // 判斷cookie
  function getCookie(user) {
    var cookieArr = document.cookie.split(';')
    for (var i = 0; i < cookieArr.length; i++) {
      var cookiePair = cookieArr[i].split('=')
      if (user == cookiePair[0].trim()) {
        return decodeURIComponent(cookiePair[1])
      }
    }
    return null
  }
  // 判斷cookie是否存在
  function checkCookie() {
    var keepLogin = getCookie('keepLogin')
    if (keepLogin === null && localStorage.getItem('keepLogin') === 'true') {
      document.cookie = 'keepLogin=hello;expires=0;path=/'
    } else if (keepLogin === null && localStorage.getItem('keepLogin') === 'false') {
      localStorage.clear()
      window.location = '/auth/login'
    }
  }
  const userName = idx(profile, _ => (_.data.me.name ? _.data.me.name : '使用者名稱'))
  const userRole = idx(profile, _ =>
    _.data.me.merchantIdentity.authorityName.length > 0 ? _.data.me.merchantIdentity.authorityName : '權限未設定'
  )
  const avatar = idx(profile, _ => _.data.me.avatar)

  // 側欄內容與底部使用者選單；外框（Sidebar）與頂部（TopBar）由 layouts/Dashboard 組合
  return (
    <Fragment>
      {/* 搜尋鈕畫在頂列通知鈴鐺左側（Jason 2026/10/21「搜尋放到右上角 icon」）；按下才展開搜尋框 */}
      <SlotPortal slotId={SIDEBAR_SEARCH_SLOT_ID}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="搜尋選單"
          aria-expanded={searchOpen}
          aria-controls="sidebar-menu-search"
          className={cn(searchOpen && 'bg-surface-hover')}
          onClick={() => (searchOpen ? closeSearch() : openSearch())}
        >
          <Search strokeWidth={1.75} />
        </Button>
      </SlotPortal>
      {searchOpen && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" strokeWidth={1.75} />
            <Input
              id="sidebar-menu-search"
              autoFocus
              aria-label="搜尋選單"
              placeholder="搜尋選單"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && closeSearch()}
              className="h-8 border-border bg-background pl-8 pr-8 text-label hover:border-border-strong"
            />
            <button
              type="button"
              aria-label="關閉搜尋"
              title="關閉搜尋"
              onClick={closeSearch}
              className={cn('absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-transparent p-0 text-text-tertiary hover:bg-surface-hover hover:text-text', focusRing)}
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
      <SidebarContent>
        {/* 目前店家（Jason 2026/10/21「要呈現現在在哪家店」；同日「不用目前店家的標籤」→ 只留圖示＋店名，標題文字僅供讀屏）：
            只顯示、不可點；切換仍用底部的店家圖示。店名取自 userMerchant，切換店家後整頁重新載入即更新 */}
        {merchantName && (
          <div className="mb-1 flex items-center gap-2.5 px-2.5 pb-2 pt-1" title={`目前店家：${merchantName}`}>
            <Store className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">目前店家：</span>
            <span className="min-w-0 truncate text-body font-medium text-text">{merchantName}</span>
          </div>
        )}
        {!profile.loading && (
          <Fragment>
            {filteredPinnedTable.length > 0 && (
              <Fragment>
                <SidebarLabel className="pt-1">釘選</SidebarLabel>
                <NavItem depth={0} title="釘選頁面" icon={Pin} open={searchTerm.trim() !== ''}>
                  <div className="flex flex-col gap-0.5">
                    {filteredPinnedTable.map(d => (
                      <NavItem key={d.title} depth={0} href={d.href} title={d.title} reportListExtended={reportListExtended} />
                    ))}
                  </div>
                </NavItem>
              </Fragment>
            )}
            {/* 「選單」標題已移除（Jason 2026/10/21）；有釘選群組時以間距與選單分開 */}
            {filteredPinnedTable.length > 0 && <div className="h-2" aria-hidden="true" />}
            {config.map(list =>
              renderNavItems({
                items: list.items,
                subheader: list.subheader,
                pathname: location.pathname,
                key: list.subheader,
                reportListExtended: reportListExtended,
                isPinned: pinnedTable.length > 0,
              })
            )}
          </Fragment>
        )}
      </SidebarContent>
      {!profile.loading && (
        <SidebarFooter className="flex items-center gap-2">
          <RouterLink to="/profile/general" className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 hover:bg-surface-hover', focusRing)}>
            {/* 頭像只是呈現：原 onClick={handleStatusToggle} 只輪替一個畫面上沒用到的 status state（無可見效果），點擊仍由外層連結前往個人頁 */}
            {avatar ? (
              <img alt="" src={avatar} className="h-8 w-8 shrink-0 rounded-full border border-solid border-border object-cover" />
            ) : (
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-hover text-label text-text-secondary">
                {String(userName).slice(0, 1)}
              </span>
            )}
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-body font-medium text-text">{userName}</span>
              <span className="truncate text-caption text-text-secondary">{userRole}</span>
            </span>
          </RouterLink>
          {/* 切換店家圖示鈕由 TopBar 以 Portal 畫進這個插槽（開關狀態與店家清單仍在 TopBar），位置在登出左側（Jason 2026/10/20） */}
          <span id="sidebar-merchant-switch-slot" className="contents" />
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="登出" title="登出" onClick={handleLogOut}>
            <LogOut strokeWidth={1.75} />
          </Button>
        </SidebarFooter>
      )}
    </Fragment>
  )
}

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
}
function areEqual(prevProps, nextProps) {
  if (prevProps.openMobile === nextProps.openMobile) {
    return true
  }
  return false
}
export default React.memo(NavBar, areEqual)
