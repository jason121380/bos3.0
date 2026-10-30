import Page from 'components/Page'
import { useState, useEffect } from 'react'
import useFetchGetMainEvent from 'hooks/useFetchGetMainEvent'
import useFetchUpdateMainEvent from 'hooks/useFetchUpdateMainEvent'
import cloneDeep from 'lodash/cloneDeep'
import { useHistory } from 'react-router'
import produce from 'immer'
import General from './General'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { startOfDay, endOfDay, isBefore } from 'date-fns'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'

function MainEventEdit({ match }) {
  const history = useHistory()
  const getMainEvent = useFetchGetMainEvent({ eventId: match.params.id })
  const { updateMainEvent } = useFetchUpdateMainEvent()
  const [isClick, setIsClick] = useState(false)
  const [inputValue, setInputValue] = useState({
    nameDefault: '',
    startDateDefault: new Date().getTime(),
    endDateDefault: new Date().getTime(),
    isSMSNotifyDefault: false,
    maxCountDefault: 0,
    isPublic: true,
    endDateActual: null,
    merchantIds: []
  })

  const handleSubmit = async () => {
    const {
      nameDefault, startDateDefault, endDateDefault, isSMSNotifyDefault,
      maxCountDefault, isPublic, merchantIds
    } = cloneDeep(inputValue)
    const submitData = {
      nameDefault: nameDefault.trim(),
      startDateDefault: startOfDay(startDateDefault).getTime(),
      endDateDefault: endOfDay(endDateDefault).getTime(),
      isSMSNotifyDefault,
      maxCountDefault,
      isPublic,
      merchantIds: isPublic ? [] : merchantIds
    }

    try {
      setIsClick(true)
      if (!submitData.nameDefault) throw new Error('請輸入活動名稱。')
      const res = await updateMainEvent({
        eventId: match.params.id,
        mainEventInput: submitData
      })
      if (res.data.updateMainEvent) {
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

  const handleDateChange = (value, pickerType) => {
    const newValue = cloneDeep(inputValue)
    newValue[pickerType] = value
    if (pickerType === 'endDateDefault' && isBefore(newValue.endDateDefault, newValue.startDateDefault)) {
      newValue.startDateDefault = newValue.endDateDefault
    } else if (pickerType === 'startDateDefault' && isBefore(newValue.endDateDefault, newValue.startDateDefault)) {
      newValue.endDateDefault = newValue.startDateDefault
    }
    setInputValue(newValue)
  }

  const handleValueChange = (key, value) => {
    setInputValue(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  useEffect(() => {
    if (!getMainEvent.loading) {
      const data = idx(getMainEvent, _ => _.data.mainEvent)
      // 查詢失敗或查無活動時不帶入（原本表單資料變 undefined 整頁進入錯誤畫面）
      if (data) setInputValue(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMainEvent.loading])

  useEffect(() => {
    return () => {
      setInputValue({
        nameDefault: '',
        startDateDefault: new Date().getTime(),
        endDateDefault: new Date().getTime(),
        isSMSNotifyDefault: false,
        maxCountDefault: 0,
        isPublic: true,
        endDateActual: null,
        merchantIds: []
      })
    }
  }, [])

  return (
    <Page className="ui-root" title="編輯活動">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="編輯活動" />
        {getMainEvent.error ? (
          <QueryFailed onRetry={() => getMainEvent.refetch()} />
        ) : !getMainEvent.loading ? (
          <General
            dateChange={handleDateChange}
            valueChange={handleValueChange}
            inputValue={inputValue}
            isClick={isClick}
            submit={handleSubmit}
          />
        ) : <div className="flex flex-col gap-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-64 w-full" /></div>}
      </div>
    </Page>
  )
}

export default MainEventEdit
