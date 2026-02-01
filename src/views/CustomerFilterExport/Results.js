/** @jsxImportSource @emotion/react */
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
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
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { gender } from 'types'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import pagenationLabel from './../../helper/pagenationLabel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: '0px !important',
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
    background: '#757575'
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  unWelcome: css({
    '& td': {
      color: 'red !important',
      '& a.MuiTypography-root': {
        color: 'red !important'
      }
    }
  })
}

function Results({
  className,
  customers,
  pageLimit,
  pageOffset,
  refetch,
  totalCount,
  onPageChange,
  ...rest
}) {
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [deletePwd, setDeletePwd] = useState('')
  const [deleteCustomerIsUsing, setDeleteCustomerIsUsing] = useState(false)
  const merchantPassword = useFetchMerchantPassword()
  const pageRef = useRef(null)

  const { deleteCustomers } = useFetchDeleteCustomer()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? customers.map(customer => customer.id) : []
    setSelectedCustomers(newSelectedPayment)
  }

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pageRef.current, customers])

  useEffect(() => {
    if (!merchantPassword.loading) {
      const deleteCustomerIsUsing = idx(
        merchantPassword,
        _ => _.data.merchantPassword.deleteCustomer.isUsing
      )
      setDeleteCustomerIsUsing(deleteCustomerIsUsing)
    }
  }, [merchantPassword.loading])

  const handleSelectOne = id => {
    const newSelect = [...selectedCustomers], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedCustomers(newSelect)
  }

  const handleOnChangePage = (_event, nextPage) => {
    onPageChange({
      value: nextPage,
      key: 'pageOffset',
    })
    refetch()
  }

  const handleOnChangeRowsPerPage = event => {
    onPageChange({
      value: event.target.value,
      key: 'pageLimit',
    })
    refetch()
  }

  const handeleteCustomer = () => {
    deleteCustomers({ customerIds: selectedCustomers, password: deletePwd }).then(() => {
      setOpenDialog(false)
      setDeletePwd('')
      setSelectedCustomers([])
      refetch()
      openSnackbar({
        message: '成功刪除客戶',
        variant: 'success',
      })
    })
  }

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedCustomers([])
    setDeletePwd('')
  }
  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        {customers.length} 筆資料, {pageOffset + 1}/{Math.ceil(customers.length / pageLimit)}
      </Typography>
      <Card>
        <CardHeader title="所有客戶列表" />
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
                          selectedCustomers.length === customers.length && customers.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedCustomers.length > 0 &&
                          selectedCustomers.length < customers.length
                        }
                        onChange={handleSelectAll}
                        disabled={customers.length === 0}
                      />
                    </TableCell>
                    <TableCell>詳細資料</TableCell>
                    <TableCell>姓名</TableCell>
                    <TableCell>最近設計師</TableCell>
                    <TableCell>偏好設計師</TableCell>
                    <TableCell>上次消費日期</TableCell>
                    <TableCell>性別</TableCell>
                    <TableCell>生日</TableCell>
                    <TableCell>電話</TableCell>
                    <TableCell>客戶來源</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map(data => (
                    <TableRow
                      css={css([data.isUnwelcome ? styles.unWelcome : {}])}
                      hover
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
                          to={`/management/customers/${data.id}/general?backto=customer-filter`}
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
                          <div>
                            <Link
                              color="inherit"
                              component={RouterLink}
                              underline='none'
                              to={`/management/customers/${data.id}/general?backto=customer-filter`}
                              variant="h6"
                            >
                              {data.name}
                            </Link>
                            <Typography variant="body2" component='div' style={{ fontSize: '14px' }}>
                              {data.no ? data.no : ''}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{idx(data, _ => _.latestDesigner.name)}</TableCell>
                      <TableCell>{idx(data, _ => _.preferDesigner.name)}</TableCell>
                      <TableCell>
                        {data.lastTime ? format(data.lastTime, 'yyyy/MM/dd') : ''}
                      </TableCell>
                      <TableCell>{gender[data.gender]}</TableCell>
                      <TableCell>
                        {data.birthday ? `${data.birthday.year}/${data.birthday.month}/${data.birthday.day}` : ''}
                      </TableCell>
                      <TableCell>{data.cellphone}</TableCell>
                      <TableCell>{data.source}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={pageOffset}
            rowsPerPage={pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 500, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar
        selected={selectedCustomers}
        onDeleteCustomer={deleteCustomerIsUsing ? handleOpenDialog : handeleteCustomer}
      />
      <Dialog
        open={openDialog}
        // onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'刪除客人'}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={deletePwd}
              label="刪除密碼"
              onChange={event => setDeletePwd(event.target.value)}
              inputProps={{
                type: 'password',
                'data-testid': 'delete-password',
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCloseDialog}>
            取消
          </Button>
          <Button color="primary" autoFocus data-testid="confirm" onClick={handeleteCustomer}>
            確認
          </Button>
        </DialogActions>
      </Dialog>
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
