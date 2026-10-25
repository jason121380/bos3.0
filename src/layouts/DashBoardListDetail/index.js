import { useEffect, useState } from 'react'
import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import idx from 'idx'
import useFetchUserPermission from 'hooks/useFetchUser'
import { CalendarDays, ChartColumn, ChevronRight, HeartHandshake, LayoutDashboard, Package, Users } from 'lucide-react'
import { Card } from 'ui/card'
import { PageHeader } from 'ui/page-header'
import { Tabs } from 'ui/tabs'
import { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading } from 'ui/settings-nav'
import { cn, focusRing } from 'ui/utils'

// 登入者 id（沒有 id 時為 undefined，下方以 null 查詢）；沒有登入資料的情況已由外層 DashBoardListDetail 導向登入
const storedUserId = () => (JSON.parse(localStorage.getItem('user')) || {}).id

// 分類連結的唯一清單（顯示順序）。SubMenuItem 只拿名稱做權限判斷，順序不影響是否出現。
// 桌機滑過分類時的細項面板由 ui/settings-nav 負責（圓角、窄屏不顯示）；這裡只把同一份連結放進去。
const REPORT_CATEGORIES = [
  {
    value: 'daily',
    label: '日報表',
    icon: CalendarDays,
    links: [
      { itemName: '店家日報表', link: '/merchant-daily-report' },
      { itemName: '設計師日報表', link: '/employee-daily-report' },
      { itemName: '互助日報表', link: '/decrease-daily-report' },
    ],
  },
  {
    value: 'business',
    label: '營業',
    icon: ChartColumn,
    links: [
      { itemName: '店家區間累計表', link: '/merchant-business-interval-report' },
      { itemName: '店家排行榜', link: '/merchant-leader-board' },
      { itemName: '全店業績分析表', link: '/designer/perform/overview' },
      { itemName: '每日業績分析表', link: '/merchant-daily-performance-report' },
      { itemName: '每日收支明細', link: '/money-flow-daily-report' },
      { itemName: '收支分類明細表', link: '/money-flow-category-report' },
      { itemName: '收支匯款表', link: '/money-flow-transfer-report' },
      { itemName: '每日非現金明細', link: '/payment-report' },
      { itemName: '單一服務項目查詢', link: '/single-service-report' },
      { itemName: '非現金明細對帳單', link: '/non-cash-statement-report' },
      { itemName: '顧客卡券餘額表', link: '/customer-coupon-report' },
      { itemName: '顧客入金餘額表', link: '/customer-wallet-balance' },
      { itemName: '營業統計分析表', link: '/business-analysis-report' },
      { itemName: '營業項目月分析表', link: '/business-items-monthly-analyze-report' },
    ],
  },
  {
    value: 'designer',
    label: '設計師',
    icon: Users,
    links: [
      { itemName: '設計師業績分析表', link: '/designer-perforamnce-analyze-report' },
      { itemName: '設計師排行榜', link: '/designer-perform-basic' },
      { itemName: '設計師抽成報表', link: '/designer-rake-report' },
      { itemName: '設計師業績月報表', link: '/designer-monthly-report' },
      { itemName: '服務扣項明細表', link: '/service-deduction-detail-report' },
      { itemName: '設計師業績表', link: '/designer-performance-report' },
    ],
  },
  {
    value: 'helper',
    label: '互助',
    icon: HeartHandshake,
    links: [
      { itemName: '互助排行榜', link: '/helper-leaderboard' },
      { itemName: '互助點數明細', link: '/decrease/detail' },
      { itemName: '互助月報表', link: '/helper-monthly-report' },
      { itemName: '互助業績報表', link: '/helper-performance' },
    ],
  },
  {
    value: 'product',
    label: '商品',
    icon: Package,
    links: [
      { itemName: '店販抽成明細', link: '/merchant/sells/records' },
      { itemName: '店販分類抽成明細', link: '/merchant/category/sells/records' },
      { itemName: '商品銷售排行榜', link: '/product-leader-board' },
      { itemName: '商品消耗明細', link: '/product-consume-report' },
      { itemName: '商品進銷貨報表', link: '/product-invoicing-record-report' },
      { itemName: '商品庫存表', link: '/product-inventoryList' },
      { itemName: '商品庫存盤點表', link: '/product-reserve-check' },
      { itemName: '會員卡銷售報表', link: '/membership-sell-report' },
    ],
  },
  {
    value: 'management',
    label: '管理分析',
    icon: LayoutDashboard,
    links: [
      { itemName: '費用分析表', link: '/cost-analysis-report' },
      { itemName: '損益表', link: '/income-statement-report' },
      { itemName: '多店業績統計表', link: '/overall-performance-analysis-report' },
      { itemName: '顧客消費排行榜', link: '/customer-consumption-leaderboard' },
      { itemName: '顧客入金排行榜', link: '/customer-wallet-leaderboard' },
      { itemName: '消費分析儀表板', link: '/consumption-analytics-dashboard' },
      { itemName: '多店店販銷售排行', link: '/multi-merchants-leader-board' },
    ],
  },
]
const reportCategory = value => REPORT_CATEGORIES.find(category => category.value === value)
const reportLinkNames = value => reportCategory(value).links.map(item => item.itemName)

// 沒有登入資料時導向登入並直接結束：不送權限查詢、不畫內容（Jason 2026/10/22 fix all；原本同一次渲染仍以 "/auth/login" 當 id 查詢）
export default function DashBoardListDetail() {
  if (localStorage.getItem('user') === null) {
    window.location = '/auth/login'
    return null
  }
  return <DashBoardListContent />
}

// 頁面外距由 layouts/Dashboard 的 #printContainer 提供（與其他頁一致），此處不再另加
function DashBoardListContent() {
  function LinkItem(props) {
    // 拿權限
    const [userPageAuth, setUserPageAuth] = useState([])

    const designerId = storedUserId()
    const apiUserPermissions = useFetchUserPermission({
      id: designerId === undefined ? null : designerId,
    })

    // LinkItem 每次切換分類都會重新掛載；權限查詢是 cache-and-network（2026/10/22），重新掛載時先有快取資料、loading 仍為 true，
    // 有資料就先用（不等重抓完成），否則切換分類後連結會先消失到重抓回來
    useEffect(() => {
      if (apiUserPermissions.data) {
        const userPageAuth = idx(apiUserPermissions, _ => _.data.user.pageAuthority.pageAuthority)
        setUserPageAuth(userPageAuth)
      }
    }, [apiUserPermissions.data])
    let item = ''
    userPageAuth
      .filter(a => a.pageTitle === '報表及分析')
      .forEach(a => {
        a.pageAuthority.filter(a => {
          if (a.pageName === props.itemName && a.authority === true) {
            item = props.itemName
          }
          return false
        })
      })

    if (item) {
      return (
        <RouterLink
          to={props.link}
          className={cn('group flex h-10 items-center justify-between rounded-md px-3 text-body text-text hover:bg-surface-hover', focusRing)}
        >
          {item}
          <ChevronRight className="h-4 w-4 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
        </RouterLink>
      )
    } else {
      return ''
    }
  }
  function SubMenuItem(Arr) {
    // 拿權限
    const [userPageAuth, setUserPageAuth] = useState([])

    const designerId = storedUserId()
    const apiUserPermissions = useFetchUserPermission({
      id: designerId === undefined ? null : designerId,
    })

    useEffect(() => {
      if (apiUserPermissions.data && !apiUserPermissions.loading) {
        const userPageAuth = idx(apiUserPermissions, _ => _.data.user.pageAuthority.pageAuthority)
        setUserPageAuth(userPageAuth)
      }
    }, [apiUserPermissions.data, apiUserPermissions.loading])
    const subItem = []
    userPageAuth
      .filter(a => a.pageTitle === '報表及分析')
      .forEach(a => {
        a.pageAuthority.filter(a => {
          Arr.forEach(i => {
            if (a.pageName === i && a.authority === true) {
              subItem.push(i)
            }
          })
          return false
        })
      })
    if (subItem.length > 0) {
      return true
    } else {
      return false
    }
  }
  const [selectTab, setSelectTab] = useState('daily')
  // SubMenuItem 內含 hooks，必須以固定順序、固定次數無條件呼叫六次（與舊版相同順序），
  // 不得依權限結果條件式呼叫；權限只決定下方選單是否顯示該分類。
  // 各分類的清單須包含下方所有連結的報表名稱（Jason 2026/10/22 fix all：補上原本漏列的設計師業績分析表、商品庫存表、顧客消費／入金排行榜）
  const canDaily = SubMenuItem(reportLinkNames('daily'))
  const canBusiness = SubMenuItem(reportLinkNames('business'))
  const canDesigner = SubMenuItem(reportLinkNames('designer'))
  const canHelper = SubMenuItem(reportLinkNames('helper'))
  // 「設計師店販抽成明細」前端沒有這張報表，只有這個權限時分類會是空的；Jason 2026/10/22 選擇從清單移除
  const canProduct = SubMenuItem(reportLinkNames('product'))
  const canManagement = SubMenuItem(reportLinkNames('management'))
  const visibleByValue = {
    daily: canDaily,
    business: canBusiness,
    designer: canDesigner,
    helper: canHelper,
    product: canProduct,
    management: canManagement,
  }
  const categories = REPORT_CATEGORIES.map(category => ({ ...category, visible: visibleByValue[category.value] }))
  // 桌機左右底色（Jason 追加指示，比照 Cursor Billing 截圖）：左選單欄整欄 bg-surface 淺灰、右內容 bg-background 白，
  // 兩欄以 gap-0 相接且不加 border／shadow 分隔；手機維持 settings-nav 頂部橫向分頁，不套此底色。
  // 左欄外框圓角在共用 settings-nav（rounded-2xl，與 Card 相同）。桌機滑過分類浮出同一份連結，點擊仍只切換右側內容。
  const visibleCategories = categories.filter(category => category.visible)
  // 預設選第一個有權限的分類；目前選取若無權限（或權限尚未載入）一律退回第一個有權限者，不得切到無權限分類
  const activeCategory = visibleCategories.find(category => category.value === selectTab) || visibleCategories[0]
  const renderLinks = items => items.map(item => <LinkItem key={item.itemName} itemName={item.itemName} link={item.link} />)
  return (
    <Page className="ui-root" title='報表目錄'>
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="報表目錄" description="依類別瀏覽有權限的報表" />
        {activeCategory && (
          <Tabs
            className="md:flex md:items-stretch md:gap-0"
            value={activeCategory.value}
            onValueChange={setSelectTab}
            activationMode="manual"
          >
            <SettingsTabsList className="md:bg-surface md:px-2 md:py-4">
              {visibleCategories.map(category => (
                <SettingsTabsTrigger
                  key={category.value}
                  value={category.value}
                  icon={category.icon}
                  detailLabel={`${category.label}的報表`}
                  detail={renderLinks(category.links)}
                >
                  {category.label}
                </SettingsTabsTrigger>
              ))}
            </SettingsTabsList>
            <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
              <SettingsSectionHeading title={activeCategory.label} />
              <Card>
                <div className="flex flex-col p-2 pt-3">{renderLinks(activeCategory.links)}</div>
              </Card>
            </div>
          </Tabs>
        )}
      </div>
    </Page>
  )
}
