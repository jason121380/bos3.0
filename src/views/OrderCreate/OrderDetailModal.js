import { Modal } from 'ui/modal-compat'
import { Divider } from 'ui/display-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader } from 'ui/card-compat'
import PropTypes from 'prop-types'
import React, {
  memo,
  useContext,
  Fragment,
} from 'react'
import { format } from 'date-fns'
import billContext from 'context/keyInContext'
import designerNameType from 'helper/designerNameType'
import OrderDetailScreen from './OrderDetailScreen'
import useOrderDetailItems from './useOrderDetailItems'
import useOrderDetailCheckout from './useOrderDetailCheckout'

const styles = {
  root: 'absolute top-[50%] left-[50%] [transform:translate(-50%,-50%)] [outline:none] [box-shadow:0px_10px_13px_-6px_rgba(0,0,0,0.2),0px_20px_31px_3px_rgba(0,0,0,0.14),0px_8px_38px_7px_rgba(0,0,0,0.12)] w-[500px] max-h-[100%] overflow-y-auto max-w-[100%]',
  header: 'flex justify-between items-center',
  backBtn: 'm-[16px_24px]',
  btnDiv: 'm-[10px_0] flex items-center justify-center',
}

// 打帳單「消費明細」彈窗：畫面與列印範本。資料在 useOrderDetailItems、送出與列印在 useOrderDetailCheckout，
// 畫面明細在 OrderDetailScreen（2026/10/21 自本檔原樣搬出）；下方 printMainRef／printThermalRef 兩塊列印範本原封不動。
function OrderDetailModal({ openOrderDetail, orderDetailPrintLayout, onClose, getHelperForPrint }) {
  const {
    bill,
    orderDetailPaymentShouldPay,
    cashPayment,
    checkoutBtnClick,
    customerBonus,
    bonusActive,
    customerWallet,
    disablePendingOrder
  } = useContext(billContext)
  const {
    ready, merchantName, orderDetail, sellTicketTotal, nameDisplayOnInvoice, customer, designer,
    detailInfo, qrcodeUrl, imgUrl,
  } = useOrderDetailItems()
  const {
    isClick, orderNumber, checkoutBtn, orderNoInPrint,
    checkOrderRef, checkOrderPrintRef, printMainRef, printThermalRef,
    valid, usehandleCreateOrder, usehandleCreateOrderAndPrint, handleOrderPendingConfirm, closeModal,
  } = useOrderDetailCheckout({ onClose, orderDetailPrintLayout })
  const getHelper = id => {
    const helper = getHelperForPrint.filter(d => d.userId === id)
    return helper[0].userNo || helper[0].userName
  }
  return (
    ready && (
      <Modal open={openOrderDetail}>
        <Card className={styles.root}>
          <div className={styles.header}>
            <CardHeader title="消費明細" />
            {/* 按鈕階層（STYLE §2／§6：一個畫面最多一個 primary、紅色只給破壞性操作）：返回＝ghost、掛單／結帳＝secondary、結帳並列印＝primary；handler 不變 */}
            <Button
              variant="text"
              onClick={closeModal}
              className={styles.backBtn}
              disabled={checkoutBtnClick}
            >
              返回
            </Button>
          </div>
          <OrderDetailScreen
            merchantName={merchantName}
            customer={customer}
            designer={designer}
            nameDisplayOnInvoice={nameDisplayOnInvoice}
            orderDetail={orderDetail}
          />
          <div className={styles.btnDiv}>
            {!disablePendingOrder && (
              <Button
                color="secondary"
                variant="contained"
                size="small"
                onClick={handleOrderPendingConfirm}
                disabled={valid || isClick || checkoutBtn}
                style={{ margin: '0 3px' }}
              >
                掛單
              </Button>
            )}
            <Button
              color="secondary"
              variant="contained"
              size="small"
              ref={checkOrderRef}
              onClick={usehandleCreateOrder}
              style={{ margin: '0 3px' }}
              disabled={valid || checkoutBtn || isClick}
            >
              結帳
            </Button>

            <Button
              color="primary"
              variant="contained"
              size="small"
              ref={checkOrderPrintRef}
              onClick={usehandleCreateOrderAndPrint}
              style={{ margin: '0 3px' }}
              disabled={valid || checkoutBtn || isClick}
            >
              結帳並列印
            </Button>
          </div>

          <div style={{ display: 'none' }} ref={printMainRef} >
            {
              (!detailInfo.logo.isDisplay || !detailInfo.logo.imageUrl) &&
                (!detailInfo.qrcode.isDisplay || !detailInfo.qrcode.imageUrl) &&
                (!detailInfo.message.isDisplay || !detailInfo.message.message) ? '' :
                <div style={{ width: '100%', height: 50, display: 'flex', gap: 5, marginBottom: 5 }}>
                  <div style={{ width: 50, height: 50, flexShrink: 0 }}>
                    {(detailInfo.logo.isDisplay && detailInfo.logo.imageUrl) ?
                      <img style={{ width: '100%', height: '100%' }} src={imgUrl} /> : ""}
                  </div>
                  <div style={{ width: 50, height: 50, overFlow: 'hidden', flexShrink: 0, overflow: 'hidden' }}>
                    {detailInfo.qrcode.isDisplay && detailInfo.qrcode.imageUrl ?
                      <img style={{ width: '100%', height: '100%' }} src={qrcodeUrl} /> : ""}
                  </div>
                  <div
                    style={{
                      flexGrow: 1,
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <textarea
                      disabled
                      style={{
                        height: 50,
                        resize: 'none',
                        overflow: 'hidden',
                        border: 'none',
                        fontSize: 7,
                        fontFamily: 'auto',
                        flexGrow: 1,
                        whiteSpace: 'nowrap'
                      }}
                      value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                    />
                  </div>
                </div>
            }
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px' }}>{merchantName}</div>
              <div style={{ color: '#009999' }}>結帳單</div>
            </div>
            <div>日期：{format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}</div>
            <div>帳單編號：{orderNumber}</div>
            <div>
              設計師:{designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
            </div>
            <div>
              顧客：{customer.data.customer === null ? '未選擇' : customer.data.customer.name}
            </div>
            <div>
              <div>
                {orderDetail.servicesDetail.length > 0 &&
                  orderDetail.servicesDetail.map((service, index) => (
                    <div
                      key={`servicesDetail-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                        <div>{service.name}</div>
                        {bill.serviceOrders[index].serviceOrderHelpers.map((d, index) => {
                          return (
                            <div
                              style={{ fontSize: '8px' }}
                              key={`helperList-${index}`}
                            >
                              助理:{getHelper(d.helperId)}
                            </div>
                          )
                        })}
                      </div>
                      <div>{service.price}x1</div>
                    </div>
                  ))}
              </div>
              <div>
                {orderDetail.productsDetail.length > 0 &&
                  orderDetail.productsDetail.map((product, index) => (
                    <div
                      key={`productsDetail-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div>{`${product.name}`}</div>
                      <div>
                        {product.price * product.count}x{product.count}
                      </div>
                    </div>
                  ))}
              </div>
              <div>
                {orderDetail.sellTicketsDetail.length > 0 &&
                  orderDetail.sellTicketsDetail.map((sellTicket, index) => (
                    <div
                      key={`sellTicketsDetail-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div item xs={5}>
                        {`${sellTicket.name}含(${sellTicket.availableCount})次`}
                      </div>
                      <div item xs={2}>
                        {sellTicket.price}
                      </div>
                    </div>
                  ))}
              </div>
              <div>
                {orderDetail.useTicketsDetail.length > 0 &&
                  orderDetail.useTicketsDetail.map((useTicket, index) => (
                    <div
                      key={`useTicketsDetail-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div>{useTicket.name}</div>
                      <div>{useTicket.price}</div>
                    </div>
                  ))}
              </div>
              <div>
                {orderDetail.membershipOrders.length > 0 &&
                  orderDetail.membershipOrders.map((memberShipCard, index) => (
                    <div
                      key={`membershipOrders-${index}`}
                      style={{ display: 'flex', justifyContent: 'space-between', margin: '0 50px' }}
                    >
                      <div>{memberShipCard.name}</div>
                      <div>{memberShipCard.price}</div>
                    </div>
                  ))}
              </div>
              <Divider style={{ width: '100%' }} />
              <div>合計：{orderDetailPaymentShouldPay}</div>
              <div>結帳：</div>
              <div style={{ display: 'flex', margin: '0 15px', justifyContent: 'space-between' }}>
                <div>扣入金：{bill.walletPay}</div>
                <div>入金餘額：{customerWallet - bill.walletPay}</div>
                {(bonusActive && !bill.withoutCustomerData) && (
                  <>
                    <div>增點：{bill.bonusDeposit}</div>
                    <div>扣點：{bill.bonusUsed}</div>
                    <div>折抵：{bill.bonusDecount}</div>
                    <div>點數餘額：{customerBonus + bill.bonusDeposit - bill.bonusUsed}</div>
                  </>
                )}
                <div>卡券金額：{sellTicketTotal}</div>
                <div style={{ color: '#EE0000' }}>付現金額：{cashPayment}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'none' }} ref={printThermalRef} >
            <div>
              {
                (!detailInfo.logo.isDisplay || !detailInfo.logo.imageUrl) &&
                  (!detailInfo.qrcode.isDisplay || !detailInfo.qrcode.imageUrl) &&
                  (!detailInfo.message.isDisplay || !detailInfo.message.message) ? '' :
                  <div style={{ width: '100%', height: 50, display: 'flex', gap: 5, marginBottom: 5 }}>
                    <div style={{ width: 50, height: 50, flexShrink: 0 }}>
                      {(detailInfo.logo.isDisplay && detailInfo.logo.imageUrl) ?
                        <img style={{ width: '100%', height: '100%' }} src={imgUrl} /> : ""}
                    </div>
                    <div style={{ width: 50, height: 50, overFlow: 'hidden', flexShrink: 0, overflow: 'hidden' }}>
                      {detailInfo.qrcode.isDisplay && detailInfo.qrcode.imageUrl ?
                        <img style={{ width: '100%', height: '100%' }} src={qrcodeUrl} /> : ""}
                    </div>
                    <div
                      style={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        display: 'flex',
                      }}
                    >
                      <textarea
                        disabled
                        style={{
                          height: 50,
                          resize: 'none',
                          overflow: 'hidden',
                          border: 'none',
                          fontSize: 7,
                          fontFamily: 'auto',
                          flexGrow: 1,
                          whiteSpace: 'nowrap'
                        }}
                        value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                      />
                    </div>
                  </div>
              }
              <div>
                <span>{merchantName}</span>
                <span style={{ marginLeft: '20px' }}>結帳單</span>
              </div>
              <div>日期：{format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}</div>
              <div>
                帳單編號：{orderNoInPrint}
                {/* {format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(0, 4) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(5, 7) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(8, 10) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(11, 13) +
                  format(new Date(bill.date), 'yyyy/MM/dd HH:mm:ss').substring(14, 16)} */}
              </div>
              <div>
                設計師:{designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
              </div>
              <div>
                顧客：{customer.data.customer === null ? '未選擇' : customer.data.customer.name}
              </div>
              <Divider style={{ width: '100%' }} />
              <table style={{ width: '100%' }}>
                <thead style={{ sizeWidth: 'bold' }}>
                  <td style={{ minWidth: '4ch' }}>名稱</td>
                  <td style={{ minWidth: '4ch' }}>單價</td>
                  <td style={{ minWidth: '4ch' }}>數量</td>
                  <td style={{ minWidth: '4ch' }}>小計</td>
                </thead>
                <tbody>
                  {orderDetail.servicesDetail.length > 0 &&
                    orderDetail.servicesDetail.map((service, index) => {
                      return (
                        <Fragment key={`servicesDetail-${index}`}>
                          <tr>
                            <td>{service.name}</td>
                            <td>{service.price}</td>
                            <td>1</td>
                            <td>{service.price}</td>
                          </tr>
                          <tr>
                            {bill.serviceOrders[index].serviceOrderHelpers.map((d, index) => {
                              return (
                                <td key={`helper-${index}`} style={{ fontSize: '6px', width: 'fit-content' }}>
                                  助理:{getHelper(d.helperId)}
                                </td>
                              )
                            })}
                          </tr>
                        </Fragment>
                      )
                    })}

                  {orderDetail.productsDetail.length > 0 &&
                    orderDetail.productsDetail.map((product, index) => (
                      <tr key={`productsDetail-${index}`}>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                        <td>{product.count}</td>
                        <td>{product.price * product.count}</td>
                      </tr>
                    ))}
                  {orderDetail.sellTicketsDetail.length > 0 &&
                    orderDetail.sellTicketsDetail.map((sellTicket, index) => (
                      <tr key={`sellTicketsDetail-${index}`}>
                        <td>{`${sellTicket.name}含(${sellTicket.availableCount})次`}</td>
                        <td>{sellTicket.price}</td>
                        <td>1</td>
                        <td>{sellTicket.price}</td>
                      </tr>
                    ))}
                  {orderDetail.useTicketsDetail.length > 0 &&
                    orderDetail.useTicketsDetail.map((useTicket, index) => (
                      <tr key={`useTicketsDetail-${index}`}>
                        <td>{useTicket.name}</td>
                        <td>{useTicket.price}</td>
                        <td>1</td>
                        <td>{useTicket.price}</td>
                      </tr>
                    ))}
                  {orderDetail.membershipOrders.length > 0 &&
                    orderDetail.membershipOrders.map((memberShipCard, index) => (
                      <tr key={`membershipOrders-${index}`}>
                        <td>{memberShipCard.name}</td>
                        <td>{memberShipCard.price}</td>
                        <td></td>
                        <td>{memberShipCard.price}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Divider style={{ width: '100%' }} />
              <div>合計：{orderDetailPaymentShouldPay}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>扣入金：{bill.walletPay}</div>
                <div>入金餘額：{customerWallet - bill.walletPay}</div>
              </div>
              {(bonusActive && !bill.withoutCustomerData) && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>增點：{bill.bonusDeposit}</div>
                    <div>扣點：{bill.bonusUsed}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>折抵：{bill.bonusDecount}</div>
                    <div>點數餘額：{customerBonus + bill.bonusDeposit - bill.bonusUsed}</div>
                  </div>
                </>
              )}
              <div>卡券金額：{sellTicketTotal}</div>
              <div>付現金額：{cashPayment}</div>
              <div>謝謝惠顧,歡迎下次光臨!</div>
            </div>
          </div>
        </Card>
      </Modal>
    )
  )
}

OrderDetailModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

OrderDetailModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(OrderDetailModal)
