import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { Field, Input } from 'ui/input'
import { Eraser, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from './RowAction'
import CustomerTicketRecordAutoCompleteForOrderCreate from 'components/CustomerTicketRecordAutoCompleteForOrderCreate'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import idx from 'idx'
import _ from 'lodash'
import { Fragment, useState, useEffect, useContext, createRef, useRef } from 'react'

const styles = {
  couponUse: 'flex items-end justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[150px] min-w-[150px] flex mr-[12px]',
  priceField: 'w-[65px] flex mr-[12px]',
  couponField: 'w-[250px] flex mr-[12px]',
  checkbox: 'w-[100px] flex mr-[12px] last:mr-0',
}

export default function CouponUse({
  index,
  first,
  last,
  addCouponUse,
  removeCouponUse,
  couponUsage,
  onClear,
  onChange,
  couponUsages,
  helper,
  setHelper,
  ticketRecordsForOrderLazyDataV2,
  expanded,
  focusFirstField,
  setFocusRow,
  isLast,
  focusRow,
  focus,
  setFocus
}) {
  const { bill } = useContext(billContext)
  const [price, setPrice] = useState(0)
  const [helperRefs, setHelperRefs] = useState([])
  const [helperDesignateRefs, setHelperDesignateRefs] = useState([])
  const couponRef = useRef()

  function handleCustomerTicketChange(value) {
    if(value === null){
      handleClear()
    } else {
      setPrice(idx(value, _ => _.price))
      const newHelper = idx(value, _ =>
        _.helperSetting.length > 0
          ? _.helperSetting
              .map(data =>
                data.nameList.map(name => ({
                  type: `${data.type}-${name}`,
                  helperId: '',
                  isDesignate: false,
                  helperDeductiontype: data.helperDeductionType,
                }))
              )
              .reduce((a, b) => a.concat(b))
          : []
      )
      const newHelp = _.cloneDeep(helper)
      newHelp[index] = newHelper
      setHelper(newHelp)
      onChange({ key: 'customerTicketId', value: idx(value, _ => _.id), index, price: idx(value, _ => _.price) })
    }
  }
  function handleAssistantChange({ value, assistantIndex, key }) {
    const newTicketOrderHelpers = _.cloneDeep(helper)
    newTicketOrderHelpers[index][assistantIndex][key] = value
    setHelper(newTicketOrderHelpers)
    onChange({
      index,
      value: newTicketOrderHelpers[index].filter(d => d.helperId),
      key: 'useTicketOrderHelpers',
      price: couponUsage.price,
    })
  }
  function handleClear() {
    let newHelp = _.cloneDeep(helper)
    newHelp[index] = []
    setHelper(newHelp)
    onClear({
      index,
    })
  }

  useEffect(() => {
    if (expanded && focusFirstField) {
      couponRef.current.focus()
    }
  }, [expanded, focusFirstField])
  
  useEffect(() => {
    if (index === focusRow && focus === 'coupon') {
      couponRef.current.focus()
    }
  }, [focus, focusRow])
  
  useEffect(() => {
    if (couponUsages[index].price) {
      setPrice(couponUsages[index].price)
    }
  }, [couponUsages])

  useEffect(() => {
    if (helper[index]) {
      setHelperRefs(elRefs =>
        Array(helper[index].length)
          .fill()
          .map((_, i) => elRefs[i] || createRef())
      )
      setHelperDesignateRefs(elRefs =>
        Array(helper[index].length)
          .fill()
          .map((_, i) => elRefs[i] || createRef())
      )
    }
  }, [helper])

  const handleFocus = event => {
    setFocus(event.target.name)
    event.target.focus()
    setFocusRow(index)
  }
  return (
    <Fragment>
      <div className={styles.couponUse}>
        {bill.customerId && (
          <Field label="預收卡">
            <CustomerTicketRecordAutoCompleteForOrderCreate
              label=''
              className={styles.couponField}
              customerId={bill.customerId}
              value={couponUsage.customerTicketId}
              onChange={value => {
                handleCustomerTicketChange(value)
                if(!value && helper[index].length > 0) {
                  helperRefs[0].current.focus()
                }
              }}
              couponUsages={couponUsages}
              ref={couponRef}
              autoFocus={focus === 'coupon'}
              onFocus={handleFocus}
              name="coupon"
              ticketRecordsForOrderLazyDataV2={ticketRecordsForOrderLazyDataV2}
              onKeyDown={event => {
                if (event.key === 'Enter' && couponUsage.customerTicketId) {
                  if (helper[index].length > 0) {
                    helperRefs[0].current.focus()
                  } else {
                    isLast && addCouponUse()
                    setFocusRow(index + 1)
                    setFocus('coupon')
                  }
                }
              }}
              inputProps={{ 'data-testid': '', placeholder: '卡券代號/名稱' }}
            />
          </Field>
        )}
        {couponUsage.customerTicketId ? (
          <Field label="金額" className={styles.priceField}>
            <Input
              disabled
              value={Math.round(price)}
              onChange={event =>
                onChange({
                  value: idx(event, _ => _.target.value),
                  key: 'customerTicketId',
                  index,
                })
              }
            />
          </Field>
        ) : (
          ''
        )}
        {helper[index].map((data, helperIndex) => (
          <Fragment key={`${data.id}-ticketOrder-${helperIndex}`}>
            <Field label={data.type}>
              <EmployeeAutoComplete
                placeholder={data.type}
                value={data.helperId}
                ref={helperRefs[helperIndex]}
                name={data.type}
                onFocus={event => {
                  setFocusRow(index)
                  setFocus(event.target.name)
                  handleFocus(event)
                }}
                onChange={value => {
                  handleAssistantChange({
                    value: idx(value, _ => _.userId),
                    assistantIndex: helperIndex,
                    key: 'helperId',
                  })
                  helperDesignateRefs[helperIndex].current.focus()
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') helperDesignateRefs[helperIndex].current.focus()
                }}
                className={styles.field}
              />
            </Field>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="指定"
              inputRef={helperDesignateRefs[helperIndex]}
              checked={data.isDesignate}
              className={styles.checkbox}
              name={data.type + 'designate'}
              onFocus={handleFocus}
              autoFocus={focus === data.type + 'designate'}
              onChange={(_event, state) =>
                handleAssistantChange({
                  value: state,
                  assistantIndex: helperIndex,
                  key: 'isDesignate',
                })
              }
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  if (helperIndex < helper[index].length - 1) {
                    helperRefs[helperIndex + 1].current.focus()
                  } else if (helperIndex === helper[index].length - 1) {
                    setFocusRow(index + 1)
                    setFocus('coupon')
                    isLast && addCouponUse()
                  }
                }
              }}
            />
          </Fragment>
        ))}
        <RowIconButton label="清除此列" className="mr-1.5" onClick={handleClear} >
<Eraser aria-hidden="true" strokeWidth={1.75} />
</RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列" className="mr-1.5"
            onClick={function () {
              removeCouponUse({ index })
            }}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          ''
        )}
      </div>
      {last && couponUsage.customerTicketId ? (
        <AddRowButton onClick={addCouponUse} />
      ) : (
        ''
      )}
    </Fragment>
  )
}
