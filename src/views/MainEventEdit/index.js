/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useState, useEffect } from 'react'
import useFetchGetMainEvent from 'hooks/useFetchGetMainEvent'
import useFetchUpdateMainEvent from 'hooks/useFetchUpdateMainEvent'
import { cloneDeep } from 'lodash'
import { useHistory } from 'react-router'
import produce from 'immer'
import General from './General'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { startOfDay, endOfDay, isBefore } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  headerWrap: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10
  })
}

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
      setInputValue(data)
    }
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
    <Page css={styles.root} title="編輯活動">
      <Container maxWidth="md">
        <PageTitle title='編輯活動' subTitle='Main Event Edit' />
        {!getMainEvent.loading ? (
          <General
            dateChange={handleDateChange}
            valueChange={handleValueChange}
            inputValue={inputValue}
            isClick={isClick}
            submit={handleSubmit}
          />
        ) : <div style={{ textAlign: 'center', marginTop: '200px' }}><CircularProgress /></div>}
      </Container>
    </Page>
  )
}

export default MainEventEdit
