import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import format from 'date-fns/format'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import useFetchDeleteMembership from 'hooks/useFetchDeleteMembership'
import useFetchMultipleUpdateMembershipCategory from 'hooks/useFetchMultipleUpdateMembershipCategory'
import { Download, Pencil } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

import EditMemberCardRecordModal from './EditMemberCardRecordModal'

function Results({ className, memberships, setCategoryFilter, onPageChange, categories, onChanged, ...rest }) {
  const { multipleUpdateMembershipCategory } = useFetchMultipleUpdateMembershipCategory()
  const { deleteMembership } = useFetchDeleteMembership()
  // 選會員卡
  const [selectedMembership, setSelectedMembership] = useState([])
  // 是否打開brawer的宣告
  const [openDialog, setOpenDialog] = useState(false)
  //是否打開批量改類別
  const [openEditMembershipsCategoryModal, setOpenEditMembershipsCategoryModal] = useState(false)
  //選類別的ID
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [excelData, setExcelData] = useState([])

  // 多選checkbox
  const handleSelectAll = event => {
    const newSelected = event.target.checked
      ? memberships.data.filter(d => d.isUsing).map(d => d.uuid)
      : []
    setSelectedMembership(newSelected)
  }

  // 單選checkbox
  const handleSelectOne = uuid => {
    const newSelect = [...selectedMembership], index = newSelect.indexOf(uuid)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(uuid)
    }
    setSelectedMembership(newSelect)
  }

  // 表頭全選以「啟用中的會員卡」判斷（Jason 2026/10/22 授權修正：原本與含停用的總數比，有停用的卡時永遠不會全選、再按也無法取消）
  const usingIds = memberships.data.filter(d => d.isUsing).map(d => d.uuid)
  const isAllSelected = usingIds.length > 0 && usingIds.every(uuid => selectedMembership.indexOf(uuid) > -1)

  // 刪除會員卡（確認視窗按「確定」後才送出；先關窗避免重複送出）
  const handleConfirmCancel = () => {
    setOpenDialog(false)
    deleteMembership(selectedMembership)
      .then(() => {
        setSelectedMembership([])
        setOpenDialog(false)
        openSnackbar({ message: '成功刪除會員卡', variant: 'success' })
        // 原本整頁 reload：改為重抓會員卡清單，保留分類篩選、搜尋與分頁（2026/10/28）
        if (onChanged) onChanged()
      })
      .catch(err => {
        setSelectedMembership([])
        setOpenDialog(false)
      })
  }

  // 關閉批量修改的modal
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  //打開批量修改的modal
  const handleOpenEditMembershipCategoryModal = () => {
    setOpenEditMembershipsCategoryModal(true)
  }

  // 批量修改的modal 的 submit
  const handleUpdateMembershipsCategory = () => {
    const tmp = {
      membershipUUIDs: selectedMembership,
      membershipCategoryUUIDs: selectedCategoryId,
    }
    multipleUpdateMembershipCategory(tmp)
      .then(() => {
        setSelectedMembership([])
        setSelectedCategoryId('')
        setOpenEditMembershipsCategoryModal(false)
        openSnackbar({ message: '編輯會員類別成功', variant: 'success' })
        if (onChanged) onChanged()
      })
      .catch(err => {
        setSelectedMembership([])
        setSelectedCategoryId('')
        setOpenEditMembershipsCategoryModal(false)
      })
  }

  // 匯出
  useEffect(() => {
    const excelData = []
    memberships.data.forEach(data => {
      excelData.push({
        代號: data.no,
        類別: data.membershipCategory === null ? '未分類' : data.membershipCategory.name,
        名稱: data.name,
        成本: data.cost,
        價格: data.sellPrice,
        變更者: data.creator !== null ? data.creator.name : '',
        變更時間: format(data.updatedAt, 'yyyy/MM/dd'),
      })
    })
    setExcelData(excelData)
  }, [memberships])

  return (
    <div {...rest} className='MemberCardRecordResult mt-2'>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="會員卡列表.csv">
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>所有會員卡</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">
              共 {memberships.data.length} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={isAllSelected}
                    indeterminate={selectedMembership.length > 0 && !isAllSelected}
                    onChange={handleSelectAll}
                    disabled={
                      memberships.data.length === 0 ||
                      memberships.data.filter(d => !d.isUsing).length ===
                      memberships.data.length
                    }
                  />
                </TableHead>
                <TableHead>操作</TableHead>
                <TableHead>代號</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>成本</TableHead>
                <TableHead numeric>價格</TableHead>
                <TableHead>變更者</TableHead>
                <TableHead>變更時間</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.data.map((data, idx) => (
                <TableRow
                  key={`membership-${data.name}-${idx}`}
                  data-state={selectedMembership.indexOf(data.uuid) > -1 || !data.isUsing ? 'selected' : undefined}
                  data-testid="membership-row"
                >
                  <TableCell>
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      checked={selectedMembership.indexOf(data.uuid) > -1}
                      onChange={() => handleSelectOne(data.uuid)}
                      data-testid={`membership-${data.name}-checkbox`}
                    />
                  </TableCell>
                  <TableCell>
                    {/* 停用的會員卡：連結無 disabled 屬性，改用 aria-disabled＋取消指標事件 */}
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className={cn('text-text-tertiary', !data.isUsing && 'pointer-events-none opacity-40')}
                      aria-label="編輯會員卡"
                    >
                      <RouterLink
                        to={`/member-card/edit/${data.uuid}`}
                        aria-disabled={!data.isUsing || undefined}
                        tabIndex={!data.isUsing ? -1 : undefined}
                      >
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell className="tabular-nums">{data.no}</TableCell>
                  <TableCell>
                    {data.membershipCategory === null ? '未分類' : data.membershipCategory.name}
                  </TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell numeric>{formatNumber(data.cost)}</TableCell>
                  <TableCell numeric>{formatNumber(data.sellPrice)}</TableCell>
                  <TableCell>{data.creator !== null ? data.creator.name : ''}</TableCell>
                  <TableCell className="tabular-nums">{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar
        selected={selectedMembership}
        onDelete={() => setOpenDialog(true)}
        onEditMembershipCategory={handleOpenEditMembershipCategoryModal}
      />
      {/* 批次刪除確認（比照打卡記錄刪除的確認窗，Jason 2026/10/22「照建議」）：確定才送出刪除，取消保留勾選 */}
      <Dialog
        open={openDialog}
        onOpenChange={o => !o && handleCloseDialog()}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle id="alert-dialog-title">{`確定要刪除選取的 ${selectedMembership.length} 張會員卡嗎？`}</DialogTitle>
            <DialogDescription>刪除後無法復原。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseDialog} variant="ghost">
              取消
            </Button>
            <Button onClick={handleConfirmCancel} variant="danger" autoFocus data-testid="confirm">
              確定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {openEditMembershipsCategoryModal && (
        <EditMemberCardRecordModal
          openEditMembershipsCategoryModal={openEditMembershipsCategoryModal}
          onClose={() => setOpenEditMembershipsCategoryModal(false)}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          handleUpdateMembershipsCategory={handleUpdateMembershipsCategory}
        />
      )}
    </div>
  )
}

export default Results
