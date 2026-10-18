// 上架狀態 Select 的值為布林值，依遷移指南保留 MUI Modal 與 Select；外框與按鈕改為 src/ui
import { Modal, FormControl, Select, MenuItem } from '@mui/material'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
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
          <FormControl variant="outlined" fullWidth>
            <Select fullWidth value={saleStatus} onChange={e => setSaleStatus(e.target.value)}>
              <MenuItem value={true}>上架</MenuItem>
              <MenuItem value={false}>下架</MenuItem>
            </Select>
          </FormControl>
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