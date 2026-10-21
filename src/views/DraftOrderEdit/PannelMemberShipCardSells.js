import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Pannel/summary'
import billContext from "context/keyInContext";
import { useFetchUseMembershipOrder } from "hooks/useFetchOrder";
import cloneDeep from "lodash/cloneDeep";
import React from "react";
import idx from "idx";

import MemberShipCardSells from "./MemberShipCardSells";

const PannelMemberShipCardSells = ({ thirdPartTicket }) => {
  const { handleBillChange, orderId, bill } = React.useContext(billContext);
  const [sells, setSells] = React.useState([]);
  const membershipOrder = useFetchUseMembershipOrder({ id: orderId });
  const [expanded, setExpanded] = React.useState(false);
  const [focusRow, setFocusRow] = React.useState(0)


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
      setSells(newSells);
    }
  }, [membershipOrder.loading, membershipOrder.data]);


  function handleClear({ index }) {
    let newSells = cloneDeep(sells);
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

    setSells(newSells);
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
    const newSells = cloneDeep(sells)
    newSells.push({
      sellerId: '',
      membershipUUID: '',
      price: 0,
      thirdPartyCouponMerchantId: null,
      remark: '',
    })
    setSells(newSells)
    setFocusRow(newSells.length - 1)
  }

  function handleRemoveSells({ index }) {
    let newSells = cloneDeep(sells)
    newSells = newSells.filter((_d, idx) => idx !== index)
    setSells(newSells)
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
    const newSells = cloneDeep(sells)
    newSells[index] = value
    setSells(newSells)
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
    const newSells = cloneDeep(sells)
    newSells[index][key] = value === NaN ? "Invalid Date" : value
    setSells(newSells)
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
    if (index < sells.length) {
      setFocusRow(index)
    }
    if (index === sells.length) {
      handleAddSells()
    }
  }

  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        data-testid="merchantSell"
        onClick={handleAccordionClick}
        summaryMeta={!expanded && panelSummary(
          sells.filter(d => d.membershipUUID).length,
          sells.filter(d => d.membershipUUID).reduce((total, d) => total + d.price, 0)
        )}
      >
        <p className="m-0 !text-[16px] font-bold text-[rgb(var(--text))]">會員卡銷售</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          {sells.map((data, index) => (
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
              last={index + 1 === sells.length}
              sellsItem={sells}
              productLength={sells.length}
              changeRowFocus={handleChangeFocusRow}
              focusRow={focusRow}
              focusFirstField={index === focusRow}
              expanded={expanded}
              thirdPartTicket={thirdPartTicket}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
export default PannelMemberShipCardSells;
