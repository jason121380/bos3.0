import billContext from "context/keyInContext";
import { useState, useContext, useEffect } from "react";
import idx from "idx";
import useFetchGetThirdPartTicketSetting from 'hooks/useFetchGetThirdPartTicketSetting'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'

import PannelCouponSells from "./PannelCouponSells";
import PannelCouponUse from "./PannelCouponUse";
import PannelMerchantSells from "./PannelMerchantSells";
import PannelPayment from "./PannelPayment";
import PannelService from "./PannelService";
import PannelRemark from "./PannelRemark";
import PannelMemberShipCardSells from "./PannelMemberShipCardSells";
import PannelBonus from "./PannelBonus";

export default function SimpleAccordion() {
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
  }, [customerBonusActive.loading, bill])
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
      {(bonusActive && !bill.withoutCustomerData) &&
        <PannelBonus
          bonusActive={bonusActive}
        />
      }
      {otherPayLimit > 0 && <PannelPayment />}
      <PannelRemark />
    </div>
  );
}
