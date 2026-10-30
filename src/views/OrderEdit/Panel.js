import billContext from "context/keyInContext";
import React, { useState, useEffect } from "react";
import idx from "idx";
import useFetchGetThirdPartTicketSetting from 'hooks/useFetchGetThirdPartTicketSetting'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'

import PanelCouponSells from "./PanelCouponSells";
import PanelCouponUse from "./PanelCouponUse";
import PanelMerchantSells from "./PanelMerchantSells";
import PanelPayment from "views/OrderShared/PanelPayment";
import Payment from "./Payment";
import PanelService from "./PanelService";
import PanelRemark from "views/OrderShared/PanelRemark";
import Remark from "./Remark";
import PanelMemberShipCardSells from "./PanelMemberShipCardSells";
import PanelBonus from "./PanelBonus";


export default function SimpleAccordion({ children }) {
  const { bill, setPaymentAlready, onceRef, shortcut } = React.useContext(billContext);
  const thirdPartTicketData = useFetchGetThirdPartTicketSetting()
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const [thirdPartTicket, setthirdPartTicketData] = useState(false)
  const [bonusActive, setBonusActive] = useState(false)
  const [serviceExpanded, setServiceExpanded] = useState(false)
  const [productExpanded, setProductExpanded] = useState(false)
  const [couponExpanded, setCouponExpanded] = useState(false)
  const [membershipsExpanded, setMembershipsExpanded] = useState(false)

  const otherPayLimit =
    bill.serviceOrders.reduce((total, item) => total + item.price, 0) +
    bill.productOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price), 0);

  useEffect(() => {
    if (otherPayLimit === 0) {
      setPaymentAlready(true)
    }
  }, [otherPayLimit, setPaymentAlready])

  useEffect(() => {
    if (!thirdPartTicketData.loading) {
      const thirdPartTicket = idx(thirdPartTicketData, _ => _.data.getIsThirdPartTicketDisplay)
      setthirdPartTicketData(thirdPartTicket)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [thirdPartTicketData.loading])

  useEffect(() => {
    if (!customerBonusActive.loading && onceRef.current) {
      const active = idx(customerBonusActive, _ => _.data.getIsCustomerBonusActive) || bill.bonusDecount > 0 || bill.bonusDeposit > 0 || bill.bonusUsed > 0
      setBonusActive(active)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [customerBonusActive.loading, bill, onceRef])

  React.useEffect(() => {
    const { services, products, tickets, memberships } = shortcut
    !!services.length && setServiceExpanded(true)
    !!products.length && setProductExpanded(true)
    !!tickets.length && setCouponExpanded(true)
    !!memberships.length && setMembershipsExpanded(true)
  }, [shortcut])
  return (
    <div className="flex w-full flex-col gap-[12px]">
      <PanelService
        expanded={serviceExpanded}
        setExpanded={setServiceExpanded}
        thirdPartTicket={thirdPartTicket}
      />
      <PanelMerchantSells
        expanded={productExpanded}
        setExpanded={setProductExpanded}
        thirdPartTicket={thirdPartTicket}
      />
      <PanelCouponSells
        expanded={couponExpanded}
        setExpanded={setCouponExpanded}
      />
      {bill.customerId ? <PanelCouponUse /> : ""}
      <PanelMemberShipCardSells
        expanded={membershipsExpanded}
        setExpanded={setMembershipsExpanded}
        thirdPartTicket={thirdPartTicket}
      />
      {/* 版面比照打帳單（OrderCreate/Panel）：項目面板在上；下方兩欄，左欄紅利／付款／備註，右欄金額彙總卡與動作按鈕（由 index.js 傳入的 Footer）；900px 以下單欄 */}
      <div className="grid grid-cols-[1fr_420px] gap-[12px] max-[899.95px]:grid-cols-[1fr]">
        <div className="flex min-w-0 flex-col gap-[12px]">
          {(bonusActive && !bill.withoutCustomerData) &&
            <PanelBonus
              bonusActive={bonusActive}
            />
          }
          {otherPayLimit > 0 && <PanelPayment Payment={Payment} />}
          <PanelRemark Remark={Remark} />
        </div>
        <div className="flex min-w-0 flex-col gap-[12px]">
          {children}
        </div>
      </div>
      {/* 讓出底部固定合計列的高度，最後一張卡不會被蓋住 */}
      <div aria-hidden="true" className="h-12" />
      {/* <PanelOtherPayment /> */}
    </div>
  );
}
