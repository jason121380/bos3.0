// 上架狀態下拉的值為布林值（NativeSelect 以索引對應、回傳原始型別）；外框已換 ui/dialog（NativeSelect 為原生 select、無彈出層）
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

const SaleStatusEditModal = ({ openEditSaleStatusModal, saleStatus, setSaleStatus, onClose, handleUpdateLaunchedStatus }) => {
  return (
    // 舊版 MUI Modal 有 onClose（點背景／Esc 關閉），以 onOpenChange 轉接；hideClose 保留原「關閉」按鈕為唯一關閉鈕外觀
    <Dialog
      open={openEditSaleStatusModal}
      onOpenChange={o => {
        if (!o) onClose()
      }}
    >
      <DialogContent size="sm" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>卡券上架狀態設定</DialogTitle>
          <Button variant="secondary" onClick={onClose}>
            關閉
          </Button>
        </DialogHeader>
        <DialogBody>
          <NativeSelect value={saleStatus} onChange={e => setSaleStatus(e.target.value)}>
            <NativeSelectOption value={true}>上架</NativeSelectOption>
            <NativeSelectOption value={false}>下架</NativeSelectOption>
          </NativeSelect>
        </DialogBody>
        <DialogFooter>
          <Button variant="primary" onClick={handleUpdateLaunchedStatus}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

SaleStatusEditModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  saleStatus: PropTypes.bool,
}

export default SaleStatusEditModal
