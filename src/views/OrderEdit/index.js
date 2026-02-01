/** @jsxImportSource @emotion/react */
import Page from 'components/Page'
import { Provider } from 'context/keyInContext'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import useFetchOrder from 'hooks/useFetchOrder'
import produce from 'immer'
import { useState, useRef, useEffect } from 'react'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import useFetchGetBindedThirdPartTicketLockedSetting from 'hooks/useFetchGetBindedThirdPartTicketLockedSetting'
import useFetchGetBonusRewardRule from 'hooks/useFetchGetBonusRewardRule'
import useFetchGetIsBonusConversion from 'hooks/useFetchGetIsBonusConversion'
import { useFetchGetSerialNumberUsing, useFetchGetIsLBCusDisplay } from 'hooks/useFetchGetParameterOrderCreateSetting'
import { useFetchGetDisablePendingOrder } from 'hooks/useFetchGetParameterAboutSettingFunction'
import { useFetchGetIsBonusRewardWithLine, useFetchGetIsComboSetting } from 'hooks/useFetchGetParameterAboutSettingFunction'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import addDays from 'date-fns/addDays'

import Footer from './Footer'
import Head from './Head'
import Header from './Header'
import Pannel from './Pannel'

const styles = {
  root: css({
    padding: theme.spacing(3),
  }),
}

export default function KeyIn({ match }) {
  const onceRef = useRef(true)
  const order = useFetchOrder({ id: match.params.id })
  const getSerialNumberUsing = useFetchGetSerialNumberUsing()
  const getIsBonusRewardWithLine = useFetchGetIsBonusRewardWithLine()
  const [focus, setFocus] = useState('customer')
  const [thirdPartyCoupons, setThirdPartyCoupons] = useState([])
  const thirdPartyCouponsData = useFetchTHirdPartys()
  const getIsLBCusDisplay = useFetchGetIsLBCusDisplay()
  const { checkOrder } = useFetchCreateOrder()
  const [orderStatus, serOrderStatus] = useState('')
  const [orderSetting, setOrderSetting] = useState({
    orderId: '',
    isCloseAccount: false,
  })
  const [orderNo, setOrderNo] = useState('')
  const [pannelEditable, setPannelEditable] = useState({})
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
    raffleRecord: [],
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
  const [bonusConversion, setBonusConversion] = useState({
    isBonusConversion: false,
    bonusConversionRate: 0
  })
  const [serialNumberUsing, setSerialNumberUsing] = useState(false)
  const [LBCusDisplay, setLBCusDisplay] = useState(false)
  const [bonusRewardWithLINE, setBonusRewardWithLINE] = useState(false)
  const [isLineBinded, setIsLineBinded] = useState(false)
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()
  const disablePendingOrder = getDisablePendingOrder.loading ? true : getDisablePendingOrder.data.getParameterAboutSettingFunction.disablePendingOrder
  const getIsComboSetting = useFetchGetIsComboSetting()
  const [shortcut, setShortcut] = useState({
    services: [],
    products: [],
    tickets: [],
    memberships: []
  })
  const [services, setServices] = useState([])
  const [sData, setSData] = useState([])
  const [sells, setSells] = useState([])
  const [pData, setPData] = useState([])
  const [couponSells, setCouponSells] = useState([])
  const [tData, setTData] = useState([])
  const [memberCardSells, setMemberCardSells] = useState([])
  const [mData, setMData] = useState([])

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
    if(!getIsBonusConversion.loading) {
      const data = idx(getIsBonusConversion,_=>_.data.getParameterAboutSettingFunction)
      setBonusConversion(data)
    }
  }, [getIsBonusConversion.loading])
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
            thirdPartyPayName: data.thirdPartyPayName,
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
          draft.ticketOrders = order.data.order.ticketOrders.map(d =>
          ({
            serviceId: d.service.id,
            availableCount: d.availableCount,
            price: d.price,
            count: d.count,
            remark: d.remark,
            intoPerformanceWhileBuying: d.intoPerformanceWhileBuying,
          }))
          draft.source = order.data.order.source
          draft.serialNumber = order.data.order.serialNumber ?? null
          draft.raffleRecord = order.data.order.raffleRecord
        })
      )
      setPannelEditable({
        isServiceEditable: order.data.order.isServiceEditable,
        isProductEditable: order.data.order.isProductEditable,
        isTicketSellingEditable: order.data.order.isTicketSellingEditable,
        isTicketUsageEditable: order.data.order.isTicketUsageEditable,
      })

    }
  }, [order.loading])
  const handleBillChange = ({ value, key }) => {
    setBill(prev => ({
      ...prev,
      [key]: value,
    }))
  }
  const useCheckOrderRef = useRef(checkOrder)

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
    const serviceArr = []
    const productArr = []
    const couponArr = []
    const memberArr = []
    
    for (let i = 0; i < shortcut.services.length; i++) {
      const id = shortcut.services[i];
      const value = sData.find(d => d.id === id)
      value && serviceArr.push({
        ...value,
        serviceId: value.id,
        price: value.price,
        isLocked: value.isLocked,
        isNoCash: value.isNoCash,
        thirdPartyCouponMerchantId: value.bindedThirdPartTicket === null ? null : value.bindedThirdPartTicket.id,
        isBindedThirdPartTicketLocked: value.isBindedThirdPartTicketLocked,
        serviceOrderHelpers: []
      })
    }
    for (let i = 0; i < shortcut.products.length; i++) {
      const id = shortcut.products[i];
      const value = pData.find(d => d.id === id)
      value && productArr.push({
        ...value,
        productId: value.id,
        price: value.sellPrice,
        count: 1,
        isLocked: value.isLocked,
      })
    }
    for (let i = 0; i < shortcut.tickets.length; i++) {
      const id = shortcut.tickets[i];
      const value = tData.find(d => d.id === id)
      value && couponArr.push({
        ...value,
        serviceId: value.id,
        availableCount: value.ticketAvailableCount,
        price: value.price,
        remark: '',
        isLocked: value.isLocked,
        count: 1
      })
    }
    for (let i = 0; i < shortcut.memberships.length; i++) {
      const id = shortcut.memberships[i];
      const value = mData.find(d => d.uuid === id)
      value && memberArr.push({
        ...value,
        membershipUUID: value.uuid,
        price: value.sellPrice,
        expiryDate: value.effecitveDay === 0 ? null : addDays(new Date(), value.effecitveDay).getTime(),
        isLocked: value.isLocked,
        effecitveDay: value.effecitveDay,
      })
    }

    let newServices = _.cloneDeep(services)
    let newSells = _.cloneDeep(sells)
    let newCouponSells = _.cloneDeep(couponSells)
    let newMemberCardSells = _.cloneDeep(memberCardSells)

    if (newServices.length === 1 && newServices[0].serviceId === '' && serviceArr.length > 0) {
      newServices = serviceArr
    } else {
      newServices = [...newServices, ...serviceArr]
    }
    if (sells.length === 1 && sells[0].productId === '' && productArr.length > 0) {
      newSells = productArr
    } else {
      newSells = [...newSells, ...productArr]
    }
    if (newCouponSells.length === 1 && newCouponSells[0].serviceId === '' && couponArr.length > 0) {
      newCouponSells = couponArr
    } else {
      newCouponSells = [...newCouponSells, ...couponArr]
    }
    if (newMemberCardSells.length === 1 && newMemberCardSells[0].membershipUUID === '' && memberArr.length > 0) {
      newMemberCardSells = memberArr
    } else {
      newMemberCardSells = [...newMemberCardSells, ...memberArr]
    }

    const serviceOrders = newServices
      .filter(d => d.serviceId)
      .map(d => ({
        serviceId: d.serviceId,
        price: d.price,
        thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
        serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
        isNoCash: d.isNoCash,
      }))
    
    const productOrders = newSells
      .filter(d => d.count > 0)
      .map(data => ({
        sellerId: data.sellerId,
        productId: data.productId,
        price: data.price || 0,
        count: data.count,
        isLocked: data.isLocked,
        thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
      }))

    const ticketOrders = newCouponSells
      .filter(d => d.serviceId)
      .map(data => ({
        serviceId: data.serviceId,
        availableCount: data.availableCount,
        price: data.price,
        count: data.count,
        remark: data.remark,
        isLocked: data.isLocked,
        intoPerformanceWhileBuying: data.intoPerformanceWhileBuying,
      }))

    const membershipOrders = newMemberCardSells.map(data => ({
      sellerId: data.sellerId,
      membershipUUID: data.membershipUUID,
      price: data.price,
      expiryDate: data.expiryDate === NaN || data.expiryDate === 'Invalid Date' || data.expiryDate === "Early Date" ||data.expiryDate === "Late Date"?'Invalid Date':data.expiryDate,
      thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
      remark: data.remark,
    }))

    setServices(newServices)
    setSells(newSells)
    setCouponSells(newCouponSells)
    setMemberCardSells(newMemberCardSells)

    setBill(
      produce(draft => {
        draft.serviceOrders = serviceOrders
        draft.productOrders = productOrders
        draft.ticketOrders = ticketOrders
        draft.membershipOrders = membershipOrders
      })
    )

  }, [shortcut])

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

  const shortBtnDisable = !(serviceAlready && productAlready && couponAlready && membershipAlready)

  const comboActive = !getIsComboSetting.loading
    ? getIsComboSetting.data.getParameterAboutSettingFunction.isComboUsing
    : false

  const handleShortcutChange = ({
    services, products, tickets, memberships
  }) => {
    const getIds = arr => arr.map(d => d.id || d.uuid)
    const obj = {
      services: getIds(services),
      products: getIds(products),
      tickets: getIds(tickets),
      memberships: getIds(memberships)
    }
    setShortcut(obj)
  }

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
      paymentAlready &&
      membershipAlready &&
      bill.amountByOtherPay === 0
      ? true
      : paymentAlready

  return (
    <Page title={`帳單詳細 ${orderNo ? `(${orderNo})` : ''}`} css={styles.root}>
      <Provider
        value={{
          handleBillChange,
          bill,
          orderId: match.params.id,
          orderSetting,
          setBill,
          orderStatus,
          orderNo,
          pannelEditable,
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
          disablePendingOrder,
          shortcut,
          handleShortcutChange,
          bonusRewardWithLINE,
          shortBtnDisable,
          comboActive,
          services,
          setServices,
          sData,
          setSData,
          sells,
          setSells,
          pData,
          setPData,
          couponSells,
          setCouponSells,
          tData,
          setTData,
          memberCardSells,
          setMemberCardSells,
          mData,
          setMData,
        }}
      >
        <Header />
        <Head />
        <Pannel />
        <Footer enable={enable} />
      </Provider>
    </Page>
  )
}
