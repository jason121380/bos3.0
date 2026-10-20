import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Pannel/summary'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import { useState, useEffect, useContext } from 'react'
import idx from 'idx'

import MerchantSells from './MerchantSells'

export default function PannelMerchantSells({ thirdPartTicket }) {
  const { handleBillChange, order } = useContext(billContext)
  const [sells, setSells] = useState([])
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (!order.loading) {
      let newSells = []
      const orderDetail = JSON.parse(idx(order, _ => _.data.getOrderInputByQueueId))
      if (orderDetail.productOrders.length > 0) {
        orderDetail.productOrders.map(data => {
          newSells.push({
            sellerId: data.sellerId,
            productId: data.productId,
            price: data.price,
            count: data.count,
            thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
          })
        })
      } else {
        newSells.push({
          sellerId: '',
          productId: '',
          price: 0,
          count: 1,
          thirdPartyCouponMerchantId: null,
        })
      }
      if (newSells.length > 0 && newSells[0].productId !== '') {
        setExpanded(true)
      }
      setSells(newSells)
    }
  }, [order.loading])
  function handleClear({ index }) {
    let newSells = _.cloneDeep(sells)
    if (newSells.length === 1) {
      newSells = [
        {
          sellerId: '',
          productId: '',
          price: 0,
          count: 0,
          thirdPartyCouponMerchantId: null,
        },
      ]
    }
    newSells[index] = {
      ...newSells[index],
      sellerId: '',
      productId: '',
      price: 0,
      count: 0,
      thirdPartyCouponMerchantId: null,
    }

    setSells(newSells)
    handleBillChange({
      key: 'productOrders',
      value: newSells
        .filter(d => d.count > 0)
        .map(data => ({
          sellerId: data.sellerId,
          productId: data.productId,
          price: data.price,
          count: data.count,
          isLocked: data.isLocked,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
        })),
    })
  }

  function handleMerchantSellsChange({ key, value, index }) {
    const newSells = _.cloneDeep(sells)
    newSells[index][key] = value
    setSells(newSells)
    if (key === 'price' || key === 'count' || key === 'sellerId') {
      handleBillChange({
        key: 'productOrders',
        value: newSells
          .filter(d => d.count > 0)
          .map(data => ({
            sellerId: data.sellerId,
            productId: data.productId,
            price: data.price,
            count: data.count,
            isLocked: data.isLocked,
            thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
          })),
      })
    }
  }
  function handleAddSells() {
    const newSells = _.cloneDeep(sells)
    newSells.push({
      sellerId: '',
      productId: '',
      price: 0,
      count: 0,
      thirdPartyCouponMerchantId: null,
    })
    setSells(newSells)
  }

  function handleRemoveSells({ index }) {
    let newSells = _.cloneDeep(sells)
    newSells = newSells.filter((_d, idx) => idx !== index)
    setSells(newSells)
    handleBillChange({
      key: 'productOrders',
      value: newSells,
    })
  }

  function handleProductChange({ index, value }) {
    const newSells = _.cloneDeep(sells)
    newSells[index] = value
    setSells(newSells)
    handleBillChange({
      key: 'productOrders',
      value: newSells
        .filter(d => d.count > 0)
        .map(data => ({
          sellerId: data.sellerId,
          productId: data.productId,
          price: data.price,
          count: data.count,
          isLocked: data.isLocked,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
        })),
    })
  }
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }
  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        data-testid="merchantSell"
        onClick={handleAccordionClick}
        // 收合時顯示「已填 N 筆 · NT$ 小計」（只讀畫面上的項目列，不參與計算或送出；比照打帳單）
        summaryMeta={!expanded && panelSummary(
          sells.filter(d => d.productId).length,
          sells.filter(d => d.productId).reduce((total, d) => total + d.price * d.count, 0)
        )}
        style={{ width: '100%' }}
      >
        <p className="m-0 !text-[16px] font-bold text-text">店販銷售</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          {sells.map((data, index) => (
            <MerchantSells
              key={index}
              sells={data}
              index={index}
              onChange={handleMerchantSellsChange}
              onProductChange={handleProductChange}
              onClear={handleClear}
              addSells={handleAddSells}
              removeSells={handleRemoveSells}
              first={index === 0}
              last={index + 1 === sells.length}
              sellsItem={sells}
              productLength={sells.length}
              thirdPartTicket={thirdPartTicket}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
