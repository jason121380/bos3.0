import { FileDown, Pencil, Trash2, UserCheck, X } from 'lucide-react'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { cn } from 'ui/utils'

function TableEditBar({
  selected = [],
  className = '',
  onDelete,
  onCancel,
  onEdit,
  onEditDeduction,
  onEditSaleStatus,
  onEditProductsCategory,
  onEditRakeSetting,
  onDeleteCustomer,
  editBarOnClick,
  onEditMembershipCategory,
  onReinstatement,
  onEditPersonnelProfile,
  ...rest
}) {
  const open = selected.length > 0
  // 批次操作列（STYLE.md §5 浮層）：勾選資料後浮在畫面底部中央；各按鈕的顯示條件與 handler 與舊版相同
  const item = (show, onClick, testId, Icon, label, { danger, disabled } = {}) =>
    show && (
      <Button
        key={label}
        size="sm"
        variant="ghost"
        onClick={onClick}
        data-testid={testId}
        disabled={disabled}
        className={danger ? 'text-danger hover:bg-danger/8' : undefined}
      >
        <Icon strokeWidth={1.75} />
        {label}
      </Button>
    )
  // 與舊版 persistent Drawer 相同：未勾選時元件仍在 DOM（隱藏），勾選後才顯示
  return (
    <div hidden={!open} className={`ui-root noprint pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-[1200] lg:bottom-6 justify-center px-4 ${open ? 'flex' : 'hidden'}`}>
      <div
        {...rest}
        role="toolbar"
        aria-label="批次操作"
        className={cn('pointer-events-auto flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-solid border-border bg-background py-1.5 pl-4 pr-1.5 shadow-float', className)}
      >
        <span className="mr-2 text-label tabular-nums text-text">已選 {selected.length} 筆</span>
        <span aria-hidden="true" className="mr-1 h-5 w-px bg-border" />
        {item(onReinstatement, onReinstatement, 'delete', UserCheck, '員工復職')}
        {item(onDelete, onDelete, 'delete', Trash2, '刪除', { danger: true })}
        {item(onEditSaleStatus, onEditSaleStatus, 'edit', Pencil, '編輯上架狀態')}
        {item(onEditDeduction, onEditDeduction, 'edit', Pencil, '編輯項目扣項')}
        {item(onEdit, onEdit, 'edit', Pencil, '編輯互助點數')}
        {item(onCancel, onCancel, 'cancelOrder', X, '取消訂單(預約)', { danger: true, disabled: editBarOnClick })}
        {item(onEditProductsCategory, onEditProductsCategory, 'editProductsCategory', Pencil, '編輯商品類別')}
        {item(onEditRakeSetting, onEditRakeSetting, 'editProductsCategory', Pencil, '編輯設計師抽成')}
        {item(onEditRakeSetting, onEditPersonnelProfile, 'editProductsCategory', FileDown, '由人員身分設定檔導入')}
        {item(onDeleteCustomer, onDeleteCustomer, 'editProductsCategory', Trash2, '刪除客人', { danger: true })}
        {item(onEditMembershipCategory, onEditMembershipCategory, 'onEditMembershipCategory', Pencil, '編輯會員卡類別')}
      </div>
    </div>
  )
}

TableEditBar.propTypes = {
  className: PropTypes.string,
  onDelete: PropTypes.func,
  onMarkPaid: PropTypes.func,
  onMarkUnpaid: PropTypes.func,
  selected: PropTypes.array,
}

export default TableEditBar
