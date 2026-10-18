// MUI Modal 保留；內部 Select 已換 NativeSelect（原生 select 無彈層，不受 Radix／MUI 影響）
import { Modal } from '@mui/material'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
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
    <Modal open={openEditMembershipsCategoryModal}>
      <Card className="ui-root absolute left-1/2 top-1/2 max-h-full w-[640px] max-w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-float outline-none">
        <CardHeader
          className="items-center"
          action={
            <Button
              variant="secondary"
              onClick={onClose}
            >
              關閉
            </Button>
          }
        >
          <CardTitle>編輯會員卡</CardTitle>
        </CardHeader>

        <CardContent>
          <Field label="會員卡">
            <NativeSelect
              value={selectedCategoryId}
              onChange={event => handleSelectCategoryId(event)}
            >
              {categories.map((data, idx) => (
                <NativeSelectOption key={`${data.uuid}-${idx}`} value={data.uuid}>
                  {data.no} {data.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </CardContent>
        <CardFooter>
          <Button
            variant="primary"
            onClick={handleUpdateMembershipsCategory}
          >
            儲存
          </Button>
        </CardFooter>
      </Card>
    </Modal>
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
