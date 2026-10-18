// MUI Modal 保留（舊版無 onClose，點背景不關閉）；內部 Select 已換 NativeSelect（原生 select 無彈層）
import { Modal } from '@mui/material'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
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
    <Modal open={openEditProductsCategoryModal}>
      <Card className="ui-root absolute left-1/2 top-1/2 max-h-full w-[912px] max-w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-float outline-none">
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
          <CardTitle>編輯商品類別</CardTitle>
        </CardHeader>

        <CardContent>
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
        </CardContent>
        <CardFooter>
          <Button
            variant="primary"
            onClick={handleUpdateProductsCategory}
          >
            儲存
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  )
}

EditProductsCategoryModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

EditProductsCategoryModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default EditProductsCategoryModal
