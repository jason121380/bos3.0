import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import idx from 'idx'
import PropTypes from 'prop-types'
import { useMemo, useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import { Download } from 'lucide-react'
import PasswordDialog from 'components/PasswordDialog'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 匯出遮罩格式與帳單列表、掛單列表相同（姓名 2 字「王*」、3 字「陳*姐」、4 字以上留前 2 字；手機留前 4 後 3）
const maskName = name =>
  name.length < 3
    ? `${name.substring(0, 1)}*`
    : name.length < 4
      ? `${name.substring(0, 1)}*${name.substring(2, 3)}`
      : `${name.substring(0, 2)}*${name.substring(2, 5)}`
const maskCellphone = cellphone => `${cellphone.substring(0, 4)}***${cellphone.substring(7, 10)}`

function Results({
  orders,
  pageSetting,
  refetch,
  checkInDisplay,
  bookingCusCheck,
  delOrderPassUsing,
  isCustomerDataMarked,
  ...rest
}) {
  const { deleteOrders } = useFetchDeleteOrder()
  const [selectedOrders, setSelectedOrders] = useState([])
  // 勾選狀態查詢用 Set（每列查兩次，避免 indexOf 逐筆掃描）；只換查詢方式，selectedOrders 的結構與 handler 不變
  const selectedOrderSet = useMemo(() => new Set(selectedOrders), [selectedOrders])
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
        預約日期及時間: `#${order.no}(${format(new Date(order.date), 'yyyy/MM/dd HH:mm:ss')})`,
        客戶資訊: idx(order, _ => _.customer.isAlive)
          ? isCustomerDataMarked
            ? `${maskName(order.customer.name || '')}(${maskCellphone(order.customer.cellphone || '')})`
            : `${idx(order, _ => _.customer.name)}(${idx(order, _ => _.customer.cellphone)})`
          : '客資已刪除',
        '指定/不指定': order.isDesignate ? '指定' : '不指定',
        設計師: order.designer ? order.designer.name ? idx(
          order,
          _ => _.designer.name + (_.designer.designerNo ? ' / ' + _.designer.designerNo : '')
        ) : '無設計師' : '不指定設計師',
        服務類別:
          idx(order, _ => _.serviceCategory.name) !== null
            ? idx(order, _ => _.serviceCategory.name)
            : '',
        來源: order.source || '',
        訂單狀態: order.status,
      }
      if (checkInDisplay) {
        data['報到狀態'] = checkinStatus(order.isCheckin)
      }
      excelData.push(data)

    })
    setExcelData(excelData)
  }, [orders, checkInDisplay, isCustomerDataMarked])


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
                <TableRow key={order.id} data-state={selectedOrderSet.has(order.id) ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      aria-label="選取此筆預約"
                      checked={selectedOrderSet.has(order.id)}
                      onChange={() => handleSelectOne(order.id)}
                      disabled={order.isDone}
                    />
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="secondary">
                      <RouterLink
                        to={`/order/${order.isDone ? order.createdOrderId : order.id}`}
                      >
                        {order.isDone ? '查看帳單' : <>&emsp;修改&emsp;</>}
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
                      {format(new Date(order.date), 'yyyy/MM/dd')}
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
  isCustomerDataMarked: PropTypes.bool,
}

Results.defaultProps = {
  orders: [],
  // 沒傳時一律遮罩（個資寧可多遮）
  isCustomerDataMarked: true,
}

export default Results
