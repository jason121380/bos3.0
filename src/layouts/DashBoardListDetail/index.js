import { useEffect, useState } from 'react'
import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import idx from 'idx'
import useFetchUserPermission from 'hooks/useFetchUser'
import { ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { PageHeader } from 'ui/page-header'
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
      .map(a => {
        a.pageAuthority.filter(a => {
          if (a.pageName === props.itemName && a.authority === true) {
            item = props.itemName
          }
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
      .map(a => {
        a.pageAuthority.filter(a => {
          Arr.map(i => {
            if (a.pageName === i && a.authority === true) {
              subItem.push(i)
            }
          })
        })
      })
    if (subItem.length > 0) {
      return true
    } else {
      return false
    }
  }
  // 每個分類一張卡片；SubMenuItem 的呼叫順序與參數與舊版相同（內含 hooks）
  const section = (title, children) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="flex flex-col p-2 pt-3">{children}</div>
    </Card>
  )
  return (
    <Page className="ui-root" title='報表目錄'>
      <PageHeader title="報表目錄" description="依類別瀏覽有權限的報表" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {SubMenuItem(['店家日報表', '設計師日報表', '互助日報表']) && section('日報表', <>
          <LinkItem itemName={'店家日報表'} link={'/merchant-daily-report'} />
          <LinkItem itemName={'設計師日報表'} link={'/employee-daily-report'} />
          <LinkItem itemName={'互助日報表'} link={'/decrease-daily-report'} />
        </>)}
        {SubMenuItem([
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
        ]) && section('營業', <>
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
        </>)}
        {SubMenuItem(['設計師排行榜', '設計師抽成報表', '設計師業績月報表', '服務扣項明細表', '設計師業績表']) && section('設計師', <>
          <LinkItem itemName={'設計師業績分析表'} link={'/designer-perforamnce-analyze-report'} />
          <LinkItem itemName={'設計師排行榜'} link={'/designer-perform-basic'} />
          <LinkItem itemName={'設計師抽成報表'} link={'/designer-rake-report'} />
          <LinkItem itemName={'設計師業績月報表'} link={'/designer-monthly-report'} />
          <LinkItem itemName={'服務扣項明細表'} link={'/service-deduction-detail-report'} />
          <LinkItem itemName={'設計師業績表'} link={'/designer-performance-report'} />
        </>)}
        {SubMenuItem(['互助排行榜', '互助點數明細', '互助月報表', '互助業績報表']) && section('互助', <>
          <LinkItem itemName={'互助排行榜'} link={'/helper-leaderboard'} />
          <LinkItem itemName={'互助點數明細'} link={'/decrease/detail'} />
          <LinkItem itemName={'互助月報表'} link={'/helper-monthly-report'} />
          <LinkItem itemName={'互助業績報表'} link={'/helper-performance'} />
        </>)}
        {SubMenuItem(['店販抽成明細', '店販分類抽成明細', '商品銷售排行榜', '商品消耗明細', '設計師店販抽成明細', '商品進銷貨報表', '會員卡銷售報表', '商品庫存盤點表']) && section('商品', <>
          <LinkItem itemName={'店販抽成明細'} link={'/merchant/sells/records'} />
          <LinkItem itemName={'店販分類抽成明細'} link={'/merchant/category/sells/records'} />
          <LinkItem itemName={'商品銷售排行榜'} link={'/product-leader-board'} />
          <LinkItem itemName={'商品消耗明細'} link={'/product-consume-report'} />
          <LinkItem itemName={'商品進銷貨報表'} link={'/product-invoicing-record-report'} />
          <LinkItem itemName={'商品庫存表'} link={'/product-inventoryList'} />
          <LinkItem itemName={'商品庫存盤點表'} link={'/product-reserve-check'} />
          <LinkItem itemName={'會員卡銷售報表'} link={'/membership-sell-report'} />
        </>)}
        {SubMenuItem(['費用分析表', '損益表', '多店業績統計表', '消費分析儀表板', '多店店販銷售排行']) && section('管理分析', <>
          <LinkItem itemName={'費用分析表'} link={'/cost-analysis-report'} />
          <LinkItem itemName={'損益表'} link={'/income-statement-report'} />
          <LinkItem itemName={'多店業績統計表'} link={'/overall-performance-analysis-report'} />
          <LinkItem itemName={'顧客消費排行榜'} link={'/customer-consumption-leaderboard'} />
          <LinkItem itemName={'顧客入金排行榜'} link={'/customer-wallet-leaderboard'} />
          <LinkItem itemName={'消費分析儀表板'} link={'/consumption-analytics-dashboard'} />
          <LinkItem itemName={'多店店販銷售排行'} link={'/multi-merchants-leader-board'} />
        </>)}
      </div>
    </Page>
  )
}
