// 掛單詳細的金額彙總卡、動作按鈕與列印範本。資料與送出邏輯在 useDraftPrint（列印）與 useDraftCheckout（儲存／結帳、金額），
// 2026/10/21 自本檔原樣搬出；本檔只留畫面。
// 原生 hr 保留舊 class 與 inline style，讓複製到無 app CSS 的新視窗之 HTML 逐字相同；
// 重新結帳密碼視窗在 OrderShared/ReCheckoutPasswordDialog（與帳單詳細共用）
import billContext from 'context/keyInContext'
import { format } from 'date-fns'
import React, { Fragment } from 'react'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import designerNameType from 'helper/designerNameType'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { SummaryDetails, EditSummaryCard, BillActions, StickySummaryBar } from 'views/OrderShared/BillSummary'
import ReCheckoutPasswordDialog from 'views/OrderShared/ReCheckoutPasswordDialog'
import useDraftPrint from './useDraftPrint'
import useDraftCheckout from './useDraftCheckout'

export default function Footer() {
  // 查詢的建立順序與合併前相同：密碼設定 → 列印資料 → 儲存／結帳
  const passwordData = useFetchMerchantPassword()
  const {
    merchantName, nameDisplayOnInvoice, orderDetail, customer, designer, userOrderableList, getHelper,
    detailInfo, qrcodeUrl, imgUrl,
    getLogoDisplayOnInvoice, getQrcodeDisplayOnInvoice, getMessageDisplayOnInvoice,
    printDiv, printShouldPay, printCashDue,
  } = useDraftPrint()
  const {
    open, isClick, isRecheckoutOrders, vaild, disableRecheckoutOrders,
    openDialog, reCheckoutPwd, setReCheckoutPwd,
    handleReCheckoutOrder, usehandleSaveDraftOrder, handleOpenReCheckout, handleCloseDialog,
    serviceTotalPrice, merchantSellTotalPrice, couponSellPrice, couponUsageTotalPrice, membershipTotalPrice,
    performanceTotal, cashDue, disabledReason, checkoutLocked,
  } = useDraftCheckout({ passwordData })
  const { bill, order, bonusActive } = React.useContext(billContext)
  // 消費明細／付款與折抵：彙總卡與手機底部展開共用同一份畫面（排版在 OrderShared/BillSummary，四頁共用）
  const details = (
    <SummaryDetails
      spending={[
        { label: '服務消費', value: serviceTotalPrice },
        { label: '店販消費', value: merchantSellTotalPrice },
        { label: '預收卡販賣', value: couponSellPrice },
        { label: '使用預收卡', value: Math.round(couponUsageTotalPrice) },
        { label: '會員卡銷售', value: membershipTotalPrice },
      ]}
      payments={[
        { label: '扣入金', value: bill.walletPay },
        { label: '其他付款方式', value: bill.amountByOtherPay },
        { label: '紅利點數折抵', value: bill.bonusDecount },
      ]}
    />
  )
  return (
    <Fragment>
    {/* 金額彙總卡（放在 Pannel 下方右欄，比照打帳單 PannelPerformance）：按鈕列在合計下方。
        手機版（< 640px）卡片只留動作鈕，金額改由底部固定列顯示與展開，同一份數字不重複出現 */}
    <EditSummaryCard
      details={details}
      performanceTotal={performanceTotal}
      cashDue={cashDue}
      actions={
        <BillActions reason={disabledReason}>
          <div className="orderButtonGroup flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => printDiv()}
              disabled={
                getLogoDisplayOnInvoice.loading ||
                getQrcodeDisplayOnInvoice.loading ||
                getMessageDisplayOnInvoice.loading
              }
            >
              <Printer strokeWidth={1.75} />
              列印
            </Button>
            <span title={disabledReason || undefined} className="inline-flex">
              <Button
                variant="secondary"
                size="lg"
                onClick={usehandleSaveDraftOrder}
                disabled={open || vaild || isClick || checkoutLocked}
                data-testid="savedraft"
              >
                儲存
              </Button>
            </span>
            <span title={disabledReason || undefined} className="inline-flex">
              {/* 停用時改成深字灰底（原本淡藍底白字對比不足），比照打帳單 */}
              <Button
                variant="primary"
                size="lg"
                className="px-6 disabled:bg-surface-active disabled:text-text-secondary disabled:opacity-100"
                onClick={disableRecheckoutOrders ? handleOpenReCheckout : handleReCheckoutOrder}
                disabled={open || vaild || isRecheckoutOrders || checkoutLocked}
                data-testid="checkout"
              >
                結帳
              </Button>
            </span>
          </div>
        </BillActions>
      }
    >
        {/* 列印範本（#printMain / #printThermal）。Jason 2026/10/24：掛單收據不印點數餘額；增點／扣點／折抵仍印。已結帳收據不受影響。 */}
        <div style={{ display: 'none' }} id="printMain">
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
                    onChange={() => { }}
                    value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                  />
                </div>
              </div>
          }
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10px' }}>{merchantName}</div>
            <div style={{ color: '#009999' }}>結帳單</div>
          </div>
          <div>
            日期：
            {format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}
          </div>
          <div>帳單編號：{order.no}</div>
          {!designer.loading && (
            <div>
              設計師:
              {designer.data.merchantDesigner === null
                ? '未選擇'
                : designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
            </div>
          )}
          {!customer.loading && (
            <div>
              顧客:
              {customer.data.customer === null ? '未選擇' : customer.data.customer.name}
            </div>
          )}
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
                      {service.serviceOrderHelpers.map((d, index) => {
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
              {orderDetail.productsDetail.map((d, index) => {
                return (
                  <div key={`product-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.name}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>{d.count}</div>
                      <div>{d.price * d.count}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              {orderDetail.sellTicketsDetail.map((d, index) => {
                return (
                  <div key={`ticketSell-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {`${d.name}`}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>{d.count}</div>
                      <div>{d.price * d.count}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div>
              {order &&
                order.useTicketOrders.map((d, index) => {
                  return (
                    <div key={`ticketUse-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {d.name}
                      <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                        <div>{d.price}</div>
                        <div>1</div>
                        <div>{d.price}</div>
                      </div>
                    </div>
                  )
                })}
            </div>
            <hr className="MuiDivider-root MuiDivider-fullWidth" style={{ width: '100%' }} />
            <div>
              合計：{printShouldPay}
            </div>
            <div>結帳：</div>
            <div style={{ display: 'flex', margin: '0 15px', justifyContent: 'space-between' }}>
              <div>
                扣入金：
                {bill.walletPay}
              </div>
              {/* <div>入金餘額：{0}</div> */}
              {(bonusActive && !bill.withoutCustomerData) && (
                <>
                  <div>增點：{bill.bonusDeposit}</div>
                  <div>扣點：{bill.bonusUsed}</div>
                  <div>折抵：{bill.bonusDecount}</div>
                </>
              )}
              <div>卡券金額：{couponSellPrice}</div>
              <div style={{ color: '#EE0000' }}>
                付現金額：
                {printCashDue}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'none' }} id="printThermal">
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
                      onChange={() => { }}
                      value={detailInfo.message.isDisplay && detailInfo.message.message ? detailInfo.message.message : ''}
                    />
                  </div>
                </div>
            }
            <div>
              <span>{merchantName}</span>
              <span style={{ marginLeft: '20px' }}>結帳單</span>
            </div>
            <div>
              日期：
              {format(new Date(bill.date), 'yyyy/MM/dd HH:mm')}
            </div>
            <div>帳單編號：{order.no}</div>
            {!designer.loading && (
              <div>
                設計師:
                {designer.data.merchantDesigner === null
                  ? '未選擇'
                  : designerNameType(designer.data.merchantDesigner, nameDisplayOnInvoice)}
              </div>
            )}
            {!customer.loading && (
              <div>
                顧客:
                {customer.data.customer === null ? '未選擇' : customer.data.customer.name}
              </div>
            )}

            <hr className="MuiDivider-root MuiDivider-fullWidth" style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>名稱</div>
              <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                <div>單價</div>
                <div>數量</div>
                <div>小計</div>
              </div>
            </div>
            {orderDetail.servicesDetail.map((d, index) => {
              return (
                <Fragment key={`service-${index}`} >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.name}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>1</div>
                      <div>{d.price}</div>
                    </div>
                  </div>
                  {!userOrderableList.loading &&
                    d.serviceOrderHelpers.map((d, index) => {
                      return (
                        <span key={`helper-${index}`} style={{ fontSize: '6px', marginRight: '10px' }}>
                          助理:{getHelper(d.helperId)}
                        </span>
                      )
                    })}
                </Fragment>
              )
            })}
            {orderDetail.productsDetail.map((d, index) => {
              return (
                <div key={`product-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {d.name}
                  <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                    <div>{d.price}</div>
                    <div>{d.count}</div>
                    <div>{d.price * d.count}</div>
                  </div>
                </div>
              )
            })}
            {orderDetail.sellTicketsDetail.map((d, index) => {
              return (
                <div key={`product-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {`${d.name}`}
                  <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                    <div>{d.price}</div>
                    <div>{d.count}</div>
                    <div>{d.price * d.count}</div>
                  </div>
                </div>
              )
            })}
            {orderDetail.membershipsDetail.map((d, index) => {
              return (
                <div key={`member-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {`${d.name}`}
                  <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                    <div>{d.price}</div>
                    <div>1</div>
                    <div>{d.price}</div>
                  </div>
                </div>
              )
            })}
            {order &&
              order.useTicketOrders.map((d, index) => {
                return (
                  <div key={`TicketUse-${index}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {d.name}
                    <div style={{ display: 'flex', width: 100, justifyContent: 'space-between' }}>
                      <div>{d.price}</div>
                      <div>1</div>
                      <div>{d.price}</div>
                    </div>
                  </div>
                )
              })}
            <hr className="MuiDivider-root MuiDivider-fullWidth" style={{ width: '100%' }} />
            <div>
              合計：{printShouldPay}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                扣入金：
                {bill.walletPay}
              </div>
              {/* <div>入金餘額：{walletPayBalanceForDetail}</div> */}
            </div>
            {(bonusActive && !bill.withoutCustomerData) && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>增點：{bill.bonusDeposit}</div>
                  <div>扣點：{bill.bonusUsed}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>折抵：{bill.bonusDecount}</div>
                </div>
              </>
            )}
            <div>卡券金額：{couponSellPrice}</div>
            <div>
              付現金額：
              {printCashDue}
            </div>
            <div>謝謝惠顧,歡迎下次光臨!</div>
          </div>
        </div>
        <ReCheckoutPasswordDialog
          open={openDialog}
          onClose={handleCloseDialog}
          title="結帳"
          reCheckoutPwd={reCheckoutPwd}
          setReCheckoutPwd={setReCheckoutPwd}
          confirmDisabled={isClick}
          onConfirm={handleReCheckoutOrder}
        />
    </EditSummaryCard>
    {/* 底部固定列（比照打帳單 PannelPerformance）：長帳單捲動時，業績合計與現金應收隨時看得到 */}
    <StickySummaryBar
      detailsId="draft-order-summary-details"
      details={details}
      performanceTotal={performanceTotal}
      cashDue={cashDue}
      aboveTabBar={false}
    />
    </Fragment>
  )
}
