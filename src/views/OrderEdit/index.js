import Page from 'components/Page'
import QueryFailed from 'components/QueryFailed'
import { Provider } from 'context/keyInContext'
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
import cloneDeep from 'lodash/cloneDeep'
import addDays from 'date-fns/addDays'

import Footer from './Footer'
import Head from './Head'
import Header from './Header'
import Panel from './Panel'
import useOncePerOrder from './useOncePerOrder'

export default function KeyIn({ match }) {
  const onceRef = useRef(true)
  const order = useFetchOrder({ id: match.params.id })
  const isFirstLoad = useOncePerOrder()
  const getSerialNumberUsing = useFetchGetSerialNumberUsing()
  const getIsBonusRewardWithLine = useFetchGetIsBonusRewardWithLine()
  const [focus, setFocus] = useState('customer')
  const [thirdPartyCoupons, setThirdPartyCoupons] = useState([])
  const thirdPartyCouponsData = useFetchTHirdPartys()
  const getIsLBCusDisplay = useFetchGetIsLBCusDisplay()
  const [orderStatus, serOrderStatus] = useState('')
  const [orderSetting, setOrderSetting] = useState({
    orderId: '',
    isCloseAccount: false,
  })
  const [orderNo, setOrderNo] = useState('')
  const [panelEditable, setPanelEditable] = useState({})
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
    serialNumber: null,
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
    },
  })

  const getIsBonusConversion = useFetchGetIsBonusConversion()
  const [bonusConversion, setBonusConversion] = useState({
    isBonusConversion: false,
    bonusConversionRate: 0,
  })
  const [serialNumberUsing, setSerialNumberUsing] = useState(false)
  const [LBCusDisplay, setLBCusDisplay] = useState(false)
  const [bonusRewardWithLINE, setBonusRewardWithLINE] = useState(false)
  const [isLineBinded, setIsLineBinded] = useState(false)
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()
  // 查詢失敗（data 為 undefined）時維持「停用掛單」的保守預設，不在 render 階段拋錯
  const disablePendingOrder = getDisablePendingOrder.loading
    ? true
    : (idx(getDisablePendingOrder, _ => _.data.getParameterAboutSettingFunction.disablePendingOrder) ?? true)
  const getIsComboSetting = useFetchGetIsComboSetting()
  const [shortcut, setShortcut] = useState({
    services: [],
    products: [],
    tickets: [],
    memberships: [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBonusRewardWithLine.loading])

  useEffect(() => {
    if (!getIsLBCusDisplay.loading) {
      const data = idx(getIsLBCusDisplay, _ => _.data.getParameterOrderCreateSetting.isLBCusDisplay)
      setLBCusDisplay(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsLBCusDisplay.loading])

  useEffect(() => {
    if (!getSerialNumberUsing.loading) {
      const data = idx(getSerialNumberUsing, _ => _.data.getParameterOrderCreateSetting.isOrderSerialNumberUsing)
      setSerialNumberUsing(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getSerialNumberUsing.loading])
  useEffect(() => {
    if (!getIsBonusConversion.loading) {
      const data = idx(getIsBonusConversion, _ => _.data.getParameterAboutSettingFunction)
      setBonusConversion(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBonusConversion.loading])
  useEffect(() => {
    if (!getBindedThirdPartTicketLockedSetting.loading) {
      const data = idx(getBindedThirdPartTicketLockedSetting, _ => _.data.getBindedThirdPartTicketLockedSetting)
      setBindedThirdPart(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getBindedThirdPartTicketLockedSetting.loading])

  useEffect(() => {
    if (!thirdPartyCouponsData.loading) {
      const thirdPartyCoupons = idx(thirdPartyCouponsData, _ => _.data.merchant.thirdpartyCoupons)
      setThirdPartyCoupons(thirdPartyCoupons)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [thirdPartyCouponsData.loading])
  useEffect(() => {
    // 同一張帳單只帶入一次：之後重新查詢（loading 再變回 false）不再把原帳單蓋回櫃檯改過的內容（見 useOncePerOrder）
    // 帳單查詢失敗或查無此帳單（order 為 null）時不帶入，由下方 QueryFailed 顯示並可重新查詢
    if (!order.loading && idx(order, _ => _.data.order) && isFirstLoad(match.params.id)) {
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
          draft.customerId = order.data.order.customer.name !== '不留客資' ? order.data.order.customer.id : undefined
          draft.customerCellphone = order.data.order.customer.name !== '不留客資' ? order.data.order.customer.cellphone : ''
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
          draft.ticketOrders = order.data.order.ticketOrders.map(d => ({
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
      setPanelEditable({
        isServiceEditable: order.data.order.isServiceEditable,
        isProductEditable: order.data.order.isProductEditable,
        isTicketSellingEditable: order.data.order.isTicketSellingEditable,
        isTicketUsageEditable: order.data.order.isTicketUsageEditable,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [order.loading, isFirstLoad, match.params.id])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getBonusRewardRule.loading])

  useEffect(() => {
    const serviceArr = []
    const productArr = []
    const couponArr = []
    const memberArr = []
    for (let i = 0; i < shortcut.services.length; i++) {
      const id = shortcut.services[i]
      const value = sData.find(d => d.id === id)
      value &&
        serviceArr.push({
          ...value,
          serviceId: value.id,
          price: value.price,
          isLocked: value.isLocked,
          isNoCash: value.isNoCash,
          thirdPartyCouponMerchantId: value.bindedThirdPartTicket === null ? null : value.bindedThirdPartTicket.id,
          isBindedThirdPartTicketLocked: value.isBindedThirdPartTicketLocked,
          serviceOrderHelpers: [],
        })
    }
    for (let i = 0; i < shortcut.products.length; i++) {
      const id = shortcut.products[i]
      const value = pData.find(d => d.id === id)
      value &&
        productArr.push({
          ...value,
          productId: value.id,
          price: value.sellPrice,
          count: 1,
          isLocked: value.isLocked,
        })
    }
    for (let i = 0; i < shortcut.tickets.length; i++) {
      const id = shortcut.tickets[i]
      const value = tData.find(d => d.id === id)
      value &&
        couponArr.push({
          ...value,
          serviceId: value.id,
          availableCount: value.ticketAvailableCount,
          price: value.price,
          remark: '',
          isLocked: value.isLocked,
          count: 1,
        })
    }
    for (let i = 0; i < shortcut.memberships.length; i++) {
      const id = shortcut.memberships[i]
      const value = mData.find(d => d.uuid === id)
      value &&
        memberArr.push({
          ...value,
          membershipUUID: value.uuid,
          price: value.sellPrice,
          expiryDate: value.effecitveDay === 0 ? null : addDays(new Date(), value.effecitveDay).getTime(),
          isLocked: value.isLocked,
          effecitveDay: value.effecitveDay,
        })
    }

    let newServices = cloneDeep(services)
    let newSells = cloneDeep(sells)
    let newCouponSells = cloneDeep(couponSells)
    let newMemberCardSells = cloneDeep(memberCardSells)

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
      expiryDate: data.expiryDate,
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

    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [shortcut] 變動時執行；couponSells、mData、memberCardSells、pData、sData、sells、services、tData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
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

  // 套餐設定查詢失敗時視為未啟用（2026/10/30 自動掃描發現）
  const comboActive = !getIsComboSetting.loading ? Boolean(idx(getIsComboSetting, _ => _.data.getParameterAboutSettingFunction.isComboUsing)) : false

  const handleShortcutChange = ({ services, products, tickets, memberships }) => {
    const getIds = arr => arr.map(d => d.id || d.uuid)
    const obj = {
      services: getIds(services),
      products: getIds(products),
      tickets: getIds(tickets),
      memberships: getIds(memberships),
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

  // 查無帳單／查詢失敗：顯示可重試的空狀態而不是整頁錯誤（選 QueryFailed 而非 Redirect：網路錯誤時可原地重試，不丟掉從列表帶來的網址）
  if (!order.loading && !idx(order, _ => _.data.order)) {
    return (
      <Page title="帳單詳細" className="ui-root">
        <QueryFailed title="無法載入帳單" description="這張帳單不存在、已被刪除，或查詢失敗。" onRetry={() => order.refetch()} />
      </Page>
    )
  }

  return (
    <Page title={`帳單詳細 ${orderNo ? `(${orderNo})` : ''}`} className="ui-root">
      <>
        <Provider
          value={{
            handleBillChange,
            bill,
            orderId: match.params.id,
            orderSetting,
            setBill,
            orderStatus,
            orderNo,
            panelEditable,
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
          {/* 版面比照打帳單：金額彙總卡與動作按鈕（Footer）放在 Panel 下方的右欄；Footer 仍在這裡建立、props 不變 */}
          <Panel>
            <Footer enable={enable} />
          </Panel>
        </Provider>
      </>
    </Page>
  )
}
