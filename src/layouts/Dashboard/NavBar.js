/** @jsxImportSource @emotion/react */
import {
  Avatar, Badge, Divider, Drawer, IconButton,
  Link, List, ListSubheader, Typography, colors,
} from '@mui/material'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import NavItem from 'components/NavItem'
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
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InsightsIcon from '@mui/icons-material/Insights'
import GroupsIcon from '@mui/icons-material/Groups'
import BadgeIcon from '@mui/icons-material/Badge'
import InventoryIcon from '@mui/icons-material/Inventory'
import CampaignIcon from '@mui/icons-material/Campaign'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { css } from '@emotion/react'
import { createTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { pinnedTableActions } from './../../store/pinnedTable'
import pageData from 'helper/pageData'
const themeForStyle = createTheme()

function renderNavItems({ items, subheader, key, reportListExtended, isPinned = false, ...rest }) {
  return (
    <List sx={{ pt: isPinned ? 0 : '' }} key={key}>
      {subheader && <ListSubheader disableSticky></ListSubheader>}
      {items.reduce((acc, item) => reduceChildRoutes({ acc, item, reportListExtended, ...rest }), [])}
    </List>
  )
}

function reduceChildRoutes({ acc, pathname, item, reportListExtended, depth = 0 }) {
  if (item.items) {
    const open = matchPath(pathname, {
      path: item.href,
      exact: false,
    })
    acc.push(
      <NavItem
        depth={depth}
        icon={item.icon}
        key={item.title}
        label={item.label}
        open={Boolean(open)}
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
  const disablePendingOrder = getDisablePendingOrder.loading ? true : getDisablePendingOrder.data.getParameterAboutSettingFunction.disablePendingOrder

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
    icon: LoyaltyIcon,
    items: [
      { title: '會員卡分類設定', href: '/member-card-categories' },
      { title: '會員卡列表', href: '/member-card-record' },
    ],
  }
  const CustomerBonusItem = {
    title: '紅利點數設定',
    icon: LocalActivityIcon,
    items: [
      { title: '紅利點數紀錄', href: '/customer-bonus-record' },
    ],
  }
  const counterItem = {
    title: '櫃檯作業',
    icon: PointOfSaleIcon,
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
    icon: CalendarMonthIcon,
    items: [
      { title: '預約管理', href: '/management/weborders' },
      { title: '單日預約紀錄', href: '/management/reservation/calendar' },
      { title: '單週預約紀錄', href: '/management/reservation/designers/calendar' },
    ],
  }
  const reportItem = {
    title: '報表及分析',
    icon: InsightsIcon,
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
    icon: GroupsIcon,
    items: [
      { title: '客戶列表', href: '/management/customers' },
      { title: '客資篩選匯出', href: '/management/customer-filter-export' },
      { title: '卡券管理', href: '/management/coupons' },
      { title: '入金管理', href: '/topup' },
    ],
  }
  const employeeItem = {
    title: '員工及薪資',
    icon: BadgeIcon,
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
    icon: InventoryIcon,
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
    icon: ManageAccountsIcon,
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
    icon: CampaignIcon,
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
      itemArr[idx].items.splice(2, 0, ...[{ title: '掛單列表', href: '/management/draft-orders' },
      { title: '座位開單', href: '/seat-order-manage' }])
    }
  }
  itemArr.push(settingItem)
  // render出來的Array
  config.push({
    subheader: merchantName,
    items: itemArr,
  })

  if (theme == 'DARK' && !profile.loading) {
    import('../../initialize-dark.scss').then(module => {
      // Do something with the module.
    })
  } else if (theme == 'DEFAULT' && !profile.loading) {
    import('../../initialize.scss').then(module => {
      // Do something with the module.
    })
  }
  if (theme == 'DARK' && !profile.loading) {
    var styles = {
      root: css({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#2B2B40',
        width: 200
      }),
      mobileDrawer: css({
        width: 200,
      }),
      desktopDrawer: css({
        '& > div.MuiPaper-root': {
          width: 'auto',
          top: 64,
          height: 'calc(100% - 64px)',
        }
      }),
      navigation: css({
        overflow: 'auto',
        padding: themeForStyle.spacing(0, 1, 2, 1),
        flexGrow: 1,
        width: 200,
      }),
      profile: css({
        padding: themeForStyle.spacing(2, 1, 2, 2),
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }),
      badge: css({
        boxShadow: `0 0 0 2px ${themeForStyle.palette.background.paper}`,
      }),
      badgeDot: css({
        height: 9,
        minWidth: 9,
      }),
      onlineBadge: css({
        backgroundColor: colors.green[600],
      }),
      awayBadge: css({
        backgroundColor: colors.orange[600],
      }),
      busyBadge: css({
        backgroundColor: colors.red[600],
      }),
      offlineBadge: css({
        backgroundColor: colors.grey[300],
      }),
      avatar: css({
        cursor: 'pointer',
        width: 40,
        height: 40,
        backgroundColor: '#ffffff00',
      }),
      details: css({
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexGrow: 1
      }),
      moreButton: css({
        marginLeft: 'auto',
        color: colors.blueGrey[200] + '!important',
        padding: '0px !important'
      }),
      divider: css({
        borderColor: '#E0E2E6'
      }),
    }
  } else {
    var styles = {
      root: css({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        width: 260,
      }),
      mobileDrawer: css({
        width: 260,
        '& > div.MuiPaper-root': {
          borderRadius: '0px !important',
        }
      }),
      desktopDrawer: css({
        '& > div.MuiPaper-root': {
          width: 260,
          top: 64,
          height: 'calc(100% - 64px)',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: '#FFFFFF',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          zIndex: 1000,
          borderRadius: '0px !important',
        }
      }),
      navigation: css({
        overflow: 'auto',
        padding: themeForStyle.spacing(2, 1),
        flexGrow: 1,
        width: 260,
      }),
      profile: css({
        padding: themeForStyle.spacing(2, 1, 2, 2),
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }),
      badge: css({
        boxShadow: `0 0 0 2px ${themeForStyle.palette.background.paper}`,
      }),
      badgeDot: css({
        height: 9,
        minWidth: 9,
      }),
      onlineBadge: css({
        backgroundColor: colors.green[600],
      }),
      awayBadge: css({
        backgroundColor: colors.orange[600],
      }),
      busyBadge: css({
        backgroundColor: colors.red[600],
      }),
      offlineBadge: css({
        backgroundColor: colors.grey[300],
      }),
      avatar: css({
        cursor: 'pointer',
        width: 40,
        height: 40,
        backgroundColor: '#ffffff00',
      }),
      details: css({
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexGrow: 1
      }),
      moreButton: css({
        color: colors.blueGrey[200] + '!important',
        padding: '0px !important'
      }),
      divider: css({
        borderColor: '#E0E2E6'
      })
    }
  }
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
  return (
    <Fragment>
      <Drawer
        sx={{ display: { xs: 'block', lg: 'none' } }}
        anchor="left"
        css={styles.mobileDrawer}
        onClose={onMobileClose}
        open={openMobile}
        variant="temporary"
      >
        {!profile.loading && (
          <div css={styles.root}>
            <nav css={styles.navigation}>
              {pinnedTable.length > 0 && (
                <List sx={{ pb: 0 }}>
                  <NavItem
                    depth={0}
                    title='釘選頁面'
                    icon={CardGiftcardIcon}
                  >
                    <List>
                      {pinnedTable.map(d => (
                        <NavItem
                          key={d.title}
                          depth={0}
                          href={d.href}
                          title={d.title}
                          reportListExtended={reportListExtended}
                        />
                      ))}
                    </List>
                  </NavItem>
                </List>
              )}
              {config.map(list =>
                renderNavItems({
                  items: list.items,
                  subheader: list.subheader,
                  pathname: location.pathname,
                  key: list.subheader,
                  reportListExtended: reportListExtended,
                  isPinned: pinnedTable.length > 0
                })
              )}
            </nav>
            <Divider css={styles.divider} />
            <Link component={RouterLink} to="/profile/general" underline="none">
              <div css={styles.profile}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  variant="dot"
                >
                  <Avatar
                    alt="Person"
                    onClick={handleStatusToggle}
                    css={styles.avatar}
                    src={idx(profile, _ => _.data.me.avatar)}
                  />
                </Badge>
                <div css={styles.details}>
                  <Typography
                    variant="h5"
                    style={{ color: '#1E1E1E', fontWeight: 500, overflow: 'hidden', textOverflow: "ellipsis" }}
                  >
                    {idx(profile, _ => (_.data.me.name ? _.data.me.name : '使用者名稱'))}
                  </Typography>
                  <Typography variant="body2" style={{ color: '#444746' }}>
                    {idx(profile, _ =>
                      _.data.me.merchantIdentity.authorityName.length > 0
                        ? _.data.me.merchantIdentity.authorityName
                        : '權限未設定'
                    )}
                  </Typography>
                </div>
                <IconButton css={styles.moreButton} size="small" onClick={handleLogOut}>
                  <ExitToAppIcon />
                </IconButton>
              </div>
            </Link>
          </div>
        )}
      </Drawer>
      <Drawer
        sx={{ display: { xs: 'none', lg: 'block' } }}
        anchor="left"
        css={styles.desktopDrawer}
        open={openDesktop}
        variant="persistent"
      >
        {!profile.loading && (
          <div css={styles.root}>
            <nav css={styles.navigation}>
              {pinnedTable.length > 0 && (
                <List sx={{ pb: 0 }}>
                  <NavItem
                    depth={0}
                    title='釘選頁面'
                    href='dfdf'
                    icon={PushPinOutlinedIcon}
                  >
                    <List>
                      {pinnedTable.map(d => (
                        <NavItem
                          key={d.title}
                          depth={0}
                          href={d.href}
                          title={d.title}
                          reportListExtended={reportListExtended}
                        />
                      ))}
                    </List>
                  </NavItem>
                </List>
              )}
              {config.map(list =>
                renderNavItems({
                  items: list.items,
                  subheader: list.subheader,
                  pathname: location.pathname,
                  key: list.subheader,
                  reportListExtended: reportListExtended,
                  isPinned: pinnedTable.length > 0
                })
              )}
            </nav>
          </div>
        )}
      </Drawer>
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
