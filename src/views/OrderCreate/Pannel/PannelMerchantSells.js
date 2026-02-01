/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import React from 'react'
import MerchantSells from 'views/OrderCreate/MerchantSells'
import styles from 'views/OrderCreate/styles/PannelMerchantSells'

function PannelMerchantSells({ expanded, onPanelClick, thirdPartTicket, reset }) {
  const {
    handleBillChange, sells, setSells,
    pData, setPData
  } = React.useContext(billContext)
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
    setSells([
      {
        sellerId: '',
        productId: '',
        price: 0,
        count: 1,
        thirdPartyCouponMerchantId: null,
      },
    ])
  }, [])

  React.useEffect(() => {
    if(reset === 'reset'){
      setSells([{
        sellerId: '',
        productId: '',
        price: 0,
        count: 1,
        thirdPartyCouponMerchantId: null,
      },])
      setFocusRow(0)
    }
  }, [reset])

  function handleClear({ index }) {
    let newSells = _.cloneDeep(sells)
    if (newSells.length === 1) {
      newSells = [
        {
          sellerId: '',
          productId: '',
          price: 0,
          count: 1,
          thirdPartyCouponMerchantId: null,
        },
      ]
    }
    newSells[index] = {
      ...newSells[index],
      sellerId: '',
      productId: '',
      price: 0,
      count: 1,
      thirdPartyCouponMerchantId: null,
    }
    setSells(newSells)
    handleBillChange({
      key: 'productOrders',
      value: newSells
        .filter(d => d.count > 0 && d.productId && d.sellerId)
        .map(data => ({
          sellerId: data.sellerId,
          productId: data.productId,
          price: data.price,
          count: data.count,
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
      sellerId: '',
      productId: '',
      price: 0,
      count: 1,
      thirdPartyCouponMerchantId: null,
    })
    setSells(newSells)
    setFocusRow(newSells.length - 1)
  }

  function handleRemoveSells({ index }) {
    let newSells = _.cloneDeep(sells)
    newSells = newSells.filter((_d, idx) => idx !== index)
    setSells(newSells)
    handleBillChange({
      key: 'productOrders',
      value: newSells,
    })
    setFocusRow(newSells.length - 1)
  }
  function handleProductChange({ value, index }) {
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
          price: data.price || 0,
          count: data.count,
          isLocked: data.isLocked,
          thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
        })),
    })
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
    <Accordion key="panelMerchantSells" expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={onPanelClick}
        data-testid="merchantSell"
        style={{ width: '100%' }}
      >
        <Typography css={styles.heading}>店販銷售</Typography>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          {sells.map((data, index) => (
            <MerchantSells
              key={index}
              focusFirstField={index === focusRow}
              focusRow={focusRow}
              sellsItem={data}
              index={index}
              expanded={expanded}
              changeRowFocus={handleChangeFocusRow}
              onChange={handleMerchantSellsChange}
              onProductChange={handleProductChange}
              onClear={handleClear}
              addSells={handleAddSells}
              removeSells={handleRemoveSells}
              first={index === 0}
              last={index + 1 === sells.length}
              sells={sells}
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

export default React.memo(PannelMerchantSells)
