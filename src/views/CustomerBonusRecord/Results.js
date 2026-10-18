import TableEditBar from 'components/TableEditBar'
import useFetchDeleteBonusDeposit from 'hooks/useFetchDeleteBonusDeposit'
import { openSnackbar } from 'elements/snackbars'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { format } from 'date-fns'
import { Pencil } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ className, recordData, refetch, ...rest }) {
  const { deleteBonus } = useFetchDeleteBonusDeposit()
  const [selectedRecord, setSelectedRecord] = useState([])

  const handleSelectAll = event => {
    const newSelected = event.target.checked
      ? recordData.map(data => data.id)
      : []
    setSelectedRecord(newSelected)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedRecord], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedRecord(newSelect)
  }

  const handleDelete = () => {
    deleteBonus({
      bonusId: selectedRecord
    }).then(res => {
      if (res.data.deleteBonusDeposit) {
        openSnackbar({
          message: '刪除成功',
          variant: 'success'
        })
        setSelectedRecord([])
        refetch()
      } else {
        openSnackbar({
          message: '刪除失敗',
          variant: 'warning'
        })
      }
    }).catch(error => {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
    })
  }

  return (
    <div {...rest} className="mt-2">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>紅利點數紀錄</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">
              共 {recordData.length} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table wrapperClassName="max-h-[calc(100vh-240px)] overflow-y-auto">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={
                      selectedRecord.length === recordData.length && recordData.length > 0
                    }
                    indeterminate={
                      selectedRecord.length > 0 &&
                      selectedRecord.length < recordData.length
                    }
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
                <TableRow
                  key={data.id}
                  data-state={selectedRecord.indexOf(data.id) > -1 ? 'selected' : undefined}
                  data-testid="category-row"
                >
                  <TableCell>
                    <Checkbox
                      aria-label="選取此筆紀錄"
                      onChange={() => handleSelectOne(data.id)}
                      checked={selectedRecord.indexOf(data.id) > -1}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary" aria-label="編輯紀錄">
                      <RouterLink to={`/customer-bonus-record/edit/${data.id}`}>
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
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

Results.propTypes = {
  className: PropTypes.object,
  categories: PropTypes.array,
}

Results.defaultProps = {
  categories: [],
}

export default Results