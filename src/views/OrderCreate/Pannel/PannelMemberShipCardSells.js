import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import React from 'react'
import { addDays } from "date-fns";
import MemberShipCardSells from 'views/OrderCreate/MemberShipCardSells'
import { panelSummary } from './summary'

const styles = {
  details: 'overflow-x-auto',
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
}

const PannelMemberShipCardSells = ({ expanded, onPanelClick, thirdPartTicket, reset }) => {
  const {
    handleBillChange, memberCardSells, setMemberCardSells, bill,
    mData, setMData
  } = React.useContext(billContext)
  const [focusRow, setFocusRow] = React.useState(0)

  const getData = value => {
    !mData.length && setMData(value)
  }

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
  }, [])

  React.useEffect(() => {
    if(reset === 'reset'){
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
  }, [reset])

  function handleClear({ index }) {
    let newSells = _.cloneDeep(memberCardSells)
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
    const newSells = _.cloneDeep(memberCardSells)
    newSells[index][key] = value === NaN ? "Invalid Date" :value
    setMemberCardSells(newSells)
    if (key === 'price' || key === 'date' || key === 'sellerId' || key === 'expiryDate' || key === 'remark') {
      handleBillChange({
        key: 'membershipOrders',
        value: newSells.map(data => ({
          sellerId: data.sellerId,
          membershipUUID: data.membershipUUID,
          price: data.price,
          expiryDate: data.expiryDate === NaN || data.expiryDate === 'Invalid Date' || data.expiryDate === "Early Date" ||data.expiryDate === "Late Date"?'Invalid Date':data.expiryDate,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
          remark: data.remark,
        })),
      })
    }
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
        summaryMeta={!expanded && panelSummary(
          bill.membershipOrders.length,
          bill.membershipOrders.reduce((total, d) => total + d.price, 0)
        )}
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
              getData={getData}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default React.memo(PannelMemberShipCardSells)
