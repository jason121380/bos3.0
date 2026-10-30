import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import billContext from 'context/keyInContext'
import cloneDeep from 'lodash/cloneDeep'
import React, { useContext } from 'react'
import uuid from 'lib/uuid'
import CouponSells from 'views/OrderCreate/CouponSells'
import { panelSummary } from './summary'
import useFetchTickets from 'hooks/useFetchTickets'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import idx from 'idx'
import TeachingModeContext from 'context/teachingModeContext'

import CouponSellModal from '../CouponSellModal'

const styles = {
  details: 'overflow-x-auto',
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
  couponTeachTitle: 'text-[0.8125rem] ml-[34px] font-bold',
}

export default function PannelCouponSells({ expanded, onPanelClick, reset }) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const {
    handleBillChange, couponSells, setCouponSells, bill
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

  React.useEffect(() => {
    if (!tickets.loading && !serviceCategoriesData.loading) {
      const conponInModal = idx(tickets, _ => _.data.tickets)
      const couponCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      setConpunInModal(conponInModal)
      setCouponCategories(couponCategories)
    } else {
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
  }, [setCouponSells])

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
  }, [reset, setCouponSells])

  const handleAddCouponSell = () => {
    const newCouponSells = cloneDeep(couponSells)
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
    let newCouponSells = cloneDeep(couponSells)
    newCouponSells = newCouponSells.filter((_d, idx) => idx !== index)
    setCouponSells(newCouponSells)
    // 刪掉的列也要從帳單移除（原本只改畫面，刪掉的卡券仍計入合計並送出）
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
    setFocusRow(newCouponSells.length - 1)
  }

  const handleFildChange = ({ index, value }) => {
    const newCouponSells = cloneDeep(couponSells)
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
    let newCouponSells = cloneDeep(couponSells)
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
        onClick={onPanelClick}
        summaryMeta={!expanded && panelSummary(
          bill.ticketOrders.length,
          bill.ticketOrders.reduce((total, d) => total + d.price * d.count, 0)
        )}
        data-testid="couponSells"
        style={{ width: '100%' }}
      >
        <p className={`m-0 ${styles.heading}`}>預收卡販賣</p>
        {teachingMode && (
          <p className={`m-0 ${styles.couponTeachTitle}`}>
            這邊賣的卡將『不入業績』，但會先跟客人『收費』**
          </p>
        )}
      </AccordionSummary>
      <AccordionDetails className={styles.details}>
        <div className={styles.fieldOutter}>
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
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
