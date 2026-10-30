import Page from 'components/Page'
import QueryFailed from 'components/QueryFailed'
import { Provider } from 'context/keyInContext'
import useFetchOrder from 'hooks/useFetchOrder'
import produce from 'immer'
import { useEffect, useState, useRef } from 'react'
import { useHistory, useLocation } from 'react-router'
import { useFetchTHirdPartys } from 'hooks/useFetchMerchant'
import idx from 'idx'
import useFetchGetBindedThirdPartTicketLockedSetting from 'hooks/useFetchGetBindedThirdPartTicketLockedSetting'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import { useFetchGetIsPrintWindowClosureDelayed, useFetchGetIsLBCusDisplay } from 'hooks/useFetchGetParameterOrderCreateSetting'
import { useFetchGetIsBonusRewardWithLine } from 'hooks/useFetchGetParameterAboutSettingFunction'
import useFetchGetBonusRewardRule from 'hooks/useFetchGetBonusRewardRule'
import useFetchGetIsBonusConversion from 'hooks/useFetchGetIsBonusConversion'
import useCheckDisablePendingOrder from 'hooks/useCheckDisablePendingOrder'

import { checkedOutDraft, checkedOutDraftPath } from './draftCheckoutGuard'
import Footer from './Footer'
import Head from './Head'
import Header from './Header'
import Pannel from './Pannel'

export default function KeyIn({ match }) {
  const history = useHistory()
  // useLocation 讓結帳成功後的 replace 重新渲染本頁，才能讀到剛寫下的「已結帳」並收起表單
  const { pathname } = useLocation()
  const storedCheckout = checkedOutDraft(match.params.id)
  const storedKey = storedCheckout ? `${storedCheckout.orderId}|${storedCheckout.listPath}` : ''
  const onceRef = useRef(true)
  const order = useFetchOrder({ id: match.params.id })
  const [focus, setFocus] = useState('customer')
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
    if (!getIsPrintWindowClosureDelayed.loading) {
      const data = idx(getIsPrintWindowClosureDelayed, _ => _.data.getParameterOrderCreateSetting.isPrintWindowClosureDelayed)
      setClosureDelayed(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsPrintWindowClosureDelayed.loading])

  useEffect(() => {
    if (!customerBonusActive.loading && onceRef.current) {
      const active = idx(customerBonusActive, _ => _.data.getIsCustomerBonusActive) || bill.bonusDecount > 0 || bill.bonusDeposit > 0 || bill.bonusUsed > 0
      setBonusActive(active)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [customerBonusActive.loading, bill])

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
    // 查無此掛單（order 為 null）或查詢失敗時不帶入，由下方 QueryFailed 顯示並可重新查詢
    if (!order.loading && idx(order, _ => _.data.order)) {
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
          // 預收卡販賣與服務、店販同時帶入（欄位與 PannelCouponSells 寫回帳單的相同）：原本要等預收卡販賣區塊稍後寫回，
          // 這段空檔「應收」少算預收卡，原掛單的入金／其他付款／點數折抵會被 useDraftCheckout「應收小於 0 歸零」的檢查清掉
          draft.ticketOrders = order.data.order.ticketOrders.map(ticketOrder => ({
            serviceId: ticketOrder.service.id,
            availableCount: ticketOrder.availableCount,
            price: ticketOrder.price,
            count: ticketOrder.count,
            remark: ticketOrder.remark,
            isLocked: ticketOrder.service.isLocked,
            intoPerformanceWhileBuying: ticketOrder.intoPerformanceWhileBuying,
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
          draft.source = order.data.order.source
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [order.loading, order.data])

  useEffect(() => {
    if (!getBonusRewardRule.loading) {
      const data = idx(getBonusRewardRule, _ => _.data.getParameterAboutSettingFunction.bonusRewardRule)
      setBonusSetting(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getBonusRewardRule.loading])

  useEffect(() => {
    if (!getIsBonusConversion.loading) {
      const data = idx(getIsBonusConversion, _ => _.data.getParameterAboutSettingFunction)
      setBonusConversion(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getIsBonusConversion.loading])

  useEffect(() => {
    if (!storedKey || !pathname.startsWith('/draft-order/')) return
    history.replace(checkedOutDraftPath(checkedOutDraft(match.params.id), match.params.id))
  }, [storedKey, match.params.id, history, pathname])

  if (storedCheckout) {
    return (
      <Page title="掛單詳細" className="ui-root">
        <p className="p-6 text-text-secondary">這張掛單已結帳，正在前往帳單。</p>
      </Page>
    )
  }

  if (!order.loading && !idx(order, _ => _.data.order)) {
    return (
      <Page title="掛單詳細" className="ui-root">
        <QueryFailed
          title="無法載入掛單"
          description="這張掛單不存在、已被刪除，或查詢失敗。"
          onRetry={() => order.refetch()}
        />
      </Page>
    )
  }

  return (
    <Page title={`掛單詳細 ${orderNo && `(${orderNo})`}`} className="ui-root">
      <>
      <Provider
        value={{
          handleBillChange,
          bill,
          setBill,
          orderId: match.params.id,
          orderSetting,
          orderStatus,
          orderNo,
          pannelEditable,
          thirdPartyCoupons,
          focus,
          setFocus,
          bindedThirdPart,
          order: order.data != null && order.data.order,
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
        {/* 版面比照打帳單：金額彙總卡與動作按鈕（Footer）放在 Pannel 下方的右欄；Footer 仍在這裡建立、props 不變 */}
        <Pannel>
          <Footer />
        </Pannel>
      </Provider>
      </>
    </Page>
  )
}
