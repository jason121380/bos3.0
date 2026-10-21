import { format } from 'date-fns'
import React, { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ChevronDown, ChevronUp, Eye, LoaderCircle, Printer } from 'lucide-react'
import truncateDecimal from 'helper/truncateDecimal'
import { Badge } from 'ui/badge'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { formatMoney, formatNumber } from 'ui/format'
import { TableCell, TableRow } from 'ui/table'
import { cn } from 'ui/utils'
import { STICKY_ACTION_CELL, STICKY_NO_CELL, linkDisabled, renderTpName, weekDisplay } from './orderListHelpers'

// 帳單列表的一列（含展開明細列）；自 ResultsV2.js 原樣搬出，state 與 handler 仍在 ResultsV2，由 props 傳入
export default function OrderListRow({
  order,
  index,
  selectedOrderSet,
  handleSelectOne,
  isExtended,
  orderStaticDetailLoading,
  handleOrderExtend,
  getOrderLazy,
  setPrintOrderId,
  setIsPrint,
  disabled,
  orderDataLazy,
  printOrderId,
  location,
  serialNumberUsing,
  raffleDisplay,
  membershipDisplay,
  bonusDisplay,
}) {
  return (
    <Fragment>
      <TableRow data-testid={`order-row`} data-state={selectedOrderSet.has(order.id) ? 'selected' : undefined} className="group">
        <TableCell className={cn('whitespace-nowrap px-3', STICKY_ACTION_CELL)}>
          <div className="flex items-center gap-1">
            <Checkbox
              aria-label={`選取 #${order.orderNo}`}
              checked={selectedOrderSet.has(order.id)}
              onChange={() => handleSelectOne(order.id)}
              data-testid={`order-checkbox-${index}`}
              disabled={order.isCloseAccount || order.status === '建立中'}
              className="mr-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary"
              aria-label={isExtended(order.id) ? '收合明細' : '展開明細'}
              aria-expanded={isExtended(order.id)}
              disabled={orderStaticDetailLoading || order.status === '建立中'}
              onClick={() => handleOrderExtend(order.id)}
            >
              {isExtended(order.id) ? <ChevronUp strokeWidth={1.75} /> : <ChevronDown strokeWidth={1.75} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary"
              aria-label="列印帳單"
              onClick={() => {
                getOrderLazy({
                  variables: {
                    orderId: order.id,
                  },
                })
                setPrintOrderId(order.id)
                setIsPrint(true)
              }}
              disabled={disabled || order.status === '建立中'}
            >
              {orderDataLazy.loading && printOrderId === order.id ? <LoaderCircle className="animate-spin" strokeWidth={1.75} /> : <Printer strokeWidth={1.75} />}
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
              <RouterLink
                aria-label="查看帳單"
                to={`/order/${location.search.length > 0
                  ? `${order.id}?startDate=${location.search
                    .split('=')[1]
                    .substring(0, 13)}&endDate=${location.search.split('=')[2]}`
                  : order.id
                  }`}
                data-testid={`order-${index}`}
                {...linkDisabled(order.status === '建立中')}
              >
                <Eye strokeWidth={1.75} />
              </RouterLink>
            </Button>
          </div>
        </TableCell>
        <TableCell className={STICKY_NO_CELL}>
          <div className="font-medium tabular-nums">
            {`#${order.orderNo}`}{serialNumberUsing && order.serialNumber ? ` (${order.serialNumber})` : ''}
          </div>
          <div className="text-caption tabular-nums text-text-secondary">
            {format(new Date(order.date), 'yyyy/MM/dd')}
            {weekDisplay(format(new Date(order.date), 'eeee'))}
            {format(new Date(order.date), 'HH:mm')}
          </div>
        </TableCell>
        {order.status === '建立中' ? (
          <TableCell colSpan={19}>
            <Badge variant="warning">帳單建立中</Badge>
          </TableCell>
        ) : (
          <>
            <TableCell>
              <div className="flex items-baseline gap-1">
                {order.customerName}
                <span className="text-caption text-text-secondary">{order.customerNo && `(${order.customerNo})`}</span>
              </div>
              <div className="text-caption tabular-nums text-text-secondary">{order.customerCellphone}</div>
            </TableCell>
            <TableCell>
              {order.designerName}
              {order.designerNo ? `/${order.designerNo}` : ''}
            </TableCell>
            <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
            {raffleDisplay ? <TableCell numeric>{formatNumber(order.raffleCount)}</TableCell> : null}
            <TableCell numeric className="font-medium">{formatMoney(Math.round(order.businessCash))}</TableCell>
            <TableCell numeric>
              {formatMoney(Math.round(order.service))}
              <div className="text-caption text-text-secondary">{order.TPTName.service.length > 0 && renderTpName(order.TPTName.service)}</div>
            </TableCell>
            <TableCell numeric>
              {formatMoney(Math.round(order.product))}
              <div className="text-caption text-text-secondary">{order.TPTName.product.length > 0 && renderTpName(order.TPTName.product)}</div>
            </TableCell>
            {membershipDisplay && (
              <TableCell numeric>
                {formatMoney(Math.round(order.membership))}
                <div className="text-caption text-text-secondary">{order.TPTName.membership.length > 0 && renderTpName(order.TPTName.membership)}</div>
              </TableCell>
            )}
            <TableCell numeric>{formatMoney(truncateDecimal(order.usedTicket))}</TableCell>
            <TableCell numeric>{formatMoney(Math.round(order.ticketSellIntoPerformance))}</TableCell>
            <TableCell numeric>{formatMoney(Math.round(order.performanceIncome))}</TableCell>
            <TableCell numeric>{formatMoney(Math.round(order.ticketSellNotIntoPerformance))}</TableCell>
            <TableCell numeric>{formatMoney(truncateDecimal(order.usedTicketForDecount))}</TableCell>
            <TableCell numeric>
              {formatMoney(Math.round(order.thirdPartTicketForDecount))}
              <div className="text-caption text-text-secondary">{order.TPTName.overAll.length > 0 && renderTpName(order.TPTName.overAll)}</div>
            </TableCell>
            <TableCell numeric>
              {formatMoney(Math.round(order.otherPayWayForDecount))}
              <div className="text-caption text-text-secondary">{order.otherPayName}</div>
            </TableCell>
            <TableCell numeric>{formatMoney(order.walletUsedForDecount)}</TableCell>
            {bonusDisplay && <TableCell numeric>{formatMoney(order.bonusDecountForReport)}</TableCell>}
            <TableCell className="text-text-secondary">{order.remark}</TableCell>
            <TableCell className="text-text-secondary">{order.source}</TableCell>
          </>
        )}
      </TableRow>
      {isExtended(order.id) && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={24} className="bg-surface px-4 py-3">
            {/* 明細：設計師 / 項目 / 價格 / 數量 / 互助人 */}
            <div className="flex gap-3 border-0 border-b border-solid border-border pb-2 text-label text-text-secondary">
              <div className="w-[100px] flex-none">設計師</div>
              <div className="w-[300px] flex-none">項目</div>
              <div className="w-[80px] flex-none text-right">價格</div>
              <div className="w-[60px] flex-none text-right">數量</div>
              <div className="w-[200px] flex-none">互助人</div>
            </div>
            {order.staticDetail && order.staticDetail.map((data, index) => (
              <div key={index} className="flex items-start gap-3 py-1.5 text-body text-text">
                <div className="w-[100px] flex-none">{data.designerName}</div>
                <div className="w-[300px] flex-none">{`${data.itemName}(${data.serviceType})`}</div>
                <div className="w-[80px] flex-none text-right tabular-nums">
                  {formatMoney(data.serviceType === '卡券使用' ? truncateDecimal(data.price) : data.price)}
                </div>
                <div className="w-[60px] flex-none text-right tabular-nums">{data.count}</div>
                <div className="w-[200px] flex-none">
                  {data.helperList.length > 0 ? (
                    data.helperList.map((helper, idx) => (
                      <div key={idx}>{`${helper.helperType}[${helper.helperName}]`}</div>
                    ))
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            ))}
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}
