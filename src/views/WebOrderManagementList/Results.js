import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useRef, useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import { Download } from 'lucide-react'
import PasswordDialog from 'components/PasswordDialog'
// 舊版缺少此 import（下方 useEffect 內呼叫）；該段只在 pageRef／pageRef2 有值時執行，而兩者從未掛到任何元素上，補上 import 僅為消除 no-undef，不改變行為
import pagenationLabel from './../../helper/pagenationLabel'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

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
    // 舊版 ManagementTable（hidePagination）改為直接使用 ui/card＋ui/table；標題、筆數、CSV 匯出與欄位相同
    <div {...rest}>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="預約訂單列表.csv">
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>預約管理列表</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">
              共 {pageSetting.totalCount} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="min-w-[1300px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    checked={selectedOrders.length === allIds().length && pageSetting.bookings.length > 0}
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < allIds().length}
                    onChange={handleSelectAll}
                    disabled={pageSetting.bookings.length === 0}
                  />
                </TableHead>
                <TableHead>操作</TableHead>
                <TableHead>訂單狀態</TableHead>
                {checkInDisplay && <TableHead>報到狀態</TableHead>}
                <TableHead>預約日期及時間</TableHead>
                <TableHead>客戶資訊</TableHead>
                <TableHead>指定/不指定</TableHead>
                {bookingCusCheck && <TableHead>未來預訂(待確認)</TableHead>}
                <TableHead>設計師</TableHead>
                <TableHead>來源</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id} data-state={selectedOrders.indexOf(order.id) > -1 ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label="選取此筆預約"
                      checked={selectedOrders.indexOf(order.id) > -1}
                      onChange={() => handleSelectOne(order.id)}
                      disabled={order.isDone}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="secondary">
                      <RouterLink
                        to={`/order/${order.isDone ? order.createdOrderId : order.id}`}
                      >
                        {order.isDone ? '查看訂單' : <>&emsp;修改&emsp;</>}
                      </RouterLink>
                    </Button>
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  {checkInDisplay && <TableCell>{checkinStatus(order.isCheckin)}</TableCell>}
                  <TableCell className="tabular-nums">
                    <div>
                      {format(new Date(order.date), 'HH:mm')}
                    </div>
                    <div className="text-caption text-text-secondary">
                      {format(new Date(order.date), 'yyyy年MM月dd日')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {
                      idx(order, _ => _.customer.isAlive) ? (
                        <>
                          {idx(order, _ => _.customer.name)}
                          <div className="text-caption tabular-nums text-text-secondary">
                            {idx(order, _ => _.customer.cellphone)}
                          </div>
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
                  <TableCell className="text-text-secondary">{order.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
