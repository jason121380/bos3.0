import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Pannel/summary'
import billContext from "context/keyInContext";
import { useFetchUseMembershipOrder } from "hooks/useFetchOrder";
import cloneDeep from "lodash/cloneDeep";
import React from "react";
import idx from "idx";

import MemberShipCardSells from "./MemberShipCardSells";


const PannelMemberShipCardSells = ({ thirdPartTicket, expanded, setExpanded }) => {
  const {
    handleBillChange, orderId, memberCardSells, setMemberCardSells,
    mData, setMData
  } = React.useContext(billContext);
  const membershipOrder = useFetchUseMembershipOrder({ id: orderId });
  // 要聚焦的列：開頁時 -1（沒有）。帶入既有會員卡時會自動展開區塊，原本初始值 0 讓第 1 列的「展開＋本列要聚焦」effect
  // 一展開就把焦點移到服務人員欄（掛單詳細還會往下捲）；改為使用者展開區塊、新增／刪除列、換列時才指定（比照打帳單；Jason 2026/10/22 fix all）
  const [focusRow, setFocusRow] = React.useState(-1)

  const getData = value => {
    !mData.length && setMData(value)
  }

  React.useEffect(() => {
    if (!membershipOrder.loading && membershipOrder.data) {
      // 查無帳單（order 為 null）時 membershipOrders 取不到，視為沒有會員卡販售
      const membershipData = idx(membershipOrder, _ => _.data.order.membershipOrders) || []

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [membershipOrder.loading, membershipOrder.data, setExpanded, setMemberCardSells]);


  function handleClear({ index }) {
    let newSells = cloneDeep(memberCardSells);
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
    const newSells = cloneDeep(memberCardSells)
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
    let newSells = cloneDeep(memberCardSells)
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
    const newSells = cloneDeep(memberCardSells)
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
    const newSells = cloneDeep(memberCardSells)
    newSells[index][key] = value
    setMemberCardSells(newSells)
    if (key === 'price' || key === 'sellerId' || key === 'expiryDate' || key === 'remark') {
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
  }
  const handleAccordionClick = () => {
    setExpanded((val) => !val);
    // 使用者展開：還沒指定列時聚焦第 1 列
    setFocusRow(row => (row < 0 ? 0 : row));
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
    <Accordion expanded={expanded}>
      <AccordionSummary
        data-testid="merchantSell"
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
        summaryMeta={!expanded && panelSummary(
          memberCardSells.filter(d => d.membershipUUID).length,
          memberCardSells.filter(d => d.membershipUUID).reduce((total, d) => total + d.price, 0)
        )}
      >
        <p className="m-0 !text-[16px] font-bold text-text">會員卡銷售</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
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
