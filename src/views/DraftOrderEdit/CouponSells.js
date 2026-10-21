import { Field, Input } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import React, { Fragment, useState, useEffect, useRef } from 'react'
import billContext from 'context/keyInContext'

// 版面比照打帳單（views/OrderCreate/styles/CouponSells）：欄位上方標籤、靠底對齊、窄螢幕換行不擠壓
// 原 emotion styles 逐值轉 Tailwind（spacing 單位 8px）。fieldWidth 傳給 TicketAutoComplete（原以 css={className} 套在根節點）
const styles = {
  couponSells: 'flex items-end justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[150px] flex mr-[12px]',
  fieldWidth: 'w-[250px] flex mr-[12px]',
  countField: 'w-[80px] flex mr-[12px]',
  priceField: 'w-[65px] flex mr-[12px]',
}

export default function CouponSells({
  couponSell,
  index,
  addCouponSell,
  removeCouponSell,
  first,
  last,
  onClear,
  onChange,
  isTicketSellingEditable,
  handleOpenCouponModal,
  expanded,
  focusFirstField,
  changeRowFocus,
  focusRow,
  setFocusRow,
}) {
  const [focus, setFocus] = useState('')
  const couponRef = useRef()
  const availableCountRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()
  const remarkRef = useRef()
  const checkboxRef = useRef()
  const { bill, orderId } = React.useContext(billContext)
  useEffect(() => {
    if (expanded && focusFirstField && bill.ticketOrders.length === index) {
      idx(couponRef, _ => _.current.focus())
      setFocus('coupon')
    }
  }, [expanded, focusFirstField])

  useEffect(() => {
    switch (focus) {
      case 'coupon':
        idx(couponRef, _ => _.current.focus())
        break
      case 'availableCount':
        idx(availableCountRef, _ => _.current.focus())
        break
      case 'price':
        idx(priceRef, _ => _.current.focus())
        break
      case 'count':
        idx(countRef, _ => _.current.focus())
        break
      case 'remark':
        idx(remarkRef, _ => _.current.focus())
        break
      case 'checkbox':
        idx(checkboxRef, _ => _.current.focus())
        break
      default:
        break
    }
  }, [focus])

  const handleFocus = event => {
    let setted = false
    if (!setted) {
      setFocus(event.target.name)
      setted = true
      event.target.focus()
    }
    if (event.target.name === 'price' || event.target.name === 'availableCount') {
      event.target.select()
    }
    setFocusRow(index)
  }
  const handleKeyDown = ({ event, nextField }) => {
    if (event.key === 'Enter') {
      setFocus(nextField)
    }
  }

  return (
    <Fragment>
      <div className={styles.couponSells}>
        {index === 0 ? (
          <RowIconButton label="從清單選擇預收卡" className="mx-1.5" onClick={handleOpenCouponModal}>
            <Copy aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        {/* 不標必填：PannelCouponSells 寫入 bill.ticketOrders 前一律 filter(d => d.serviceId)，空列會被略過 */}
        <Field label="卡券">
          <TicketAutoComplete
            className={styles.fieldWidth}
            value={couponSell.serviceId}
            ref={couponRef}
            name="coupon"
            autoFocus={focus === 'coupon'}
            orderId={orderId}
            onFocus={handleFocus}
            onKeyDown={event => {
              if ((couponSell.isLocked !== 'FALSE' || !isTicketSellingEditable)) {
                setFocus('remark')
                idx(remarkRef, _ => _.current.focus())
              } else {
                setFocus('availableCount')
                idx(availableCountRef, _ => _.current.focus())
              }
            }}
            onChange={function (value) {
              idx(value, _ => {
                onChange({
                  index,
                  value: {
                    ...couponSell,
                    serviceId: _.id,
                    availableCount: _.ticketAvailableCount,
                    price: _.price,
                    isLocked: _.isLocked,
                  },
                })
              })
              if (value.isLocked !== 'FALSE' || !isTicketSellingEditable) {
                setFocus('remark')
                idx(remarkRef, _ => _.current.focus())
              } else {
                setFocus('availableCount')
                idx(availableCountRef, _ => _.current.focus())
              }
            }}
            inputProps={{
              'data-testid': `couponSells-${index}-coupon`,
              placeholder: '卡券名稱/代號',
            }}
            isTicketSellingEditable={isTicketSellingEditable}
          />
        </Field>
        {couponSell.serviceId ? (
          <React.Fragment>
            <Field label="可使用次數" className={styles.countField}>
              <Input
                value={couponSell.availableCount}
                ref={availableCountRef}
                name="availableCount"
                onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
                onFocus={handleFocus}
                onChange={function (event) {
                  const newCouponSell = cloneDeep(couponSell)
                  newCouponSell.availableCount = idx(event, _ => +_.target.value || 1)
                  onChange({ index, value: newCouponSell })
                }}
                data-testid={`couponSells-${index}-count`}
                disabled={
                  !!(
                    couponSell.isLocked === 'TRUE' ||
                    couponSell.isLocked === 'UNSET' ||
                    !isTicketSellingEditable
                  )
                }
              />
            </Field>
            <Field label="價格" className={styles.field}>
              <Input
                value={couponSell.price}
                autoFocus={focus === 'price'}
                onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
                onFocus={handleFocus}
                ref={priceRef}
                onChange={function (event) {
                  const newCouponSell = cloneDeep(couponSell)
                  newCouponSell.price = idx(event, _ => +_.target.value || 0)
                  onChange({ index, value: newCouponSell })
                }}
                data-testid={`couponSells-${index}-price`}
                disabled={
                  !!(
                    couponSell.isLocked === 'TRUE' ||
                    couponSell.isLocked === 'UNSET' ||
                    !isTicketSellingEditable
                  )
                }
              />
            </Field>
            <Field label="張數" className={styles.priceField}>
              <Input
                value={couponSell.count}
                autoFocus={focus === 'count'}
                onFocus={handleFocus}
                ref={countRef}
                onKeyDown={event => handleKeyDown({ event, nextField: 'remark' })}
                onChange={function (event) {
                  const newCouponSell = cloneDeep(couponSell)
                  newCouponSell.count = idx(event, _ => +_.target.value || 1)
                  onChange({ index, value: newCouponSell })
                }}
                data-testid={`couponSells-${index}-count`}
                disabled={
                  !!(
                    couponSell.isLocked === 'TRUE' ||
                    couponSell.isLocked === 'UNSET' ||
                    !isTicketSellingEditable
                  )
                }
              />
            </Field>
            <Field label="備註" className={styles.field}>
              <Input
                value={couponSell.remark}
                name="remark"
                onFocus={handleFocus}
                ref={remarkRef}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    setTimeout(() => {
                      changeRowFocus(index + 1)
                    }, 1)
                  }
                }}
                onChange={event => {
                  const newCouponSell = cloneDeep(couponSell)
                  newCouponSell.remark = event.target.value
                  onChange({ index, value: newCouponSell })
                }}
              />
            </Field>
          </React.Fragment>
        ) : (
          ''
        )}
        {isTicketSellingEditable && (
          <RowIconButton
            label="清除此列"
            className="mr-1.5"
            onClick={function () {
              onClear({ index })
            }}
            data-testid={`couponSells-${index}-clear`}
          >
            <Eraser aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        )}
        {!first && isTicketSellingEditable ? (
          <RowIconButton
            label="刪除此列"
            className="mr-1.5"
            onClick={function () {
              removeCouponSell({
                index,
              })
            }}
            data-testid={`couponSells-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          ''
        )}
      </div>
      {last && isTicketSellingEditable ? (
        <AddRowButton
          onClick={function () {
            addCouponSell({
              index,
            })
          }}
          data-testid={`couponSells-${index}-add`}
        />
      ) : (
        ''
      )}
    </Fragment>
  )
}
