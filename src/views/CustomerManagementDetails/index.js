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
import _ from 'lodash'
import pagenationLabel from './../../helper/pagenationLabel'
import { ArrowLeft } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'

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
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [tabs, setTabs] = useState([
    { value: 'general', label: '基本資料' },
    { value: 'invoices', label: '消費記錄' },
    { value: 'coupon', label: '卡券紀錄' },
    { value: 'topup', label: '入金紀錄' },
    { value: 'customerTracking', label: '顧客追蹤' },
    { value: 'SMS', label: '簡訊發送紀錄' },
    { value: 'EventTicketsRecord', label: '抽獎券紀錄' }
  ])
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
  }, [getIsBookingCusCheckUsing.loading])

  useEffect(() => {
    if (!getCustomerOrders.loading) {
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
  }, [getCustomerOrders.loading])

  useEffect(() => {
    if (!orderStaticDetail.loading && getCustomerOrders.data) {
      const staticDetail = idx(orderStaticDetail, _ => _.data.getOrderStaticDetail)
      if (staticDetail.length) {
        const orders = idx(getCustomerOrders, _ => _.data.getCustomerOrders.orderList)
        orders.forEach(({ id }, index) => {
          const findData = staticDetail.find(({ orderId }) => orderId === id)
          if (findData) {
            orders[index].staticDetail = findData.orderStaticDetail
          }
        });
        setOrderList(orders)
      }
    }
  }, [orderStaticDetail.loading, getCustomerOrders.data])

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !getCustomerOrders.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const orders = idx(getCustomerOrders,_ => _.data.getCustomerOrders.orderList)
      const membership = orders.reduce((a, b) => a + b.membership , 0)
      setMembershipDisplay(isMemberShipCardActive || membership !== 0)
    }
  }, [isMemberShipCardActiveData.loading, getCustomerOrders.loading])

  useEffect(() => {
    if (!getCustomerEventTicketsForMerchant.loading) {
      const data = idx(getCustomerEventTicketsForMerchant, _ => _.data.customerEventTicketsForMerchant)
      setEventTickets(data)
    }
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
    if (!customerBonusRecords.loading && !getIsCustomerBonusActive.loading && membershipDisplay && !loading) {
      const bonusActive = customerBonusRecords.data.customerBonusRecord.length > 0 || getIsCustomerBonusActive.data.getIsCustomerBonusActive
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
      if (membershipDisplay || customer.data.customer.membershipPurchaseRecord.length) {
        newTabs.push({ value: 'membership', label: '會員卡列表' })
      }
      setTabs(newTabs)
    }
  }, [customerBonusRecords.loading, getIsCustomerBonusActive.loading, membershipDisplay, loading])

  const currentTabName = idx(tabs, _ => _.find(tab => tab.value === currentTab).label)

  if (!currentTab) {
    return <Redirect to={`/management/customers/${id}/general`} />
  }

  if (!tabs.find(tab => tab.value === currentTab)) {
    return <Redirect to="/errors/error-404" />
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

  useEffect(() => {
    if (!customerBonusActive.loading && !getCustomerOrders.loading) {
      const orders = idx(getCustomerOrders,_ => _.data.getCustomerOrders.orderList)
      const bonusDecount = orders.reduce((a, b) => a + b.bonusDecountForReport , 0)
      setBonusDisplay(customerBonusActive.data.getIsCustomerBonusActive || bonusDecount !== 0)
    }
  }, [customerBonusActive.loading, getCustomerOrders.loading])

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

  return (
    <Page className="ui-root" title={`${customer.data.customer.name} - ${currentTabName}`}>
      <Provider value={value}>
        {idx(customer, _ => (_.data.customer ? <PageHeader title={_.data.customer.name} description='顧客詳細資料' /> : ''))}
        {/* 分頁值皆為字串、handler 只用到 value；activationMode="manual" 與舊版 MUI Tabs 相同：方向鍵只移動焦點，按 Enter／點擊才切換（切換會 history.push） */}
        <Tabs
          onValueChange={value => handleTabsChange(null, value)}
          value={currentTab}
          activationMode="manual"
        >
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="mt-6">
          {currentTab === 'general' && (
            <General
              bookingCusCheck={bookingCusCheck}
              customer={customer.data.customer}
              isLoading={customer.loading}
            />
          )}
          {currentTab === 'invoices' &&
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
                  idx(customerHairInfo, _ => _.data.getCustomerHairInfo) : hairCondition
              }
            />
          }
          {currentTab === 'SMS' && <SMSRecord records={!getCustomerSMSRecord.loading ? getCustomerSMSRecord.data.customerSMSRecord : []} />}
          {currentTab === 'EventTicketsRecord' && <EventTicketsRecord data={eventTickets} isLoading={getCustomerEventTicketsForMerchant.loading} />}
          {currentTab === 'membership' && <MembershipRecord records={customer.data.customer.membershipPurchaseRecord} />}
        </div>

        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={handleBack}
          >
            <ArrowLeft strokeWidth={1.75} />
            返回
          </Button>
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