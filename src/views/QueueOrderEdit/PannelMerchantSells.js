/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion-compat'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import { useState, useEffect, useContext } from 'react'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import MerchantSells from './MerchantSells'

const styles = {
  details: css({
    overflowX: 'scroll',
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
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        data-testid="merchantSell"
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
      >
        <p className="m-0" css={styles.heading}>店販銷售</p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
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
