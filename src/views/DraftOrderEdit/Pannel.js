/** @jsxImportSource @emotion/react */
import billContext from 'context/keyInContext'
import { useState, useContext, useEffect } from 'react'
import idx from "idx";
import useFetchGetThirdPartTicketSetting from 'hooks/useFetchGetThirdPartTicketSetting'
import { css } from '@emotion/react'

import PannelCouponSells from './PannelCouponSells'
import PannelCouponUse from './PannelCouponUse'
import PannelMerchantSells from './PannelMerchantSells'
import PannelPayment from './PannelPayment'
import PannelService from './PannelService'
import PannelRemark from './PannelRemark'
import PannelMemberShipCardSells from './PannelMemberShipCardSells'
import PannelBonus from "./PannelBonus";

// import PannelOtherPayment from './PannelOtherPayment'

const styles = {
  // 各區塊（Accordion）之間 12px，與打帳單一致
  root: css({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }),
  heading: css({
    fontSize: '16px !important',
    fontWeight: 'bold',
    color: 'rgb(var(--text))',
  }),
}

export default function SimpleAccordion() {

  const { bill, bonusActive } = useContext(billContext)
  const thirdPartTicketData = useFetchGetThirdPartTicketSetting()
  const [thirdPartTicket, setthirdPartTicketData] = useState(false)

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

  return (
    <div css={styles.root}>
      <PannelService
        thirdPartTicket={thirdPartTicket}
      />
      <PannelMerchantSells
        thirdPartTicket={thirdPartTicket}
      />
      <PannelCouponSells />
      {bill.customerId ? <PannelCouponUse /> : ''}
      <PannelMemberShipCardSells
        thirdPartTicket={thirdPartTicket}
      />
      {(bonusActive && !bill.withoutCustomerData) &&
        <PannelBonus
          onPanelClick={() => handlePannelClick('bonus')}
          bonusActive={bonusActive}
        />
      }
      {otherPayLimit > 0 && <PannelPayment />}
      <PannelRemark />
      {/* <PannelOtherPayment /> */}
    </div>
  )
}
