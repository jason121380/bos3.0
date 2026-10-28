import Page from 'components/Page'
import { useState, useEffect } from 'react'
import useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import useFetchGetEventRuleGroup from 'hooks/useFetchGetEventRuleGroup'
import useFetchUpdateEventRuleGroup from 'hooks/useFetchUpdateEventRuleGroup'
import { tidyDataObj } from 'helper/sweepstake'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { useHistory } from 'react-router'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import General from './General'
import { openSnackbar } from 'elements/snackbars'
import { startOfDay, endOfDay } from 'date-fns'

function EventRuleEdit({ match }) {
  const history = useHistory()
  const getAttribution = useFetchGetAttribution()
  const getEventRule = useFetchGetEventRuleGroup({ ruleGroupId: match.params.id })
  const { updateRule } = useFetchUpdateEventRuleGroup()
  const [attributions, setAttributions] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(true)
  const [mainEvent, setMainEvent] = useState({
    name: '',
    start: new Date().getTime(),
    end: new Date().getTime(),
    maxCount: 0
  })
  const [inputValue, setInputValue] = useState({
    mainEventId: '',
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
  })

  useEffect(() => {
    if (!getAttribution.loading) {
      // 歸屬查詢失敗時當成沒有歸屬選項（原本對 undefined 呼叫 .map 整頁進入錯誤畫面）
      const data = (idx(getAttribution, _ => _.data.getAttribution) || []).map(({ name }) => name)
      setAttributions(data)
    }
  }, [getAttribution.loading])

  useEffect(() => {
    if (!getEventRule.loading) {
      const group = idx(getEventRule, _ => _.data.eventRuleGroup)
      // 規則查詢失敗或查無規則時不帶入（原本解構 undefined 整頁進入錯誤畫面）
      if (!group) return
      const {
        mainEventId, nameForGroup, nameDefault, startDateDefault, endDateDefault, startDateForGroup,
        endDateForGroup, isSMSNotifyForGroup, maxCountForGroup, maxCountPerOrder, maxCountDefault,
        thresholdPrice, consumptionTypeUsing, consumptionTypeRules, payTypeUsing, merchants, endDateActual,
        walletDepositRules
      } = group

      const newData = {
        mainEventId,
        nameForGroup,
        startDateForGroup,
        endDateForGroup,
        merchants: merchants.map(d => d.id),
        product: false,
        membershipCard: false,
        consumptionTypeUsing,
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
        payTypeUsing,
        thresholdPrice,
        isSMSNotifyForGroup,
        maxCountForGroup,
        maxCountPerOrder
      }

      consumptionTypeRules.forEach(({ consumptionType, attributionRange, attributions }) => {
        if (tidyDataObj[consumptionType]) {
          tidyDataObj[consumptionType](newData, attributionRange, attributions)
        }
      })
      walletDepositRules.forEach(({ payType, depositThreshold }) => {
        const obj = {
          CASH: 'walletDepositForCash',
          OTHERPAY: 'walletDepositForOtherPay'
        }
        newData[obj[payType]].using = true
        newData[obj[payType]].price = depositThreshold
      })

      setIsReadOnly(Boolean(endDateActual))

      setInputValue(newData)
      setMainEvent({
        name: nameDefault,
        start: startDateDefault,
        end: endDateDefault,
        maxCount: maxCountDefault
      })
    }
  }, [getEventRule.loading])

  const handleSubmit = async () => {
    const {
      mainEventId, nameForGroup, startDateForGroup, endDateForGroup, merchants, product, membershipCard,
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
    try {
      setIsClick(true)
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
      const res = await updateRule({
        id: match.params.id,
        eventRuleGroup: submitData
      })

      if (res.data.updateEventRuleGroup) {
        openSnackbar({
          message: '儲存成功',
          variant: 'success'
        })
        history.push('/main-event-list')
      } else {
        openSnackbar({
          message: '儲存失敗',
          variant: 'warning'
        })
        setIsClick(false)
      }

    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      setIsClick(false)
    }
  }

  return (
    <Page className="ui-root" title="編輯規則">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="編輯規則" />

        {getEventRule.loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <General
            inputValue={inputValue}
            attributions={attributions}
            setInputValue={setInputValue}
            handleSubmit={handleSubmit}
            isClick={isClick}
            mainEvent={mainEvent}
            isReadOnly={isReadOnly}
            eventId={inputValue.mainEventId}
          />
        )}
      </div>
    </Page>
  )
}

export default EventRuleEdit
