/** @jsxImportSource @emotion/react */
import {
  Avatar,
  Button,
  Checkbox,
  Link,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteCustomer from 'hooks/useFetchDeleteCustomer'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { gender } from 'types'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import ManagementTable from 'components/ManagementTable'

const styles = {
  root: css({}),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
    background: '#757575'
  }),
  unWelcome: css({
    '& td': {
      color: 'red !important',
      '& a.MuiTypography-root': {
        color: 'red !important'
      }
    }
  }),
  tableRow: css({
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
  }),
}

function Results({
  className = {},
  customers,
  pageLimit,
  pageOffset,
  refetch,
  totalCount,
  onPageChange,
  isMemberShipCardActive,
  ...rest
}) {
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [deletePwd, setDeletePwd] = useState('')
  const [deleteCustomerIsUsing, setDeleteCustomerIsUsing] = useState(false)
  const [clickComfirmBtn, setClickComfirmBtn] = useState(false)

  const merchantPassword = useFetchMerchantPassword()
  const { deleteCustomers } = useFetchDeleteCustomer()

  useEffect(() => {
    if (!merchantPassword.loading) {
      const isUsing = idx(merchantPassword, _ => _.data.merchantPassword.deleteCustomer.isUsing)
      setDeleteCustomerIsUsing(isUsing)
    }
  }, [merchantPassword.loading])

  const handleSelectAll = event => {
    const newSelected = event.target.checked ? customers.map(customer => customer.id) : []
    setSelectedCustomers(newSelected)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedCustomers], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCustomers(newSelect)
  }

  const handlePageChangeInternal = (_event, nextPage) => {
    onPageChange({ value: nextPage, key: 'pageOffset' })
    refetch()
  }

  const handleRowsPerPageChangeInternal = event => {
    onPageChange({ value: event.target.value, key: 'pageLimit' })
    refetch()
  }

  const handeleteCustomer = () => {
    setClickComfirmBtn(true)
    openSnackbar({ message: '刪除客戶中', variant: 'warning' })
    deleteCustomers({ customerIds: selectedCustomers, password: deletePwd })
      .then(() => {
        setOpenDialog(false)
        setDeletePwd('')
        setSelectedCustomers([])
        refetch()
        openSnackbar({ message: '成功刪除客戶', variant: 'success' })
      })
      .catch(error => {
        openSnackbar({ message: error.message, variant: 'error' })
        setClickComfirmBtn(false)
      })
  }

  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedCustomers([])
    setDeletePwd('')
  }

  return (
    <div {...rest} css={css([styles.root, className])}>
      <ManagementTable
        title="所有客戶列表"
        totalCount={totalCount}
        pageLimit={pageLimit}
        pageOffset={pageOffset}
        onPageChange={handlePageChangeInternal}
        onRowsPerPageChange={handleRowsPerPageChangeInternal}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        minWidth={1100}
        tableHead={
          <>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedCustomers.length === customers.length && customers.length > 0}
                color="primary"
                indeterminate={selectedCustomers.length > 0 && selectedCustomers.length < customers.length}
                onChange={handleSelectAll}
                disabled={customers.length === 0}
              />
            </TableCell>
            <TableCell>詳細資料</TableCell>
            <TableCell>姓名</TableCell>
            <TableCell>電話</TableCell>
            <TableCell>客戶編號</TableCell>
            <TableCell>最近設計師</TableCell>
            <TableCell>偏好設計師</TableCell>
            <TableCell>上次消費日期</TableCell>
            {isMemberShipCardActive && <TableCell>會員卡</TableCell>}
            <TableCell>性別</TableCell>
            <TableCell>生日</TableCell>
            <TableCell>客戶來源</TableCell>
          </>
        }
      >
        <TableBody>
          {customers.map(data => (
            <TableRow
              css={css([styles.tableRow, data.isUnwelcome ? styles.unWelcome : {}])}
              key={`customer-${data.id}`}
              selected={selectedCustomers.indexOf(data.id) > -1}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedCustomers.indexOf(data.id) > -1}
                  onChange={() => handleSelectOne(data.id)}
                />
              </TableCell>
              <TableCell>
                <Button
                  color="primary"
                  component={RouterLink}
                  size="small"
                  to={`/management/customers/${data.id}`}
                  variant="outlined"
                >
                  查看
                </Button>
              </TableCell>
              <TableCell>
                <div css={styles.nameCell}>
                  <Avatar css={styles.avatar}>
                    {data.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Link
                    color="inherit"
                    underline='none'
                    component={RouterLink}
                    to={`/management/customers/${data.id}`}
                    variant="h6"
                  >
                    {data.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell>{data.cellphone}</TableCell>
              <TableCell>{data.no ? data.no : ''}</TableCell>
              <TableCell>{idx(data, _ => _.latestDesigner.name)}</TableCell>
              <TableCell>{idx(data, _ => _.preferDesigner.name)}</TableCell>
              <TableCell>
                {data.lastTime ? format(data.lastTime, 'yyyy/MM/dd') : ''}
              </TableCell>
              {isMemberShipCardActive && (
                <TableCell>
                  {data.membershipPurchaseRecord && data.membershipPurchaseRecord.length > 0 && (
                    <div key={data.membershipPurchaseRecord.length - 1}>
                      <div>{data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].membershipName}</div>
                      <div>效期： {data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].expiryDay ? format(data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].expiryDay, 'yyyy/MM/dd') : "永久"}</div>
                      {data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].remark && <div>備註： {data.membershipPurchaseRecord[data.membershipPurchaseRecord.length - 1].remark}</div>}
                    </div>
                  )}
                </TableCell>
              )}
              <TableCell>{gender[data.gender]}</TableCell>
              <TableCell>
                {data.birthday ? `${data.birthday.year}/${data.birthday.month}/${data.birthday.day}` : ''}
              </TableCell>
              <TableCell>{data.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ManagementTable>

      <TableEditBar
        selected={selectedCustomers}
        onDeleteCustomer={deleteCustomerIsUsing ? handleOpenDialog : handeleteCustomer}
      />

      <Dialog open={openDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{'刪除客人'}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={deletePwd}
              label="刪除密碼"
              fullWidth
              onChange={event => setDeletePwd(event.target.value)}
              inputProps={{ type: 'password', 'data-testid': 'delete-password' }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCloseDialog} disabled={clickComfirmBtn}>取消</Button>
          <Button color="primary" autoFocus onClick={handeleteCustomer} disabled={clickComfirmBtn}>確認</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
  pageLimit: PropTypes.number,
  pageOffset: PropTypes.number,
  refetch: PropTypes.func,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  isMemberShipCardActive: PropTypes.bool,
}

Results.defaultProps = {
  customers: [],
}

export default Results
