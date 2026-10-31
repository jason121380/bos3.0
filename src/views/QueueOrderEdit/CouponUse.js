import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import CustomerTicketRecordAutoCompleteForQueueOrder from 'components/CustomerTicketRecordAutoCompleteForQueueOrder'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import { useFetchLazyTicketRecords } from 'hooks/useFetchTicketRecords'
import { ticketHelperType, isSameHelperType } from 'views/OrderShared/ticketHelperType'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { Fragment, useContext, useState, useEffect, useRef } from 'react'
import { ROW_INLINE_ALIGN } from 'views/OrderShared/rowAlign'

export default function CouponUse({ index, couponUsages, couponUsage, onChange }) {
  const { bill, order } = useContext(billContext)
  const [price, setPrice] = useState(0)
  const [ticketOrderHelpers, setTicketOrderHelpers] = useState(couponUsage.useTicketOrderHelpers)
  const ticketRecord = useFetchLazyTicketRecords()
  useEffect(() => {
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

      setPrice(ticketRecord.response.data.ticketRecords.data.map(data => data.service.price).reduce((a, b) => a.concat(b), []))
    }
  }, [ticketRecord.response.loading, ticketRecord.response.data, couponUsage])
  const fetchTicketRecordRef = useRef(ticketRecord.fetchTicketRecord)

  useEffect(() => {
    if (couponUsage.customerTicketId)
      fetchTicketRecordRef.current({
        ids: [couponUsage.customerTicketId],
      })
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

  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-start justify-start gap-y-[12px]">
        {bill.customerId && (
          <Field label="預收卡">
            <CustomerTicketRecordAutoCompleteForQueueOrder
              className="mr-[12px] flex w-[250px] max-w-full"
              value={couponUsage.customerTicketId}
              onChange={handleCustomerTicketChange}
              couponUsages={couponUsages}
              customerId={bill.customerId}
            />
          </Field>
        )}
        {couponUsage.customerTicketId && (
          <Fragment>
            {/* 金額只顯示卡券單價（送出的使用預收卡不帶金額），唯讀，比照帳單詳細／掛單詳細／打帳單。
                原本可編輯，輸入的文字被寫進選的預收卡（customerTicketId），送出時換成不存在的卡券（coverage wave 1，2026/10/22） */}
            <Field label="金額" className="!mr-[12px] flex w-[65px]">
              <TextField
                fullWidth
                variant="outlined"
                customerId={bill.customerId}
                value={displayFloat(price)}
                disabled
                InputProps={{ readOnly: true }}
              />
            </Field>
            {ticketOrderHelpers.map((data, helperIndex) => (
              <Fragment key={`${data.id}-ticketOrder-${helperIndex}-${data.helperId}`}>
                <Field label={data.type}>
                  <EmployeeAutoComplete
                    // 與同列輸入框同高（36px、手機 40px；原本 small 34px 比同列矮 2px，Jason 2026/10/22 fix all）
                    size="medium"
                    placeholder={data.type}
                    value={data.helperId}
                    onChange={value =>
                      handleAssistantChange({
                        value: idx(value, _ => _.userId),
                        assistantIndex: helperIndex,
                        key: 'helperId',
                      })
                    }
                    className="!mr-[12px] flex !w-[150px] !min-w-[150px]"
                  />
                </Field>
                <CheckboxField
                  label="指定"
                  checked={data.isDesignate}
                  className={`mr-[12px] flex w-[100px] last:mr-0 ${ROW_INLINE_ALIGN}`}
                  onChange={(_event, state) =>
                    handleAssistantChange({
                      value: state,
                      assistantIndex: helperIndex,
                      key: 'isDesignate',
                    })
                  }
                />
              </Fragment>
            ))}
          </Fragment>
        )}
      </div>
    </Fragment>
  )
}
