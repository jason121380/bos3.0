/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, CardHeader, Checkbox, Divider,
  Table, TableBody, TableCell, TableHead, TablePagination,
  TableRow, Typography
} from '@mui/material'
import red from '@mui/material/colors/red'
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useRef, useState, useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import pagenationLabel from './../../helper/pagenationLabel'
import PasswordDialog from 'components/PasswordDialog'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: {},
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1300,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  deleteButton: css({
    borderColor: red[500],
    color: red[500],
    '&:hover': {
      borderColor: red[500],
      color: red[500],
      backgroundColor: 'rgba(244, 67, 54, 0.08)',
    },
    marginRight: theme.spacing(1),
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
  orders,
  pageSetting,
  startDate,
  endDate,
  onPageChange,
  onRowsPerPageChange,
  refetch,
  checkInDisplay,
  bookingCusCheck,
  delOrderPassUsing,
  ...rest
}) {
  const pageRef = useRef(null)
  const pageRef2 = useRef(null)
  const { deleteOrders } = useFetchDeleteOrder()
  const [selectedOrders, setSelectedOrders] = useState([])
  const [excelData, setExcelData] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isClick, setIsClick] = useState(false)

  const handleCancel = async () => {
    setIsClick(true)
    try {
      await deleteOrders({ orderIds: selectedOrders, password })
      setSelectedOrders([])
      refetch()
      openSnackbar({
        message: '成功刪除預約',
        variant: 'success',
      })
      setDialogOpen(false)
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
    } finally {
      setIsClick(false)
    }
  }

  const allIds = () => (orders.filter(({ isDone }) => !isDone).map(order => order.id))

  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? allIds() : []
    setSelectedOrders(newSelectedPayment)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedOrders], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }

  const checkinStatus = status => {
    if (status === null) return ''
    return status ? '報到成功' : '未報到'
  }

  const openPasswordModal = () => {
    setDialogOpen(true)
  }

  const closePasswordModal = () => {
    setDialogOpen(false)
    setPassword('')
  }

  const handleSetPassword = value => {
    setPassword(value)
  }

  useEffect(() => {
    const excelData = []
    orders.forEach(order => {
      const data = {
        預約日期及時間: `#${order.no}(${format(new Date(order.date), 'MM/dd/yyyy HH:mm:ss')})`,
        客戶資訊: idx(order, _ => _.customer.isAlive) ? `${idx(order, _ => _.customer.name)}(${idx(order, _ => _.customer.cellphone)})` : '客資已刪除',
        '指定/不指定': order.isDesignate ? '指定' : '不指定',
        設計師: order.designer ? order.designer.name ? idx(
          order,
          _ => _.designer.name + (_.designer.designerNo ? ' / ' + _.designer.designerNo : '')
        ) : '無設計師' : '不指定設計師',
        服務類別:
          idx(order, _ => _.serviceCategory.name) !== null
            ? idx(order, _ => _.serviceCategory.name)
            : '',
        來源: order.reference !== null ? order.reference : '',
        訂單狀態: order.status,
      }
      if (checkInDisplay) {
        data['報到狀態'] = checkinStatus(order.isCheckin)
      }
      excelData.push(data)

    })
    setExcelData(excelData)
  }, [orders, checkInDisplay])

  useEffect(() => {
    if (pageRef.current && pageRef2.current) {
      pagenationLabel(pageRef.current)
      pagenationLabel(pageRef2.current)
    }
  }, [orders, pageRef.current, pageRef2.current])

  return (
    <div {...rest} css={styles.root}>
      <Card>
        <CardHeader
          css={styles.cardHeader}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CSVLink data={excelData} filename="預約訂單列表.csv">
                <Button variant="contained" color="primary" size="small">
                  報表匯出
                </Button>
              </CSVLink>
              <TablePagination
                style={{ width: 'fit-content', border: 'none' }}
                ref={pageRef2}
                labelRowsPerPage='每頁顯示數量'
                component="div"
                count={pageSetting.totalCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={pageSetting.pageOffset}
                rowsPerPage={pageSetting.pageLimit}
                rowsPerPageOptions={[5, 10, 25, 50, 1000]}
              />
            </div>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>預約管理列表</span>
              <Typography color="textSecondary" variant="body2">
                共 {pageSetting.totalCount} 筆
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
                          selectedOrders.length === allIds().length &&
                          pageSetting.bookings.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedOrders.length > 0 &&
                          selectedOrders.length < allIds().length
                        }
                        onChange={handleSelectAll}
                        disabled={pageSetting.bookings.length === 0}
                      />
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell>訂單狀態</TableCell>
                    {checkInDisplay && <TableCell>報到狀態</TableCell>}
                    <TableCell>預約日期及時間</TableCell>
                    <TableCell>客戶資訊</TableCell>
                    <TableCell>指定/不指定</TableCell>
                    {bookingCusCheck && <TableCell>未來預訂(待確認)</TableCell>}
                    <TableCell>設計師</TableCell>
                    <TableCell>來源</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} css={styles.tableRow}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selectedOrders.indexOf(order.id) > -1}
                          onChange={() => handleSelectOne(order.id)}
                          disabled={order.isDone}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          component={RouterLink}
                          size="small"
                          to={`/order/${order.isDone ? order.createdOrderId : order.id}`}
                          variant="outlined"
                        >
                          {order.isDone ? '查看訂單' : <>&emsp;修改&emsp;</>}
                        </Button>
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                      {checkInDisplay && <TableCell>{checkinStatus(order.isCheckin)}</TableCell>}
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(order.date), 'HH:mm')}
                        </Typography>
                        <Typography variant="body2">
                          {format(new Date(order.date), 'yyyy年MM月dd日')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {
                          idx(order, _ => _.customer.isAlive) ? (
                            <>
                              {idx(order, _ => _.customer.name)}
                              <Typography variant="body2">
                                {idx(order, _ => _.customer.cellphone)}
                              </Typography>
                            </>
                          ) : '客資已刪除'
                        }
                      </TableCell>
                      <TableCell>{order.isDesignate ? '指定' : '不指定'}</TableCell>
                      {bookingCusCheck && <TableCell>{order.isCusCheckRequired && '是'}</TableCell>}
                      <TableCell>
                        {order.designer ? order.designer.name ? idx(
                          order,
                          _ =>
                            _.designer.name +
                            (_.designer.designerNo ? ' / ' + _.designer.designerNo : '')
                        ) : '無設計師' : '不指定設計師'}
                      </TableCell>
                      <TableCell>{order.source}</TableCell>
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
            count={pageSetting.totalCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            page={pageSetting.pageOffset}
            rowsPerPage={pageSetting.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar selected={selectedOrders} onCancel={delOrderPassUsing ? openPasswordModal : handleCancel} />
      <PasswordDialog
        open={dialogOpen}
        title='刪除預約'
        inputLabel='刪除預約密碼'
        handleOnCancel={closePasswordModal}
        handleOnConfirm={handleCancel}
        isLoading={isClick}
        inputOnChange={handleSetPassword}
      />
    </div>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
