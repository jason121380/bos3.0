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

// 沒有登入資料時導向登入並直接結束：不送權限查詢、不畫內容（Jason 2026/10/22 fix all；原本同一次渲染仍以 "/auth/login" 當 id 查詢）
export default function DashBoardListDetail() {
  if (localStorage.getItem('user') === null) {
    window.location = '/auth/login'
    return null
  }
  return <DashBoardListContent />
}

// 頁面外距由 layouts/Dashboard 的 #printContainer 提供（與其他頁一致），此處不再另加
// 單一報表連結：只在登入者有該報表權限時顯示。定義在模組層（不在父元件內），切換分類時不會重新掛載整批連結。
function LinkItem({ userPageAuth, itemName, link }) {
  const item = hasReportAuthority(userPageAuth, [itemName]) ? itemName : ''
  if (!item) return ''
  return (
    <RouterLink
      to={link}
      className={cn('group flex h-10 items-center justify-between rounded-md px-3 text-body text-text hover:bg-surface-hover', focusRing)}
    >
      {item}
      <ChevronRight className="h-4 w-4 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
    </RouterLink>
  )
}

// 「報表及分析」區塊內，names 任一報表有權限即為 true（分類是否顯示、連結是否顯示共用同一判斷）
function hasReportAuthority(userPageAuth, names) {
  let found = false
  userPageAuth
    .filter(a => a.pageTitle === '報表及分析')
    .forEach(a => {
      a.pageAuthority.filter(a => {
        names.forEach(i => {
          if (a.pageName === i && a.authority === true) found = true
        })
        return false
      })
    })
  return found
}

function DashBoardListContent() {
  // 權限只查一次（原本 41 個 LinkItem 與 6 個分類各自呼叫同一支查詢、每次切換分類全部重新掛載）；
  // 權限查詢是 cache-and-network（2026/10/22），有資料就先用（不等重抓完成），否則切換分類後連結會先消失到重抓回來
  const [userPageAuth, setUserPageAuth] = useState([])
  const designerId = storedUserId()
  const apiUserPermissions = useFetchUserPermission({
    id: designerId === undefined ? null : designerId,
  })
  useEffect(() => {
    if (apiUserPermissions.data) {
      const userPageAuth = idx(apiUserPermissions, _ => _.data.user.pageAuthority.pageAuthority)
      setUserPageAuth(userPageAuth || [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [apiUserPermissions.data] 變動時執行；apiUserPermissions 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [apiUserPermissions.data])
  const SubMenuItem = Arr => hasReportAuthority(userPageAuth, Arr)
  const [selectTab, setSelectTab] = useState('daily')
  // SubMenuItem 內含 hooks，必須以固定順序、固定次數無條件呼叫六次（與舊版相同順序），
  // 不得依權限結果條件式呼叫；權限只決定下方選單是否顯示該分類。
  // 各分類的清單須包含下方所有連結的報表名稱（Jason 2026/10/22 fix all：補上原本漏列的設計師業績分析表、商品庫存表、顧客消費／入金排行榜）
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
  const canDesigner = SubMenuItem(['設計師業績分析表', '設計師排行榜', '設計師抽成報表', '設計師業績月報表', '服務扣項明細表', '設計師業績表'])
  const canHelper = SubMenuItem(['互助排行榜', '互助點數明細', '互助月報表', '互助業績報表'])
  // 「設計師店販抽成明細」前端沒有這張報表，只有這個權限時分類會是空的；Jason 2026/10/22 選擇從清單移除
  const canProduct = SubMenuItem([
    '店販抽成明細',
    '店販分類抽成明細',
    '商品銷售排行榜',
    '商品消耗明細',
    '商品進銷貨報表',
    '會員卡銷售報表',
    '商品庫存表',
    '商品庫存盤點表',
  ])
  const canManagement = SubMenuItem([
    '費用分析表',
    '損益表',
    '多店業績統計表',
    '顧客消費排行榜',
    '顧客入金排行榜',
    '消費分析儀表板',
    '多店店販銷售排行',
  ])
  const categories = [
    {
      value: 'daily',
      label: '日報表',
      icon: CalendarDays,
      visible: canDaily,
      children: (
        <>
          <LinkItem userPageAuth={userPageAuth} itemName={'店家日報表'} link={'/merchant-daily-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'設計師日報表'} link={'/employee-daily-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'互助日報表'} link={'/decrease-daily-report'} />
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
          <LinkItem userPageAuth={userPageAuth} itemName={'店家區間累計表'} link={'/merchant-business-interval-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'店家排行榜'} link={'/merchant-leader-board'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'全店業績分析表'} link={'/designer/perform/overview'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'每日業績分析表'} link={'/merchant-daily-performance-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'每日收支明細'} link={'/money-flow-daily-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'收支分類明細表'} link={'/money-flow-category-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'收支匯款表'} link={'/money-flow-transfer-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'每日非現金明細'} link={'/payment-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'單一服務項目查詢'} link={'/single-service-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'非現金明細對帳單'} link={'/non-cash-statement-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'顧客卡券餘額表'} link={'/customer-coupon-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'顧客入金餘額表'} link={'/customer-wallet-balance'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'營業統計分析表'} link={'/business-analysis-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'營業項目月分析表'} link={'/business-items-monthly-analyze-report'} />
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
          <LinkItem userPageAuth={userPageAuth} itemName={'設計師業績分析表'} link={'/designer-performance-analyze-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'設計師排行榜'} link={'/designer-perform-basic'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'設計師抽成報表'} link={'/designer-rake-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'設計師業績月報表'} link={'/designer-monthly-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'服務扣項明細表'} link={'/service-deduction-detail-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'設計師業績表'} link={'/designer-performance-report'} />
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
          <LinkItem userPageAuth={userPageAuth} itemName={'互助排行榜'} link={'/helper-leaderboard'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'互助點數明細'} link={'/decrease/detail'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'互助月報表'} link={'/helper-monthly-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'互助業績報表'} link={'/helper-performance'} />
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
          <LinkItem userPageAuth={userPageAuth} itemName={'店販抽成明細'} link={'/merchant/sells/records'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'店販分類抽成明細'} link={'/merchant/category/sells/records'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'商品銷售排行榜'} link={'/product-leader-board'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'商品消耗明細'} link={'/product-consume-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'商品進銷貨報表'} link={'/product-invoicing-record-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'商品庫存表'} link={'/product-inventoryList'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'商品庫存盤點表'} link={'/product-reserve-check'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'會員卡銷售報表'} link={'/membership-sell-report'} />
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
          <LinkItem userPageAuth={userPageAuth} itemName={'費用分析表'} link={'/cost-analysis-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'損益表'} link={'/income-statement-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'多店業績統計表'} link={'/overall-performance-analysis-report'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'顧客消費排行榜'} link={'/customer-consumption-leaderboard'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'顧客入金排行榜'} link={'/customer-wallet-leaderboard'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'消費分析儀表板'} link={'/consumption-analytics-dashboard'} />
          <LinkItem userPageAuth={userPageAuth} itemName={'多店店販銷售排行'} link={'/multi-merchants-leader-board'} />
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
    <Page className="ui-root" title="報表目錄">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="報表目錄" description="依類別瀏覽有權限的報表" />
        {activeCategory && (
          <Tabs className="md:flex md:items-stretch md:gap-0" value={activeCategory.value} onValueChange={setSelectTab} activationMode="manual">
            <SettingsTabsList className="md:bg-surface md:px-2 md:py-4">
              {visibleCategories.map(category => (
                <SettingsTabsTrigger key={category.value} value={category.value} icon={category.icon}>
                  {category.label}
                </SettingsTabsTrigger>
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
