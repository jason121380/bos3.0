// 共用圖層支援窗內 picker；保留原受控開關與表單行為。
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from 'ui/dialog'
import PropTypes from 'prop-types'
import { memo } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import { Trash2 } from 'lucide-react'
import { Button } from 'ui/button'

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
  setDisableButton,
}) {
  const handleDeleteDesigner = index => {
    const newDesigners = cloneDeep(designers)
    newDesigners.splice(index, 1)
    setDesigners(newDesigners)
  }

  const handleDesignerOnChange = (id, index) => {
    const newDesigners = cloneDeep(designers)
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
    const newScheduleCard = cloneDeep(scheduleCard)
    const newDesigners = designers.filter(designer => designer.designerId !== '' || designer === null)
    if (newScheduleCard[modalCardIndex].scheduleRow[0].designerId === '') {
      newScheduleCard[modalCardIndex].scheduleRow = [...newDesigners]
    } else {
      newScheduleCard[modalCardIndex].scheduleRow = [...newScheduleCard[modalCardIndex].scheduleRow, ...newDesigners]
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
    const newDesigners = cloneDeep(designers)
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
    <Dialog open={openAddDesignerModal}>
      {/* 保留原表單寬 500px；本批僅替換彈窗外殼。 */}
      <DialogContent
        hideClose
        onOpenAutoFocus={event => {
          // 沿用舊 Modal：已有欄位焦點就保留，否則先聚焦面板，避免選人窗自動叫出手機鍵盤。
          event.preventDefault()
          if (!event.target.contains(document.activeElement)) event.target.focus()
        }}
        className="sm:max-w-[500px]"
        aria-describedby={undefined}
      >
        <DialogHeader className="items-center">
          <div className="flex w-full items-center justify-between gap-4">
            <DialogTitle>新增設計師</DialogTitle>
            <Button variant="secondary" onClick={onClose}>
              返回
            </Button>
          </div>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          {designers.map((designer, index) => (
            <div className="flex items-center justify-center gap-2" key={`${designer.designerId}-${index}`}>
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
                  title="移除此人員"
                  onClick={() => handleDeleteDesigner(index)}
                >
                  <Trash2 strokeWidth={1.75} />
                </Button>
              )}
            </div>
          ))}
        </DialogBody>
        <DialogFooter className="flex-wrap justify-center">
          {/* 停用原因（STYLE.md §6）：第一列還沒選服務人員時不能新增 */}
          {designers[0].designerId.length === 0 && (
            <p id="add-designers-missing" role="status" className="w-full text-center text-caption text-text-secondary">
              尚缺：服務人員
            </p>
          )}
          <Button
            variant="primary"
            onClick={handleAddDesignersToSchedule}
            disabled={designers[0].designerId.length === 0}
            aria-describedby={designers[0].designerId.length === 0 ? 'add-designers-missing' : undefined}
          >
            新增
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

AddDesignersModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AddDesignersModal.defaultProps = {
  open: false,
  onClose: () => {},
}

export default memo(AddDesignersModal)
