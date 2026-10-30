import { CardContent } from 'ui/card'
import React, { Fragment, useContext } from 'react'
import { format } from 'date-fns'
import billContext from 'context/keyInContext'
import designerNameType from 'helper/designerNameType'
import { formatNumber } from 'ui/format'

const styles = {
  rowOfGrid: 'm-[5px_0px]',
  dividerDiv: 'm-[8px_0px]',
  detailBottomCash: 'text-[20px] font-bold',
}

// 打帳單「消費明細」彈窗的畫面明細（2026/10/21 自 OrderDetailModal.js 原樣搬出，畫面與運算式不變）。
// 不是列印範本：列印內容是 OrderDetailModal.js 下方的 printMainRef／printThermalRef 兩塊
export default function OrderDetailScreen({ merchantName, customer, designer, nameDisplayOnInvoice, orderDetail }) {
  const { bill, orderDetailPaymentShouldPay, cashPayment, walletPayBalanceForDetail } = useContext(billContext)
  return (
    <CardContent id="DivIdToPrint" className="dark:bg-surface-hover">
      <div className="box-border flex w-full flex-wrap">
        <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
          <div className="box-border m-0 grow-0 basis-[66.666667%] max-w-[66.666667%]">{merchantName}</div>
          <div className="box-border m-0 grow-0 basis-[33.333333%] max-w-[33.333333%]">{format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}</div>
        </div>
        <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
          <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{bill.isDesignate ? '指定' : '不指定'}</div>
          <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">
            顧客:{customer.data.customer === null ? '未選擇' : customer.data.customer.name}
          </div>
          <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">
            設計師:{designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
          </div>
        </div>
        <div className={`box-border flex w-full flex-wrap ${styles.dividerDiv}`}>
          <div className="h-px w-full bg-border dark:bg-border-strong" />
        </div>
        <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
          {orderDetail.servicesDetail.length === 0 ? (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">項目消費</div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">未選擇</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          ) : (
            orderDetail.servicesDetail.length > 0 &&
            orderDetail.servicesDetail.map((service, index) => (
              <Fragment key={index}>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">項目消費</div>
                <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">{service.name}</div>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{formatNumber(service.price)}</div>
                {service.thirdPartyCoupon === null ? (
                  <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
                ) : (
                  <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]">{service.thirdPartyCoupon}</div>
                )}
              </Fragment>
            ))
          )}
          {orderDetail.productsDetail.length === 0 ? (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">店販銷售</div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">未選擇</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          ) : (
            orderDetail.productsDetail.length > 0 &&
            orderDetail.productsDetail.map((product, index) => (
              <Fragment key={index}>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">店販銷售</div>
                <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">{`${product.name}*${product.count}`}</div>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{formatNumber(product.price * product.count)}</div>
                {product.thirdPartyCoupon === null ? (
                  <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
                ) : (
                  <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]">{product.thirdPartyCoupon}</div>
                )}
              </Fragment>
            ))
          )}
          {orderDetail.sellTicketsDetail.length === 0 ? (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">卡券銷售</div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">未選擇</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          ) : (
            orderDetail.sellTicketsDetail.length > 0 &&
            orderDetail.sellTicketsDetail.map((sellTicket, index) => (
              <Fragment key={index}>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">卡券銷售</div>
                <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">
                  {`${sellTicket.name}含(${sellTicket.availableCount})次*${sellTicket.count}`}
                </div>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{formatNumber(sellTicket.price * sellTicket.count)}</div>
                <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
              </Fragment>
            ))
          )}
          {orderDetail.useTicketsDetail.length === 0 ? (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">卡券使用</div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">未選擇</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          ) : (
            orderDetail.useTicketsDetail.length > 0 &&
            orderDetail.useTicketsDetail.map((useTicket, index) => (
              <Fragment key={index}>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">卡券使用</div>
                <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">{useTicket.name}</div>
                <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{formatNumber(useTicket.price)}</div>
                <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
              </Fragment>
            ))
          )}
        </div>
        {orderDetail.membershipOrders.length === 0 ? (
          <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
            <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]">會員卡銷售</div>
            <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">未選擇</div>
            <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
            <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
          </div>
        ) : (
          orderDetail.membershipOrders.length > 0 &&
          orderDetail.membershipOrders.map((memberShipCard, index) => (
            <Fragment key={index}>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]">會員卡銷售</div>
              <div className="box-border m-0 grow-0 basis-[33.333333%] max-w-[33.333333%]">{memberShipCard.name}</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{formatNumber(memberShipCard.price)}</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
            </Fragment>
          ))
        )}
        <div className={`box-border flex w-full flex-wrap ${styles.dividerDiv}`}>
          <div className="h-px w-full bg-border dark:bg-border-strong" />
        </div>
        <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
          <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">應付帳款</div>
          <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]"></div>
          <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{orderDetailPaymentShouldPay}</div>
          <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
        </div>
        <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
          <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
            <div className="box-border m-0 grow-0 basis-[33.333333%] max-w-[33.333333%]">其他支付方式</div>
            <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
            <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
          </div>
          {bill.payType.length === 0 && bill.walletPay === 0 && (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">無</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          )}
          {bill.payType.length > 0 && (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">{bill.payType[0]}</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{bill.amountByOtherPay}</div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          )}
          {bill.walletPay > 0 && (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">扣入金</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{formatNumber(bill.walletPay)}</div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          )}
          {bill.walletPay > 0 && (
            <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]"></div>
              <div className="box-border m-0 grow-0 basis-[41.666667%] max-w-[41.666667%]">入金剩餘</div>
              <div className="box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%]">{formatNumber(walletPayBalanceForDetail)}</div>
              <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
            </div>
          )}
        </div>
        <div className={`box-border flex w-full flex-wrap ${styles.dividerDiv}`}>
          <div className="h-px w-full bg-border dark:bg-border-strong" />
        </div>
        <div className={`box-border flex w-full flex-wrap ${styles.rowOfGrid}`}>
          <div className={`box-border m-0 grow-0 basis-[25%] max-w-[25%] ${styles.detailBottomCash}`}>現金應收</div>
          <div className="box-border m-0 grow-0 basis-[33.333333%] max-w-[33.333333%]"></div>
          <div className={`box-border m-0 grow-0 basis-[16.666667%] max-w-[16.666667%] ${styles.detailBottomCash}`}>{formatNumber(cashPayment)}</div>
          <div className="box-border m-0 grow-0 basis-[25%] max-w-[25%]"></div>
        </div>
      </div>
    </CardContent>
  )
}
