import React from 'react'
import { useFetchLazyTicketRecords } from 'hooks/useFetchTicketRecords'
import { ticketHelperType, isSameHelperType } from './ticketHelperType'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'

// 「使用預收卡」一列的狀態與處理（帳單詳細、掛單詳細原本各一份、逐字相同，2026/10/21 合併；程式原樣搬入）：
// 金額、助理欄位（依卡券綁定服務的助理設定展開）、選卡券、改助理、清除。畫面仍在各頁的 CouponUse。
// 重新開單與打帳單的同名元件邏輯不同（帶入金額的方式、焦點處理），沒有合併。
export default function useCouponUseRow({ index, couponUsage, onChange, onClear }) {
  const [price, setPrice] = React.useState(0)
  const [ticketOrderHelpers, setTicketOrderHelpers] = React.useState(
    couponUsage.useTicketOrderHelpers
  )
  const ticketRecord = useFetchLazyTicketRecords()
  React.useEffect(() => {
    if (!ticketRecord.response.loading && ticketRecord.response.data) {
      setTicketOrderHelpers(prev => {
        const next = prev.concat(
          ticketRecord.response.data.ticketRecords.data
            .map(data => data.service.helperDeductionSetting)
            .reduce((a, b) => a.concat(b), [])
            .map(data =>
              data.nameList.map(name => {
                return {
                  type: ticketHelperType(data.type, name),
                  helperDeductiontype: data.helperDeductionType,
                }
              })
            )
            .reduce((a, b) => a.concat(b), [])
            .filter(data => !prev.find(i => isSameHelperType(i.type, data.type)))
            .map(data => ({
              type: data.type,
              isDesignate: false,
              helperId: '',
              helperDeductiontype: data.helperDeductiontype,
            }))
        )
        return next
      })
    }
  }, [ticketRecord.response.loading, ticketRecord.response.data])
  const useFetchTicketRecodRef = React.useRef(ticketRecord.fetchTicketRecod)

  React.useEffect(() => {
    setPrice(couponUsage.price)
    if (couponUsage.customerTicketId)
      useFetchTicketRecodRef.current({
        ids: [couponUsage.customerTicketId],
      })
    // setTicketOrderHelpers(couponUsage.useTicketOrderHelpers)
  }, [couponUsage])

  function handleCustomerTicketChange(value) {
    setPrice(idx(value, _ => _.price))
    setTicketOrderHelpers(
      idx(value, _ => {
        return _.service.helperDeductionSetting.length > 0
          ? _.service.helperDeductionSetting
            .map(data =>
              data.nameList.map(name => ({
                type: ticketHelperType(data.type, name),
                helperId: '',
                isDesignate: false,
                helperDeductiontype: data.helperDeductionType,
              }))
            )
            .reduce((a, b) => a.concat(b))
          : []
      })
    )
    onChange({ key: 'customerTicketId', value: idx(value, _ => _.id), index })
  }
  function handleAssistantChange({ value, assistantIndex, key }) {
    const newTicketOrderHelpers = cloneDeep(ticketOrderHelpers)
    newTicketOrderHelpers[assistantIndex][key] = value
    setTicketOrderHelpers(newTicketOrderHelpers)
    onChange({
      index,
      value: newTicketOrderHelpers.filter(d => d.helperId),
      key: 'useTicketOrderHelpers',
    })
  }
  function handleClear() {
    let newTicketOrderHelpers = cloneDeep(ticketOrderHelpers)
    newTicketOrderHelpers = newTicketOrderHelpers.map(data => ({
      ...data,
      helperId: '',
      isDesignate: false,
    }))
    setTicketOrderHelpers(newTicketOrderHelpers)
    onClear({
      index,
    })
  }

  const displayFloat = num => {
    if (String(num).length > 7) {
      let display = Number(num).toFixed(1)
      if (Number(display) === 0) {
        display = 0
      }
      return display
    } else {
      return num
    }
  }
  return {
    price,
    ticketOrderHelpers,
    handleCustomerTicketChange,
    handleAssistantChange,
    handleClear,
    displayFloat,
  }
}
