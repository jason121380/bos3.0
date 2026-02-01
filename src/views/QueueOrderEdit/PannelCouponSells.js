/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import { useContext, useState, useRef, useEffect } from 'react'
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
    fontSize: '15px !important',
    fontWeight: theme.typography.fontWeightRegular,
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

export default function PannelCouponSells() {
  const { handleBillChange, order } = useContext(billContext)
  const [couponSells, setCouponSells] = useState([])
  const useHandleBillChangeRef = useRef(handleBillChange)
  const [expanded, setExpanded] = useState(false)
  const [couponModalOpen, setCouponModalOpen] = useState(false)
  const [conpunInModal, setConpunInModal] = useState([])
  const [couponCategories, setCouponCategories] = useState([])
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [selectedCategorieName, setSelectedCategorieName] = useState([])
  const [pageSetting, setPageSetting] = useState({
    keyword: '',
    categoryIds: [],
    isLaunched: true
  })

  const tickets = useFetchTickets(pageSetting)
  const serviceCategoriesData = useFetchServiceCategories()

  useEffect(() => {
    if (!tickets.loading && !serviceCategoriesData.loading) {
      const conponInModal = idx(tickets, _ => _.data.tickets)
      const couponCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setConpunInModal(conponInModal)
      setCouponCategories(couponCategories)
    } else {
    }
  }, [tickets.loading, serviceCategoriesData.loading])

  useEffect(() => {
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

  useEffect(() => {
    if (!order.loading) {
      let newTicketSells = []
      const orderDetail = JSON.parse(idx(order, _ => _.data.getOrderInputByQueueId))
      if (orderDetail.ticketOrders.length > 0) {
        orderDetail.ticketOrders.map(ticketOrder =>
          newTicketSells.push({
            id: uuid(),
            serviceId: ticketOrder.serviceId,
            availableCount: ticketOrder.availableCount,
            price: ticketOrder.price,
            count: ticketOrder.count,
            remark: ticketOrder.remark,
            intoPerformanceWhileBuying: ticketOrder.intoPerformanceWhileBuying,
          })
        )
      } else {
        newTicketSells.push({
          id: uuid(),
          serviceId: '',
          availableCount: 0,
          price: 0,
          count: 1,
          remark: '',
        })
      }
      if (newTicketSells.length > 0 && newTicketSells[0].serviceId !== '') {
        setExpanded(true)
      }
      setCouponSells(newTicketSells)
    }
  }, [order.loading])

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
  }
  function handleRemoveCouponSell({ index }) {
    let newCouponSells = _.cloneDeep(couponSells)
    newCouponSells = newCouponSells.filter((_d, idx) => idx !== index)
    setCouponSells(newCouponSells)
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
        <Typography css={styles.heading}>預收卡販賣</Typography>
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
              key={`couponSells-${data.id}`}
              addCouponSell={handleAddCouponSell}
              removeCouponSell={handleRemoveCouponSell}
              first={index === 0}
              last={index + 1 === couponSells.length}
              onChange={handleFildChange}
              onClear={handleClear}
              isTicketSellingEditable={true}
              handleOpenCouponModal={handleOpenCouponModal}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
