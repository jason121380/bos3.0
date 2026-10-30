import clsx from 'clsx'
import { Plus } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import useFetchDeleteBonusDeposit from 'hooks/useFetchDeleteBonusDeposit'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ className, recordData, customer, refetch, ...rest }) {
  const [selectedRecord, setSelectedRecord] = useState([])
  const { deleteBonus } = useFetchDeleteBonusDeposit()
  const handleSelectAll = event => {
    const newSelected = event.target.checked ? recordData.map(data => data.id) : []
    setSelectedRecord(newSelected)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedRecord],
      index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedRecord(newSelect)
  }

  const handleDelete = () => {
    deleteBonus({
      bonusId: selectedRecord,
    })
      .then(res => {
        if (res.data.deleteBonusDeposit) {
          openSnackbar({
            message: '刪除成功',
            variant: 'success',
          })
          setSelectedRecord([])
          refetch()
        } else {
          openSnackbar({
            message: '刪除失敗',
            variant: 'warning',
          })
        }
      })
      .catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
      })
  }

  return (
    <div {...rest} className={clsx('flex flex-col gap-4', className)}>
      <Card className="flex flex-col items-center gap-1 px-5 py-6 text-center">
        <span className="text-label text-text-secondary">紅利點數餘額</span>
        <span className="text-display tabular-nums text-text">{formatNumber(recordData.reduce((a, b) => a + b.bonus, 0))}</span>
      </Card>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label tabular-nums text-text-secondary">共 {recordData.length} 筆資料</span>
        <Button asChild variant="primary" size="sm">
          <RouterLink to={`/customer-bonus-record/create/${customer.id}`}>
            <Plus strokeWidth={1.75} />
            新增紅利點數
          </RouterLink>
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>紅利點數紀錄</CardTitle>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={selectedRecord.length === recordData.length && recordData.length > 0}
                    indeterminate={selectedRecord.length > 0 && selectedRecord.length < recordData.length}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>操作</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>顧客代號</TableHead>
                <TableHead>顧客名稱</TableHead>
                <TableHead numeric>點數</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordData.map(data => (
                <TableRow key={data.id} data-state={selectedRecord.indexOf(data.id) > -1 ? 'selected' : undefined} data-testid="category-row">
                  <TableCell className="w-12">
                    <Checkbox aria-label="選取此筆" onChange={() => handleSelectOne(data.id)} checked={selectedRecord.indexOf(data.id) > -1} />
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="secondary">
                      <RouterLink to={`/customer-bonus-record/edit/${data.id}`}>編輯</RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell className="tabular-nums">{format(data.date, 'yyyy/MM/dd')}</TableCell>
                  <TableCell className="tabular-nums">{data.customerNo}</TableCell>
                  <TableCell>{data.customerName}</TableCell>
                  <TableCell numeric>{formatNumber(data.bonus)}</TableCell>
                  <TableCell>{data.designerName}</TableCell>
                  <TableCell>{data.remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar selected={selectedRecord} onDelete={handleDelete} />
    </div>
  )
}

export default Results
