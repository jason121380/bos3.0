/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import CustomerTicketRecordAutoComplete from 'components/CustomerTicketRecordAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import { useFetchLazyTicketRecords } from 'hooks/useFetchTicketRecords'
import idx from 'idx'
import _ from 'lodash'
import React, { Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  couponUse: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '150px',
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
          <CustomerTicketRecordAutoComplete
            className={styles.field}
            customerId={bill.customerId}
            label="卡券名稱/代號"
            value={couponUsage.customerTicketId}
            onChange={handleCustomerTicketChange}
            orderId={orderId}
            isUseTicket={true}
            couponUsages={couponUsages}
            editOrderUseTicketDisabled={true}
          />
        )}
        {couponUsage.customerTicketId && (
          <React.Fragment>
            <TextField
              label="金額"
              variant="outlined"
              disabled
              value={displayFloat(price)}
              css={styles.priceField}
              onChange={event =>
                onChange({
                  value: idx(event, _ => _.target.value),
                  key: 'customerTicketId',
                  index,
                })
              }
            />
            {ticketOrderHelpers.map((data, helperIndex) => (
              <React.Fragment key={`${data.id}-ticketOrder-${helperIndex}-${data.helperId}`}>
                <EmployeeAutoComplete
                  label={data.type}
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
                  disabled
                />
              </React.Fragment>
            ))}
          </React.Fragment>
        )}
        {/* <BackspaceOutlinedIcon className={classes.action} onClick={handleClear} /> */}
        {/* {!first && couponUsage.customerTicketId && (
          <DeleteForeverIcon
            className={classes.action}
            onClick={function () {
              removeCouponUse({ index })
            }}
          />
        )} */}
      </div>
      {/* {last && couponUsage.customerTicketId && (
        <AddIcon className={classes.action} onClick={addCouponUse} />
      )} */}
    </Fragment>
  )
}
