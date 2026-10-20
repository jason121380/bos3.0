/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import CustomerTicketRecordAutoCompleteForQueueOrder from 'components/CustomerTicketRecordAutoCompleteForQueueOrder'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import { useFetchLazyTicketRecords } from 'hooks/useFetchTicketRecords'
import idx from 'idx'
import _ from 'lodash'
import { Fragment, useContext, useState, useEffect, useRef } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  // 項目列（比照打帳單 views/OrderCreate/styles/CouponUse）：上方標籤、控制項靠底對齊、窄螢幕換行不擠壓
  couponUse: css({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    rowGap: '12px',
    marginBottom: theme.spacing(3),
  }),
  couponField: css({
    width: '250px',
    maxWidth: '100%',
    display: 'flex',
    marginRight: '12px',
  }),
  field: css({
    minWidth: '150px !important',
    width: '150px !important',
    display: 'flex',
    marginRight: '12px !important',
  }),
  priceField: css({
    width: '65px',
    display: 'flex',
    marginRight: '12px !important',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  action: css({
    width: '50px',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
}

export default function CouponUse({
  index,
  couponUsages,
  couponUsage,
  onClear,
  onChange,
}) {
  const { bill, order } = useContext(billContext)
  const [price, setPrice] = useState(0)
  const [ticketOrderHelpers, setTicketOrderHelpers] = useState(
    couponUsage.useTicketOrderHelpers
  )
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

      setPrice(
        ticketRecord.response.data.ticketRecords.data
          .map(data => data.service.price)
          .reduce((a, b) => a.concat(b), [])

      )
    }
  }, [ticketRecord.response.loading, ticketRecord.response.data, couponUsage])
  const useFetchTicketRecodRef = useRef(ticketRecord.fetchTicketRecod)

  useEffect(() => {
    if (couponUsage.customerTicketId)
      useFetchTicketRecodRef.current({
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
    const newTicketOrderHelpers = _.cloneDeep(ticketOrderHelpers)
    newTicketOrderHelpers[assistantIndex][key] = value
    setTicketOrderHelpers(newTicketOrderHelpers)
    onChange({
      index,
      value: newTicketOrderHelpers.filter(d => d.helperId),
      key: 'useTicketOrderHelpers',
    })
  }
  function handleClear() {
    let newTicketOrderHelpers = _.cloneDeep(ticketOrderHelpers)
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
      if (display == 0.0) {
        display = 0
      }
      return display
    } else {
      return num
    }
  }

  return (
    <Fragment>
      <div css={styles.couponUse}>
        {bill.customerId && (
          <Field label="預收卡">
            <CustomerTicketRecordAutoCompleteForQueueOrder
              className={styles.couponField}
              value={couponUsage.customerTicketId}
              onChange={handleCustomerTicketChange}
              couponUsages={couponUsages}
              customerId={bill.customerId}
            />
          </Field>
        )}
        {couponUsage.customerTicketId && (
          <Fragment>
            <Field label="金額" css={styles.priceField}>
              <TextField
                fullWidth
                variant="outlined"
                customerId={bill.customerId}
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
              <Fragment key={`${data.id}-ticketOrder-${helperIndex}-${data.helperId}`}>
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
                    className={styles.field}
                  />
                </Field>
                <CheckboxField
                  label="指定"
                  checked={data.isDesignate}
                  css={styles.checkbox}
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
