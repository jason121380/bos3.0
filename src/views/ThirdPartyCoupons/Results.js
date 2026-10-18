/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Checkbox, Divider, Table,
  TableBody, TableCell, TableHead, TableRow, Typography, IconButton,
} from '@mui/material'
import EditIconSlot from '@mui/icons-material/Edit';
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteThirdPartyCoupon from 'hooks/useFetchDeleteThirdPartTicket'
import PropTypes from 'prop-types'
import { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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

function Results({ className, thirdPartyCouponList = [], thirdPartyCouponsRefetch, ...rest }) {
  const [selectedPayment, setSelectedPayment] = useState([])
  const { deleteThirdPartyCoupon } = useFetchDeleteThirdPartyCoupon()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? thirdPartyCouponList.map(d => d.id) : []
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
    if (selectedPayment.length > 0) {
      selectedPayment.map(d => {
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
    <div {...rest} css={css([styles.root, className])}>
      <Card css={styles.card}>
        <CardHeader
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                所有第三方卡券
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {thirdPartyCouponList.length} 筆
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
                          selectedPayment.length === thirdPartyCouponList.length &&
                          thirdPartyCouponList.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedPayment.length > 0 &&
                          selectedPayment.length < thirdPartyCouponList.length
                        }
                        onChange={handleSelectAll}
                        disabled={thirdPartyCouponList.length === 0}
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>#</TableCell>
                    <TableCell>名稱</TableCell>
                    <TableCell>手續費</TableCell>
                    <TableCell>金額是否為0</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {thirdPartyCouponList.map((data, idx) => (
                    <TableRow key={`${data.id}-${idx}`} css={styles.tableRow}>
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
                          to={`/thirdPartyCoupon/edit/${data.id}`}
                          size="small"
                        >
                          <EditIconSlot fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>
                        {data.type === 'PERCENT' ? `${data.handlingFee}%` : `$${data.handlingFee}`}
                      </TableCell>
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
  className: {}
}

export default Results
