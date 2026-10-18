/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import { useEffect, useRef, useContext, useState } from 'react'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import CouponUse from './CouponUse'

const styles = {
  root: css({
    width: '100%',
    marginTop: theme.spacing(3),
  }),
  details: css({
    overflowX: 'auto',
  }),
  heading: css({
    fontSize: '16px !important',
    fontWeight: 'bold',
    color: 'rgb(var(--text))',
  }),
  subHeading: css({
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightRegular,
    color: 'rgb(var(--text-secondary))',
    marginLeft: '8px',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

export default function PannelCouponUse() {
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

  }, [order.loading])

  useEffect(() => {
    if (couponUsage.length > 0 && couponUsage[0].customerTicketId !== '') {
      setExpanded(true)
    }
  }, [couponUsage])

  function handleAddCouponUse() {
    const newCouponUsage = _.cloneDeep(couponUsage)
    newCouponUsage.push({
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
          customerTicketId: '',
          useTicketOrderHelpers: [],
        },
      ]
    }
    newCouponUsage[index] = {
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
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} onClick={handleAccordionClick}>
        <p className="m-0" css={styles.heading}>使用預收卡</p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
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
