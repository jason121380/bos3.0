import Page from 'components/Page'
import { Provider } from 'context/keyInContext'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchOrder from 'hooks/useFetchOrder'
import produce from 'immer'
import { useEffect, useState, useRef } from 'react'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import idx from 'idx'
import useFetchGetBindedThirdPartTicketLockedSetting from 'hooks/useFetchGetBindedThirdPartTicketLockedSetting'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import { useFetchGetIsPrintWindowClosureDelayed, useFetchGetIsLBCusDisplay } from 'hooks/useFetchGetParameterOrderCreateSetting'
import { useFetchGetIsBonusRewardWithLine } from 'hooks/useFetchGetParameterAboutSettingFunction'
import useFetchGetBonusRewardRule from 'hooks/useFetchGetBonusRewardRule'
import useFetchGetIsBonusConversion from 'hooks/useFetchGetIsBonusConversion'
import useCheckDisablePendingOrder from 'hooks/useCheckDisablePendingOrder'
import { MuiScope } from 'ui/mui-theme'

import Footer from './Footer'
import Head from './Head'
import Header from './Header'
import Pannel from './Pannel'

export default function KeyIn({ match }) {
  const onceRef = useRef(true)
  const order = useFetchOrder({ id: match.params.id })
  const [focus, setFocus] = useState('customer')
  const { checkOrder } = useFetchCreateOrder()
  const [bill, setBill] = useState({
    isDesignate: false,
    date: new Date().getTime(),
    isReserved: false,
    payType: [],
    amountByOtherPay: 0,
    walletPay: 0,
    serviceOrders: [],
    productOrders: [],
    ticketOrders: [],
    useTicketOrders: [],
    membershipOrders: [],
    designerId: '',
    customerCellphone: '',
    linePay: false,
    remark: '',
    withoutCustomerData: false,
    bonusDecount: 0,
    bonusDeposit: 0,
    bonusUsed: 0,
    source: null,
    serialNumber: null
  })
  const getBindedThirdPartTicketLockedSetting = useFetchGetBindedThirdPartTicketLockedSetting()
  const getIsPrintWindowClosureDelayed = useFetchGetIsPrintWindowClosureDelayed()
  const getIsBonusConversion = useFetchGetIsBonusConversion()
  const getIsLBCusDisplay = useFetchGetIsLBCusDisplay()
  const getIsBonusRewardWithLine = useFetchGetIsBonusRewardWithLine()
  const [bindedThirdPart, setBindedThirdPart] = useState({
    service: false,
    product: false,
    membership: false,
  })
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const [bonusActive, setBonusActive] = useState(false)
  const [customerBonus, setCustomerBonus] = useState(0)
  const [thirdPartyCoupons, setThirdPartyCoupons] = useState([])
  const thirdPartyCouponsData = useFetchTHirdPartys()
  const [orderStatus, serOrderStatus] = useState('')
  const [orderSetting, setOrderSetting] = useState({
    orderId: '',
    isCloseAccount: false,
  })
  const [orderNo, setOrderNo] = useState('')
  const [pannelEditable, setPannelEditable] = useState({})
  const getBonusRewardRule = useFetchGetBonusRewardRule()
  const [bonusSetting, setBonusSetting] = useState({
    isUsing: false,
    rule: {
      price: 0,
      bonus: 0,
      mode: 'ROUNDING',
    }
  })

  const handleBillChange = ({ value, key }) => {
    setBill(prev => ({
      ...prev,
      [key]: value,
    }))
  }
  const useCheckOrderRef = useRef(checkOrder)
  const [closureDelayed, setClosureDelayed] = useState(false)
  const [bonusConversion, setBonusConversion] = useState({
    isBonusConversion: false,
    bonusConversionRate: 0
  })
  const [LBCusDisplay, setLBCusDisplay] = useState(false)
  const [bonusRewardWithLINE, setBonusRewardWithLINE] = useState(false)
  const [isLineBinded, setIsLineBinded] = useState(false)

  useCheckDisablePendingOrder()

  useEffect(() => {
    if (!getIsBonusRewardWithLine.loading) {
      const data = idx(getIsBonusRewardWithLine, _ => _.data.getParameterAboutSettingFunction.isBonusRewardWithLine)
      setBonusRewardWithLINE(data)
    }
  }, [getIsBonusRewardWithLine.loading])

  useEffect(() => {
    if (!getIsLBCusDisplay.loading) {
      const data = idx(getIsLBCusDisplay, _ => _.data.getParameterOrderCreateSetting.isLBCusDisplay)
      setLBCusDisplay(data)
    }
  }, [getIsLBCusDisplay.loading])

  useEffect(() => {
    if (!getIsPrintWindowClosureDelayed.loading) {
      const data = idx(getIsPrintWindowClosureDelayed, _ => _.data.getParameterOrderCreateSetting.isPrintWindowClosureDelayed)
      setClosureDelayed(data)
    }
  }, [getIsPrintWindowClosureDelayed.loading])

  useEffect(() => {
    if (!customerBonusActive.loading && onceRef.current) {
      const active = customerBonusActive.data.getIsCustomerBonusActive || bill.bonusDecount > 0 || bill.bonusDeposit > 0 || bill.bonusUsed > 0
      setBonusActive(active)
    }
  }, [customerBonusActive.loading, bill])

  useEffect(() => {
    if (!getBindedThirdPartTicketLockedSetting.loading) {
      const data = idx(getBindedThirdPartTicketLockedSetting, _ => _.data.getBindedThirdPartTicketLockedSetting)
      setBindedThirdPart(data)
    }
  }, [getBindedThirdPartTicketLockedSetting.loading])

  useEffect(() => {
    if (!thirdPartyCouponsData.loading) {
      const thirdPartyCoupons = idx(thirdPartyCouponsData, _ => _.data.merchant.thirdpartyCoupons)
      setThirdPartyCoupons(thirdPartyCoupons)
    }
  }, [thirdPartyCouponsData.loading])

  useEffect(() => {
    if (!order.loading && order.data) {
      setOrderSetting(
        produce(draft => {
          draft.orderId = order.data.order.id
          draft.isCloseAccount = order.data.order.isCloseAccount
        })
      )
      serOrderStatus(order.data.order.status)
      setOrderNo(order.data.order.no)
      setBill(
        produce(draft => {
          draft.date = order.data.order.date
          draft.isDesignate = order.data.order.isDesignate
          draft.isReserved = order.data.order.isReserved
          draft.payType = order.data.order.payType
          draft.amountByOtherPay = order.data.order.amountByOtherPay
          draft.walletPay = order.data.order.walletPay === null ? 0 : order.data.order.walletPay
          draft.customerId =
            order.data.order.customer.name !== '不留客資' ? order.data.order.customer.id : undefined
          draft.customerCellphone =
            order.data.order.customer.name !== '不留客資' ? order.data.order.customer.cellphone : ''
          draft.designerId = order.data.order.designer ? order.data.order.designer.id : ''
          draft.serviceOrders = order.data.order.serviceOrders.map(data => ({
            price: data.price,
            serviceId: data.service.id,
            thirdPartyCouponMerchantId: data.thirdPartyPayId,
            isLocked: data.service.isLocked,
            isNoCash: data.service.isNoCash,
            isBindedThirdPartTicketLocked: data.service.isBindedThirdPartTicketLocked,
            serviceOrderHelpers: data.helperList.map(helper => ({
              type: helper.type,
              isDesignate: helper.isDesignate,
              helperId: helper.helper.id,
              helperDeductiontype: helper.helperDeductionType,
            })),
          }))
          draft.productOrders = order.data.order.productOrders.map(product => ({
            sellerId: product.seller.id,
            productId: product.product.id,
            price: product.price,
            count: product.count,
            isLocked: product.isLocked,
            thirdPartyCouponMerchantId: product.thirdPartyPayId,
          }))
          draft.membershipOrders = order.data.order.membershipOrders.map(member => ({
            sellerId: member.seller.id,
            membershipUUID: member.membership.uuid,
            price: member.price,
            expiryDate: member.expiryDate,
            thirdPartyCouponMerchantId: member.thirdPartyPayId,
            remark: member.remark,
          }))
          draft.bonusDecount = order.data.order.bonusDecount
          draft.bonusDeposit = order.data.order.bonusDeposit
          draft.bonusUsed = order.data.order.bonusUsed
          draft.remark = order.data.order.remark
          draft.withoutCustomerData = order.data.order.customer.name === '不留客資'
          draft.source = order.data.order.source,
            draft.serialNumber = order.data.order.serialNumber ?? null
        })
      )
      setPannelEditable({
        isServiceEditable: order.data.order.isServiceEditable,
        isProductEditable: order.data.order.isProductEditable,
        isTicketSellingEditable: order.data.order.isTicketSellingEditable,
        isTicketUsageEditable: order.data.order.isTicketUsageEditable,
      })
    }
  }, [order.loading, order.data])

  useEffect(() => {
    if (bill.designerId) {
      const serviceOrdersNoIsLocked = bill.serviceOrders.map(
        ({ isLocked, thirdPartyPayName, ...keep }) => keep
      )
      bill.serviceOrders = serviceOrdersNoIsLocked
      const productOrdersNoIsLocked = bill.productOrders.map(({ isLocked, ...keep }) => keep)
      bill.productOrders = productOrdersNoIsLocked
      const ticketOrdersNoIsLocked = bill.ticketOrders.map(({ isLocked, ...keep }) => keep)
      bill.ticketOrders = ticketOrdersNoIsLocked
      useCheckOrderRef.current(bill)
    }
  }, [])

  useEffect(() => {
    if (!getBonusRewardRule.loading) {
      const data = idx(getBonusRewardRule, _ => _.data.getParameterAboutSettingFunction.bonusRewardRule)
      setBonusSetting(data)
    }
  }, [getBonusRewardRule.loading])

  useEffect(() => {
    if (!getIsBonusConversion.loading) {
      const data = idx(getIsBonusConversion, _ => _.data.getParameterAboutSettingFunction)
      setBonusConversion(data)
    }
  }, [getIsBonusConversion.loading])

  return (
    <Page title={`掛單詳細 ${orderNo && `(${orderNo})`}`} className="ui-root">
      <MuiScope>
      <Provider
        value={{
          handleBillChange,
          bill,
          setBill,
          orderId: match.params.id,
          orderSetting,
          setBill,
          orderStatus,
          orderNo,
          pannelEditable,
          thirdPartyCoupons,
          focus,
          setFocus,
          bindedThirdPart,
          order: order.data != undefined && order.data.order,
          orderDetail: order,
          bonusActive,
          customerBonus,
          setCustomerBonus,
          onceRef,
          closureDelayed,
          bonusSetting,
          bonusConversion,
          LBCusDisplay,
          isLineBinded,
          setIsLineBinded,
          bonusRewardWithLINE
        }}
      >
        <Header />
        <Head />
        <Pannel />
        <Footer />
      </Provider>
      </MuiScope>
    </Page>
  )
}
