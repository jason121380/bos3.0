import Page from 'components/Page'
import { Provider } from 'context/keyInContext'
// import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchGetOrderInputByQueueId from 'hooks/useFetchGetOrderInputByQueueId'
import produce from 'immer'
import { useState, useEffect, useRef } from 'react'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import useFetchGetBindedThirdPartTicketLockedSetting from 'hooks/useFetchGetBindedThirdPartTicketLockedSetting'
import useFetchGetBonusRewardRule from 'hooks/useFetchGetBonusRewardRule'
import useFetchGetIsBonusConversion from 'hooks/useFetchGetIsBonusConversion'
import { useFetchGetSerialNumberUsing, useFetchGetIsLBCusDisplay } from 'hooks/useFetchGetParameterOrderCreateSetting'
import { useFetchGetIsBonusRewardWithLine } from 'hooks/useFetchGetParameterAboutSettingFunction'
import idx from 'idx'

import Footer from './Footer'
import Head from './Head'
import Header from './Header'
import Pannel from './Pannel'
import { useClearWalletPayOnCustomerChange } from './PaymentCustomerWallet'

export default function KeyIn({ match }) {
  const onceRef = useRef(true)
  const order = useFetchGetOrderInputByQueueId(match.params.id)
  const getSerialNumberUsing = useFetchGetSerialNumberUsing()
  const [focus, setFocus] = useState('customer')
  const [thirdPartyCoupons, setThirdPartyCoupons] = useState([])
  const thirdPartyCouponsData = useFetchTHirdPartys()
  const getIsLBCusDisplay = useFetchGetIsLBCusDisplay()

  const [orderNo, setOrderNo] = useState('')
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
    no: '',
    bonusDecount: 0,
    bonusDeposit: 0,
    bonusUsed: 0,
    source: null,
    serialNumber: null
  })
  const getBindedThirdPartTicketLockedSetting = useFetchGetBindedThirdPartTicketLockedSetting()
  const [bindedThirdPart, setBindedThirdPart] = useState({
    service: false,
    product: false,
    membership: false,
  })
  const getBonusRewardRule = useFetchGetBonusRewardRule()
  const [bonusSetting, setBonusSetting] = useState({
    isUsing: false,
    rule: {
      price: 0,
      bonus: 0,
      mode: 'ROUNDING',
    }
  })
  const getIsBonusConversion = useFetchGetIsBonusConversion()
  const getIsBonusRewardWithLine = useFetchGetIsBonusRewardWithLine()
  const [bonusConversion, setBonusConversion] = useState({
    isBonusConversion: false,
    bonusConversionRate: 0
  })
  const [serialNumberUsing, setSerialNumberUsing] = useState(false)
  const [LBCusDisplay, setLBCusDisplay] = useState(false)
  const [bonusRewardWithLINE, setBonusRewardWithLINE] = useState(false)
  const [isLineBinded, setIsLineBinded] = useState(false)

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
    if (!getSerialNumberUsing.loading) {
      const data = idx(getSerialNumberUsing, _ => _.data.getParameterOrderCreateSetting.isOrderSerialNumberUsing)
      setSerialNumberUsing(data)
    }
  }, [getSerialNumberUsing.loading])

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
    if (!order.loading) {
      const orderDetail = JSON.parse(idx(order, _ => _.data.getOrderInputByQueueId))
      setOrderNo(orderDetail.no)
      setBill(
        produce(draft => {
          draft.no = orderDetail.no
          draft.date = orderDetail.date
          draft.isDesignate = orderDetail.isDesignate
          draft.isReserved = orderDetail.isReserved
          draft.payType = orderDetail.payType
          draft.amountByOtherPay = orderDetail.amountByOtherPay
          draft.walletPay = orderDetail.walletPay === null ? 0 : orderDetail.walletPay
          draft.customerId = orderDetail.customerId !== undefined ? orderDetail.customerId : undefined
          draft.customerCellphone = orderDetail.customerCellphone
          draft.designerId = orderDetail.designerId
          draft.serviceOrders = orderDetail.serviceOrders
          draft.productOrders = orderDetail.productOrders
          draft.ticketOrders = orderDetail.ticketOrders
          draft.membershipOrders = orderDetail.membershipOrders
          draft.remark = orderDetail.remark
          draft.withoutCustomerData = orderDetail.withoutCustomerData ?? false
          draft.isPending = orderDetail.isPending
          draft.bonusDecount = orderDetail.bonusDecount || 0
          draft.bonusDeposit = orderDetail.bonusDeposit || 0
          draft.bonusUsed = orderDetail.bonusUsed || 0
          draft.source = orderDetail?.source || null
          draft.serialNumber = orderDetail.serialNumber ?? null
        })
      )
    }
  }, [order.loading])
  // 換顧客（含清除顧客、改輸入新手機）時清空扣入金；寫在一直顯示的本頁，見 PaymentCustomerWallet
  useClearWalletPayOnCustomerChange({ bill, order, setBill })
  const handleBillChange = ({ value, key }) => {
    setBill(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  useEffect(() => {
    if (!getBonusRewardRule.loading) {
      const data = idx(getBonusRewardRule, _ => _.data.getParameterAboutSettingFunction.bonusRewardRule)
      setBonusSetting(data)
    }
  }, [getBonusRewardRule.loading])
  useEffect(() => {
    if(!getIsBonusConversion.loading) {
      const data = idx(getIsBonusConversion,_=>_.data.getParameterAboutSettingFunction)
      setBonusConversion(data)
    }
  }, [getIsBonusConversion.loading])

  // 確認欄位資料是否載入完成
  const [customerAlready, setCustomerAlready] = useState(false) // 客資
  const [employeeAlready, setEmployeeAlready] = useState(false) // 員工
  const [serviceAlready, setServiceAlready] = useState(false) // 項目消費 服務名稱代號
  const [serviceDetailAlready, setServiceDetailAlready] = useState(false) // 服務細項
  const [thirdPartyAlready, setThirdPartyAlready] = useState(false) // 第三方卡券
  const [productAlready, setProductAlready] = useState(false) // 店販銷售
  const [couponAlready, setCouponAlready] = useState(false) // 預收卡販賣
  const [paymentAlready, setPaymentAlready] = useState(false) // 其他付款方式
  const [membershipAlready, setMembershipAlready] = useState(false) // 會員卡販賣

  // 沒有要收的金額（服務、店販、預收卡、會員卡合計為 0，例如只有使用預收卡）時不顯示「其他付款方式」（Pannel 同一算式），
  // 付款方式清單不會載入、paymentAlready 不會變成 true；這時不必等付款方式清單，視為已載入。
  // 以目前帳單即時判斷、不寫入 paymentAlready：帳單從空白載入成有金額時，仍要等付款方式清單載入（2026/10/22）
  const otherPayLimit =
    bill.serviceOrders.reduce((total, item) => total + item.price, 0) +
    bill.productOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price), 0)
  const paymentReady = paymentAlready || (!order.loading && otherPayLimit === 0)

  // 重新結帳按鈕是否disabled
  const enable =
    !thirdPartyCouponsData.loading &&
      !order.loading &&
      customerAlready &&
      employeeAlready &&
      serviceAlready &&
      serviceDetailAlready &&
      thirdPartyAlready &&
      productAlready &&
      couponAlready &&
      paymentReady &&
      membershipAlready &&
      bill.amountByOtherPay === 0
      ? true
      : paymentReady


  return (
    <Page title={`重新開單 ${orderNo && `(${orderNo})`}`} className="ui-root">
      <>
      <Provider
        value={{
          handleBillChange,
          bill,
          orderId: match.params.id,
          setBill,
          orderNo,
          thirdPartyCoupons,
          focus,
          setFocus,
          customerAlready,
          setCustomerAlready,
          setServiceAlready,
          setServiceDetailAlready,
          setThirdPartyAlready,
          setEmployeeAlready,
          setProductAlready,
          setCouponAlready,
          setPaymentAlready,
          setMembershipAlready,
          order,
          bindedThirdPart,
          orderAlready: order.loading,
          onceRef,
          bonusSetting,
          bonusConversion,
          enable,
          serialNumberUsing,
          LBCusDisplay,
          isLineBinded,
          setIsLineBinded,
          bonusRewardWithLINE
        }}
      >
        <Header />
        <Head />
        {/* 版面比照打帳單：金額彙總卡與動作按鈕（Footer）放在 Pannel 下方的右欄；Footer 仍在這裡建立、props 不變 */}
        <Pannel>
          <Footer enable={enable} />
        </Pannel>
      </Provider>
      </>
    </Page>
  )
}
