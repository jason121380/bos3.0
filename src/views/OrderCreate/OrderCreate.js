import Page from 'components/Page'
import { Provider } from 'context/keyInContext'
import { useState, useEffect } from 'react'
import useFetchUpdateUserOrderableList from 'hooks/useFetchSettingUpdateUserOrderableList'
import useFetchGetDesignationSettingForOrderCreate from 'hooks/useFetchGetDesignationSettingForOrderCreate'
import useFetchGetLatestOrderStatus from 'hooks/useFetchGetLatestOrderStatus'
import useFetchGetBindedThirdPartTicketLockedSetting from 'hooks/useFetchGetBindedThirdPartTicketLockedSetting'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import useFetchGetIsBonusConversion from 'hooks/useFetchGetIsBonusConversion'
import { useFetchGetIsBonusRewardWithLine } from 'hooks/useFetchGetParameterAboutSettingFunction'
import {
  useFetchGetIsPrintWindowClosureDelayed, useFetchGetSerialNumberUsing,
  useFetchGetIsLBCusDisplay, useFetchGetIsCusWalletUsageForOrder
} from 'hooks/useFetchGetParameterOrderCreateSetting'
import useFetchGetBonusRewardRule from 'hooks/useFetchGetBonusRewardRule'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetDisablePendingOrder } from 'hooks/useFetchGetParameterAboutSettingFunction'
import idx from 'idx'
import uuid from 'lib/uuid'
import produce from 'immer'
import billPaymentSummary from 'helper/billPaymentSummary'

import Head from './Head'
import Header from './Header'
import Pannel from './Pannel'

function OrderCreate() {
  const [isClick, setIsClick] = useState(false)
  const designationSettingForOrderCreateData = useFetchGetDesignationSettingForOrderCreate()
  const getIsLBCusDisplay = useFetchGetIsLBCusDisplay()
  const getIsCusWalletUsageForOrder = useFetchGetIsCusWalletUsageForOrder()
  const getIsBonusRewardWithLine = useFetchGetIsBonusRewardWithLine()
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
  const [checkoutBtn, setCheckoutBtn] = useState(false)
  // 明細彈窗與收據的應付帳款／現金應收，與頁面右側金額彙總同一公式（原本從未計算、永遠是 0）
  const { shouldPay: orderDetailPaymentShouldPay, cashDue: cashPayment } = billPaymentSummary(bill)
  const stayInCreateOrderInMemory = JSON.parse(localStorage.getItem('stayInCreateOrder'))
  const [openOrderDetail, setOpenOrderDetail] = useState(false)
  const [updateUserOrderableListDone, setUpdateUserOrderableListDone] = useState(false)
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
  const [services, setServices] = useState([])
  const [sells, setSells] = useState([])
  const [couponSells, setCouponSells] = useState([])
  const [memberCardSells, setMemberCardSells] = useState([])
  const [memberShipCardActive, setMemberShipCardActive] = useState(false)
  const getDisablePendingOrder = useFetchGetDisablePendingOrder()
  const disablePendingOrder = getDisablePendingOrder.loading ? true : getDisablePendingOrder.data.getParameterAboutSettingFunction.disablePendingOrder

  useEffect(() => {
    if (!memberShipActive.loading) {
      setMemberShipCardActive(memberShipActive.data.getIsMemberShipCardActive)
    }
  }, [memberShipActive.loading])

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
            cashPayment,
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
            services,
            setServices,
            sells,
            setSells,
            couponSells,
            setCouponSells,
            memberCardSells,
            setMemberCardSells,
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
