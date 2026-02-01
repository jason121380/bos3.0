/** @jsxImportSource @emotion/react */
import { Container, Grid, Button, Divider, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import React, { useState, useEffect } from 'react'
import _, { cloneDeep } from 'lodash'
import useFetchSettingEmployeeSchedule from 'hooks/useFetchSettingEmployeeSchedule'
import useFetchEmployeeSchedule from 'hooks/useFetchEmployeeSchedule'
import useFetchUndoEmployeeSchedule from 'hooks/useFetchUndoEmployeeSchedule'
import useFetchRedoEmployeeSchedule from 'hooks/useFetchRedoEmployeeSchedule'
import { useFetchUsersInEmployeeSchedule } from 'hooks/useFetchUsers'
import useFetchGetIsEmployeeScheduleUndoActive from 'hooks/useFetchGetIsEmployeeScheduleUndoActive'
import idx from 'idx'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import { openSnackbar } from 'elements/snackbars'
import { useSelector } from 'react-redux'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ScheduleCard from './ScheduleCard'
import Header from './Header'
import AddDesignersModal from './AddDesignersModal'

const styles = {
  root: css({
    paddingTop: theme.spacing(2) + '!important',
    paddingBottom: theme.spacing(1) + '!important',
  }),
}

const EmployeeSchedule = () => {
  const socketSchedule = useSelector(state => state.socket.schedule)
  const { setEmployeeSchedule } = useFetchSettingEmployeeSchedule()
  const { undoEmployeeSchedule } = useFetchUndoEmployeeSchedule()
  const { redoEmployeeSchedule } = useFetchRedoEmployeeSchedule()
  const getIsEmployeeScheduleUndoActive = useFetchGetIsEmployeeScheduleUndoActive()
  const employeeScheduleData = useFetchEmployeeSchedule()
  const [disableButton, setDisableButton] = useState(true)
  const [disableButtonUndo, setDisableButtonUndo] = useState(true)
  const [disableButtonRedo, setDisableButtonRedo] = useState(true)
  const [scheduleCard, setScheduleCard] = useState([
    {
      cardName: '',
      setName: false,
      scheduleRow: [
        {
          timeAdded: false,
          designerId: '',
          time: 0,
        },
      ],
    },
  ])
  const [designers, setDesigners] = useState([
    {
      timeAdded: false,
      designerId: '',
      time: 0,
    },
  ])
  const [scheduleId, setScheduleId] = useState('')

  const [openAddDesignerModal, setOpenAddDesignerModal] = useState(false)
  const [modalCardIndex, setModalCardIndex] = useState(null)
  const [open, setOpen] = useState(false)
  const [undoActive, setUndoActive] = useState(false)
  const [cardIndex, setCardIndex] = useState(null)
  const [users, setUsers] = useState([])
  const usersData = useFetchUsersInEmployeeSchedule({ pageLimit: 9999 })

  const handleSetData = (newSchedule, key = 'setEmployeeSchedule', isSocket = false) => {
    if (!isSocket && !idx(employeeScheduleData, _ => _.data[key])) return
    const { id, schedule, isFirst, isLast } = isSocket ? newSchedule : idx(newSchedule, _ => _.data[key])
    const data = JSON.parse(schedule)
    setScheduleId(id)
    setDisableButtonUndo(isFirst)
    setDisableButtonRedo(isLast)
    setScheduleCard(
      data === null ? [{
        cardName: '',
        setName: false,
        scheduleRow: [{
          timeAdded: false,
          designerId: '',
          time: 0,
        }]
      }] : data
    )
    setDisableButton(false)
    if (!newSchedule?.data) {
      openSnackbar({
        message: '排班表已更新',
        variant: 'success'
      })
      handleClose()
      handleCloseModal()
    }
  }

  const handleAddScheduleCard = () => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    newScheduleCard.push({
      cardName: '',
      setName: false,
      scheduleRow: [
        {
          timeAdded: false,
          designerId: '',
          time: 0,
        },
      ],
    })
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
  }

  const handleUndoScheduleCard = async () => {
    setDisableButton(true)
    try {
      const res = await undoEmployeeSchedule({ currentScheduleId: scheduleId })
      handleSetData(res, 'undoEmployeeSchedule')
    } catch (error) {
      setDisableButton(false)
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      if (error.message.includes('當前班表已過期')) {
        employeeScheduleData.refetch()
      }
    }
  }

  const handleRedoScheduleCard = async () => {
    setDisableButton(true)
    try {
      const res = await redoEmployeeSchedule({ currentScheduleId: scheduleId })
      handleSetData(res, 'redoEmployeeSchedule')
    } catch (error) {
      setDisableButton(false)
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      if (error.message.includes('當前班表已過期')) {
        employeeScheduleData.refetch()
      }
    }
  }

  const handleCloseModal = () => {
    setOpenAddDesignerModal(false)
    setDesigners([
      {
        timeAdded: false,
        designerId: '',
        time: 0,
      },
    ])
  }

  const handleClickOpen = cardIndex => {
    setOpen(true)
    setCardIndex(cardIndex)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDeleteCard = () => {
    setDisableButton(true)
    const newCard = cloneDeep(scheduleCard)
    newCard.splice(cardIndex, 1)
    setScheduleCard(newCard)
    handleSetSchedule(JSON.stringify(newCard))
    handleClose()
  }

  const handleSetSchedule = async (inputData) => {
    try {
      const res = await setEmployeeSchedule({
        schedule: inputData,
        currentScheduleId: scheduleId
      })
      handleSetData(res)
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      if (error.message.includes('當前班表已過期')) {
        employeeScheduleData.refetch()
      }
    } finally {
      setDisableButton(false)
    }
  }

  useEffect(() => {
    if (!getIsEmployeeScheduleUndoActive.loading) {
      const data = idx(getIsEmployeeScheduleUndoActive, _ => _.data.getIsEmployeeScheduleUndoActive)
      setUndoActive(data)
    }
  }, [getIsEmployeeScheduleUndoActive.loading])

  useEffect(() => {
    if (!employeeScheduleData.loading) {
      handleSetData(employeeScheduleData, 'getEmployeeSchedule')
    } else {
      setDisableButton(true)
    }
  }, [employeeScheduleData.loading])

  useEffect(() => {
    if (!usersData.loading) {
      const users = idx(usersData, _ => _.data.users.users)
      setUsers(users)
      setDisableButton(false)
    } else {
      setDisableButton(true)
    }
  }, [usersData.loading])

  useEffect(() => {
    socketSchedule && handleSetData(socketSchedule, undefined, true)
  }, [socketSchedule])
  return (
    <Page css={styles.root} title="排班表">
      <Container maxWidth={false}>
        <Header
          handleAddScheduleCard={handleAddScheduleCard}
          handleRedoScheduleCard={handleRedoScheduleCard}
          handleUndoScheduleCard={handleUndoScheduleCard}
          disableButton={disableButton}
          disableButtonUndo={disableButtonUndo}
          disableButtonRedo={disableButtonRedo}
          undoActive={undoActive}
        />
        <Grid container spacing={3} style={{ marginTop: '16px' }}>
          {!usersData.loading ? (
            <ScheduleCard
              users={users}
              scheduleCard={scheduleCard}
              setScheduleCard={setScheduleCard}
              handleClickOpen={handleClickOpen}
              setEmployeeSchedule={setEmployeeSchedule}
              setOpenAddDesignerModal={setOpenAddDesignerModal}
              setModalCardIndex={setModalCardIndex}
              setDisableButton={setDisableButton}
              disableButton={disableButton}
              employeeScheduleData={employeeScheduleData}
              setDisableButtonUndo={setDisableButtonUndo}
              setDisableButtonRedo={setDisableButtonRedo}
              handleSetSchedule={handleSetSchedule}
            />
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <CircularProgress color="inherit" />
            </div>
          )}
        </Grid>
        <AddDesignersModal
          designers={designers}
          setDesigners={setDesigners}
          openAddDesignerModal={openAddDesignerModal}
          onClose={handleCloseModal}
          modalCardIndex={modalCardIndex}
          scheduleCard={scheduleCard}
          setScheduleCard={setScheduleCard}
          setOpenAddDesignerModal={setOpenAddDesignerModal}
          handleSetSchedule={handleSetSchedule}
          setDisableButton={setDisableButton}
        />
      </Container>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            width: '300px',
            height: '125px',
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">確定要刪除此班表嗎？</DialogTitle>
        <Divider />
        <DialogActions style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={disableButton}
            onClick={handleClose}
            variant="outlined"
            style={{ margin: ' -1px 19px' }}
          >
            取消
          </Button>
          <Button
            onClick={handleDeleteCard}
            disabled={disableButton}
            autoFocus
            variant="outlined"
            style={{ margin: ' -1px 19px' }}
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
    </Page>
  )
}

export default EmployeeSchedule
