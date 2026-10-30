// 外框已換 ui/dialog；內部下拉是自家清單（不是系統選單）
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

function EditMemberCardRecordModal({
  openEditMembershipsCategoryModal,
  onClose,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  handleUpdateMembershipsCategory,
}) {
  const handleSelectCategoryId = event => {
    setSelectedCategoryId(event.target.value)
  }

  return (
    // 舊版 MUI Modal 未設 onClose（點背景／Esc 不關閉），故不傳 onOpenChange；hideClose 保留原「關閉」按鈕
    <Dialog open={openEditMembershipsCategoryModal}>
      <DialogContent size="md" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>編輯會員卡</DialogTitle>
          <Button variant="secondary" onClick={onClose}>
            關閉
          </Button>
        </DialogHeader>
        <DialogBody>
          <Field label="會員卡">
            <NativeSelect value={selectedCategoryId} onChange={event => handleSelectCategoryId(event)}>
              {(categories || []).map((data, idx) => (
                <NativeSelectOption key={`${data.uuid}-${idx}`} value={data.uuid}>
                  {data.no} {data.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" onClick={handleUpdateMembershipsCategory}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

EditMemberCardRecordModal.propTypes = {
  className: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

EditMemberCardRecordModal.defaultProps = {
  open: false,
  onClose: () => {},
}

export default EditMemberCardRecordModal
