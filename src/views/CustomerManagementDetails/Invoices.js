/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, CircularProgress,
  Divider, TextField, Table, TableBody, TableCell, TableHead, Collapse,
  TablePagination, TableRow, TableContainer, Typography, IconButton,
  Box, Grid, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle
} from '@mui/material'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import PropTypes from 'prop-types'
import { useState, useRef, useEffect, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    '& .MuiTypography-root': {
      whiteSpace: 'nowrap'
    },
    '& td': {
      whiteSpace: 'nowrap !important'
    }
  }),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1400,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  paymentLinePay: css({
    width: '50px',
    imageRendering: '-webkit-optimize-contrast',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))',
  }),
  marginTop: css({
    textAlign: 'center',
    marginTop: 100
  }),
  padding: {
    padding: '3px !important'
  }
}

function Invoices({
  className,
  orders,
  refetch2,
  pageSetting,
  onPageChange,
  onRowsPerPageChange,
  bonusDisplay,
  membershipDisplay,
  pagenationLabel,
  isLoading,
  ...rest
}) {
  const [selectedOrders, setSelectedOrders] = useState([])
  const [raffleDisplay, setRaffleDisplay] = useState(false)
  const { deleteOrders } = useFetchDeleteOrder()
  const [deleteOrderPwd, setDeleteOrderPwd] = useState('')
  const pageRef = useRef(null)
  const handleCancel = () => {
    setOpenDialog(true)
  }
  // 檢查是否為首次render
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pageRef.current, orders])

  const [openDialog, setOpenDialog] = useState(false)

  const handleConfirmCancel = () => {
    if (deleteOrderPwd === '0000') {
      deleteOrders(selectedOrders).then(() => {
        setOpenDialog(false)
        setDeleteOrderPwd('')
        setSelectedOrders([])
        refetch2()
        openSnackbar({
          message: '成功刪除預約',
          variant: 'success',
        })
      })
    } else {
      setOpenDialog(false)
      setDeleteOrderPwd('')
      openSnackbar({
        message: '密碼錯誤',
        variant: 'error',
      })
    }
  }
  const handleCloseDialog = () => {
    setOpenDialog(false)
  }
  const [orderExtendArr, setOrderExtendArr] = useState([])

  const handleOrderExtend = id => {
    const newSelect = [...orderExtendArr], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setOrderExtendArr(newSelect)
  }

  const renderTpName = names => {
    let returnString = ''
    const arr = names.map(d => d)
    arr.forEach((element, index) => {
      if (index !== 0) {
        returnString = returnString + ', 含 ' + element
      } else {
        returnString = '含 ' + element
      }
    })
    return returnString
  }

  useEffect(() => {
    if (orders.length === 0) return
    const display = orders.some(({ raffleCount }) => raffleCount > 0)
    setRaffleDisplay(display)
  }, [orders])

  return (
    <Fragment>
      {isLoading ? (
        <div css={styles.marginTop}><CircularProgress /></div>
      ) : orders.length === 0 ? (
        <Typography css={styles.marginTop} component="h1" variant="h3">
          無資料
        </Typography>
      ) : (
        <div {...rest} css={css([styles.root, className])}>
          <Typography color="textSecondary" gutterBottom variant="body2" data-testid="result-counter">
            共 {pageSetting.totalCount} 筆, {pageSetting.pageOffset + 1} /{' '}
            {Math.ceil(pageSetting.totalCount / pageSetting.pageLimit)}
          </Typography>
          <Card>
            <CardHeader title="消費紀錄列表" />
            <Divider />
            <CardContent css={styles.content}>
              <TableContainer style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <Table>
                  <TableHead>
                    <TableRow css={styles.stickyRow}>
                      {/* <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          color="primary"
                          indeterminate={
                            selectedOrders.length > 0 && selectedOrders.length < orders.length
                          }
                          onChange={handleSelectAll}
                          disabled={orders.length === 0}
                        />
                      </TableCell> */}
                      <TableCell>展開</TableCell>
                      <TableCell>操作</TableCell>
                      <TableCell>帳單編號/時間</TableCell>
                      <TableCell>客戶</TableCell>
                      <TableCell>設計師</TableCell>
                      <TableCell>指定/不指定</TableCell>
                      {raffleDisplay ? <TableCell>活動券</TableCell> : null}
                      <TableCell>服務消費</TableCell>
                      <TableCell>店販消費</TableCell>
                      {membershipDisplay && <TableCell>會員卡消費</TableCell>}
                      <TableCell>卡券販賣(入業績)</TableCell>
                      <TableCell>卡券販賣(不入業績)</TableCell>
                      <TableCell>卡券使用</TableCell>
                      <TableCell>扣入金</TableCell>
                      {bonusDisplay && <TableCell>點數折抵金額</TableCell>}
                      <TableCell>其他付款方式</TableCell>
                      <TableCell>現金應收</TableCell>
                      <TableCell>備註</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order, index) => {
                      return (
                        <Fragment key={index}>
                          <TableRow key={order.id} data-testid={`order-row`}>
                            <TableCell>
                              <IconButton
                                aria-label="expand row"
                                size="small"
                                css={styles.padding}
                                onClick={() => handleOrderExtend(order.id)}
                              >
                                {orderExtendArr.find(id => id === order.id) !== undefined ? (
                                  <KeyboardArrowUp />
                                ) : (
                                  <KeyboardArrowDown />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Button
                                color="primary"
                                component={RouterLink}
                                size="small"
                                to={`/order/${order.id}`}
                                variant="outlined"
                                data-testid={`order-${index}`}
                              >
                                詳情
                              </Button>
                            </TableCell>
                            <TableCell>
                              {order.orderNo}
                              <Typography variant="body2">
                                {format(new Date(order.date), 'MM/dd/yyyy')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {order.customerName}
                              <Typography variant="body2">{order.customerCellphone}</Typography>
                            </TableCell>
                            <TableCell>
                              {order.designerName} /{' '}
                              {order.designerNo ? `/${order.designerNo}` : ''}
                            </TableCell>
                            <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                            {raffleDisplay ? <TableCell>{order.raffleCount}</TableCell> : null}
                            <TableCell>
                              {Math.round(order.service)}
                              <Typography variant="body2">
                                {order.TPTName.service.length > 0 && renderTpName(order.TPTName.service)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {order.product}
                              <Typography variant="body2">
                                {order.TPTName.product.length > 0 && renderTpName(order.TPTName.product)}
                              </Typography>
                            </TableCell>
                            {membershipDisplay && (
                              <TableCell>
                                {Math.round(order.membership)}
                                <Typography variant="body2">
                                  {order.TPTName.membership.length > 0 && renderTpName(order.TPTName.membership)}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>{Math.round(order.ticketSellIntoPerformance)}</TableCell>
                            <TableCell>{order.ticketSellNotIntoPerformance}</TableCell>
                            <TableCell>{order.usedTicket}</TableCell>
                            <TableCell>{order.walletUsedForDecount}</TableCell>
                            {bonusDisplay && <TableCell>{order.bonusDecountForReport}</TableCell>}
                            <TableCell>
                              {order.otherPayWayForDecount}
                              <Typography variant="body2">{order.otherPayName}</Typography>
                            </TableCell>
                            <TableCell>{order.businessCash}</TableCell>
                            <TableCell>{order.remark}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                              <Collapse
                                in={orderExtendArr.find(id => id === order.id) !== undefined}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box sx={{ margin: 1 }}>
                                  <Grid container style={{ justifyContent: 'space-between' }}>
                                    <Grid item xs={2}>
                                      <Typography variant="button">設計師</Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                      <Typography variant="button">項目</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                      <Typography variant="button">價格</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                      <Typography variant="button">數量</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                      <Typography variant="button">互助人</Typography>
                                    </Grid>
                                  </Grid>
                                  {order.staticDetail && order.staticDetail.map((data, index) => (
                                    <Grid key={index} container style={{ justifyContent: 'space-between' }}>
                                      <Grid item xs={2}>
                                        <Typography variant="body1">
                                          {data.designerName}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={5}>
                                        <Typography variant="body1">
                                          {`${data.itemName}(${data.serviceType})`}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={1}>
                                        <Typography variant="body1">{data.serviceType === '卡券使用' ? parseInt(data.price * 100) / 100 : data.price}</Typography>
                                      </Grid>
                                      <Grid item xs={1}>
                                        <Typography variant="body1">{data.count}</Typography>
                                      </Grid>
                                      <Grid item xs={3}>
                                        {data.helperList.length > 0 &&
                                          data.helperList.map((helper, index) => (
                                            <Typography key={index} variant="body1">
                                              {`${helper.helperType}[${helper.helperName}]`}
                                            </Typography>
                                          ))}
                                      </Grid>
                                    </Grid>
                                  ))}
                                </Box>
                              </Collapse>
                            </TableCell>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} />
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} />
                          </TableRow>
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
            <CardActions css={styles.actions}>
              <TablePagination
                ref={pageRef}
                labelRowsPerPage='每頁顯示數量'
                component="div"
                count={pageSetting.totalCount}
                onPageChange={(e, newPage) => {
                  setOrderExtendArr([])
                  onPageChange(e, newPage)
                }}
                onRowsPerPageChange={onRowsPerPageChange}
                page={pageSetting.pageOffset}
                rowsPerPage={pageSetting.pageLimit}
                rowsPerPageOptions={[5, 10, 25, 50, 1000]}
              />
            </CardActions>
          </Card>
          <TableEditBar selected={selectedOrders} onCancel={handleCancel} />

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{'刪除訂單?'}</DialogTitle>
            <DialogContent style={{ overflow: 'visible' }}>
              <DialogContentText id="alert-dialog-description">
                <TextField
                  value={deleteOrderPwd}
                  label="刪除密碼"
                  onChange={event => setDeleteOrderPwd(event.target.value)}
                  inputProps={{
                    type: 'password',
                    'data-testid': 'delete-password',
                  }}
                />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                取消
              </Button>
              <Button onClick={handleConfirmCancel} color="primary" autoFocus data-testid="confirm">
                確認
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </Fragment>
  )
}

Invoices.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Invoices.defaultProps = {
  orders: [],
}

export default Invoices
