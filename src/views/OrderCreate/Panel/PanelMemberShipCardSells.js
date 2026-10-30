import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import billContext from 'context/keyInContext'
import cloneDeep from 'lodash/cloneDeep'
import React from 'react'
import { addDays } from 'date-fns'
import MemberShipCardSells from 'views/OrderCreate/MemberShipCardSells'
import { panelSummary } from './summary'

const styles = {
  details: 'overflow-x-auto',
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
}

const PanelMemberShipCardSells = ({ expanded, onPanelClick, thirdPartTicket, reset }) => {
  const { handleBillChange, memberCardSells, setMemberCardSells, bill } = React.useContext(billContext)
  const [focusRow, setFocusRow] = React.useState(0)

  React.useEffect(() => {
    if (expanded) {
      setFocusRow(0)
    }
  }, [expanded])

  React.useEffect(() => {
    setMemberCardSells([
      {
        sellerId: '',
        membershipUUID: '',
        price: 0,
        thirdPartyCouponMerchantId: null,
        remark: '',
      },
    ])
  }, [setMemberCardSells])

  React.useEffect(() => {
    if (reset === 'reset') {
      setMemberCardSells([
        {
          sellerId: '',
          membershipUUID: '',
          price: 0,
          thirdPartyCouponMerchantId: null,
          remark: '',
        },
      ])
      setFocusRow(0)
    }
  }, [reset, setMemberCardSells])

  function handleClear({ index }) {
    let newSells = cloneDeep(memberCardSells)
    if (newSells.length === 1) {
      newSells = [
        {
          sellerId: '',
          membershipUUID: '',
          price: 0,
          thirdPartyCouponMerchantId: null,
          remark: '',
        },
      ]
    }
    newSells[index] = {
      ...newSells[index],
      sellerId: '',
      membershipUUID: '',
      price: 0,
      thirdPartyCouponMerchantId: null,
      remark: '',
    }
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
    setFocusRow(index)
  }

  function handleMerchantSellsChange({ key, value, index }) {
    const newSells = cloneDeep(memberCardSells)
    newSells[index][key] = value
    setMemberCardSells(newSells)
    // 呼叫端（MemberShipCardSells）只會傳 sellerId／price／expiryDate／remark，原本的 key 判斷永遠成立；
    // expiryDate 一律是時間戳、NaN 或 null（不會是 'Invalid Date' 等字串，=== NaN 也永遠不成立），原樣送出
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
  const handleChangeFocusRow = index => {
    if (index < memberCardSells.length) {
      setFocusRow(index)
    }
    if (index === memberCardSells.length) {
      handleAddSells()
    }
  }
  return (
    <Accordion key="panelMemberShipCardSells" expanded={expanded}>
      <AccordionSummary
        onClick={onPanelClick}
        summaryMeta={
          !expanded &&
          panelSummary(
            bill.membershipOrders.length,
            bill.membershipOrders.reduce((total, d) => total + d.price, 0)
          )
        }
        data-testid="memberShipCardSells"
        style={{ width: '100%' }}
      >
        <p className={`m-0 ${styles.heading}`}>會員卡銷售</p>
      </AccordionSummary>
      <AccordionDetails className={styles.details}>
        <div className={styles.fieldOutter}>
          {memberCardSells.map((data, index) => (
            <MemberShipCardSells
              key={`memberShipCard-sells-pannel-${data.id}-${index}`}
              focusFirstField={index === focusRow}
              focusRow={focusRow}
              sellsItem={data}
              index={index}
              expanded={expanded}
              changeRowFocus={handleChangeFocusRow}
              onChange={handleMerchantSellsChange}
              onCardChange={handleMemberShipCardChange}
              onClear={handleClear}
              addSells={handleAddSells}
              removeSells={handleRemoveSells}
              first={index === 0}
              last={index + 1 === memberCardSells.length}
              sells={memberCardSells}
              productLength={memberCardSells.length}
              thirdPartTicket={thirdPartTicket}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default React.memo(PanelMemberShipCardSells)
