import { format } from 'date-fns'
import idx from 'idx'
import React, { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ChevronDown, ChevronUp, CircleDollarSign, Eye, Printer } from 'lucide-react'
import truncateDecimal from 'helper/truncateDecimal'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { formatMoney } from 'ui/format'
import { TableCell, TableRow } from 'ui/table'
import { cn } from 'ui/utils'
import {
  STICKY_ACTION_CELL,
  STICKY_NO_CELL,
  membershipOrders,
  productOrders,
  serviceOrders,
  thirdParty,
  weekDisplay,
} from './draftOrderListHelpers'

// 掛單列表的一列（含展開明細列）；自 ResultsV2.js 原樣搬出，state 與 handler 仍在 ResultsV2，由 props 傳入
export default function DraftOrderRow({
  order,
  index,
  selectedOrderSet,
  handleSelectOne,
  orderExtendArr,
  handleOrderExtend,
  disabled,
  handlePrintOrderDetail,
  location,
  isClick,
  passwordEnabled,
  handleCheckout,
  handleCheckoutOrder,
  membershipDisplay,
  bonusDisplay,
}) {
  return (
    <Fragment>
      <TableRow data-testid={`order-row`} data-state={selectedOrderSet.has(order.id) ? 'selected' : undefined} className="group">
        <TableCell className={cn('whitespace-nowrap px-3', STICKY_ACTION_CELL)}>
          <div className="flex items-center gap-1">
            <Checkbox
              aria-label={`選取 #${order.no}`}
              checked={selectedOrderSet.has(order.id)}
              onChange={() => handleSelectOne(order.id)}
              data-testid={`order-checkbox-${index}`}
              disabled={order.isCloseAccount}
              className="mr-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary"
              aria-label={orderExtendArr.find(id => id === order.id) !== undefined ? '收合明細' : '展開明細'}
              aria-expanded={orderExtendArr.find(id => id === order.id) !== undefined}
              onClick={() => handleOrderExtend(order.id)}
            >
              {orderExtendArr.find(id => id === order.id) !== undefined ? (
                <ChevronUp strokeWidth={1.75} />
              ) : (
                <ChevronDown strokeWidth={1.75} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary"
              aria-label="列印帳單"
              disabled={disabled}
              onClick={() => handlePrintOrderDetail(order.id)}
            >
              <Printer strokeWidth={1.75} />
            </Button>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary">
              <RouterLink
                aria-label="查看掛單"
                to={`/draft-order/${location.search.length > 0
                  ? `${order.id}?startDate=${location.search
                    .split('=')[1]
                    .substring(0, 13)}&endDate=${location.search.split('=')[2]}`
                  : `${order.id}`
                  }`}
                data-testid={`order-${index}`}
              >
                <Eye strokeWidth={1.75} />
              </RouterLink>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary"
              aria-label="結帳"
              disabled={isClick}
              onClick={() => {
                passwordEnabled.checkout ? handleCheckout(index) : handleCheckoutOrder(order)
              }}
              data-testid={`order-checkout-${index}`}
            >
              <CircleDollarSign strokeWidth={1.75} />
            </Button>
          </div>
        </TableCell>

        <TableCell className={STICKY_NO_CELL}>
          <div className="font-medium tabular-nums">#{order.no}</div>
          <div className="text-caption tabular-nums text-text-secondary">
            {format(new Date(order.date), 'yyyy/MM/dd')}/
            {weekDisplay(format(new Date(order.date), 'eeee'))}
          </div>
        </TableCell>
        <TableCell>
          {idx(order, _ => _.customer.name)}
          <div className="text-caption tabular-nums text-text-secondary">
            {idx(order, _ => _.customer.cellphone)}
          </div>
        </TableCell>
        <TableCell>
          {`${idx(order, _ => _.designer.lastName)}${idx(
            order,
            _ => _.designer.firstName
          )}`}
          {idx(order, _ => _.designer.designerNo)
            ? `/${idx(order, _ => _.designer.designerNo)}`
            : ''}
        </TableCell>
        <TableCell>{order.isDesignate ? 'Y' : 'N'}</TableCell>
        <TableCell numeric className="font-medium">
          {formatMoney(Math.round(order.businessCash))}
        </TableCell>
        <TableCell numeric>
          {formatMoney(Math.round(order.serviceFakeTotal))}
          <div className="text-caption text-text-secondary">
            {order.serviceOrders.length > 0 && serviceOrders(order)}
          </div>
        </TableCell>
        <TableCell numeric>
          {formatMoney(Math.round(order.productFakeTotal))}
          <div className="text-caption text-text-secondary">
            {order.productOrders.length > 0 && productOrders(order)}
          </div>
        </TableCell>
        {membershipDisplay && (
          <TableCell numeric>
            {formatMoney(Math.round(order.membershipFakeTotal))}
            <div className="text-caption text-text-secondary">
              {order.membershipOrders.length > 0 && membershipOrders(order)}
            </div>
          </TableCell>
        )}
        <TableCell numeric>{formatMoney(Math.round(order.useTicketTotal))}</TableCell>
        <TableCell numeric>{formatMoney(Math.round(order.ticketSellIntoPerformance))}</TableCell>
        <TableCell numeric>{formatMoney(Math.round(order.performanceIncome))}</TableCell>
        <TableCell numeric>{formatMoney(Math.round(order.ticketSellNotIntoPerformance))}</TableCell>
        <TableCell numeric>{formatMoney(Math.round(order.usedTicketForDecount))}</TableCell>
        <TableCell numeric>
          {formatMoney(Math.round(order.thirdPartTicketForDecount))}
          <div className="text-caption text-text-secondary">
            {order.serviceOrders.length > 0 &&
              order.productOrders.length > 0 &&
              thirdParty(order)}
          </div>
        </TableCell>
        <TableCell numeric>
          {formatMoney(Math.round(order.otherPayWayForDecount))}
          <div className="text-caption text-text-secondary">{order.payType2}</div>
        </TableCell>
        <TableCell numeric>{formatMoney(order.walletUsedForDecount)}</TableCell>
        {bonusDisplay && <TableCell numeric>{formatMoney(order.bonusDecountForReport)}</TableCell>}
        <TableCell className="text-text-secondary">{order.remark}</TableCell>
        <TableCell className="text-text-secondary">{order.source}</TableCell>
      </TableRow>
      {orderExtendArr.find(id => id === order.id) !== undefined && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={23} className="bg-surface px-4 py-3">
            {/* 明細：設計師 / 項目 / 價格 / 數量 / 互助人 */}
            <div className="flex gap-3 border-0 border-b border-solid border-border pb-2 text-label text-text-secondary">
              <div className="w-[100px] flex-none">設計師</div>
              <div className="w-[300px] flex-none">項目</div>
              <div className="w-[80px] flex-none text-right">價格</div>
              <div className="w-[60px] flex-none text-right">數量</div>
              <div className="w-[200px] flex-none">互助人</div>
            </div>
            {order.staticDetail.map((data, index) => (
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
                      <div key={idx}>
                        {`${helper.helperType}[${helper.helperName}]`}
                      </div>
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
