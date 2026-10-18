// 上架狀態下拉的值為布林值（NativeSelect 以索引對應、回傳原始型別）；保留 MUI Modal，外框、下拉與按鈕改為 src/ui
import { Modal } from '@mui/material'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'

const SaleStatusEditModal = ({
  openEditSaleStatusModal,
  saleStatus,
  setSaleStatus,
  onClose,
  handleUpdateLaunchedStatus
}) => {
  return (
    <Modal open={openEditSaleStatusModal} onClose={onClose}>
      <Card className="ui-root absolute left-1/2 top-1/2 w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 shadow-float outline-none">
        <CardHeader
          className="items-center pb-4"
          action={
            <Button variant="secondary" onClick={onClose}>
              關閉
            </Button>
          }
        >
          <CardTitle>卡券上架狀態設定</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <NativeSelect value={saleStatus} onChange={e => setSaleStatus(e.target.value)}>
            <NativeSelectOption value={true}>上架</NativeSelectOption>
            <NativeSelectOption value={false}>下架</NativeSelectOption>
          </NativeSelect>
        </CardContent>
        <CardFooter className="mt-5">
          <Button variant="primary" onClick={handleUpdateLaunchedStatus}>
            儲存
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  )
}

SaleStatusEditModal.propTypes = {
  onClose: PropTypes.func,
  saleStatus: PropTypes.bool
}

SaleStatusEditModal.defaultProps = {
  onClose: () => { },
}

export default SaleStatusEditModal