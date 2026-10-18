/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material'
import { Edit as EditIconSlot } from 'ui/icons'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import { PaymentSymbol } from 'helper/enum'
import useFetchDeletePayment from 'hooks/useFetchDeletePayment'
import useFetchPayments from 'hooks/useFetchPayments'
import PropTypes from 'prop-types'
import { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
  }),
  tableHead: css({
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      color: 'rgb(var(--text))',
      fontWeight: 'bold',
      borderBottom: '1px solid rgb(var(--border))',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid rgb(var(--border))',
      fontSize: '14px !important',
      color: 'rgb(var(--text))',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  }),
  actionButton: css({
    padding: '4px !important',
    color: 'rgb(var(--text-tertiary)) !important',
    '&:hover': {
      color: 'rgb(var(--accent)) !important',
      backgroundColor: 'rgba(26, 115, 232, 0.04) !important',
    }
  }),
}

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
    <div {...rest} css={css([styles.root, className])}>
      <Card css={styles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                所有支付方式
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {paymentList.length} 筆
              </Typography>
            </div>
          }
        />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table size="small">
                <TableHead css={styles.tableHead}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedPayment.length === paymentList.length && paymentList.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedPayment.length > 0 && selectedPayment.length < paymentList.length
                        }
                        onChange={handleSelectAll}
                        disabled={paymentList.length === 0}
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>#</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>手續費</TableCell>
                    <TableCell>扣項方式</TableCell>
                    <TableCell>金額是否為0</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentList.map((data, idx) => (
                    <TableRow key={`${data.name}-${idx}`} css={styles.tableRow}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selectedPayment.indexOf(data.id) > -1}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          component={RouterLink}
                          css={styles.actionButton}
                          to={`/payment/edit/${data.id}`}
                          size="small"
                        >
                          <EditIconSlot fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>
                        {(data.amountType === 'AMOUNT' ? PaymentSymbol[data.amountType] : '') +
                          data.fee +
                          (data.amountType === 'PERCENT' ? PaymentSymbol[data.amountType] : '')}
                      </TableCell>
                      <TableCell>{deductions[data.type]}</TableCell>
                      <TableCell>{data.isNoCash ? '是' : '否'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
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
