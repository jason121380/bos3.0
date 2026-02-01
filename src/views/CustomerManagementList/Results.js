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
import PropTypes from 'prop-types'
import { useState, useEffect, Fragment, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { gender } from 'types'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { format } from 'date-fns'
import pagenationLabel from './../../helper/pagenationLabel'
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
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '4px',
        height: '16px',
        backgroundColor: '#1A73E8',
        marginRight: '8px',
        borderRadius: '2px',
      },
    },
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
  const merchantPassword = useFetchMerchantPassword()
  const pageRef = useRef(null)

  const { deleteCustomers } = useFetchDeleteCustomer()
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? customers.map(customer => customer.id) : []
    setSelectedCustomers(newSelectedPayment)
  }
  const [clickComfirmBtn, setClickComfirmBtn] = useState(false)

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
    setClickComfirmBtn(true)
    openSnackbar({
      message: '刪除客戶中',
      variant: 'warning',
    })
    deleteCustomers({ customerIds: selectedCustomers, password: deletePwd })
      .then(() => {
        setOpenDialog(false)
        setDeletePwd('')
        setSelectedCustomers([])
        refetch()
        openSnackbar({
          message: '成功刪除客戶',
          variant: 'success',
        })
      })
      .catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
        setClickComfirmBtn(false)
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
      <Card>
        <CardHeader
          css={styles.cardHeader}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>所有客戶列表</span>
              <Typography color="textSecondary" variant="body2">
                共 {totalCount} 筆
              </Typography>
            </div>
          }
        />
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
                    <TableCell>電話</TableCell>
                    <TableCell>客戶編號</TableCell>
                    <TableCell>最近設計師</TableCell>
                    <TableCell>偏好設計師</TableCell>
                    <TableCell>上次消費日期</TableCell>
                    {isMemberShipCardActive && <TableCell>會員卡</TableCell>}
                    <TableCell>性別</TableCell>
                    <TableCell>生日</TableCell>
                    <TableCell>客戶來源</TableCell>
                  </TableRow>
                </TableHead>
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
                      {isMemberShipCardActive ? data.membershipPurchaseRecord.length > 0 ? data.membershipPurchaseRecord.map((d, index) => {
                        if (index === data.membershipPurchaseRecord.length - 1) {
                          return (
                            <Fragment key={index}>
                              <TableCell>
                                <ul>{d.membershipName}</ul>
                                <ul>效期： {d.expiryDay !== null ? format(d.expiryDay, 'yyyy/MM/dd') : "永久"}</ul>
                                <ul>備註： {d.remark}</ul>
                              </TableCell>
                            </Fragment>
                          )
                        }
                      }) : (
                        <TableCell />
                      ) : ''}
                      <TableCell>{gender[data.gender]}</TableCell>
                      <TableCell>
                        {data.birthday ? `${data.birthday.year}/${data.birthday.month}/${data.birthday.day}` : ''}
                      </TableCell>
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
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
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
          <Button color="primary" onClick={handleCloseDialog} disabled={clickComfirmBtn}>
            取消
          </Button>
          <Button
            color="primary"
            autoFocus
            data-testid="confirm"
            onClick={handeleteCustomer}
            disabled={clickComfirmBtn}
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
