import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Pannel/summary'
import billContext from 'context/keyInContext'
import { useFetchProductOrder } from 'hooks/useFetchOrder'
import cloneDeep from 'lodash/cloneDeep'
import React from 'react'
import uuid from 'lib/uuid'

import MerchantSells from './MerchantSells'

export default function PannelMerchantSells({ thirdPartTicket }) {
  const { handleBillChange, orderId } = React.useContext(billContext)
  const [sells, setSells] = React.useState([])
  const productOrder = useFetchProductOrder({ id: orderId })
  const [expanded, setExpanded] = React.useState(false)
  const [focusRow, setFocusRow] = React.useState(0)

  React.useEffect(() => {
    if (expanded) {
      setFocusRow(0)
    }
  }, [expanded])

  React.useEffect(() => {
    if (!productOrder.loading && productOrder.data) {
      const newSells =
        productOrder.data.order.productOrders.length > 0
          ? productOrder.data.order.productOrders.map(data => ({
            id: data.id,
            sellerId: data.seller.id,
            productId: data.product.id,
            price: data.price,
            count: data.count,
            isLocked: data.product.isLocked,
            thirdPartyCouponMerchantId: data.thirdPartyPayId,
          }))
          : [
            {
              id: uuid(),
              sellerId: '',
              productId: '',
              price: 0,
              count: 1,
              thirdPartyCouponMerchantId: null,
            },
          ]

      if (newSells.length > 0 && newSells[0].productId !== '' && newSells[0].sellerId !== '') {
        setExpanded(true)
      }
      setSells(newSells)
    }
  }, [productOrder.loading, productOrder.data])

  function handleClear({ index }) {
    let newSells = cloneDeep(sells)
    if (newSells.length === 1) {
      newSells = [
        {
          id: uuid(),
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
    const newSells = cloneDeep(sells)
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
    const newSells = cloneDeep(sells)
    newSells.push({
      id: uuid(),
      sellerId: '',
      productId: '',
      price: 0,
      count: 0,
      thirdPartyCouponMerchantId: null,
    })
    setSells(newSells)
    setFocusRow(newSells.length - 1)
  }

  function handleRemoveSells({ index }) {
    let newSells = cloneDeep(sells)
    newSells = newSells.filter((_d, idx) => idx !== index)
    setSells(newSells)
    const newSellsNoId = newSells.map(({ id, ...keep }) => keep)
    handleBillChange({
      key: 'productOrders',
      value: newSellsNoId,
    })
  }

  function handleProductChange({ index, value }) {
    const newSells = cloneDeep(sells)
    newSells[index] = value
    setSells(newSells)
    handleBillChange({
      key: 'productOrders',
      value: newSells
        .filter(d => d.count > 0)
        .map(data => ({
          sellerId: data.sellerId,
          productId: data.productId,
          price: data.price || 0,
          count: data.count,
          isLocked: data.isLocked,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
        })),
    })
  }
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }
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
          sells.filter(d => d.productId).length,
          sells.filter(d => d.productId).reduce((total, d) => total + d.price * d.count, 0)
        )}
      >
        <p className="m-0 !text-[16px] font-bold text-[rgb(var(--text))]">店販銷售</p>
      </AccordionSummary>
      <AccordionDetails className="overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          {sells.map((data, index) => (
            <MerchantSells
              key={`merhant-pannel-${data.id}-${index}`}
              expanded={expanded}
              focusFirstField={index === focusRow}
              changeRowFocus={handleChangeFocusRow}
              focusRow={focusRow}
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
              setFocusRow={setFocusRow}
              thirdPartTicket={thirdPartTicket}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
