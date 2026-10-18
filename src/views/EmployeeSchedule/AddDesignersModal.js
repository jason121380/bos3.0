// 保留 MUI Modal：內含 EmployeeAutoComplete（MUI Autocomplete），Radix Dialog 會擋住其彈出層點擊
import { Modal } from '@mui/material'
import PropTypes from 'prop-types'
import { memo } from 'react'
import _ from 'lodash'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import { Trash2 } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

function AddDesignersModal({
  designers,
  setDesigners,
  openAddDesignerModal,
  onClose,
  modalCardIndex,
  scheduleCard,
  setScheduleCard,
  setOpenAddDesignerModal,
  handleSetSchedule,
  setDisableButton
}) {
  const handleDeleteDesigner = index => {
    const newDesigners = _.cloneDeep(designers)
    newDesigners.splice(index, 1)
    setDesigners(newDesigners)
  }

  const handleDesignerOnChange = (id, index) => {
    const newDesigners = _.cloneDeep(designers)
    if (id !== undefined) {
      newDesigners[index].designerId = id
      if (index === newDesigners.length - 1) {
        newDesigners.push({
          timeAdded: false,
          designerId: '',
          time: 0,
        })
      }
    } else {
      newDesigners.splice(index, 1)
      if (newDesigners.length === 0) {
        newDesigners.push({
          timeAdded: false,
          designerId: '',
          time: 0,
        })
      }
    }
    setDesigners(newDesigners)
  }
  const handleAddDesignersToSchedule = () => {
    setDisableButton(true)
    const newScheduleCard = _.cloneDeep(scheduleCard)
    const newDesigners = designers.filter(
      designer => designer.designerId !== '' || designer === null
    )
    if (newScheduleCard[modalCardIndex].scheduleRow[0].designerId === '') {
      newScheduleCard[modalCardIndex].scheduleRow = [...newDesigners]
    } else {
      newScheduleCard[modalCardIndex].scheduleRow = [
        ...newScheduleCard[modalCardIndex].scheduleRow,
        ...newDesigners,
      ]
    }
    setScheduleCard([...newScheduleCard])
    handleSetSchedule(JSON.stringify(newScheduleCard))
    setOpenAddDesignerModal(false)
    setDesigners([
      {
        timeAdded: false,
        designerId: '',
        time: 0,
      },
    ])
  }

  const keyDownDeleteData = (event, index) => {
    const newDesigners = _.cloneDeep(designers)
    event.preventDefault()
    if (event.keyCode === 8 || event.keyCode === 46) {
      if (newDesigners.length === 1) {
        setDesigners([
          {
            timeAdded: false,
            designerId: '',
            time: 0,
          },
        ])
      } else {
        newDesigners.splice(index, 1)
        if (index === newDesigners.length) {
          newDesigners.push({
            timeAdded: false,
            designerId: '',
            time: 0,
          })
        }
        setDesigners(newDesigners)
      }
    }
  }

  return (
    <Modal open={openAddDesignerModal}>
      <Card className="ui-root absolute left-1/2 top-1/2 max-h-full w-[500px] max-w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-float outline-none">
        <CardHeader
          className="items-center"
          action={
            <Button variant="secondary" onClick={onClose}>
              返回
            </Button>
          }
        >
          <CardTitle>新增設計師</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {designers.map((designer, index) => (
            <div
              className="flex items-center justify-center gap-2"
              key={`${designer.designerId}-${index}`}
            >
              <div className="w-1/2">
                <div className="EmployeeScheduleAddDesignersModal">
                  <EmployeeAutoComplete
                    label="服務人員姓名/編號"
                    value={designer.designerId}
                    onKeyDown={event => {
                      keyDownDeleteData(event, index)
                    }}
                    onChange={value => handleDesignerOnChange(value.userId, index)}
                  />
                </div>
              </div>
              {designers.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-danger"
                  aria-label="移除此人員"
                  onClick={() => handleDeleteDesigner(index)}
                >
                  <Trash2 strokeWidth={1.75} />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
        <div className="flex items-center justify-center px-5 pb-5">
          <Button
            variant="primary"
            onClick={handleAddDesignersToSchedule}
            disabled={designers[0].designerId.length === 0}
          >
            新增
          </Button>
        </div>
      </Card>
    </Modal>
  )
}

AddDesignersModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AddDesignersModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(AddDesignersModal)
