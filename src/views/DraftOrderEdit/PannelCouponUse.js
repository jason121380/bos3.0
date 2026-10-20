import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Pannel/summary'
import billContext from 'context/keyInContext'
import useFetchOrder from 'hooks/useFetchOrder'
import _ from 'lodash'
import React from 'react'

import CouponUse from './CouponUse'

export default function PannelCouponUse() {
  const { handleBillChange, bill, orderId } = React.useContext(billContext)

  const [couponUsage, setCouponUsage] = React.useState([])

  const order = useFetchOrder({ id: orderId })

  const useHandleBillChangeRef = React.useRef(handleBillChange)

  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => {
    if (couponUsage.length > 0 && couponUsage[0].customerTicketId !== '') {
      setExpanded(true)
    }
  }, [couponUsage])

  React.useEffect(() => {
    if (!order.loading && order.data) {
      const newCouponUsage =
        order.data.order.useTicketOrders.length > 0
          ? order.data.order.useTicketOrders.map(data => ({
            customerTicketId: data.id,
            price: data.price,
            useTicketOrderHelpers: data.helperList.map(helper => ({
              // id: uuid(),
              type: helper.type,
              isDesignate: helper.isDesignate,
              helperId: helper.helper.id,
              helperDeductiontype: helper.helperDeductiontype,
            })),
          }))
          : [
            {
              // id: uuid(),
              customerTicketId: '',
              useTicketOrderHelpers: [],
            },
          ]
      setCouponUsage(newCouponUsage)
      useHandleBillChangeRef.current({
        key: 'useTicketOrders',
        value: newCouponUsage
          .filter(d => d.customerTicketId)
          .map(data => ({
            customerTicketId: data.customerTicketId,
            useTicketOrderHelpers: data.useTicketOrderHelpers,
          })),
      })
    }
  }, [order.loading, order.data])

  function handleAddCouponUse() {
    const newCouponUsage = _.cloneDeep(couponUsage)
    newCouponUsage.push({
      // id: uuid(),
      customerTicketId: '',
      useTicketOrderHelpers: [],
    })
    setCouponUsage(newCouponUsage)
  }
  function handleRemoveCouponUse({ index }) {
    const newCouponUsage = _.cloneDeep(couponUsage)
    newCouponUsage.splice(index, 1)
    setCouponUsage(newCouponUsage)
  }
  function handleFildChange({ index, value, key }) {
    const newCouponUsage = _.cloneDeep(couponUsage)
    newCouponUsage[index][key] = value
    setCouponUsage(newCouponUsage)
    handleBillChange({
      key: 'useTicketOrders',
      value: newCouponUsage
        .filter(d => d.customerTicketId)
        .map(data => ({
          customerTicketId: data.customerTicketId,
          useTicketOrderHelpers: data.useTicketOrderHelpers,
        })),
    })
  }

  function handleClear({ index }) {
    let newCouponUsage = _.cloneDeep(couponUsage)
    if (newCouponUsage.length === 1) {
      newCouponUsage = [
        {
          // id: uuid(),
          customerTicketId: '',
          useTicketOrderHelpers: [],
        },
      ]
    }
    newCouponUsage[index] = {
      // id: uuid(),
      customerTicketId: '',
      useTicketOrderHelpers: [],
    }
    setCouponUsage(newCouponUsage)
    handleBillChange({
      key: 'useTicketOrders',
      value: newCouponUsage
        .filter(d => d.customerTicketId)
        .map(data => ({
          customerTicketId: data.customerTicketId,
          useTicketOrderHelpers: data.useTicketOrderHelpers,
        })),
    })
  }
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }
  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        onClick={handleAccordionClick}
        summaryMeta={!expanded && panelSummary(couponUsage.filter(d => d.customerTicketId).length)}
      >
        <p className="m-0 !text-[16px] font-bold text-[rgb(var(--text))]">使用預收卡</p>
        <p className="m-0 ml-[8px] text-[0.75rem] font-normal text-[rgb(var(--text-secondary))]">編輯訂單不得編輯預收卡使用</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          {bill.customerId &&
            couponUsage.map((data, index) => (
              <CouponUse
                couponUsage={data}
                couponUsages={couponUsage}
                key={`pannel-couponuse-${index}`}
                index={index}
                addCouponUse={handleAddCouponUse}
                removeCouponUse={handleRemoveCouponUse}
                first={index === 0}
                last={index + 1 === couponUsage.length}
                onChange={handleFildChange}
                onClear={handleClear}
              />
            ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
