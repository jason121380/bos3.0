import { Pencil, Trash2 } from 'lucide-react'
import { Button } from 'ui/button'

// 批次操作列：外觀比照 components/TableEditBar（浮在底部中央）；
// 與舊版 persistent Drawer 相同，未勾選時仍在 DOM（隱藏），勾選後才顯示；各按鈕 onClick 與舊版相同
const ProdudctDrawer = ({
  selectedProducts, disableDeleteProduct, handleCancel, handleConfirmCancel, setOpenPublishDialog,
  setOpenEditProductsCategoryModal, setOpenVendorDialog
}) => {
  return (
    <div
      hidden={!(selectedProducts.length > 0)}
      className={`ui-root noprint pointer-events-none fixed inset-x-0 bottom-6 z-[1200] justify-center px-4 ${selectedProducts.length > 0 ? 'flex' : 'hidden'}`}
    >
      <div
        role="toolbar"
        aria-label="批次操作"
        className="pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-solid border-border bg-background py-1.5 pl-4 pr-1.5 shadow-float"
      >
        <span className="mr-2 hidden text-label tabular-nums text-text sm:inline">
          已選 {selectedProducts.length} 筆
        </span>
        <span aria-hidden="true" className="mr-1 hidden h-5 w-px bg-border sm:inline-block" />
        <Button size="sm" variant="ghost" className="text-danger hover:bg-danger/8" onClick={disableDeleteProduct ? handleCancel : handleConfirmCancel}>
          <Trash2 strokeWidth={1.75} />
          刪除
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpenPublishDialog(true)}>
          <Pencil strokeWidth={1.75} />
          編輯上架狀態
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpenVendorDialog(true)}>
          <Pencil strokeWidth={1.75} />
          編輯廠商
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpenEditProductsCategoryModal(true)}>
          <Pencil strokeWidth={1.75} />
          編輯商品類別
        </Button>
      </div>
    </div>
  )
}

export default ProdudctDrawer
