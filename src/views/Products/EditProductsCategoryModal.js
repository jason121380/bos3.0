// 外框已換 ui/dialog（舊版 Modal 無 onClose，點背景不關閉）；內部 Select 已換 NativeSelect（原生 select 無彈層）
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

function EditProductsCategoryModal({
  openEditProductsCategoryModal,
  onClose,
  productCategories,
  selectedCategoryId,
  setSelectedCategoryId,
  handleUpdateProductsCategory,
}) {
  const handleSelectCategoryId = event => {
    setSelectedCategoryId(event.target.value)
  }

  return (
    // 舊版 MUI Modal 未設 onClose（點背景／Esc 不關閉），故不傳 onOpenChange；hideClose 保留原「關閉」按鈕；寬度以 className 保留原 912px
    <Dialog open={openEditProductsCategoryModal}>
      <DialogContent size="lg" className="max-w-[912px]" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>編輯商品類別</DialogTitle>
          <Button
            variant="secondary"
            onClick={onClose}
          >
            關閉
          </Button>
        </DialogHeader>
        <DialogBody>
          <Field label="商品類別">
            <NativeSelect
              value={selectedCategoryId}
              onChange={event => handleSelectCategoryId(event)}
            >
              {productCategories.map((data, idx) => (
                <NativeSelectOption key={`${data.id}-${idx}`} value={data.id}>
                  {data.no} {data.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="primary"
            onClick={handleUpdateProductsCategory}
          >
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

EditProductsCategoryModal.propTypes = {
  openEditProductsCategoryModal: PropTypes.bool,
  onClose: PropTypes.func,
}

export default EditProductsCategoryModal
