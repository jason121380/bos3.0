import Page from 'components/Page'
import React, { useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import useFetchSettingEmployeeSchedule from 'hooks/useFetchSettingEmployeeSchedule'
import useFetchEmployeeSchedule from 'hooks/useFetchEmployeeSchedule'
import useFetchUndoEmployeeSchedule from 'hooks/useFetchUndoEmployeeSchedule'
import useFetchRedoEmployeeSchedule from 'hooks/useFetchRedoEmployeeSchedule'
import { useFetchUsersInEmployeeSchedule } from 'hooks/useFetchUsers'
import useFetchGetIsEmployeeScheduleUndoActive from 'hooks/useFetchGetIsEmployeeScheduleUndoActive'
import idx from 'idx'
import { openSnackbar } from 'elements/snackbars'
import { useSelector } from 'react-redux'
import { Button } from 'ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Skeleton } from 'ui/skeleton'

import ScheduleCard from './ScheduleCard'
import Header from './Header'
import AddDesignersModal from './AddDesignersModal'

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
    // 讀這次的回應（存檔／復原／重做的 mutation 結果、頁面查詢或 socket 推播），不是頁面查詢（Jason 2026/10/22 fix all）
    const payload = isSocket ? newSchedule : idx(newSchedule, _ => _.data[key])
    if (!payload) return
    const { id, schedule, isFirst, isLast } = payload
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
    const newScheduleCard = cloneDeep(scheduleCard)
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
    <Page className="ui-root" title="排班表">
      <Header
        handleAddScheduleCard={handleAddScheduleCard}
        handleRedoScheduleCard={handleRedoScheduleCard}
        handleUndoScheduleCard={handleUndoScheduleCard}
        disableButton={disableButton}
        disableButtonUndo={disableButtonUndo}
        disableButtonRedo={disableButtonRedo}
        undoActive={undoActive}
      />
      <div className="flex flex-wrap items-start gap-6">
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
          <div className="flex flex-wrap gap-6" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[240px] w-[332px] rounded-lg" />
            <Skeleton className="h-[240px] w-[332px] rounded-lg" />
          </div>
        )}
      </div>
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
      <Dialog open={open} onOpenChange={o => !o && handleClose()}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>確定要刪除此班表嗎？</DialogTitle>
            <DialogDescription>刪除後此班表與其中的人員排序會一併移除。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={disableButton}
              onClick={handleClose}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteCard}
              disabled={disableButton}
              autoFocus
            >
              確定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Page>
  )
}

export default EmployeeSchedule
