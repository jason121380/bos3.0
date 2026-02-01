/** @jsxImportSource @emotion/react */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import billContext from "context/keyInContext";
import { useFetchUseMembershipOrder } from "hooks/useFetchOrder";
import _ from "lodash";
import React from "react";
import idx from "idx";
import { css } from '@emotion/react'
import { theme } from '../../theme'

import MemberShipCardSells from "./MemberShipCardSells";

const styles = {
  details: css({
    overflowX: "scroll",
  }),
  heading: css({
    fontSize: '15px !important',
    fontWeight: theme.typography.fontWeightRegular,
  }),
  fieldOutter: css({
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
  }),
}

const PannelMemberShipCardSells = ({ thirdPartTicket, expanded, setExpanded }) => {
  const {
    handleBillChange, orderId, memberCardSells, setMemberCardSells,
    mData, setMData
  } = React.useContext(billContext);
  const membershipOrder = useFetchUseMembershipOrder({ id: orderId });
  const [focusRow, setFocusRow] = React.useState(0)

  const getData = value => {
    !mData.length && setMData(value)
  }

  React.useEffect(() => {
    if (!membershipOrder.loading && membershipOrder.data) {
      const membershipData = idx(membershipOrder, _ => _.data.order.membershipOrders)

      const newSells = membershipData.length > 0 ? membershipData.map(d => ({
        sellerId: d.seller.id,
        membershipUUID: d.membership.uuid,
        price: d.price,
        thirdPartyCouponMerchantId: d.thirdPartyPayId,
        remark: d.remark,
        isLocked: d.membership.isLocked,
        expiryDate: d.expiryDate,
        purchaseDate: d.purchaseDate,
        validDayCount: d.validDayCount,
        effecitveDay: d.membership.effecitveDay,
      })) : [
        {
          sellerId: '',
          membershipUUID: '',
          price: 0,
          thirdPartyCouponMerchantId: null,
          remark: '',
        },
      ]

      if (
        newSells.length > 0 &&
        newSells[0].membershipUUID !== "" &&
        newSells[0].sellerId !== ""
      ) {
        setExpanded(true);
      }
      setMemberCardSells(newSells);
    }
  }, [membershipOrder.loading, membershipOrder.data]);


  function handleClear({ index }) {
    let newSells = _.cloneDeep(memberCardSells);
    if (newSells.length === 1) {
      newSells = [
        {
          sellerId: '',
          membershipUUID: '',
          price: 0,
          thirdPartyCouponMerchantId: null,
          remark: '',
        },
      ];
    }
    newSells[index] = {
      ...newSells[index],
      sellerId: '',
      membershipUUID: '',
      price: 0,
      thirdPartyCouponMerchantId: null,
      remark: '',
    };

    setMemberCardSells(newSells);
    handleBillChange({
      key: "membershipOrders",
      value: newSells
        .filter(d => d.membershipUUID && d.sellerId)
        .map(data => ({
          sellerId: data.sellerId,
          membershipUUID: data.membershipUUID,
          price: data.price,
          expiryDate: data.expiryDate,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
          remark: data.remark,
        })),
    });
  }

  function handleAddSells() {
    const newSells = _.cloneDeep(memberCardSells)
    newSells.push({
      sellerId: '',
      membershipUUID: '',
      price: 0,
      thirdPartyCouponMerchantId: null,
      remark: '',
    })
    setMemberCardSells(newSells)
    setFocusRow(newSells.length - 1)
  }

  function handleRemoveSells({ index }) {
    let newSells = _.cloneDeep(memberCardSells)
    newSells = newSells.filter((_d, idx) => idx !== index)
    setMemberCardSells(newSells)
    handleBillChange({
      key: 'membershipOrders',
      value: newSells
        .filter(d => d.membershipUUID !== '' && d.sellerId !== '')
        .map(data => ({
          sellerId: data.sellerId,
          membershipUUID: data.membershipUUID,
          price: data.price,
          expiryDate: data.expiryDate,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
          remark: data.remark,
        })),
    })
    setFocusRow(newSells.length - 1)
  }

  function handleMemberShipCardChange({ value, index }) {
    const newSells = _.cloneDeep(memberCardSells)
    newSells[index] = value
    setMemberCardSells(newSells)
    handleBillChange({
      key: 'membershipOrders',
      value: newSells.map(data => ({
        sellerId: data.sellerId,
        membershipUUID: data.membershipUUID,
        price: data.price,
        expiryDate: data.expiryDate,
        thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
        remark: data.remark,
      })),
    })
  }
  function handleMerchantSellsChange({ key, value, index }) {
    const newSells = _.cloneDeep(memberCardSells)
    newSells[index][key] = value === NaN ? "Invalid Date" : value
    setMemberCardSells(newSells)
    if (key === 'price' || key === 'date' || key === 'sellerId' || key === 'expiryDate' || key === 'remark') {
      handleBillChange({
        key: 'membershipOrders',
        value: newSells.map(data => ({
          sellerId: data.sellerId,
          membershipUUID: data.membershipUUID,
          price: data.price,
          expiryDate: data.expiryDate === NaN || data.expiryDate === 'Invalid Date' || data.expiryDate === "Early Date" || data.expiryDate === "Late Date" ? 'Invalid Date' : data.expiryDate,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
          remark: data.remark,
        })),
      })
    }
  }
  const handleAccordionClick = () => {
    setExpanded((val) => !val);
  };
  const handleChangeFocusRow = index => {
    if (index < memberCardSells.length) {
      setFocusRow(index)
    }
    if (index === memberCardSells.length) {
      handleAddSells()
    }
  }

  return (
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        data-testid="merchantSell"
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
      >
        <Typography css={styles.heading}>會員卡銷售</Typography>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          {memberCardSells.map((data, index) => (
            <MemberShipCardSells
              key={`memberShipCard-sells-pannel-${data.id}-${index}`}
              sells={data}
              index={index}
              onChange={handleMerchantSellsChange}
              onCardChange={handleMemberShipCardChange}
              onClear={handleClear}
              addSells={handleAddSells}
              removeSells={handleRemoveSells}
              first={index === 0}
              last={index + 1 === memberCardSells.length}
              sellsItem={memberCardSells}
              productLength={memberCardSells.length}
              changeRowFocus={handleChangeFocusRow}
              focusRow={focusRow}
              focusFirstField={index === focusRow}
              expanded={expanded}
              thirdPartTicket={thirdPartTicket}
              getData={getData}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
export default PannelMemberShipCardSells;
