/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Pannel/summary'
import billContext from 'context/keyInContext'
import { useFetchProductOrder } from 'hooks/useFetchOrder'
import _ from 'lodash'
import React from 'react'
import uuid from 'uuid'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import MerchantSells from './MerchantSells'

const styles = {
  details: css({
    overflowX: 'auto',
  }),
  heading: css({
    fontSize: '16px !important',
    fontWeight: 'bold',
    color: 'rgb(var(--text))',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

export default function PannelMerchantSells({ thirdPartTicket, expanded, setExpanded  }) {
  const {
    handleBillChange, orderId, sells, setSells, pData, setPData
  } = React.useContext(billContext)
  const productOrder = useFetchProductOrder({ id: orderId })
  const [focusRow, setFocusRow] = React.useState(0)
  
  const getData = value => {
    !pData.length && setPData(value)
  }

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
    let newSells = _.cloneDeep(sells)
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
    setFocusRow(index)
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
    let newSells = _.cloneDeep(sells)
    newSells = newSells.filter((_d, idx) => idx !== index)
    setSells(newSells)
    const newSellsNoId = newSells.map(({ id, ...keep }) => keep)
    handleBillChange({
      key: 'productOrders',
      value: newSellsNoId,
    })
    setFocusRow(newSells.length - 1)
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
        style={{ width: '100%' }}
        summaryMeta={!expanded && panelSummary(
          sells.filter(d => d.productId).length,
          sells.filter(d => d.productId).reduce((total, d) => total + d.price * d.count, 0)
        )}
      >
        <p className="m-0" css={styles.heading}>店販銷售</p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
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
              thirdPartTicket={thirdPartTicket}
              getData={getData}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
