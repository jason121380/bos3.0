import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { Field, Input } from 'ui/input'
import { Eraser, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from './RowAction'
import CustomerTicketRecordAutoCompleteForOrderCreate from 'components/CustomerTicketRecordAutoCompleteForOrderCreate'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { Fragment, useState, useEffect, useContext, createRef, useRef } from 'react'
import { ROW_ICON_ALIGN, ROW_INLINE_ALIGN } from 'views/OrderShared/rowAlign'

const styles = {
  couponUse: 'flex items-start justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[150px] min-w-[150px] flex mr-[12px]',
  priceField: 'w-[65px] flex mr-[12px]',
  couponField: 'w-[250px] flex mr-[12px]',
  checkbox: `w-[100px] flex mr-[12px] last:mr-0 ${ROW_INLINE_ALIGN}`,
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
  setFocus,
}) {
  const { bill } = useContext(billContext)
  const [price, setPrice] = useState(0)
  const [helperRefs, setHelperRefs] = useState([])
  const [helperDesignateRefs, setHelperDesignateRefs] = useState([])
  const couponRef = useRef()

  function handleCustomerTicketChange(value) {
    if (value === null) {
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
      const newHelp = cloneDeep(helper)
      newHelp[index] = newHelper
      setHelper(newHelp)
      onChange({ key: 'customerTicketId', value: idx(value, _ => _.id), index, price: idx(value, _ => _.price) })
    }
  }
  function handleAssistantChange({ value, assistantIndex, key }) {
    const newTicketOrderHelpers = cloneDeep(helper)
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
    let newHelp = cloneDeep(helper)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [focus, focusRow] 變動時執行；index 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [focus, focusRow])

  useEffect(() => {
    if (couponUsages[index].price) {
      setPrice(couponUsages[index].price)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [couponUsages] 變動時執行；index 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [couponUsages])

  // render 時已讀 helper[index].map，能執行到這裡 helper[index] 一定存在
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [helper] 變動時執行；index 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
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
              label=""
              className={styles.couponField}
              customerId={bill.customerId}
              value={couponUsage.customerTicketId}
              onChange={value => {
                handleCustomerTicketChange(value)
                if (!value && helper[index].length > 0) {
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
            <Input disabled value={Math.round(price)} />
          </Field>
        ) : (
          ''
        )}
        {helper[index].map((data, helperIndex) => (
          <Fragment key={`${data.id}-ticketOrder-${helperIndex}`}>
            <Field label={data.type}>
              <EmployeeAutoComplete
                // 與同列輸入框同高（36px、手機 40px；原本 small 34px 比同列矮 2px，Jason 2026/10/22 fix all）
                size="medium"
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
                  } else {
                    setFocusRow(index + 1)
                    setFocus('coupon')
                    isLast && addCouponUse()
                  }
                }
              }}
            />
          </Fragment>
        ))}
        <RowIconButton label="清除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`} onClick={handleClear}>
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列"
            className={`mr-1.5 ${ROW_ICON_ALIGN}`}
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
      {last && couponUsage.customerTicketId ? <AddRowButton onClick={addCouponUse} /> : ''}
    </Fragment>
  )
}
