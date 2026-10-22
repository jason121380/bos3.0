import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import React, { Fragment, useState, useEffect, useRef } from 'react'
import billContext from 'context/keyInContext'
import { ROW_ICON_ALIGN } from 'views/OrderShared/rowAlign'


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
  getData
}) {
  const { setCouponAlready, orderId } = React.useContext(billContext)

  const [focus, setFocus] = useState('')
  const couponRef = useRef()
  const availableCountRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()
  const remarkRef = useRef()

  useEffect(() => {
    // 新增列、展開區塊、從上一列按 Enter 移過來時游標跳到卡券；使用者自己點了這一列的欄位（焦點已在本列欄位上）時不搶焦點
    // （比照店販／會員卡；原本點另一列的欄位會先被拉到該列的卡券欄）
    const active = document.activeElement
    const fieldFocused = [couponRef, availableCountRef, priceRef, countRef, remarkRef]
      .some(ref => ref.current && (ref.current === active || (ref.current.contains && ref.current.contains(active))))
    if (expanded && focusFirstField && !fieldFocused) {
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
      default:
        break
    }
  }, [focus])

  const handleFocus = event => {
    setFocus(event.target.name)
    event.target.focus()
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
      <div className="mb-6 flex flex-wrap items-start justify-start gap-y-[12px]">
        {index === 0 ? (
          <RowIconButton label="從清單選擇預收卡" className={`mx-1.5 ${ROW_ICON_ALIGN}`} onClick={handleOpenCouponModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className={`mx-1.5 h-8 w-8 shrink-0 ${ROW_ICON_ALIGN}`} />
        )}
        <Field label="卡券">
        <TicketAutoComplete
          setCouponAlready={setCouponAlready}
          className="mr-[12px] flex w-[250px] max-w-full"
          inputProps={{ placeholder: '卡券名稱/代號' }}
          value={couponSell.serviceId}
          ref={couponRef}
          name="coupon"
          autoFocus={focus === 'coupon'}
          orderId={orderId}
          onFocus={handleFocus}
          getData={getData}
          onKeyDown={event => {
            if (!!(couponSell.isLocked !== 'FALSE' || !isTicketSellingEditable)) {
              handleKeyDown({ event, nextField: "remark" })
            } else {
              handleKeyDown({ event, nextField: "availableCount" })
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
            if (value.isLocked !== 'FALSE') {
              handleKeyDown({ event: { key: 'Enter' }, nextField: "remark" })
            } else {
              handleKeyDown({ event: { key: 'Enter' }, nextField: "availableCount" })
            }
          }}
          isTicketSellingEditable={isTicketSellingEditable}
        />
        </Field>
        {couponSell.serviceId ? (
          <React.Fragment>
            <Field label="可使用次數" className="!mr-[12px] flex w-[80px]">
            <TextField
              fullWidth
              variant="outlined"
              value={couponSell.availableCount}
              inputRef={availableCountRef}
              name="availableCount"
              onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
              onFocus={handleFocus}
              onChange={function (event) {
                const newCouponSell = cloneDeep(couponSell)
                newCouponSell.availableCount = idx(event, _ => +_.target.value || 1)
                onChange({ index, value: newCouponSell })
              }}
              inputProps={{
                'data-testid': `couponSells-${index}-count`,
              }}
              disabled={
                !!(
                  couponSell.isLocked === 'TRUE' ||
                  couponSell.isLocked === 'UNSET' ||
                  !isTicketSellingEditable
                )
              }
            />
            </Field>
            <Field label="價格" className="!mr-[12px] flex w-[65px]">
            <TextField
              fullWidth
              variant="outlined"
              value={couponSell.price}
              name="price"
              autoFocus={focus === 'price'}
              onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
              onFocus={handleFocus}
              inputRef={priceRef}
              onChange={function (event) {
                const newCouponSell = cloneDeep(couponSell)
                newCouponSell.price = idx(event, _ => +_.target.value || 0)
                onChange({ index, value: newCouponSell })
              }}
              inputProps={{
                'data-testid': `couponSells-${index}-price`,
              }}
              disabled={
                !!(
                  couponSell.isLocked === 'TRUE' ||
                  couponSell.isLocked === 'UNSET' ||
                  !isTicketSellingEditable
                )
              }
            />
            </Field>
            <Field label="張數" className="!mr-[12px] flex w-[65px]">
            <TextField
              fullWidth
              variant="outlined"
              value={couponSell.count}
              name="count"
              autoFocus={focus === 'count'}
              onFocus={handleFocus}
              inputRef={countRef}
              onKeyDown={event => handleKeyDown({ event, nextField: 'remark' })}
              onChange={function (event) {
                const newCouponSell = cloneDeep(couponSell)
                newCouponSell.count = idx(event, _ => +_.target.value || 1)
                onChange({ index, value: newCouponSell })
              }}
              inputProps={{
                'data-testid': `couponSells-${index}-count`,
              }}
              disabled={
                !!(
                  couponSell.isLocked === 'TRUE' ||
                  couponSell.isLocked === 'UNSET' ||
                  !isTicketSellingEditable
                )
              }
            />
            </Field>
            <Field label="備註" className="!mr-[12px] flex w-[150px] min-w-[150px]">
            <TextField
              fullWidth
              value={couponSell.remark}
              variant="outlined"
              placeholder="備註"
              name="remark"
              onFocus={handleFocus}
              inputRef={remarkRef}
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
            label="清除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
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
            label="刪除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
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
