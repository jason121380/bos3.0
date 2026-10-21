import { Divider } from 'ui/display-compat'
import { Grid } from 'ui/grid-compat'
import { CardContent } from 'ui/card-compat'
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
  const {
    bill,
    orderDetailPaymentShouldPay,
    cashPayment,
    walletPayBalanceForDetail,
  } = useContext(billContext)
  return (
    <CardContent id="DivIdToPrint">
      <Grid container>
        <Grid container className={styles.rowOfGrid}>
          <Grid item xs={8}>
            {merchantName}
          </Grid>
          <Grid item xs={4}>
            {format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}
          </Grid>
        </Grid>
        <Grid container className={styles.rowOfGrid}>
          <Grid item xs={2}>
            {bill.isDesignate ? '指定' : '不指定'}
          </Grid>
          <Grid item xs={5}>
            顧客:{customer.data.customer === null ? '未選擇' : customer.data.customer.name}
          </Grid>
          <Grid item xs={5}>
            設計師:{designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
          </Grid>
        </Grid>
        <Grid container className={styles.dividerDiv}>
          <Divider style={{ width: '100%' }} />
        </Grid>
        <Grid container className={styles.rowOfGrid}>
          {orderDetail.servicesDetail.length === 0 ? (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}>
                項目消費
              </Grid>
              <Grid item xs={5}>
                未選擇
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          ) : (
            orderDetail.servicesDetail.length > 0 &&
            orderDetail.servicesDetail.map((service, index) => (
              <Fragment key={index}>
                <Grid item xs={2}>
                  項目消費
                </Grid>
                <Grid item xs={5}>
                  {service.name}
                </Grid>
                <Grid item xs={2}>
                  {formatNumber(service.price)}
                </Grid>
                {service.thirdPartyCoupon === null ? (
                  <Grid item xs={3}></Grid>
                ) : (
                  <Grid item xs={3}>
                    {service.thirdPartyCoupon}
                  </Grid>
                )}
              </Fragment>
            ))
          )}
          {orderDetail.productsDetail.length === 0 ? (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}>
                店販銷售
              </Grid>
              <Grid item xs={5}>
                未選擇
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          ) : (
            orderDetail.productsDetail.length > 0 &&
            orderDetail.productsDetail.map((product, index) => (
              <Fragment key={index}>
                <Grid item xs={2}>
                  店販銷售
                </Grid>
                <Grid item xs={5}>
                  {`${product.name}*${product.count}`}
                </Grid>
                <Grid item xs={2}>
                  {formatNumber(product.price * product.count)}
                </Grid>
                {product.thirdPartyCoupon === null ? (
                  <Grid item xs={3}></Grid>
                ) : (
                  <Grid item xs={3}>
                    {product.thirdPartyCoupon}
                  </Grid>
                )}
              </Fragment>
            ))
          )}
          {orderDetail.sellTicketsDetail.length === 0 ? (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}>
                卡券銷售
              </Grid>
              <Grid item xs={5}>
                未選擇
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          ) : (
            orderDetail.sellTicketsDetail.length > 0 &&
            orderDetail.sellTicketsDetail.map((sellTicket, index) => (
              <Fragment key={index}>
                <Grid item xs={2}>
                  卡券銷售
                </Grid>
                <Grid item xs={5}>
                  {`${sellTicket.name}含(${sellTicket.availableCount})次*${sellTicket.count}`}
                </Grid>
                <Grid item xs={2}>
                  {formatNumber(sellTicket.price * sellTicket.count)}
                </Grid>
                <Grid item xs={3}></Grid>
              </Fragment>
            ))
          )}
          {orderDetail.useTicketsDetail.length === 0 ? (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}>
                卡券使用
              </Grid>
              <Grid item xs={5}>
                未選擇
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          ) : (
            orderDetail.useTicketsDetail.length > 0 &&
            orderDetail.useTicketsDetail.map((useTicket, index) => (
              <Fragment key={index}>
                <Grid item xs={2}>
                  卡券使用
                </Grid>
                <Grid item xs={5}>
                  {useTicket.name}
                </Grid>
                <Grid item xs={2}>
                  {formatNumber(useTicket.price)}
                </Grid>
                <Grid item xs={3}></Grid>
              </Fragment>
            ))
          )}
        </Grid>
        {orderDetail.membershipOrders.length === 0 ? (
          <Grid container className={styles.rowOfGrid}>
            <Grid item xs={3}>
              會員卡銷售
            </Grid>
            <Grid item xs={5}>
              未選擇
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}></Grid>
          </Grid>
        ) : (
          orderDetail.membershipOrders.length > 0 &&
          orderDetail.membershipOrders.map((memberShipCard, index) => (
            <Fragment key={index}>
              <Grid item xs={3}>
                會員卡銷售
              </Grid>
              <Grid item xs={4}>
                {memberShipCard.name}
              </Grid>
              <Grid item xs={2}>
                {formatNumber(memberShipCard.price)}
              </Grid>
              <Grid item xs={2}></Grid>
            </Fragment>
          ))
        )}
        <Grid container className={styles.dividerDiv}>
          <Divider style={{ width: '100%' }} />
        </Grid>
        <Grid container className={styles.rowOfGrid}>
          <Grid item xs={2}>
            應付帳款
          </Grid>
          <Grid item xs={5}></Grid>
          <Grid item xs={2}>
            {orderDetailPaymentShouldPay}
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
        <Grid container className={styles.rowOfGrid}>
          <Grid container className={styles.rowOfGrid}>
            <Grid item xs={4}>
              其他支付方式
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={3}></Grid>
          </Grid>
          {bill.payType.length === 0 && bill.walletPay === 0 && (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}></Grid>
              <Grid item xs={5}>
                無
              </Grid>
              <Grid item xs={2}></Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          )}
          {bill.payType.length > 0 && (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}></Grid>
              <Grid item xs={5}>
                {bill.payType[0]}
              </Grid>
              <Grid item xs={2}>
                {bill.amountByOtherPay}
              </Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          )}
          {bill.walletPay > 0 && (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}></Grid>
              <Grid item xs={5}>
                扣入金
              </Grid>
              <Grid item xs={2}>
                {formatNumber(bill.walletPay)}
              </Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          )}
          {bill.walletPay > 0 && (
            <Grid container className={styles.rowOfGrid}>
              <Grid item xs={2}></Grid>
              <Grid item xs={5}>
                入金剩餘
              </Grid>
              <Grid item xs={2}>
                {formatNumber(walletPayBalanceForDetail)}
              </Grid>
              <Grid item xs={3}></Grid>
            </Grid>
          )}
        </Grid>
        <Grid container className={styles.dividerDiv}>
          <Divider style={{ width: '100%' }} />
        </Grid>
        <Grid container className={styles.rowOfGrid}>
          <Grid item xs={3} className={styles.detailBottomCash}>
            現金應收
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={2} className={styles.detailBottomCash}>
            {formatNumber(cashPayment)}
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
      </Grid>
    </CardContent>
  )
}
