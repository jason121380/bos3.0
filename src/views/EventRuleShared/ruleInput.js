import cloneDeep from 'lodash/cloneDeep'
import { startOfDay, endOfDay } from 'date-fns'

// 建立規則／編輯規則共用（2026/10/28 自兩頁 index.js 合併，內容逐字搬移，不改送出欄位與驗證）。

// 規則表單的初始值（建立頁直接使用；編輯頁另加 mainEventId: ''，帶入後由查詢結果覆蓋）
export function createRuleInput() {
  return {
    nameForGroup: '',
    startDateForGroup: new Date().getTime(),
    endDateForGroup: new Date().getTime(),
    merchants: [],
    product: false,
    membershipCard: false,
    consumptionTypeUsing: 'ALL',
    service: {
      type: '',
      belong: []
    },
    ticketSellInPerformance: {
      type: '',
      belong: []
    },
    ticketSellNotInPerformance: {
      type: '',
      belong: []
    },
    ticketUsePerformanceEntered: {
      type: '',
      belong: []
    },
    ticketUsePerformanceNotEntered: {
      type: '',
      belong: []
    },
    walletDepositForCash: {
      using: false,
      price: 0
    },
    walletDepositForOtherPay: {
      using: false,
      price: 0
    },
    payTypeUsing: [],
    thresholdPrice: 0,
    isSMSNotifyForGroup: false,
    maxCountForGroup: 0,
    maxCountPerOrder: 0
  }
}

// 把表單值整理成 createEventRuleGroup／updateEventRuleGroup 的 eventRuleGroup 輸入，同時做送出前驗證；
// 驗證不過以 Error 拋出（訊息由呼叫端顯示）。mainEventId：建立頁傳網址上的主活動 id，編輯頁傳規則所屬的主活動 id。
export function buildRuleSubmitData(inputValue, mainEventId) {
  const {
    nameForGroup, startDateForGroup, endDateForGroup, merchants, product, membershipCard,
    consumptionTypeUsing, service, maxCountForGroup, payTypeUsing, thresholdPrice, isSMSNotifyForGroup,
    ticketSellNotInPerformance, ticketUsePerformanceEntered, maxCountPerOrder, ticketSellInPerformance,
    ticketUsePerformanceNotEntered, walletDepositForCash, walletDepositForOtherPay
  } = cloneDeep(inputValue)
  const submitData = {
    mainEventId,
    nameForGroup: nameForGroup.trim(),
    startDateForGroup: startOfDay(startDateForGroup).getTime(),
    endDateForGroup: endOfDay(endDateForGroup).getTime(),
    merchants,
    consumptionTypeUsing,
    maxCountForGroup,
    payTypeUsing,
    thresholdPrice,
    isSMSNotifyForGroup,
    maxCountPerOrder,
    consumptionTypeRules: [],
    walletDepositRules: []
  }
  const checkArr = [
    {
      data: service,
      enum: 'SERVICE',
      errorMessage: '請選擇服務套用的歸屬。'
    },
    {
      data: ticketSellInPerformance,
      enum: 'TICKETSELLINPERFORMANCE',
      errorMessage: '請選擇賣卡先入套用的歸屬。'
    },
    {
      data: ticketSellNotInPerformance,
      enum: 'TICKETSELLNOTINPERFORMANCE',
      errorMessage: '請選擇賣卡後入套用的歸屬。'
    },
    {
      data: ticketUsePerformanceEntered,
      enum: 'TICKETUSEPERFORMANCEENTERED',
      errorMessage: '請選擇用卡先入套用的歸屬。'
    },
    {
      data: ticketUsePerformanceNotEntered,
      enum: 'TICKETUSEPERFORMANCENOTENTERED',
      errorMessage: '請選擇用卡後入套用的歸屬。'
    },
  ]

  const walletDepositArr = [
    {
      data: walletDepositForCash,
      enum: 'CASH',
      errorMessage: '入金儲值現金金額門檻不得為0。'
    },
    {
      data: walletDepositForOtherPay,
      enum: 'OTHERPAY',
      errorMessage: '入金儲值其他付款方式金額門檻不得為0。'
    },
  ]

  if (!submitData.nameForGroup) throw new Error('請輸入規則名稱。')
  // 至少選一間適用店家（Jason 2026/10/22「照建議」）
  if (!submitData.merchants || !submitData.merchants.length) throw new Error('請選擇適用店家。')

  if (consumptionTypeUsing !== 'ALL') {
    if (product) {
      submitData.consumptionTypeRules.push({
        consumptionType: 'PRODUCT',
        attributionRange: 'ALL',
        attributions: [],
      })
    }
    if (membershipCard) {
      submitData.consumptionTypeRules.push({
        consumptionType: 'MEMBERSHIP',
        attributionRange: 'ALL',
        attributions: [],
      })
    }

    checkArr.forEach(item => {
      if (item.data.type !== '') {
        if (item.data.type === 'ALL') {
          submitData.consumptionTypeRules.push({
            consumptionType: item.enum,
            attributionRange: 'ALL',
            attributions: [],
          })
        } else {
          if (!item.data.belong.length) throw new Error(item.errorMessage)
          submitData.consumptionTypeRules.push({
            consumptionType: item.enum,
            attributionRange: 'SPECIFIC',
            attributions: item.data.belong,
          })
        }
      }
    })

    if (!submitData.consumptionTypeRules.length) throw new Error('請選套用的消費類型。')
  }

  if (!submitData.payTypeUsing.length) throw new Error('請選擇適用付款方式。')

  walletDepositArr.forEach(item => {
    if (item.data.using) {
      if (item.data.price === 0) throw new Error(item.errorMessage)
      submitData.walletDepositRules.push({
        payType: item.enum,
        depositThreshold: item.data.price
      })
    }
  })
  return submitData
}
