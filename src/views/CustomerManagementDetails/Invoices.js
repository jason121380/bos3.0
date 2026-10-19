/** @jsxImportSource @emotion/react */
// 分頁使用 ui/table TablePagination（pagenationLabel 找不到 MUI class 即不動作，ui 版自帶中文筆數文字）
import { ChevronDown, ChevronUp } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteOrder from 'hooks/useFetchDeleteOrder'
import PropTypes from 'prop-types'
import { useState, useRef, useEffect, Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Field, Input } from 'ui/input'
import { Skeleton } from 'ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

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

  const isExtended = id => orderExtendArr.find(d => d === id) !== undefined
  return (
    <Fragment>
      {isLoading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState title="無資料" />
        </Card>
      ) : (
        <div {...rest} css={className} className="[&_td]:!whitespace-nowrap">
          <p className="mb-2 text-label tabular-nums text-text-secondary" data-testid="result-counter">
            共 {pageSetting.totalCount} 筆, {pageSetting.pageOffset + 1} /{' '}
            {Math.ceil(pageSetting.totalCount / pageSetting.pageLimit)}
          </p>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>消費紀錄列表</CardTitle>
            </CardHeader>
            <div className="px-5">
              <Table wrapperClassName="max-h-[calc(100vh-300px)] overflow-auto">
                <TableHeader className="sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent">
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
                    <TableHead>展開</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>帳單編號/時間</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead>設計師</TableHead>
                    <TableHead>指定/不指定</TableHead>
                    {raffleDisplay ? <TableHead numeric>活動券</TableHead> : null}
                    <TableHead numeric>服務消費</TableHead>
                    <TableHead numeric>店販消費</TableHead>
                    {membershipDisplay && <TableHead numeric>會員卡消費</TableHead>}
                    <TableHead numeric>卡券販賣(入業績)</TableHead>
                    <TableHead numeric>卡券販賣(不入業績)</TableHead>
                    <TableHead numeric>卡券使用</TableHead>
                    <TableHead numeric>扣入金</TableHead>
                    {bonusDisplay && <TableHead numeric>點數折抵金額</TableHead>}
                    <TableHead numeric>其他付款方式</TableHead>
                    <TableHead numeric>現金應收</TableHead>
                    <TableHead>備註</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => {
                    return (
                      <Fragment key={index}>
                        <TableRow key={order.id} data-testid={`order-row`}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-text-secondary"
                              aria-label={isExtended(order.id) ? '收合明細' : '展開明細'}
                              aria-expanded={isExtended(order.id)}
                              onClick={() => handleOrderExtend(order.id)}
                            >
                              {orderExtendArr.find(id => id === order.id) !== undefined ? (
                                <ChevronUp strokeWidth={1.75} />
                              ) : (
                                <ChevronDown strokeWidth={1.75} />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="secondary">
                              <RouterLink
                                to={`/order/${order.id}`}
                                data-testid={`order-${index}`}
                              >
                                詳情
                              </RouterLink>
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium tabular-nums">{order.orderNo}</div>
                            <div className="text-caption tabular-nums text-text-secondary">
                              {format(new Date(order.date), 'MM/dd/yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.customerName}
                            <div className="text-caption tabular-nums text-text-secondary">{order.customerCellphone}</div>
                          </TableCell>
                          <TableCell>
                            {order.designerName} /{' '}
                            {order.designerNo ? `/${order.designerNo}` : ''}
                          </TableCell>
                          <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
                          {raffleDisplay ? <TableCell numeric>{order.raffleCount}</TableCell> : null}
                          <TableCell numeric>
                            {formatNumber(Math.round(order.service))}
                            <div className="text-caption text-text-secondary">
                              {order.TPTName.service.length > 0 && renderTpName(order.TPTName.service)}
                            </div>
                          </TableCell>
                          <TableCell numeric>
                            {formatNumber(order.product)}
                            <div className="text-caption text-text-secondary">
                              {order.TPTName.product.length > 0 && renderTpName(order.TPTName.product)}
                            </div>
                          </TableCell>
                          {membershipDisplay && (
                            <TableCell numeric>
                              {formatNumber(Math.round(order.membership))}
                              <div className="text-caption text-text-secondary">
                                {order.TPTName.membership.length > 0 && renderTpName(order.TPTName.membership)}
                              </div>
                            </TableCell>
                          )}
                          <TableCell numeric>{formatNumber(Math.round(order.ticketSellIntoPerformance))}</TableCell>
                          <TableCell numeric>{formatNumber(order.ticketSellNotIntoPerformance)}</TableCell>
                          <TableCell numeric>{formatNumber(order.usedTicket)}</TableCell>
                          <TableCell numeric>{formatNumber(order.walletUsedForDecount)}</TableCell>
                          {bonusDisplay && <TableCell numeric>{formatNumber(order.bonusDecountForReport)}</TableCell>}
                          <TableCell numeric>
                            {formatNumber(order.otherPayWayForDecount)}
                            <div className="text-caption text-text-secondary">{order.otherPayName}</div>
                          </TableCell>
                          <TableCell numeric className="font-medium">{formatNumber(order.businessCash)}</TableCell>
                          <TableCell>{order.remark}</TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="h-auto py-0" colSpan={10}>
                            {orderExtendArr.find(id => id === order.id) !== undefined && (
                              <div className="my-2 border-0 border-l-4 border-solid border-accent bg-background px-4 py-3">
                                <div className="flex justify-between gap-3 border-0 border-b border-solid border-border pb-1 text-label text-text">
                                  <div className="w-2/12">設計師</div>
                                  <div className="w-5/12">項目</div>
                                  <div className="w-1/12">價格</div>
                                  <div className="w-1/12">數量</div>
                                  <div className="w-3/12">互助人</div>
                                </div>
                                {order.staticDetail && order.staticDetail.map((data, index) => (
                                  <div key={index} className="flex justify-between gap-3 py-1 text-body text-text">
                                    <div className="w-2/12">
                                      {data.designerName}
                                    </div>
                                    <div className="w-5/12">
                                      {`${data.itemName}(${data.serviceType})`}
                                    </div>
                                    <div className="w-1/12 tabular-nums">{data.serviceType === '卡券使用' ? parseInt(data.price * 100) / 100 : data.price}</div>
                                    <div className="w-1/12 tabular-nums">{data.count}</div>
                                    <div className="w-3/12">
                                      {data.helperList.length > 0 &&
                                        data.helperList.map((helper, index) => (
                                          <div key={index}>
                                            {`${helper.helperType}[${helper.helperName}]`}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="h-auto py-0" colSpan={6} />
                          <TableCell className="h-auto py-0" colSpan={6} />
                        </TableRow>
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
                <div className="flex justify-end px-3 pb-2">
              <TablePagination
                ref={pageRef}
                labelRowsPerPage='每頁顯示數量'
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
            </div>
          </Card>
          <TableEditBar selected={selectedOrders} onCancel={handleCancel} />

          <Dialog
            open={openDialog}
            onOpenChange={o => !o && handleCloseDialog()}
          >
            <DialogContent size="sm" aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
              <DialogHeader>
                <DialogTitle id="alert-dialog-title">{'刪除訂單?'}</DialogTitle>
                <DialogDescription id="alert-dialog-description">刪除後訂單將無法復原，請輸入刪除密碼確認。</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <Field label="刪除密碼" htmlFor="delete-order-password">
                  <Input
                    id="delete-order-password"
                    type="password"
                    value={deleteOrderPwd}
                    onChange={event => setDeleteOrderPwd(event.target.value)}
                    data-testid="delete-password"
                  />
                </Field>
              </DialogBody>
              <DialogFooter>
                <Button variant="secondary" onClick={handleCloseDialog}>
                  取消
                </Button>
                <Button variant="danger" onClick={handleConfirmCancel} autoFocus data-testid="confirm">
                  確認
                </Button>
              </DialogFooter>
            </DialogContent>
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
