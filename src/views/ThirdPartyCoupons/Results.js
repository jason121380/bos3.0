/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Checkbox, Divider, Table,
  TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
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
      <Typography color="textSecondary" gutterBottom variant="body2">
        {thirdPartyCouponList.length} 筆資料
      </Typography>
      <Card>
        <CardHeader title="所有第三方卡券" />
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
                    <TableRow hover key={`${data.id}-${idx}`}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          onChange={() => handleSelectOne(data.id)}
                          checked={selectedPayment.indexOf(data.id) > -1}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/thirdPartyCoupon/edit/${data.id}`}
                          variant="outlined"
                        >
                          編輯
                        </Button>
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
