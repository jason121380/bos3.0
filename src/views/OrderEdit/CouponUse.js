import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import CustomerTicketRecordAutoComplete from 'components/CustomerTicketRecordAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import { useFetchLazyTicketRecords } from 'hooks/useFetchTicketRecords'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import React, { Fragment } from 'react'


export default function CouponUse({
  index,
  first,
  last,
  addCouponUse,
  removeCouponUse,
  couponUsages,
  couponUsage,
  onClear,
  onChange,
}) {
  const { bill, orderId } = React.useContext(billContext)
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
                  type: `${data.type}-${name}`,
                  helperDeductiontype: data.helperDeductionType,
                }
              })
            )
            .reduce((a, b) => a.concat(b), [])
            .filter(data => !prev.find(i => i.type === data.type))
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
                type: `${data.type} - ${name}`,
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

  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-end justify-start gap-y-[12px]">
        {bill.customerId && (
          <Field label="預收卡">
          <CustomerTicketRecordAutoComplete
            className="mr-[12px] flex w-[250px] max-w-full"
            customerId={bill.customerId}
            inputProps={{ 'data-testid': '', placeholder: '卡券名稱/代號' }}
            value={couponUsage.customerTicketId}
            onChange={handleCustomerTicketChange}
            orderId={orderId}
            isUseTicket={true}
            couponUsages={couponUsages}
            editOrderUseTicketDisabled={true}
          />
          </Field>
        )}
        {couponUsage.customerTicketId && (
          <React.Fragment>
            <Field label="金額" className="!mr-[12px] flex w-[65px]">
            <TextField
              fullWidth
              variant="outlined"
              disabled
              value={displayFloat(price)}
              onChange={event =>
                onChange({
                  value: idx(event, _ => _.target.value),
                  key: 'customerTicketId',
                  index,
                })
              }
            />
            </Field>
            {ticketOrderHelpers.map((data, helperIndex) => (
              <React.Fragment key={`${data.id}-ticketOrder-${helperIndex}-${data.helperId}`}>
                <Field label={data.type}>
                <EmployeeAutoComplete
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
                  className="mr-[12px] flex w-[100px] last:mr-0"
                  onChange={(_event, state) =>
                    handleAssistantChange({
                      value: state,
                      assistantIndex: helperIndex,
                      key: 'isDesignate',
                    })
                  }
                  disabled
                />
              </React.Fragment>
            ))}
          </React.Fragment>
        )}
        {/* <BackspaceOutlinedIcon css={styles.action} onClick={handleClear} /> */}
        {/* {!first && couponUsage.customerTicketId && (
          <DeleteForeverIcon
            css={styles.action}
            onClick={function () {
              removeCouponUse({ index })
            }}
          />
        )} */}
      </div>
      {/* {last && couponUsage.customerTicketId && (
        <AddIcon css={styles.action} onClick={addCouponUse} />
      )} */}
    </Fragment>
  )
}
