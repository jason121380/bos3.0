/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Button, Grid } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
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
import { cloneDeep } from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }),
  filterWrap: css({
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center'
  })
}

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
          id: '',
          func: () => { }
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
          id: '',
          func: () => { }
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

  useEffect(() => {
    if (!getMainEvents.loading) {
      const data = idx(getMainEvents, _ => _.data.mainEvents)
      setEvents(data)
    }
  }, [getMainEvents.loading])

  return (
    <Fragment>
      <Page css={styles.root} title="活動列表">
        <Container maxWidth={false}>
          <Grid container item justifyContent='space-between' alignItems='center'>
            <PageTitle title='活動列表' subTitle='Main Event List' />
            <Grid item>
              <Button
                color="primary"
                variant="contained"
                to='/main-event-create'
                component={RouterLink}
              >建立活動</Button>
            </Grid>
          </Grid>
          {getMainEvents.loading ?
            <div style={{ textAlign: 'center', marginTop: 100 }}><CircularProgress /></div>
            : <Results
              events={events}
              setEventUsing={handleSetMainEventUsing}
              setEventRuleUsing={handleSetEventRuleGroupUsing}
              setClickData={setClickData}
              setDialogOpen={setDialogOpen}
              setCollapse={handleSetCollapse}
              selectIds={selectIds}
              clickData={clickData}
            />
          }
        </Container>
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
