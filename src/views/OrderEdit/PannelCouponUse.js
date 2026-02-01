/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import billContext from 'context/keyInContext'
import useFetchOrder from 'hooks/useFetchOrder'
import _ from 'lodash'
import React from 'react'
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
    fontSize: '15px !important',
    fontWeight: theme.typography.fontWeightRegular,
  }),
  subHeading: css({
    fontSize: theme.typography.pxToRem(12) + '!important',
    fontWeight: theme.typography.fontWeightRegular + '!important',
    marginLeft: '5px',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

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
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
      >
        <Typography css={styles.heading}>使用預收卡</Typography>
        <Typography css={styles.subHeading}>編輯訂單不得編輯預收卡使用</Typography>
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
