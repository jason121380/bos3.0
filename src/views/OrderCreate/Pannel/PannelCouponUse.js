/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon, Style as StyleIcon } from 'ui/icons'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import React, { Fragment, useContext } from 'react'
import uuid from 'uuid'
import CouponUse from 'views/OrderCreate/CouponUse'
import styles from 'views/OrderCreate/styles/PannelCouponUse'
import useFetchGetTicketRecordsForOrderV2 from 'hooks/useFetchGetTicketRecordsForOrderV2'
import TeachingModeContext from 'context/teachingModeContext'

export default function PannelCouponUse({ expanded, onPanelClick, display, reset }) {
  const { handleBillChange, bill } = useContext(billContext)
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const [couponUsage, setCouponUsage] = React.useState([])
  const [totalCoupons, setTotalCoupons] = React.useState(0)
  const [ticketRecordsForOrderLazyV2, ticketRecordsForOrderLazyDataV2] = useFetchGetTicketRecordsForOrderV2()
  const [helper, setHelper] = React.useState([[]])
  const [focusRow, setFocusRow] = React.useState(0)
  const [focus, setFocus] = React.useState('')

  React.useEffect(() => {
    if (bill.customerId) {
      ticketRecordsForOrderLazyV2({
        variables: {
          customerId: bill.customerId
        }
      })
      setCouponUsage([
        {
          id: uuid(),
          customerTicketId: '',
          useTicketOrderHelpers: [],
        },
      ])
    } else {
      setTotalCoupons(0)
      setHelper([[]])
    }
  }, [bill.customerId])

  React.useEffect(() => {
    if (!ticketRecordsForOrderLazyDataV2.loading && ticketRecordsForOrderLazyDataV2.data !== undefined) {
      const data = ticketRecordsForOrderLazyDataV2.data.ticketRecordsForOrderV2
      const totalCount = data.reduce((a, b) => a + b.ticketRecordForOrder.length ,0)
      setTotalCoupons(totalCount)
    }
  }, [ticketRecordsForOrderLazyDataV2.loading])

  React.useEffect(() => {
    setCouponUsage([
      {
        id: uuid(),
        customerTicketId: '',
        useTicketOrderHelpers: [],
      },
    ])
  }, [])

  React.useEffect(() => {
    if(reset === 'reset'){
      setTotalCoupons(0)
      setCouponUsage([
        {
          id: uuid(),
          customerTicketId: '',
          useTicketOrderHelpers: [],
        },
      ])
      setHelper([])
    }
  }, [reset])

  function handleAddCouponUse() {
    const newCouponUsage = _.cloneDeep(couponUsage)
    const newHelper = _.cloneDeep(helper)
    newCouponUsage.push({
      id: uuid(),
      customerTicketId: '',
      useTicketOrderHelpers: [],
    })
    newHelper.push([])
    setCouponUsage(newCouponUsage)
    setHelper(newHelper)
  }
  function handleRemoveCouponUse({ index }) {
    const newCouponUsage = _.cloneDeep(couponUsage)
    const newHelper = _.cloneDeep(helper)
    newCouponUsage.splice(index, 1)
    newHelper.splice(index, 1)
    setCouponUsage(newCouponUsage)
    setHelper(newHelper)
  }
  function handleFildChange({ index, value, key, price }) {
    const newCouponUsage = _.cloneDeep(couponUsage)
    newCouponUsage[index][key] = value
    newCouponUsage[index]['price'] = price
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
          id: uuid(),
          customerTicketId: '',
          useTicketOrderHelpers: [],
        },
      ]
    }
    newCouponUsage[index] = {
      id: uuid(),
      customerTicketId: '',
      useTicketOrderHelpers: [],
    }
    setCouponUsage(newCouponUsage)
    const newHelper = _.cloneDeep(helper)
    newHelper[index] = []
    setHelper(newHelper)
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
  return (
    <Accordion key="panelCouponUse" expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={onPanelClick}
        data-testid="panelCouponUse"
        style={{ width: '100%' }}
      >
        <p className="m-0" css={styles.heading}>使用預收卡</p>
        {teachingMode && (
          <p className="m-0" css={styles.couponTeachTitle}>
            使用卡券必須設定好助理才能輸入助理**
          </p>
        )}
        {totalCoupons !== 0 && (
          <Fragment>
            <p className="m-0" css={styles.heading}>
              <StyleIcon />
            </p>
            <span>{`x${totalCoupons}`}</span>
          </Fragment>
        )}
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          {display &&
            couponUsage.map((data, index) => (
              <CouponUse
                couponUsage={data}
                couponUsages={couponUsage}
                key={data.id + index}
                index={index}
                addCouponUse={handleAddCouponUse}
                removeCouponUse={handleRemoveCouponUse}
                first={index === 0}
                last={index + 1 === couponUsage.length}
                onChange={handleFildChange}
                onClear={handleClear}
                helper={helper}
                setHelper={setHelper}
                ticketRecordsForOrderLazyDataV2={ticketRecordsForOrderLazyDataV2}
                focusFirstField={index === 0}
                focusRow={focusRow}
                setFocusRow={setFocusRow}
                expanded={expanded}
                isLast={couponUsage.length - 1 === index}
                focus={focus}
                setFocus={setFocus}
              />
            ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
