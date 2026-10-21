import { Edit as EditIconSlot } from 'ui/icons'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import { PaymentSymbol } from 'helper/enum'
import useFetchDeletePayment from 'hooks/useFetchDeletePayment'
import useFetchPayments from 'hooks/useFetchPayments'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

const deductions = {
  onSales: '業績',
  onSalary: '薪水',
  none: '',
}
function Results({ className, paymentList = [], ...rest }) {
  const [selectedPayment, setSelectedPayment] = useState([])
  const { deletePayment } = useFetchDeletePayment()
  const payments = useFetchPayments()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? paymentList.map(payment => payment.id) : []
    setSelectedPayment(newSelectedPayment)
  }
  const handleSelectOne = id => {
    const newSelect = [...selectedPayment], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedPayment(newSelect)
  }
  const handleSeletedDelete = () => {
    deletePayment({ ids: selectedPayment }).then(() => {
      setSelectedPayment([])
      payments.refetch()
      openSnackbar({ message: '刪除支付方式成功', variant: 'success' })
    })
  }
  return (
    <div {...rest}>
      <Card>
        <CardHeader>
          <div className="flex items-baseline gap-3">
            <CardTitle>
              所有支付方式
            </CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              共 {paymentList.length} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5 pt-4">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={
                      selectedPayment.length === paymentList.length && paymentList.length > 0
                    }
                    indeterminate={
                      selectedPayment.length > 0 && selectedPayment.length < paymentList.length
                    }
                    onChange={handleSelectAll}
                    disabled={paymentList.length === 0}
                  />
                </TableHead>
                <TableHead className="w-16">操作</TableHead>
                <TableHead numeric className="w-12">#</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>手續費</TableHead>
                <TableHead>扣項方式</TableHead>
                <TableHead>金額是否為0</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentList.map((data, idx) => (
                <TableRow key={`${data.name}-${idx}`} data-state={selectedPayment.indexOf(data.id) > -1 ? 'selected' : undefined}>
                  <TableCell className="w-12">
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      onChange={() => handleSelectOne(data.id)}
                      checked={selectedPayment.indexOf(data.id) > -1}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
                      <RouterLink
                        aria-label={`編輯 ${data.name}`}
                        to={`/payment/edit/${data.id}`}
                      >
                        <EditIconSlot fontSize="small" />
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell numeric>{idx + 1}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell numeric>
                    {formatNumber(data.fee) + (data.amountType === 'PERCENT' ? PaymentSymbol[data.amountType] : '')}
                  </TableCell>
                  <TableCell>{deductions[data.type]}</TableCell>
                  <TableCell>{data.isNoCash ? '是' : '否'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      <TableEditBar selected={selectedPayment} onDelete={handleSeletedDelete} />
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
