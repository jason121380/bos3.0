import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Panel/summary'
import billContext from 'context/keyInContext'
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useRef, useContext, useState } from 'react'
import idx from 'idx'

import CouponUse from './CouponUse'

export default function PanelCouponUse() {
  const { handleBillChange, order, bill } = useContext(billContext)

  const [couponUsage, setCouponUsage] = useState([])

  const useHandleBillChangeRef = useRef(handleBillChange)

  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!order.loading) {
      let newCouponUsage = []
      const orderDetail = JSON.parse(idx(order, _ => _.data.getOrderInputByQueueId))
      if (orderDetail.useTicketOrders.length > 0) {
        orderDetail.useTicketOrders.map(data =>
          newCouponUsage.push({
            customerTicketId: data.customerTicketId,
            price: data.price,
            useTicketOrderHelpers: data.useTicketOrderHelpers.map(helper => ({
              type: helper.type,
              isDesignate: helper.isDesignate,
              helperId: helper.helperId,
              helperDeductiontype: helper.helperDeductiontype,
            })),
          })
        )
      } else {
        newCouponUsage.push({
          customerTicketId: '',
          useTicketOrderHelpers: [],
        })
      }
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
  }, [order.loading])

  useEffect(() => {
    if (couponUsage.length > 0 && couponUsage[0].customerTicketId !== '') {
      setExpanded(true)
    }
  }, [couponUsage])

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
        // 收合時顯示「已填 N 筆」（只讀畫面資料，不參與計算或送出；比照打帳單）
        summaryMeta={!expanded && panelSummary(bill.useTicketOrders.length)}
      >
        <p className="m-0 !text-[16px] font-bold text-text">使用預收卡</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          {bill.customerId &&
            couponUsage.map((data, index) => (
              <CouponUse couponUsage={data} couponUsages={couponUsage} key={`pannel-couponuse-${index}`} index={index} onChange={handleFildChange} />
            ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
