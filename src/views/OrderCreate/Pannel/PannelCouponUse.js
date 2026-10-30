import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { Style as StyleIcon } from 'ui/icons'
import billContext from 'context/keyInContext'
import cloneDeep from 'lodash/cloneDeep'
import React, { Fragment, useContext } from 'react'
import uuid from 'lib/uuid'
import CouponUse from 'views/OrderCreate/CouponUse'
import { panelSummary } from './summary'
import useFetchGetTicketRecordsForOrderV2 from 'hooks/useFetchGetTicketRecordsForOrderV2'
import TeachingModeContext from 'context/teachingModeContext'

const styles = {
  details: 'overflow-x-auto',
  heading: '!text-[16px] font-bold text-[rgb(var(--text))] flex items-center',
  fieldOutter: 'flex justify-start items-start flex-col',
  couponTeachTitle: 'text-[0.8125rem] ml-[34px] font-bold',
}

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（ticketRecordsForOrderLazyV2）；只在 [bill.customerId] 變動時呼叫，補上會每次 render 重跑
  }, [bill.customerId])

  React.useEffect(() => {
    if (!ticketRecordsForOrderLazyDataV2.loading && ticketRecordsForOrderLazyDataV2.data !== undefined) {
      const data = ticketRecordsForOrderLazyDataV2.data.ticketRecordsForOrderV2
      const totalCount = data.reduce((a, b) => a + b.ticketRecordForOrder.length ,0)
      setTotalCoupons(totalCount)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
    const newCouponUsage = cloneDeep(couponUsage)
    const newHelper = cloneDeep(helper)
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
    const newCouponUsage = cloneDeep(couponUsage)
    const newHelper = cloneDeep(helper)
    newCouponUsage.splice(index, 1)
    newHelper.splice(index, 1)
    setCouponUsage(newCouponUsage)
    setHelper(newHelper)
    // 刪掉的列也要從帳單移除（原本只改畫面，刪掉的預收卡仍計入並送出）
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
  function handleFildChange({ index, value, key, price }) {
    const newCouponUsage = cloneDeep(couponUsage)
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
    let newCouponUsage = cloneDeep(couponUsage)
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
    const newHelper = cloneDeep(helper)
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
        onClick={onPanelClick}
        summaryMeta={!expanded && panelSummary(bill.useTicketOrders.length)}
        data-testid="panelCouponUse"
        style={{ width: '100%' }}
      >
        <p className={`m-0 ${styles.heading}`}>使用預收卡</p>
        {teachingMode && (
          <p className={`m-0 ${styles.couponTeachTitle}`}>
            使用卡券必須設定好助理才能輸入助理**
          </p>
        )}
        {totalCoupons !== 0 && (
          <Fragment>
            <p className={`m-0 ${styles.heading}`}>
              <StyleIcon />
            </p>
            <span>{`x${totalCoupons}`}</span>
          </Fragment>
        )}
      </AccordionSummary>
      <AccordionDetails className={styles.details}>
        <div className={styles.fieldOutter}>
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
