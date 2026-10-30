import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import idx from 'idx'
import { panelSummary } from 'views/OrderCreate/Panel/summary'
import billContext from 'context/keyInContext'
import useFetchOrder from 'hooks/useFetchOrder'
import cloneDeep from 'lodash/cloneDeep'
import React from 'react'

import CouponUse from './CouponUse'


export default function PanelCouponUse() {
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
    if (!order.loading && idx(order, _ => _.data.order)) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [order.loading, order.data])

  function handleFildChange({ index, value, key }) {
    const newCouponUsage = cloneDeep(couponUsage)
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
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }
  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
        summaryMeta={!expanded && panelSummary(bill.useTicketOrders.length)}
      >
        <p className="m-0 !text-[16px] font-bold text-text">使用預收卡</p>
        <p className="m-0 ml-2 !text-[0.75rem] !font-normal text-text-secondary">編輯帳單不得編輯預收卡使用</p>
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
                onChange={handleFildChange}
              />
            ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
