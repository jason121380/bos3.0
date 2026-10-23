import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import ComfirmDialog from './ComfirmDialog'
import { useFetchGetMainEvents } from 'hooks/useFetchGetMainEvent'
import useFetchSetMainEventUsing from 'hooks/useFetchSetMainEventUsing'
import useFetchSetEventRuleGroupUsing from 'hooks/useFetchSetEventRuleGroupUsing'
import useFetchSetEndMainEvent from 'hooks/useFetchSetEndMainEvent'
import useFetchEndEventRuleGroup from 'hooks/useFetchEndEventRuleGroup'
import { openSnackbar } from 'elements/snackbars'
import cloneDeep from 'lodash/cloneDeep'
import AdminPageHeader from 'components/AdminPageHeader'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

function MainEventList() {
  const getMainEvents = useFetchGetMainEvents()
  const { setMainEventUsing } = useFetchSetMainEventUsing()
  const { setEventRuleGroupUsing } = useFetchSetEventRuleGroupUsing()
  const { setMainEndEvent } = useFetchSetEndMainEvent()
  const { endEventRuleGroup } = useFetchEndEventRuleGroup()
  const [events, setEvents] = useState([])
  const [selectIds, setSelectIds] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const [clickData, setClickData] = useState({
    name: '',
    id: '',
    type: ''
  })

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleSetMainEventUsing = async (id, isUsing) => {
    const data = { id, isUsing }
    try {
      const res = await setMainEventUsing({ input: data })
      if (res.data.setMainEventUsing) {
        openSnackbar({
          message: '修改成功',
          variant: 'success'
        })
        getMainEvents.refetch()
      } else {
        openSnackbar({
          message: '修改失敗',
          variant: 'warning'
        })
      }
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
    }
  }

  const handleSetEventRuleGroupUsing = async (id, isUsing) => {
    const data = { id, isUsing }
    try {
      const res = await setEventRuleGroupUsing({ input: data })
      if (res.data.setEventRuleGroupUsing) {
        openSnackbar({
          message: '修改成功',
          variant: 'success'
        })
        getMainEvents.refetch()
      } else {
        openSnackbar({
          message: '修改失敗',
          variant: 'warning'
        })
      }
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
    }
  }

  const handleEndMainEvent = async () => {
    setIsClick(true)
    try {
      const res = await setMainEndEvent({ eventId: clickData.id })
      if (res.data.endMainEvent) {
        openSnackbar({
          message: '修改成功',
          variant: 'success'
        })
        getMainEvents.refetch()
        setClickData({
          name: '',
          id: ''
        })
        handleCloseDialog()
      } else {
        openSnackbar({
          message: '修改失敗',
          variant: 'warning'
        })
      }
      setIsClick(false)
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      setIsClick(false)
    }
  }

  const handleEndEventRuleGroup = async () => {
    setIsClick(true)
    try {
      const res = await endEventRuleGroup(clickData.id)
      if (res.data.endEventRuleGroup) {
        openSnackbar({
          message: '修改成功',
          variant: 'success'
        })
        getMainEvents.refetch()
        setClickData({
          name: '',
          id: ''
        })
        handleCloseDialog()
      } else {
        openSnackbar({
          message: '修改失敗',
          variant: 'warning'
        })
      }
      setIsClick(false)
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      setIsClick(false)
    }
  }

  const handleChooseFunc = () => {
    if (clickData.type) {
      clickData.type === 'event' ? handleEndMainEvent() : handleEndEventRuleGroup()
    }
  }

  const handleSetCollapse = id => {
    const cloneIds = cloneDeep(selectIds)
    const idx = cloneIds.indexOf(id)
    if (idx > -1) {
      cloneIds.splice(idx, 1)
    } else {
      cloneIds.push(id)
    }
    setSelectIds(cloneIds)
  }

  const handleToggleAll = () => {
    if (selectIds.length === events.length) {
      setSelectIds([])
    } else {
      setSelectIds(events.map(e => e.id))
    }
  }

  useEffect(() => {
    if (!getMainEvents.loading) {
      // 查詢失敗時當成沒有活動（原本 events 變 undefined、讀 .length 整頁進入錯誤畫面）
      const data = idx(getMainEvents, _ => _.data.mainEvents) || []
      setEvents(data)
    }
  }, [getMainEvents.loading])

  return (
    <Fragment>
      <Page className="ui-root" title="活動列表">
        <div>
          <AdminPageHeader
            title="活動列表"
            primaryAction={{
              label: '建立活動',
              to: '/main-event-create'
            }}
          />
          {getMainEvents.loading ?
            <div className="flex flex-col gap-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
            : <Results
              events={events}
              setEventUsing={handleSetMainEventUsing}
              setEventRuleUsing={handleSetEventRuleGroupUsing}
              setClickData={setClickData}
              setDialogOpen={setDialogOpen}
              setCollapse={handleSetCollapse}
              onToggleAll={handleToggleAll}
              isAllExpanded={events.length > 0 && selectIds.length === events.length}
              selectIds={selectIds}
              clickData={clickData}
            />
          }
        </div>
      </Page>
      <ComfirmDialog
        clickData={clickData}
        isClick={isClick}
        dialogOpen={dialogOpen}
        close={handleCloseDialog}
        confirmFunc={handleChooseFunc}
      />
    </Fragment>
  )
}

export default MainEventList
