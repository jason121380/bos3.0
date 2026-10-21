import Page from 'components/Page'
import { useState } from 'react'
import useFetchCreateMainEvent from 'hooks/useFetchCreateMainEvent'
import cloneDeep from 'lodash/cloneDeep'
import { useHistory } from 'react-router'
import produce from 'immer'
import General from './General'
import { openSnackbar } from 'elements/snackbars'
import { startOfDay, endOfDay, isBefore } from 'date-fns'
import { PageHeader } from 'ui/page-header'

function MainEventCreate() {
  const history = useHistory()
  const { createMainEvent } = useFetchCreateMainEvent()
  const [isClick, setIsClick] = useState(false)
  const [inputValue, setInputValue] = useState({
    nameDefault: '',
    startDateDefault: new Date().getTime(),
    endDateDefault: new Date().getTime(),
    isSMSNotifyDefault: false,
    maxCountDefault: 0,
    isPublic: true,
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
      const res = await createMainEvent(submitData)
      if (res.data.createMainEvent) {
        openSnackbar({
          message: '新增成功',
          variant: 'success'
        })
        history.push('/main-event-list')
      } else {
        openSnackbar({
          message: '新增失敗',
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

  return (
    <Page className="ui-root" title="建立活動">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="建立活動" />
        <General
          dateChange={handleDateChange}
          valueChange={handleValueChange}
          inputValue={inputValue}
          isClick={isClick}
          submit={handleSubmit}
        />
      </div>
    </Page>
  )
}

export default MainEventCreate
