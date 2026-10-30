import Page from 'components/Page'
import { useState, useEffect } from 'react'
import useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import useFetchGetEventRuleGroup from 'hooks/useFetchGetEventRuleGroup'
import useFetchUpdateEventRuleGroup from 'hooks/useFetchUpdateEventRuleGroup'
import { tidyDataObj } from 'helper/sweepstake'
import idx from 'idx'
import { useHistory } from 'react-router'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import RuleForm from 'views/EventRuleShared/RuleForm'
import { createRuleInput, buildRuleSubmitData } from 'views/EventRuleShared/ruleInput'
import { openSnackbar } from 'elements/snackbars'
import QueryFailed from 'components/QueryFailed'

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
    maxCount: 0,
  })
  // 編輯頁多一個 mainEventId，查詢回來後由 newData 整份覆蓋
  const [inputValue, setInputValue] = useState({ mainEventId: '', ...createRuleInput() })

  useEffect(() => {
    if (!getAttribution.loading) {
      // 歸屬查詢失敗時當成沒有歸屬選項（原本對 undefined 呼叫 .map 整頁進入錯誤畫面）
      const data = (idx(getAttribution, _ => _.data.getAttribution) || []).map(({ name }) => name)
      setAttributions(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAttribution.loading])

  useEffect(() => {
    if (!getEventRule.loading) {
      const group = idx(getEventRule, _ => _.data.eventRuleGroup)
      // 規則查詢失敗或查無規則時不帶入（原本解構 undefined 整頁進入錯誤畫面）
      if (!group) return
      const {
        mainEventId,
        nameForGroup,
        nameDefault,
        startDateDefault,
        endDateDefault,
        startDateForGroup,
        endDateForGroup,
        isSMSNotifyForGroup,
        maxCountForGroup,
        maxCountPerOrder,
        maxCountDefault,
        thresholdPrice,
        consumptionTypeUsing,
        consumptionTypeRules,
        payTypeUsing,
        merchants,
        endDateActual,
        walletDepositRules,
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
          belong: [],
        },
        ticketSellInPerformance: {
          type: '',
          belong: [],
        },
        ticketSellNotInPerformance: {
          type: '',
          belong: [],
        },
        ticketUsePerformanceEntered: {
          type: '',
          belong: [],
        },
        ticketUsePerformanceNotEntered: {
          type: '',
          belong: [],
        },
        walletDepositForCash: {
          using: false,
          price: 0,
        },
        walletDepositForOtherPay: {
          using: false,
          price: 0,
        },
        payTypeUsing,
        thresholdPrice,
        isSMSNotifyForGroup,
        maxCountForGroup,
        maxCountPerOrder,
      }

      consumptionTypeRules.forEach(({ consumptionType, attributionRange, attributions }) => {
        if (tidyDataObj[consumptionType]) {
          tidyDataObj[consumptionType](newData, attributionRange, attributions)
        }
      })
      walletDepositRules.forEach(({ payType, depositThreshold }) => {
        const obj = {
          CASH: 'walletDepositForCash',
          OTHERPAY: 'walletDepositForOtherPay',
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
        maxCount: maxCountDefault,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getEventRule.loading])

  const handleSubmit = async () => {
    try {
      setIsClick(true)
      // 整理送出資料與驗證（與建立／編輯頁共用，見 views/EventRuleShared/ruleInput）
      const submitData = buildRuleSubmitData(inputValue, inputValue.mainEventId)
      const res = await updateRule({
        id: match.params.id,
        eventRuleGroup: submitData,
      })

      if (res.data.updateEventRuleGroup) {
        openSnackbar({
          message: '儲存成功',
          variant: 'success',
        })
        history.push('/main-event-list')
      } else {
        openSnackbar({
          message: '儲存失敗',
          variant: 'warning',
        })
        setIsClick(false)
      }
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      setIsClick(false)
    }
  }

  return (
    <Page className="ui-root" title="編輯規則">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="編輯規則" />

        {getEventRule.error ? (
          <QueryFailed onRetry={() => getEventRule.refetch()} />
        ) : getEventRule.loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <RuleForm
            inputValue={inputValue}
            attributions={attributions}
            setInputValue={setInputValue}
            handleSubmit={handleSubmit}
            isClick={isClick}
            submitLabel="儲存"
            isEdit
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
