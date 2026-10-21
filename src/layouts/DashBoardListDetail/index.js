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

// 頁面外距由 layouts/Dashboard 的 #printContainer 提供（與其他頁一致），此處不再另加
export default function DashBoardListDetail() {
  function LinkItem(props) {
    // 拿權限
    const [userPageAuth, setUserPageAuth] = useState([])

    const designerId =
      localStorage.getItem('user') === null
        ? (window.location = '/auth/login')
        : JSON.parse(localStorage.getItem('user')).id
    const apiUserPermissions = useFetchUserPermission({
      id: designerId === undefined ? null : designerId,
    })

    useEffect(() => {
      if (apiUserPermissions.data && !apiUserPermissions.loading) {
        const userPageAuth = idx(apiUserPermissions, _ => _.data.user.pageAuthority.pageAuthority)
        setUserPageAuth(userPageAuth)
      }
    }, [apiUserPermissions.data, apiUserPermissions.loading])
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

    const designerId =
      localStorage.getItem('user') === null
        ? (window.location = '/auth/login')
        : JSON.parse(localStorage.getItem('user')).id
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
  // SubMenuItem 內含 hooks，必須以固定順序、固定次數無條件呼叫六次（與舊版相同順序與參數），
  // 不得依權限結果條件式呼叫；權限只決定下方選單是否顯示該分類。
  const canDaily = SubMenuItem(['店家日報表', '設計師日報表', '互助日報表'])
  const canBusiness = SubMenuItem([
    '店家區間累計表',
    '全店業績分析表',
    '每日業績分析表',
    '每日收支明細',
    '收支分類明細表',
    '收支匯款表',
    '每日非現金明細',
    '非現金明細對帳單',
    '顧客入金餘額表',
    '店家排行榜',
    '單一服務項目查詢',
    '營業統計分析表',
    '顧客卡券餘額表',
    '營業項目月分析表',
  ])
  const canDesigner = SubMenuItem(['設計師排行榜', '設計師抽成報表', '設計師業績月報表', '服務扣項明細表', '設計師業績表'])
  const canHelper = SubMenuItem(['互助排行榜', '互助點數明細', '互助月報表', '互助業績報表'])
  const canProduct = SubMenuItem(['店販抽成明細', '店販分類抽成明細', '商品銷售排行榜', '商品消耗明細', '設計師店販抽成明細', '商品進銷貨報表', '會員卡銷售報表', '商品庫存盤點表'])
  const canManagement = SubMenuItem(['費用分析表', '損益表', '多店業績統計表', '消費分析儀表板', '多店店販銷售排行'])
  const categories = [
    {
      value: 'daily',
      label: '日報表',
      icon: CalendarDays,
      visible: canDaily,
      children: (
        <>
          <LinkItem itemName={'店家日報表'} link={'/merchant-daily-report'} />
          <LinkItem itemName={'設計師日報表'} link={'/employee-daily-report'} />
          <LinkItem itemName={'互助日報表'} link={'/decrease-daily-report'} />
        </>
      ),
    },
    {
      value: 'business',
      label: '營業',
      icon: ChartColumn,
      visible: canBusiness,
      children: (
        <>
          <LinkItem itemName={'店家區間累計表'} link={'/merchant-business-interval-report'} />
          <LinkItem itemName={'店家排行榜'} link={'/merchant-leader-board'} />
          <LinkItem itemName={'全店業績分析表'} link={'/designer/perform/overview'} />
          <LinkItem itemName={'每日業績分析表'} link={'/merchant-daily-performance-report'} />
          <LinkItem itemName={'每日收支明細'} link={'/money-flow-daily-report'} />
          <LinkItem itemName={'收支分類明細表'} link={'/money-flow-category-report'} />
          <LinkItem itemName={'收支匯款表'} link={'/money-flow-transfer-report'} />
          <LinkItem itemName={'每日非現金明細'} link={'/payment-report'} />
          <LinkItem itemName={'單一服務項目查詢'} link={'/single-service-report'} />
          <LinkItem itemName={'非現金明細對帳單'} link={'/non-cash-statement-report'} />
          <LinkItem itemName={'顧客卡券餘額表'} link={'/customer-coupon-report'} />
          <LinkItem itemName={'顧客入金餘額表'} link={'/customer-wallet-balance'} />
          <LinkItem itemName={'營業統計分析表'} link={'/business-analysis-report'} />
          <LinkItem itemName={'營業項目月分析表'} link={'/business-items-monthly-analyze-report'} />
        </>
      ),
    },
    {
      value: 'designer',
      label: '設計師',
      icon: Users,
      visible: canDesigner,
      children: (
        <>
          <LinkItem itemName={'設計師業績分析表'} link={'/designer-perforamnce-analyze-report'} />
          <LinkItem itemName={'設計師排行榜'} link={'/designer-perform-basic'} />
          <LinkItem itemName={'設計師抽成報表'} link={'/designer-rake-report'} />
          <LinkItem itemName={'設計師業績月報表'} link={'/designer-monthly-report'} />
          <LinkItem itemName={'服務扣項明細表'} link={'/service-deduction-detail-report'} />
          <LinkItem itemName={'設計師業績表'} link={'/designer-performance-report'} />
        </>
      ),
    },
    {
      value: 'helper',
      label: '互助',
      icon: HeartHandshake,
      visible: canHelper,
      children: (
        <>
          <LinkItem itemName={'互助排行榜'} link={'/helper-leaderboard'} />
          <LinkItem itemName={'互助點數明細'} link={'/decrease/detail'} />
          <LinkItem itemName={'互助月報表'} link={'/helper-monthly-report'} />
          <LinkItem itemName={'互助業績報表'} link={'/helper-performance'} />
        </>
      ),
    },
    {
      value: 'product',
      label: '商品',
      icon: Package,
      visible: canProduct,
      children: (
        <>
          <LinkItem itemName={'店販抽成明細'} link={'/merchant/sells/records'} />
          <LinkItem itemName={'店販分類抽成明細'} link={'/merchant/category/sells/records'} />
          <LinkItem itemName={'商品銷售排行榜'} link={'/product-leader-board'} />
          <LinkItem itemName={'商品消耗明細'} link={'/product-consume-report'} />
          <LinkItem itemName={'商品進銷貨報表'} link={'/product-invoicing-record-report'} />
          <LinkItem itemName={'商品庫存表'} link={'/product-inventoryList'} />
          <LinkItem itemName={'商品庫存盤點表'} link={'/product-reserve-check'} />
          <LinkItem itemName={'會員卡銷售報表'} link={'/membership-sell-report'} />
        </>
      ),
    },
    {
      value: 'management',
      label: '管理分析',
      icon: LayoutDashboard,
      visible: canManagement,
      children: (
        <>
          <LinkItem itemName={'費用分析表'} link={'/cost-analysis-report'} />
          <LinkItem itemName={'損益表'} link={'/income-statement-report'} />
          <LinkItem itemName={'多店業績統計表'} link={'/overall-performance-analysis-report'} />
          <LinkItem itemName={'顧客消費排行榜'} link={'/customer-consumption-leaderboard'} />
          <LinkItem itemName={'顧客入金排行榜'} link={'/customer-wallet-leaderboard'} />
          <LinkItem itemName={'消費分析儀表板'} link={'/consumption-analytics-dashboard'} />
          <LinkItem itemName={'多店店販銷售排行'} link={'/multi-merchants-leader-board'} />
        </>
      ),
    },
  ]
  // 桌機左右底色（Jason 追加指示，比照 Cursor Billing 截圖）：左選單欄整欄 bg-surface 淺灰、右內容 bg-background 白，
  // 兩欄以 gap-0 相接且不加 border／shadow 分隔；手機維持 settings-nav 頂部橫向分頁，不套此底色。
  const visibleCategories = categories.filter(category => category.visible)
  // 預設選第一個有權限的分類；目前選取若無權限（或權限尚未載入）一律退回第一個有權限者，不得切到無權限分類
  const activeCategory = visibleCategories.find(category => category.value === selectTab) || visibleCategories[0]
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
                <SettingsTabsTrigger key={category.value} value={category.value} icon={category.icon}>{category.label}</SettingsTabsTrigger>
              ))}
            </SettingsTabsList>
            <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
              <SettingsSectionHeading title={activeCategory.label} />
              <Card>
                <div className="flex flex-col p-2 pt-3">{activeCategory.children}</div>
              </Card>
            </div>
          </Tabs>
        )}
      </div>
    </Page>
  )
}
