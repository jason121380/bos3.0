import billContext from "context/keyInContext";
import { useState, useContext, useEffect } from "react";
import idx from "idx";
import useFetchGetThirdPartTicketSetting from 'hooks/useFetchGetThirdPartTicketSetting'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'

import PannelCouponSells from "./PannelCouponSells";
import PannelCouponUse from "./PannelCouponUse";
import PannelMerchantSells from "./PannelMerchantSells";
import PannelPayment from "views/OrderShared/PannelPayment";
import Payment from "./Payment";
import PannelService from "./PannelService";
import PannelRemark from "views/OrderShared/PannelRemark";
import Remark from "./Remark";
import PannelMemberShipCardSells from "./PannelMemberShipCardSells";
import PannelBonus from "./PannelBonus";

export default function SimpleAccordion({ children }) {
  const { bill, onceRef } = useContext(billContext);
  const thirdPartTicketData = useFetchGetThirdPartTicketSetting()
  const [thirdPartTicket, setthirdPartTicketData] = useState(false)
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const [bonusActive, setBonusActive] = useState(false)

  const otherPayLimit =
    bill.serviceOrders.reduce((total, item) => total + item.price, 0) +
    bill.productOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.ticketOrders.reduce((total, item) => (total = total + item.price * item.count), 0) +
    bill.membershipOrders.reduce((total, item) => (total = total + item.price), 0);

  useEffect(() => {
    if (!thirdPartTicketData.loading) {
      const thirdPartTicket = idx(thirdPartTicketData, _ => _.data.getIsThirdPartTicketDisplay)
      setthirdPartTicketData(thirdPartTicket)
    }
  }, [thirdPartTicketData.loading])

  useEffect(() => {
    if (!customerBonusActive.loading && onceRef.current) {
      const active = customerBonusActive.data.getIsCustomerBonusActive || bill.bonusDecount > 0 || bill.bonusDeposit > 0 || bill.bonusUsed > 0
      setBonusActive(active)
    }
  }, [customerBonusActive.loading, bill, onceRef])
  return (
    <div className="flex w-full flex-col gap-[12px]">
      <PannelService
        thirdPartTicket={thirdPartTicket}
      />
      <PannelMerchantSells
        thirdPartTicket={thirdPartTicket}
      />
      <PannelCouponSells />
      {bill.customerId ? <PannelCouponUse /> : ""}
      <PannelMemberShipCardSells
        thirdPartTicket={thirdPartTicket}
      />
      {/* 版面比照打帳單（OrderCreate/Pannel）：項目面板在上；下方兩欄，左欄紅利／付款／備註，右欄金額彙總卡與動作按鈕（由 index.js 傳入的 Footer）；900px 以下單欄 */}
      <div className="grid grid-cols-[1fr_420px] gap-[12px] max-[899.95px]:grid-cols-[1fr]">
        <div className="flex min-w-0 flex-col gap-[12px]">
          {(bonusActive && !bill.withoutCustomerData) &&
            <PannelBonus
              bonusActive={bonusActive}
            />
          }
          {otherPayLimit > 0 && <PannelPayment Payment={Payment} />}
          <PannelRemark Remark={Remark} />
        </div>
        <div className="flex min-w-0 flex-col gap-[12px]">
          {children}
        </div>
      </div>
      {/* 讓出底部固定合計列的高度，最後一張卡不會被蓋住 */}
      <div aria-hidden="true" className="h-12" />
    </div>
  );
}
