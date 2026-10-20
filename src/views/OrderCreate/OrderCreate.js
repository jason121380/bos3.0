import Page from 'components/Page'
import { Provider } from 'context/keyInContext'
import useFetchCreateOrder from 'hooks/useFetchCreateOrder'
import { useState, useEffect, useRef } from 'react'
import useFetchUpdateUserOrderableList from 'hooks/useFetchSettingUpdateUserOrderableList'
import useFetchIsDetailBottomed from 'hooks/useFetchGetIsDetailBottomed'
import useFetchGetDesignationSettingForOrderCreate from 'hooks/useFetchGetDesignationSettingForOrderCreate'
import useFetchGetLatestOrderStatus from 'hooks/useFetchGetLatestOrderStatus'
import useFetchGetBindedThirdPartTicketLockedSetting from 'hooks/useFetchGetBindedThirdPartTicketLockedSetting'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetIsBonusConversion from 'hooks/useFetchGetIsBonusConversion'
import { useFetchGetIsBonusRewardWithLine, useFetchGetIsComboSetting } from 'hooks/useFetchGetParameterAboutSettingFunction'
import {
  useFetchGetIsPrintWindowClosureDelayed, useFetchGetSerialNumberUsing,
  useFetchGetIsLBCusDisplay, useFetchGetIsCusWalletUsageForOrder
} from 'hooks/useFetchGetParameterOrderCreateSetting'
import useFetchGetBonusRewardRule from 'hooks/useFetchGetBonusRewardRule'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetDisablePendingOrder } from 'hooks/useFetchGetParameterAboutSettingFunction'
import idx from 'idx'
import uuid from 'uuid'
import addDays from 'date-fns/addDays'
import _ from 'lodash'
import produce from 'immer'

import Head from './Head'
import Header from './Header'
import Pannel from './Pannel'

function OrderCreate() {
  const [isClick, setIsClick] = useState(false)
  const [marginTop, setMarginTop] = useState(83)
  const footerRef = useRef(null)
  const designationSettingForOrderCreateData = useFetchGetDesignationSettingForOrderCreate()
  const getIsLBCusDisplay = useFetchGetIsLBCusDisplay()
  const getIsCusWalletUsageForOrder = useFetchGetIsCusWalletUsageForOrder()
  const getIsBonusRewardWithLine = useFetchGetIsBonusRewardWithLine()
  const getIsComboSetting = useFetchGetIsComboSetting()
  const memberShipActive = useFetchGetIsMemberShipCardActive()
  // 指不指定依據
  const [designationSettingForOrderCreate, setDesignationSettingForOrderCreate] = useState(false)
  const getIsPrintWindowClosureDelayed = useFetchGetIsPrintWindowClosureDelayed()
  const stayInCheckoutWithoutCustomer = JSON.parse(
    localStorage.getItem('stayInCheckoutWithoutCustomer')
  )
  const [bill, setBill] = useState({
    isDesignate: designationSettingForOrderCreate,
    date:
      JSON.parse(localStorage.getItem('lockDateTimeStamp')) === null
        ? new Date().getTime()
        : JSON.parse(localStorage.getItem('lockDateTimeStamp')),
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
    withoutCustomerData: stayInCheckoutWithoutCustomer,
    checkCodeFromFE: uuid(),
    bonusDecount: 0,
    bonusDeposit: 0,
    bonusUsed: 0,
    source: null,
    serialNumber: null
  })
  const lastOrderStatusData = useFetchGetLatestOrderStatus({ date: bill.date })
  const stayInCheckOrderDetailMemory = JSON.parse(localStorage.getItem('stayInCheckOrderDetail'))
  const getSerialNumberUsing = useFetchGetSerialNumberUsing()
  const [orderDetailPaymentShouldPay, setOrderDetailPaymentShouldPay] = useState(0)
  const [checkoutBtn, setCheckoutBtn] = useState(false)
  const [cashPayment, setCashPayment] = useState(0)
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
  const { checkOrder } = useFetchCreateOrder()
  const useCheckOrderRef = useRef(checkOrder)
  const stayInCreateOrderInMemory = JSON.parse(localStorage.getItem('stayInCreateOrder'))
  const footerSwitchMemory = JSON.parse(localStorage.getItem('footerSwitchMemory'))
  const isDetailBottomedData = useFetchIsDetailBottomed()
  const [openOrderDetail, setOpenOrderDetail] = useState(false)
  const [updateUserOrderableListDone, setUpdateUserOrderableListDone] = useState(false)
  const [isFooterFold, setIsFooterFold] = useState(
    footerSwitchMemory !== null ? footerSwitchMemory : false
  )
  const [isFooterFixed, setIsFooterFixed] = useState(false)
  const { setUpdateUserOrderableList } = useFetchUpdateUserOrderableList()
  const [checkoutBtnClick, setCheckoutBtnClick] = useState(false)
  const [focus, setFocus] = useState('customer')

  const [checkOrderDetailSwitch, setCheckOrderDetailSwitch] = useState(
    stayInCheckOrderDetailMemory !== null ? stayInCheckOrderDetailMemory : false
  )
  const [stayInCreateOrder, setStayInCreateOrder] = useState(
    stayInCreateOrderInMemory !== null ? stayInCreateOrderInMemory : false
  )
  const [walletPayBalanceForDetail, setWalletPayBalanceForDetail] = useState(0)
  const [customerWallet, setCustomerWallet] = useState(0)
  const [reset, setReset] = useState('')
  const getBindedThirdPartTicketLockedSetting = useFetchGetBindedThirdPartTicketLockedSetting()
  const [bindedThirdPart, setBindedThirdPart] = useState({
    service: false,
    product: false,
    membership: false,
  })
  const [customerBonus, setCustomerBonus] = useState(0)
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const [bonusActive, setBonusActive] = useState(false)
  const [closureDelayed, setClosureDelayed] = useState(false)
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
  const [walletFuncDisplay, setWalletFuncDisplay] = useState(true)
  const [bonusRewardWithLINE, setBonusRewardWithLINE] = useState(false)
  const [isLineBinded, setIsLineBinded] = useState(false)
  const [serviceAlready, setServiceAlready] = useState(false)
  const [productAlready, setProductAlready] = useState(false)
  const [couponAlready, setCouponAlready] = useState(false)
  const [membershipAlready, setMembershipAlready] = useState(false)
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
  const [memberShipCardActive, setMemberShipCardActive] = useState(false)
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()
  const disablePendingOrder = getDisablePendingOrder.loading ? true : getDisablePendingOrder.data.getParameterAboutSettingFunction.disablePendingOrder

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
      memberships: memberShipCardActive ? getIds(memberships) : []
    }
    setShortcut(obj)
  }

  useEffect(() => {
    if (!memberShipActive.loading) {
      setMemberShipCardActive(memberShipActive.data.getIsMemberShipCardActive)
      if (!memberShipActive.data.getIsMemberShipCardActive) {
        setMembershipAlready(true)
      }
    }
  }, [memberShipActive.loading])

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
      expiryDate: data.expiryDate === NaN || data.expiryDate === 'Invalid Date' || data.expiryDate === "Early Date" || data.expiryDate === "Late Date" ? 'Invalid Date' : data.expiryDate,
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

  useEffect(() => {
    if (!getIsBonusRewardWithLine.loading) {
      const data = idx(getIsBonusRewardWithLine, _ => _.data.getParameterAboutSettingFunction.isBonusRewardWithLine)
      setBonusRewardWithLINE(data)
    }
  }, [getIsBonusRewardWithLine.loading])

  useEffect(() => {
    if (!getIsCusWalletUsageForOrder.loading) {
      const data = idx(getIsCusWalletUsageForOrder, _ => _.data.getParameterOrderCreateSetting.isCusWalletUsageForOrder)
      setWalletFuncDisplay(data)
    }
  }, [getIsCusWalletUsageForOrder.loading])

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
    if (!getIsPrintWindowClosureDelayed.loading) {
      const data = idx(getIsPrintWindowClosureDelayed, _ => _.data.getParameterOrderCreateSetting.isPrintWindowClosureDelayed)
      setClosureDelayed(data)
    }
  }, [getIsPrintWindowClosureDelayed.loading])

  useEffect(() => {
    if (!customerBonusActive.loading) {
      setBonusActive(customerBonusActive.data.getIsCustomerBonusActive)
    }
  }, [customerBonusActive.loading])

  useEffect(() => {
    if (!getIsBonusConversion.loading) {
      const data = idx(getIsBonusConversion, _ => _.data.getParameterAboutSettingFunction)
      setBonusConversion(data)
    }
  }, [getIsBonusConversion.loading])

  useEffect(() => {
    if (!getBindedThirdPartTicketLockedSetting.loading) {
      const data = idx(getBindedThirdPartTicketLockedSetting, _ => _.data.getBindedThirdPartTicketLockedSetting)
      setBindedThirdPart(data)
    }
  }, [getBindedThirdPartTicketLockedSetting.loading])

  // 指不指定依據data
  useEffect(() => {
    if (!designationSettingForOrderCreateData.loading && !lastOrderStatusData.loading) {
      const designationSettingForOrderCreate = idx(
        designationSettingForOrderCreateData,
        _ => _.data.getDesignationSettingForOrderCreate
      )
      const status = idx(lastOrderStatusData, _ => _.data.getLatestOrderStatus)
      if (designationSettingForOrderCreate === 'DESIGNATE') {
        setDesignationSettingForOrderCreate(true)
        handleBillChange({
          key: 'isDesignate',
          value: true,
        })
      } else if (designationSettingForOrderCreate === 'NONDESIGNATE') {
        setDesignationSettingForOrderCreate(false)
        handleBillChange({
          key: 'isDesignate',
          value: false,
        })
        // 依據上一筆訂單的判斷要等後端修改
      } else {
        if (status !== undefined) {
          setDesignationSettingForOrderCreate(status.isDesignate)
          handleBillChange({
            key: 'isDesignate',
            value: status.isDesignate,
          })
        }
      }
    }
  }, [designationSettingForOrderCreateData.loading, lastOrderStatusData.loading])

  // state重置後重新拿上一筆訂單編號跟參數設定的指定不指定
  useEffect(() => {
    designationSettingForOrderCreateData.refetch()
    lastOrderStatusData.refetch()
  }, [reset])

  useEffect(() => {
    if (!isDetailBottomedData.loading) {
      const isFooterFixed = idx(isDetailBottomedData, _ => _.data.getIsDetailBottomed)
      setIsFooterFixed(isFooterFixed)
    }
  }, [isDetailBottomedData.loading])

  useEffect(() => {
    if (!getBonusRewardRule.loading) {
      const data = idx(getBonusRewardRule, _ => _.data.getParameterAboutSettingFunction.bonusRewardRule)
      setBonusSetting(data)
    }
  }, [getBonusRewardRule.loading])

  // 先請後端更新可打單人員再顯示打帳單。更新失敗（例如網路暫斷）時仍顯示頁面、沿用現有名單：
  // 原本失敗就永遠不顯示，櫃台整頁空白無法打單；錯誤訊息由 Apollo errorLink 提示
  useEffect(() => {
    setUpdateUserOrderableList()
      .catch(() => {})
      .then(() => {
        setUpdateUserOrderableListDone(true)
      })
  }, [])

  const handleDisplayOrderDetail = () => {
    setOpenOrderDetail(!openOrderDetail)
  }

  useEffect(() => {
    if (bill.designerId) {
      const serviceOrdersNoIsLocked = bill.serviceOrders.map(({ isLocked, ...keep }) => keep)
      bill.serviceOrders = serviceOrdersNoIsLocked
      const productOrdersNoIsLocked = bill.productOrders.map(({ isLocked, ...keep }) => keep)
      bill.productOrders = productOrdersNoIsLocked
      const ticketOrdersNoIsLocked = bill.ticketOrders.map(({ isLocked, ...keep }) => keep)
      bill.ticketOrders = ticketOrdersNoIsLocked
      useCheckOrderRef.current(bill)
    }
  }, [])

  useEffect(() => {
    setBill(prev => ({
      ...prev,
      amountByOtherPay: 0,
      walletPay: 0,
    }))
  }, [bill.serviceOrders, bill.productOrders, bill.ticketOrders])
  const handleBillChange = ({ value, key }) => {
    setBill({
      ...bill,
      [key]: value,
    })
  }

  useEffect(() => {
    if (!bill.customerId) {
      setCustomerWallet(0)
    }
  }, [bill])

  useEffect(() => {
    if (reset === 'reset') {
      setBill({
        isDesignate: designationSettingForOrderCreate,
        date:
          JSON.parse(localStorage.getItem('lockDateTimeStamp')) === null
            ? new Date().getTime()
            : JSON.parse(localStorage.getItem('lockDateTimeStamp')),
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
        withoutCustomerData: stayInCheckoutWithoutCustomer,
        checkCodeFromFE: uuid(),
        bonusDecount: 0,
        bonusDeposit: 0,
        bonusUsed: 0,
        source: null,
        serialNumber: null
      })
    }
  }, [reset])

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window
    return {
      width,
      height,
    }
  }

  function useWindowDimensions() {
    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions())
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])
    return windowDimensions
  }
  const { height, width } = useWindowDimensions()
  const [addKeydown, setAddKeyDown] = useState(0)

  useEffect(() => {
    if (footerRef.current) {
      setMarginTop(footerRef.current.clientHeight - 10)
    }
  }, [height, width, footerRef.current, isFooterFold])

  return (
    <Page title="打帳單" className="ui-root">
      <>
      {updateUserOrderableListDone && (
        <Provider
          value={{
            handleBillChange,
            bill,
            setBill,
            orderDetailPaymentShouldPay,
            setOrderDetailPaymentShouldPay,
            cashPayment,
            setCashPayment,
            openOrderDetail,
            setOpenOrderDetail,
            focus,
            setFocus,
            checkOrderDetailSwitch,
            setCheckOrderDetailSwitch,
            handleDisplayOrderDetail,
            stayInCheckoutWithoutCustomer,
            checkoutBtn,
            setCheckoutBtn,
            setStayInCreateOrder,
            stayInCreateOrder,
            setWalletPayBalanceForDetail,
            walletPayBalanceForDetail,
            isClick,
            setIsClick,
            addKeydown,
            setAddKeyDown,
            designationSettingForOrderCreate,
            setDesignationSettingForOrderCreate,
            lastOrderStatusData,
            setCheckoutBtnClick,
            checkoutBtnClick,
            designationSettingForOrderCreateData,
            customerWallet,
            setCustomerWallet,
            bindedThirdPart,
            setCustomerBonus,
            customerBonus,
            bonusActive,
            reset,
            setReset,
            closureDelayed,
            bonusSetting,
            bonusConversion,
            serialNumberUsing,
            LBCusDisplay,
            walletFuncDisplay,
            isLineBinded,
            setIsLineBinded,
            bonusRewardWithLINE,
            shortcut,
            handleShortcutChange,
            setServiceAlready,
            setProductAlready,
            setCouponAlready,
            setMembershipAlready,
            serviceAlready,
            productAlready,
            couponAlready,
            membershipAlready,
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
            memberShipCardActive,
            disablePendingOrder
          }}
        >
          <Header />
          <Head />
          <Pannel />
        </Provider>
      )}
      </>
    </Page>
  )
}

export default OrderCreate
