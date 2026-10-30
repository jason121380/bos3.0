import Page from 'components/Page'
import { useState, useEffect } from 'react'
import useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import { useFetchGetMainEventForRule } from 'hooks/useFetchGetMainEvent'
import useFetchCreateEventRuleGroup from 'hooks/useFetchCreateEventRuleGroup'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { useHistory } from 'react-router'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import RuleForm from 'views/EventRuleShared/RuleForm'
import { createRuleInput, buildRuleSubmitData } from 'views/EventRuleShared/ruleInput'
import { openSnackbar } from 'elements/snackbars'

function EventRuleCreate({ match }) {
  const history = useHistory()
  const getAttribution = useFetchGetAttribution()
  const getMainEvent = useFetchGetMainEventForRule({ eventId: match.params.id })
  const { createRule } = useFetchCreateEventRuleGroup()
  const [attributions, setAttributions] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [mainEvent, setMainEvent] = useState({
    name: '',
    start: new Date().getTime(),
    end: new Date().getTime(),
    maxCount: 0
  })
  const [inputValue, setInputValue] = useState(createRuleInput())

  useEffect(() => {
    if (!getAttribution.loading) {
      // 歸屬查詢失敗時當成沒有歸屬選項（原本對 undefined 呼叫 .map 整頁進入錯誤畫面）
      const data = (idx(getAttribution, _ => _.data.getAttribution) || []).map(({ name }) => name)
      setAttributions(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAttribution.loading])

  useEffect(() => {
    if (!getMainEvent.loading) {
      const main = idx(getMainEvent, _ => _.data.mainEvent)
      // 主活動查詢失敗或查無主活動時不帶入（原本解構 undefined 整頁進入錯誤畫面）
      if (!main) return
      const {
        nameDefault, startDateDefault, endDateDefault,
        isSMSNotifyDefault, maxCountDefault
      } = main

      const cloneData = cloneDeep(inputValue)

      cloneData.startDateForGroup = startDateDefault
      cloneData.endDateForGroup = endDateDefault
      cloneData.isSMSNotifyForGroup = isSMSNotifyDefault
      cloneData.maxCountForGroup = maxCountDefault

      setInputValue(cloneData)

      setMainEvent({
        name: nameDefault,
        start: startDateDefault,
        end: endDateDefault,
        maxCount: maxCountDefault
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [getMainEvent.loading] 變動時執行；getMainEvent、inputValue 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [getMainEvent.loading])

  const handleSubmit = async () => {
    try {
      setIsClick(true)
      // 整理送出資料與驗證（與建立／編輯頁共用，見 views/EventRuleShared/ruleInput）
      const submitData = buildRuleSubmitData(inputValue, match.params.id)
      const res = await createRule(submitData)
      if (res.data.createEventRuleGroup) {
        openSnackbar({
          message: '建立成功',
          variant: 'success'
        })
        history.push('/main-event-list')
      } else {
        openSnackbar({
          message: '建立失敗',
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
    <Page className="ui-root" title="建立規則">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="建立規則" />
        {getMainEvent.loading ? (
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
            submitLabel="新增"
            mainEvent={mainEvent}
            eventId={match.params.id}
          />
        )}
      </div>
    </Page>
  )
}

export default EventRuleCreate
