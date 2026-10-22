import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Pannel/summary'
import billContext from 'context/keyInContext'
import cloneDeep from 'lodash/cloneDeep'
import React from 'react'

import CouponUse from './CouponUse'

export default function PannelCouponUse() {
  // 帳單直接用頁面（index.js）已查好的同一份結果（orderDetail），不另外重抓：這個區塊有顧客才掛上，
  // 自己再以 cache-and-network 查 FETCH_ORDER 會在選顧客的當下重抓帳單；四支帳單查詢共用 order(orderId) 根欄位、快取不正規化，
  // 重抓會連鎖讓頁面與各項目區塊重新帶入原掛單，櫃台改過的內容（價格、取消不留客資、選的顧客）被蓋回原樣
  const { handleBillChange, bill, orderDetail: order } = React.useContext(billContext)

  const [couponUsage, setCouponUsage] = React.useState([])

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
        summaryMeta={!expanded && panelSummary(couponUsage.filter(d => d.customerTicketId).length)}
      >
        <p className="m-0 !text-[16px] font-bold text-[rgb(var(--text))]">使用預收卡</p>
        <p className="m-0 ml-[8px] text-[0.75rem] font-normal text-[rgb(var(--text-secondary))]">編輯帳單不得編輯預收卡使用</p>
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
