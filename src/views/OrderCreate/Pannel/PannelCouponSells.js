/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from 'ui/icons'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import React, { useContext } from 'react'
import uuid from 'uuid'
import CouponSells from 'views/OrderCreate/CouponSells'
import styles from 'views/OrderCreate/styles/PannelCouponSells'
import useFetchTickets from 'hooks/useFetchTickets'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import TeachingModeContext from 'context/teachingModeContext'

import CouponSellModal from '../CouponSellModal'

export default function PannelCouponSells({ expanded, onPanelClick, reset }) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const {
    handleBillChange, couponSells, setCouponSells, tData, setTData
  } = React.useContext(billContext)
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
    if (!tickets.loading && !serviceCategoriesData.loading) {
      const conponInModal = idx(tickets, _ => _.data.tickets)
      const couponCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setConpunInModal(conponInModal)
      setCouponCategories(couponCategories)
    } else {
    }
  }, [tickets.loading, serviceCategoriesData.loading])

  React.useEffect(() => {
    if (expanded) {
      setFocusRow(0)
    }
  }, [expanded])

  React.useEffect(() => {
    setCouponSells([
      {
        id: uuid(),
        serviceId: '',
        availableCount: 0,
        price: 0,
        count: 1,
        remark: '',
        intoPerformanceWhileBuying: false,
      },
    ])
  }, [])

  React.useEffect(() => {
    if(reset === 'reset'){
      setCouponSells([
        {
          id: uuid(),
          serviceId: '',
          availableCount: 0,
          price: 0,
          count: 1,
          remark: '',
          intoPerformanceWhileBuying: false,
        },
      ])
    }
  }, [reset])

  const handleAddCouponSell = () => {
    const newCouponSells = _.cloneDeep(couponSells)
    newCouponSells.push({
      id: uuid(),
      serviceId: '',
      availableCount: 0,
      price: 0,
      count: 1,
      remark: '',
      intoPerformanceWhileBuying: false,
    })
    setCouponSells(newCouponSells)
    setFocusRow(newCouponSells.length - 1)
  }
  const handleRemoveCouponSell = ({ index }) => {
    let newCouponSells = _.cloneDeep(couponSells)
    newCouponSells = newCouponSells.filter((_d, idx) => idx !== index)
    setCouponSells(newCouponSells)
    setFocusRow(newCouponSells.length - 1)
  }

  const handleFildChange = ({ index, value }) => {
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
          intoPerformanceWhileBuying: data.intoPerformanceWhileBuying,
        })),
    })
    setCouponSells(newCouponSells)
  }
  const handleClear = ({ index }) => {
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
          intoPerformanceWhileBuying: false,
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
      intoPerformanceWhileBuying: false,
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
          isLocked: data.isLocked,
          intoPerformanceWhileBuying: data.intoPerformanceWhileBuying,
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

  const handleOpenCouponModal = () => {
    if (!tickets.loading && !serviceCategoriesData.loading) {
      setCouponModalOpen(true)
    }
  }

  const handleCloseCouponModal = () => {
    setCouponModalOpen(false)
  }

  return (
    <Accordion key="panelCouponSells" expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={onPanelClick}
        data-testid="couponSells"
        style={{ width: '100%' }}
      >
        <Typography css={styles.heading}>預收卡販賣</Typography>
        {teachingMode && (
          <Typography css={styles.couponTeachTitle}>
            這邊賣的卡將『不入業績』，但會先跟客人『收費』**
          </Typography>
        )}
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
              key={`couponSells-pannel-${data.id}-${index}`}
              addCouponSell={handleAddCouponSell}
              removeCouponSell={handleRemoveCouponSell}
              first={index === 0}
              last={index + 1 === couponSells.length}
              onChange={handleFildChange}
              onClear={handleClear}
              couponSells={couponSells}
              changeRowFocus={handleChangeFocusRow}
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
