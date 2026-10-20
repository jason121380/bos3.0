import billContext from "context/keyInContext";
import React, { useState, useEffect } from "react";
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
  }, [otherPayLimit])

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

  React.useEffect(() => {
    const { services, products, tickets, memberships } = shortcut
    !!services.length && setServiceExpanded(true)
    !!products.length && setProductExpanded(true)
    !!tickets.length && setCouponExpanded(true)
    !!memberships.length && setMembershipsExpanded(true)
  }, [shortcut])
  return (
    <div className="flex w-full flex-col gap-[12px]">
      <PannelService
        expanded={serviceExpanded}
        setExpanded={setServiceExpanded}
        thirdPartTicket={thirdPartTicket}
      />
      <PannelMerchantSells
        expanded={productExpanded}
        setExpanded={setProductExpanded}
        thirdPartTicket={thirdPartTicket}
      />
      <PannelCouponSells
        expanded={couponExpanded}
        setExpanded={setCouponExpanded}
      />
      {bill.customerId ? <PannelCouponUse /> : ""}
      <PannelMemberShipCardSells
        expanded={membershipsExpanded}
        setExpanded={setMembershipsExpanded}
        thirdPartTicket={thirdPartTicket}
      />
      {(bonusActive && !bill.withoutCustomerData) &&
        <PannelBonus
          bonusActive={bonusActive}
        />
      }
      {otherPayLimit > 0 && <PannelPayment />}
      <PannelRemark />
      {/* <PannelOtherPayment /> */}
    </div>
  );
}
