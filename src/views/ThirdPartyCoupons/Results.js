import { Pencil } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteThirdPartyCoupon from 'hooks/useFetchDeleteThirdPartTicket'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

function Results({ className, thirdPartyCouponList = [], thirdPartyCouponsRefetch, ...rest }) {
  const [selectedPayment, setSelectedPayment] = useState([])
  const { deleteThirdPartyCoupon } = useFetchDeleteThirdPartyCoupon()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? thirdPartyCouponList.map(d => d.id) : []
    setSelectedPayment(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedPayment],
      index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedPayment(newSelect)
  }
  const handleSeletedDelete = () => {
    if (selectedPayment.length > 0) {
      selectedPayment.forEach(d => {
        deleteThirdPartyCoupon({ id: d })
          .then(() => {
            setSelectedPayment([])
            thirdPartyCouponsRefetch()
            openSnackbar({ message: '刪除第三方卡券成功', variant: 'success' })
          })
          .catch(error => {
            openSnackbar({ message: error.message, variant: 'error' })
          })
      })
    }
  }
  return (
    <div {...rest}>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-baseline gap-3">
            <CardTitle>所有第三方卡券</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">共 {thirdPartyCouponList.length} 筆</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={selectedPayment.length === thirdPartyCouponList.length && thirdPartyCouponList.length > 0}
                    indeterminate={selectedPayment.length > 0 && selectedPayment.length < thirdPartyCouponList.length}
                    onChange={handleSelectAll}
                    disabled={thirdPartyCouponList.length === 0}
                  />
                </TableHead>
                <TableHead>操作</TableHead>
                <TableHead>#</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>手續費</TableHead>
                <TableHead>金額是否為0</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {thirdPartyCouponList.map((data, idx) => (
                <TableRow key={`${data.id}-${idx}`} data-state={selectedPayment.indexOf(data.id) > -1 ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      onChange={() => handleSelectOne(data.id)}
                      checked={selectedPayment.indexOf(data.id) > -1}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="text-text-secondary">
                      <RouterLink aria-label="編輯第三方卡券" to={`/thirdPartyCoupon/edit/${data.id}`}>
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell className="tabular-nums text-text-secondary">{idx + 1}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell numeric>{data.type === 'PERCENT' ? `${data.handlingFee}%` : formatNumber(data.handlingFee)}</TableCell>
                  <TableCell>{data.isNoCash ? '是' : '否'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar selected={selectedPayment} onDelete={handleSeletedDelete} confirmDelete />
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
  className: {},
}

export default Results
