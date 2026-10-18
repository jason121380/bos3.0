/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import billContext from 'context/keyInContext'
import useFetchOrder from 'hooks/useFetchOrder'
import _ from 'lodash'
import React from 'react'
import uuid from 'uuid'
import useFetchTickets from 'hooks/useFetchTickets'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import CouponSells from './CouponSells'
import CouponSellModal from './CouponSellModal'

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
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

export default function PannelCouponSells({ expanded, setExpanded }) {
  const {
    handleBillChange, orderId, pannelEditable,
    couponSells, setCouponSells, tData, setTData
  } = React.useContext(billContext)
  const order = useFetchOrder({ id: orderId })
  const useHandleBillChangeRef = React.useRef(handleBillChange)
  const [couponModalOpen, setCouponModalOpen] = React.useState(false)
  const [conpunInModal, setConpunInModal] = React.useState([])

  const [couponCategories, setCouponCategories] = React.useState([])
  const [selectedCategorie, setSelectedCategorie] = React.useState([])
  const [selectedCategorieName, setSelectedCategorieName] = React.useState([])
  const [pageSetting, setPageSetting] = React.useState({
    keyword: '',
    categoryIds: [],
    isLaunched: true
  })

  const [focusRow, setFocusRow] = React.useState(0)
  const tickets = useFetchTickets(pageSetting)
  const serviceCategoriesData = useFetchServiceCategories()

  const getData = value => {
    !tData.length && setTData(value)
  }

  React.useEffect(() => {
    if (expanded) {
      setFocusRow(0)
    }
  }, [expanded])

  React.useEffect(() => {
    if (!tickets.loading && !serviceCategoriesData.loading) {
      const conponInModal = idx(tickets, _ => _.data.tickets)
      const couponCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setConpunInModal(conponInModal)
      setCouponCategories(couponCategories)
    } else {
    }
  }, [tickets.loading, serviceCategoriesData.loading])
  React.useEffect(() => {
    if (couponSells.length > 0) {
      useHandleBillChangeRef.current({
        key: 'ticketOrders',
        value: couponSells
          .filter(d => d.serviceId)
          .map(data => ({
            serviceId: data.serviceId,
            availableCount: data.availableCount,
            price: data.price,
            count: data.count,
            remark: data.remark,
            isLocked: data.isLocked,
            intoPerformanceWhileBuying: data.intoPerformanceWhileBuying,
          })),
      })
    }
  }, [couponSells])
  React.useEffect(() => {
    if (!order.loading && order.data) {
      const newCouponSells =
        order.data.order.ticketOrders.length > 0
          ? order.data.order.ticketOrders.map(ticketOrder => ({
            id: uuid(),
            serviceId: ticketOrder.service.id,
            availableCount: ticketOrder.availableCount,
            price: ticketOrder.price,
            count: ticketOrder.count,
            remark: ticketOrder.remark,
            isLocked: ticketOrder.service.isLocked,
            intoPerformanceWhileBuying: ticketOrder.intoPerformanceWhileBuying,
          }))
          : [
            {
              id: uuid(),
              serviceId: '',
              availableCount: 0,
              price: 0,
              count: 1,
              remark: '',
            },
          ]

      if (newCouponSells.length > 0 && newCouponSells[0].serviceId !== '') {
        setExpanded(true)
      }
      setCouponSells(newCouponSells)
    }
  }, [order.loading, order.data])

  function handleAddCouponSell() {
    const newCouponSells = _.cloneDeep(couponSells)
    newCouponSells.push({
      id: uuid(),
      serviceId: '',
      availableCount: 0,
      price: 0,
      count: 1,
      remark: '',
    })
    setCouponSells(newCouponSells)
    setFocusRow(newCouponSells.length - 1)
  }
  function handleRemoveCouponSell({ index }) {
    let newCouponSells = _.cloneDeep(couponSells)
    newCouponSells = newCouponSells.filter((_d, idx) => idx !== index)
    setCouponSells(newCouponSells)
    setFocusRow(newCouponSells.length - 1)
  }

  function handleFildChange({ index, value }) {
    const newCouponSells = _.cloneDeep(couponSells)
    newCouponSells[index] = value
    handleBillChange({
      key: 'ticketOrders',
      value: newCouponSells
        .filter(d => d.serviceId)
        .map(data => ({
          serviceId: data.serviceId,
          availableCount: data.availableCount,
          price: data.price,
          count: data.count,
          remark: data.remark,
          isLocked: data.isLocked,
          intoPerformanceWhileBuying: false,
        })),
    })
    setCouponSells(newCouponSells)
  }
  function handleClear({ index }) {
    let newCouponSells = _.cloneDeep(couponSells)
    if (newCouponSells.length === 1) {
      newCouponSells = [
        {
          id: uuid(),
          serviceId: '',
          availableCount: 0,
          price: 0,
          count: 1,
          remark: '',
        },
      ]
    }
    newCouponSells[index] = {
      ...newCouponSells[index],
      serviceId: '',
      availableCount: 0,
      price: 0,
      count: 1,
      remark: '',
    }
    setCouponSells(newCouponSells)
    handleBillChange({
      key: 'ticketOrders',
      value: newCouponSells
        .filter(d => d.serviceId)
        .map(data => ({
          serviceId: data.serviceId,
          availableCount: data.availableCount,
          price: data.price,
          count: data.count,
          remark: data.remark,
        })),
    })
    setFocusRow(index)
  }

  const handleChangeFocusRow = index => {
    if (index < couponSells.length) {
      setFocusRow(index)
    }
    if (index === couponSells.length) {
      handleAddCouponSell()
    }
  }

  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }

  const handleOpenCouponModal = () => {
    if (!tickets.loading && !serviceCategoriesData.loading) {
      setCouponModalOpen(true)
    }
  }

  const handleCloseCouponModal = () => {
    setCouponModalOpen(false)
  }

  return (
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        data-testid="couponSells"
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
      >
        <p className="m-0" css={styles.heading}>預收卡販賣</p>
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
          {couponModalOpen && (
            <CouponSellModal
              couponModalOpen={couponModalOpen}
              closeModal={handleCloseCouponModal}
              coupons={conpunInModal}
              onChange={handleFildChange}
              couponsOnPannel={couponSells}
              couponsLength={couponSells.length}
              setCouponModalOpen={setCouponModalOpen}
              couponCategories={couponCategories}
              setSelectedCategorie={setSelectedCategorie}
              selectedCategorie={selectedCategorie}
              setSelectedCategorieName={setSelectedCategorieName}
              selectedCategorieName={selectedCategorieName}
              setPageSetting={setPageSetting}
            />
          )}
          {couponSells.map((data, index) => (
            <CouponSells
              index={index}
              couponSell={data}
              expanded={expanded}
              focusFirstField={index === focusRow}
              focusRow={focusRow}
              changeRowFocus={handleChangeFocusRow}
              key={`couponSells-${data.id}`}
              addCouponSell={handleAddCouponSell}
              removeCouponSell={handleRemoveCouponSell}
              first={index === 0}
              last={index + 1 === couponSells.length}
              onChange={handleFildChange}
              onClear={handleClear}
              isTicketSellingEditable={pannelEditable.isTicketSellingEditable}
              handleOpenCouponModal={handleOpenCouponModal}
              setFocusRow={setFocusRow}
              getData={getData}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
