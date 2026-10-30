import Page from 'components/Page'
import useFetchCustomer from 'hooks/useFetchCustomer'
import useFetchGetCustomerOrders from 'hooks/useFetchGetCustomerOrders'
import useFetchGetOrderStaticDetail from 'hooks/useFetchGetOrderStaticDetail'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetCustomerBonusRecord from 'hooks/useFetchGetCustomerBonusRecord'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetCustomerHairInfo from 'hooks/useFetchGetCustomerHairInfo'
import useFetchGetCustomerSMSRecord from 'hooks/useFetchGetCustomerSMSRecord'
import useFetchGetCustomerEventTicketsForMerchant from 'hooks/useFetchGetCustomerEventTicketsForMerchant'
import useFetchGetIsBookingCusCheckUsing from 'hooks/useFetchGetIsBookingCusCheckUsing'
import idx from 'idx'
import produce from 'immer'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom'
import ProgressBar from 'components/ProgressBar'
import pagenationLabel from './../../helper/pagenationLabel'
import { CreditCard, Gift, MessageSquare, Receipt, Star, Ticket, User, UserCheck, Wallet } from 'lucide-react'
import { Breadcrumb, PageHeader } from 'ui/page-header'
import { EmptyState } from 'ui/empty-state'
import { Tabs } from 'ui/tabs'
import { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading } from 'ui/settings-nav'

import { Provider } from '../../hooks/useStore'

import Coupon from './Coupon'
import General from './General'
import Invoices from './Invoices'
import TopUp from './TopUp'
import Bonus from './Bonus'
import CustomerTracking from './CustomerTracking'
import SMSRecord from './SMSRecord'
import EventTicketsRecord from './EventTicketsRecord'
import MembershipRecord from './MembershipRecord'
import cloneDeep from 'lodash/cloneDeep'
import QueryFailed from 'components/QueryFailed'

function CustomerManagementDetails({ match, history }) {
  const { id, tab: currentTab } = match.params
  const customer = useFetchCustomer({ id })
  const { refetch, loading } = customer
  const [progress, setProgress] = useState(0)
  const [bonusDisplay, setBonusDisplay] = useState(false)
  const params = new URLSearchParams(window.location.search)
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    totalCount: 0
  })
  const [orderIds, setOrtderIds] = useState([])
  const [orderList, setOrderList] = useState([])
  const [eventTickets, setEventTickets] = useState([])
  // null＝尚未算出；原本預設 false 會讓下方分頁計算永遠等不到條件（未開會員卡的店家看不到紅利分頁）
  const [membershipDisplay, setMembershipDisplay] = useState(null)
  // 分頁清單是否已依資料算好；算好之前不判斷 404，否則直接開啟／重新整理紅利、會員卡分頁會被導到 404
  const [tabsReady, setTabsReady] = useState(false)
  const [tabs, setTabs] = useState([
    { value: 'general', label: '基本資料' },
    { value: 'invoices', label: '消費記錄' },
    { value: 'coupon', label: '卡券紀錄' },
    { value: 'topup', label: '入金紀錄' },
    { value: 'customerTracking', label: '顧客追蹤' },
    { value: 'SMS', label: '簡訊發送紀錄' },
    { value: 'EventTicketsRecord', label: '抽獎券紀錄' }
  ])
  // 設定頁樣板（STYLE §12）：圖示只供 SettingsTabsTrigger 呈現，不改分頁 value／條件分頁順序／路由。
  const tabIcons = {
    general: User,
    invoices: Receipt,
    coupon: Ticket,
    topup: Wallet,
    bonus: Star,
    customerTracking: UserCheck,
    SMS: MessageSquare,
    EventTicketsRecord: Gift,
    membership: CreditCard,
  }
  const hairCondition = {
    hairProperties: [],
    scalpProperties: [],
    permAppliance: [],
    permPotion: [],
    hairColorCategory: [],
    hairColor: [],
    hairDyeFormula: ''
  }
  const [bookingCusCheck, setBookingCusCheck] = useState(false)

  const getCustomerOrders = useFetchGetCustomerOrders({
    customerId: id,
    pageLimit: pageSetting.pageLimit,
    pageOffset: pageSetting.pageOffset
  })
  const orderStaticDetail = useFetchGetOrderStaticDetail(orderIds)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const customerHairInfo = useFetchGetCustomerHairInfo(id)
  const getCustomerSMSRecord = useFetchGetCustomerSMSRecord({ input: { customerId: id } })
  const getCustomerEventTicketsForMerchant = useFetchGetCustomerEventTicketsForMerchant({ input: id })
  const getIsBookingCusCheckUsing = useFetchGetIsBookingCusCheckUsing()

  useEffect(() => {
    if (!getIsBookingCusCheckUsing.loading) {
      const data = idx(getIsBookingCusCheckUsing,_=>_.data.getIsBookingCusCheckUsing)
      setBookingCusCheck(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBookingCusCheckUsing.loading])

  useEffect(() => {
    // 帳單查詢失敗時不帶入（原本解構 undefined 整頁錯誤；消費記錄分頁改顯示 QueryFailed，2026/10/28）
    if (!getCustomerOrders.loading && idx(getCustomerOrders, _ => _.data.getCustomerOrders)) {
      const { orderList, totalCount, pageLimit, pageOffset } = idx(getCustomerOrders, _ => _.data.getCustomerOrders)
      const ids = orderList.map(d => d.id)
      setPageSetting({
        totalCount,
        pageLimit,
        pageOffset
      })
      setOrderList(orderList)
      setOrtderIds([...ids])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getCustomerOrders.loading])

  useEffect(() => {
    if (!orderStaticDetail.loading && getCustomerOrders.data) {
      const staticDetail = idx(orderStaticDetail, _ => _.data.getOrderStaticDetail)
      if (staticDetail.length) {
        // 複製再補上統計明細（查詢結果唯讀）
        const orders = cloneDeep(idx(getCustomerOrders, _ => _.data.getCustomerOrders.orderList))
        orders.forEach(({ id }, index) => {
          const findData = staticDetail.find(({ orderId }) => orderId === id)
          if (findData) {
            orders[index].staticDetail = findData.orderStaticDetail
          }
        });
        setOrderList(orders)
      }
    }
    // 含 getCustomerOrders.loading：重新查詢結果沒變時 data 不會換，但上面的 effect 會以不含明細的資料重設列表，這裡要再補一次明細
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [orderStaticDetail.loading, getCustomerOrders.loading, getCustomerOrders.data])

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !getCustomerOrders.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const orders = idx(getCustomerOrders,_ => _.data.getCustomerOrders.orderList) || []
      const membership = orders.reduce((a, b) => a + b.membership , 0)
      setMembershipDisplay(isMemberShipCardActive || membership !== 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading, getCustomerOrders.loading])

  useEffect(() => {
    if (!getCustomerEventTicketsForMerchant.loading) {
      const data = idx(getCustomerEventTicketsForMerchant, _ => _.data.customerEventTicketsForMerchant)
      setEventTickets(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getCustomerEventTicketsForMerchant.loading])

  const customerBonusActive = useFetchGetIsCustomerBonusActive()

  const customerBonusRecords = useFetchGetCustomerBonusRecord({
    customerId: id
  })

  const getIsCustomerBonusActive = useFetchGetIsCustomerBonusActive()

  const handleTabsChange = (_event, value) => {
    if (params.get('backto') === 'customer-filter') {
      history.push(value + '?backto=customer-filter')
    } else {
      history.push(value)
    }
  }
  useEffect(() => {
    if (!customerBonusRecords.loading && !getIsCustomerBonusActive.loading && membershipDisplay !== null && !loading) {
      const bonusActive = (idx(customerBonusRecords, _ => _.data.customerBonusRecord) || []).length > 0 || idx(getIsCustomerBonusActive, _ => _.data.getIsCustomerBonusActive)
      const newTabs = [
        { value: 'general', label: '基本資料' },
        { value: 'invoices', label: '消費記錄' },
        { value: 'coupon', label: '卡券紀錄' },
        { value: 'topup', label: '入金紀錄' },
        { value: 'customerTracking', label: '顧客追蹤' },
        { value: 'SMS', label: '簡訊發送紀錄' },
        { value: 'EventTicketsRecord', label: '抽獎券紀錄' }
      ]
      if (bonusActive) {
        newTabs.splice(3, 0, { value: 'bonus', label: '紅利點數紀錄' })
      }
      // 顧客查詢失敗或查無顧客時沒有會員卡紀錄（原本直接讀欄位拋錯；Jason 2026/10/22 fix all）
      if (membershipDisplay || (idx(customer, _ => _.data.customer.membershipPurchaseRecord) || []).length) {
        newTabs.push({ value: 'membership', label: '會員卡列表' })
      }
      setTabs(newTabs)
      setTabsReady(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [customerBonusRecords.loading, getIsCustomerBonusActive.l…] 變動時執行；customer、customerBonusRecords、getIsCustomerBonusActive 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [customerBonusRecords.loading, getIsCustomerBonusActive.loading, membershipDisplay, loading])

  useEffect(() => {
    if (!customerBonusActive.loading && !getCustomerOrders.loading) {
      const orders = idx(getCustomerOrders,_ => _.data.getCustomerOrders.orderList)
      const bonusDecount = (orders || []).reduce((a, b) => a + b.bonusDecountForReport , 0)
      setBonusDisplay(idx(customerBonusActive, _ => _.data.getIsCustomerBonusActive) || bonusDecount !== 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [customerBonusActive.loading, getCustomerOrders.loading])

  const currentTabName = idx(tabs, _ => _.find(tab => tab.value === currentTab).label)

  if (!currentTab) {
    return <Redirect to={`/management/customers/${id}/general`} />
  }

  if (!tabs.find(tab => tab.value === currentTab)) {
    return tabsReady ? <Redirect to="/errors/error-404" /> : null
  }
  const handlePageChange = (value, key) => {
    setPageSetting(
      produce(draft => {
        draft.pageOffset = key
      })
    )
  }
  const handleRowsPerPageChange = event => {
    setPageSetting(
      produce(draft => {
        draft.pageLimit = idx(event, _ => _.target.value)
        draft.pageOffset = 0
      })
    )
  }

  // 返回function
  const handleBack = () => {
    if (params.get('backto') === 'customer-filter') {
      history.goBack()
    } else {
      history.push('/management/customers')
    }
  }
  if (customer.loading && progress < 100)
    return (
      <ProgressBar dataLoading={customer.loading} progress={progress} setProgress={setProgress} />
    )

  const value = {
    refetch,
  }
  // 頁首導覽：麵包屑「客戶列表 › 姓名」與左側返回鈕，兩者都沿用原本的返回行為（handleBack）；
  // 從客資篩選匯出進來（backto=customer-filter）時，上一層顯示「客資篩選匯出」。名稱比照側欄與列表頁標題「客戶列表」。
  const fromCustomerFilter = params.get('backto') === 'customer-filter'
  const parentCrumb = fromCustomerFilter
    ? { label: '客資篩選匯出', href: '/management/customer-filter-export', onClick: handleBack }
    : { label: '客戶列表', href: '/management/customers', onClick: handleBack }

  // 顧客查詢失敗或查無此顧客：顯示找不到並可返回（原本直接讀 customer.data.customer.name 整頁錯誤；
  // 錯誤提示由 init-apollo 的 errorLink 統一顯示；Jason 2026/10/22 fix all）
  if (!idx(customer, _ => _.data.customer)) {
    return (
      <Page className="ui-root" title="顧客詳細資料">
        <div className="mx-auto w-full max-w-6xl">
          <PageHeader
            title="顧客詳細資料"
            breadcrumb={<Breadcrumb items={[parentCrumb]} />}
            back={{ label: `返回${parentCrumb.label}`, onClick: handleBack }}
          />
          {customer.error ? (
            <QueryFailed onRetry={() => customer.refetch()} />
          ) : (
            <EmptyState title="找不到這位顧客" description="資料可能已刪除或暫時無法讀取，請返回列表後再試一次" />
          )}
        </div>
      </Page>
    )
  }

  return (
    <Page className="ui-root" title={`${customer.data.customer.name} - ${currentTabName}`}>
      <Provider value={value}>
        <div className="mx-auto w-full max-w-6xl">
        {/* 查無顧客已在上方提早返回，這裡一定有顧客資料 */}
        <PageHeader
          title={customer.data.customer.name}
          description='顧客詳細資料'
          breadcrumb={<Breadcrumb items={[parentCrumb, { label: customer.data.customer.name }]} />}
          back={{ label: `返回${parentCrumb.label}`, onClick: handleBack }}
        />
        {/* 分頁值皆為字串、handler 只用到 value；activationMode="manual" 與舊版 MUI Tabs 相同：方向鍵只移動焦點，按 Enter／點擊才切換（切換會 history.push） */}
        {/* 設定頁樣板（STYLE §12）：桌機左選單＋右內容（左 surface／右 background、無分隔線由共用 settings-nav 承擔），手機頂部橫向捲動分頁；僅改版面殼，分頁內容元件不動 */}
        <Tabs
          className="md:flex md:items-stretch"
          onValueChange={value => handleTabsChange(null, value)}
          value={currentTab}
          activationMode="manual"
        >
          <SettingsTabsList aria-label="顧客詳細資料分類" className="noprint">
            {tabs.map(tab => (
              <SettingsTabsTrigger key={tab.value} value={tab.value} icon={tabIcons[tab.value]}>{tab.label}</SettingsTabsTrigger>
            ))}
          </SettingsTabsList>
          <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
            <SettingsSectionHeading title={currentTabName} />
        <div>
          {currentTab === 'general' && (
            <General
              bookingCusCheck={bookingCusCheck}
              customer={customer.data.customer}
              isLoading={customer.loading}
            />
          )}
          {currentTab === 'invoices' && getCustomerOrders.error && (
            <QueryFailed onRetry={() => getCustomerOrders.refetch()} />
          )}
          {currentTab === 'invoices' && !getCustomerOrders.error &&
            <Invoices
              orders={orderList}
              isLoading={getCustomerOrders.loading}
              membershipDisplay={membershipDisplay}
              bonusDisplay={bonusDisplay}
              pageSetting={pageSetting}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              pagenationLabel={pagenationLabel}
            />
          }
          {currentTab === 'coupon' && <Coupon customer={{ id }} pagenationLabel={pagenationLabel} />}
          {currentTab === 'topup' && <TopUp customer={{ id }} pagenationLabel={pagenationLabel} />}
          {currentTab === 'bonus' && <Bonus customer={{ id }} customerBonusRecords={customerBonusRecords} />}
          {currentTab === 'customerTracking' &&
            <CustomerTracking
              customerId={id}
              refetchHairInfo={() => customerHairInfo.refetch()}
              isLoading={customerHairInfo.loading}
              hairCondition={
                !customerHairInfo.loading ?
                  // 查詢失敗或沒有髮況資料時以空髮況顯示（原本傳 undefined 整頁錯誤；Jason 2026/10/22 fix all）
                  idx(customerHairInfo, _ => _.data.getCustomerHairInfo) || hairCondition : hairCondition
              }
            />
          }
          {currentTab === 'SMS' && (getCustomerSMSRecord.error ? (
            <QueryFailed onRetry={() => getCustomerSMSRecord.refetch()} />
          ) : (
            <SMSRecord records={!getCustomerSMSRecord.loading ? idx(getCustomerSMSRecord, _ => _.data.customerSMSRecord) || [] : []} />
          ))}
          {currentTab === 'EventTicketsRecord' && (getCustomerEventTicketsForMerchant.error ? (
            <QueryFailed onRetry={() => getCustomerEventTicketsForMerchant.refetch()} />
          ) : (
            <EventTicketsRecord data={eventTickets} isLoading={getCustomerEventTicketsForMerchant.loading} />
          ))}
          {currentTab === 'membership' && <MembershipRecord records={customer.data.customer.membershipPurchaseRecord} />}
        </div>
          </div>
        </Tabs>
        </div>
      </Provider>
    </Page>
  )
}

CustomerManagementDetails.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
}

export default CustomerManagementDetails