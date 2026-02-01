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
} from '@mui/material'
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
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 700,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
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
      <Typography color="textSecondary" gutterBottom variant="body2">
        {paymentList.length} 筆資料
      </Typography>
      <Card>
        <CardHeader title="所有支付方式" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
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
                    <TableRow hover key={`${data.name}-${idx}`} data-testid="table-row">
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selectedPayment.indexOf(data.id) > -1}
                          inputProps={{
                            'data-testid': `payment-selector-${idx}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/payment/edit/${data.id}`}
                          variant="outlined"
                          data-testid={`payment-edit-${idx}`}
                        >
                          編輯
                        </Button>
                      </TableCell>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell data-testid={`payment-name-${data.name}`}>{data.name}</TableCell>
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
