/** @jsxImportSource @emotion/react */
import {
  Button, Checkbox, Divider,
  TableBody, TableCell,
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
import { Link as RouterLink } from 'react-router-dom'
import PasswordDialog from 'components/PasswordDialog'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import ManagementTable from 'components/ManagementTable'

const styles = {
  root: {},
  filterButton: css({
    marginRight: theme.spacing(2),
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

  /**
   * 處理刪除操作的取消/確認邏輯
   */
  const handleCancel = async () => {
    setIsClick(true)
    try {
      await deleteOrders({ orderIds: selectedOrders, password })
      setSelectedOrders([])
      refetch()
      openSnackbar({
        message: ' 成功刪除預約',
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

  /**
   * 獲取所有未完成訂單的 ID
   */
  const allIds = () => (orders.filter(({ isDone }) => !isDone).map(order => order.id))

  /**
   * 處理全選邏輯
   */
  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked ? allIds() : []
    setSelectedOrders(newSelectedPayment)
  }

  /**
   * 處理單選邏輯
   */
  const handleSelectOne = id => {
    const newSelect = [...selectedOrders], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedOrders(newSelect)
  }

  /**
   * 格式化報到狀態文字
   */
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
      <ManagementTable
        title="預約管理列表"
        totalCount={pageSetting.totalCount}
        excelData={excelData}
        excelFilename="預約訂單列表.csv"
        pageLimit={pageSetting.pageLimit}
        pageOffset={pageSetting.pageOffset}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        minWidth={1300}
        tableHead={
          <>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedOrders.length === allIds().length && pageSetting.bookings.length > 0}
                color="primary"
                indeterminate={selectedOrders.length > 0 && selectedOrders.length < allIds().length}
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
          </>
        }
      >
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
      </ManagementTable>
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
