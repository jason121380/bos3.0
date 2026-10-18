// MUI Modal 保留：內含 MUI Select（Radix Dialog 會擋住其選單），且舊版無 onClose（點背景不關閉）
import {
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'

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
          <FormControl variant="outlined" fullWidth>
            <InputLabel>商品類別</InputLabel>
            <Select
              label='商品類別'
              value={selectedCategoryId}
              onChange={event => handleSelectCategoryId(event)}
            >
              {productCategories.map((data, idx) => (
                <MenuItem key={`${data.id}-${idx}`} value={data.id}>
                  {data.no} {data.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
