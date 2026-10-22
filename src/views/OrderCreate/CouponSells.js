import { Field, Input } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from './RowAction'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { Fragment, useEffect, useRef, useState } from 'react'
import { ROW_ICON_ALIGN } from 'views/OrderShared/rowAlign'

const styles = {
  couponSells: 'flex items-start justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[150px] flex mr-[12px]',
  fieldWidth: 'w-[250px] flex mr-[12px]',
  priceField: 'w-[65px] flex mr-[12px]',
  countField: 'w-[80px] flex mr-[12px]', // 「可使用次數」65px 會折成兩行（標籤變高、輸入框下移），比照掛單詳細
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
  expanded,
  focusFirstField,
  changeRowFocus,
  focusRow,
  handleOpenCouponModal,
  setFocusRow,
}) {
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
      <div className={styles.couponSells}>
        {index === 0 ? (
          <RowIconButton label="從清單選擇預收卡" className={`mx-1.5 ${ROW_ICON_ALIGN}`} onClick={handleOpenCouponModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className={`mx-1.5 h-8 w-8 shrink-0 ${ROW_ICON_ALIGN}`} />
        )}
        <Field label="卡券">
          <TicketAutoComplete
            className={styles.fieldWidth}
            value={couponSell.serviceId}
            ref={couponRef}
            name="coupon"
            autoFocus={focus === 'coupon'}
            onFocus={handleFocus}
            isLaunched
            onKeyDown={event => {
              if (couponSell.isLocked !== 'FALSE') {
                handleKeyDown({ event, nextField: "count" })
              } else {
                handleKeyDown({ event, nextField: "availableCount" })
              }
            }}
            onChange={function (value) {
              const newCouponSell = cloneDeep(couponSell)
              idx(value, _ => {
                onChange({
                  index,
                  value: {
                    ...newCouponSell,
                    serviceId: _.id,
                    availableCount: _.ticketAvailableCount,
                    price: _.price,
                    remark: _.remark,
                    isLocked: _.isLocked,
                  },
                })
              })
              if (value.isLocked !== 'FALSE') {
                handleKeyDown({ event: { key: 'Enter' }, nextField: "count" })
              } else {
                handleKeyDown({ event: { key: 'Enter' }, nextField: "availableCount" })
              }
            }}
            inputProps={{ placeholder: '卡券名稱/代號' }}
          />
        </Field>
        {couponSell.serviceId && (
          <Fragment>
            <Field label="可使用次數" className={styles.countField}>
              <Input
                value={couponSell.availableCount}
                autoFocus={focus === 'availableCount'}
                ref={availableCountRef}
                name="availableCount"
                onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
                onFocus={handleFocus}
                data-testid={`couponSells-${index}-count`}
                onChange={event => {
                  const newCouponSell = cloneDeep(couponSell)
                  newCouponSell.availableCount = idx(event, _ => +_.target.value || 1)
                  onChange({ index, value: newCouponSell })
                }}
                disabled={!!(couponSell.isLocked === 'TRUE' || couponSell.isLocked === 'UNSET')}
              />
            </Field>
            <Field label="價格" className={styles.priceField}>
              <Input
                value={couponSell.price}
                name="price"
                autoFocus={focus === 'price'}
                onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
                data-testid={`couponSells-${index}-price`}
                onFocus={handleFocus}
                ref={priceRef}
                onChange={event => {
                  const newCouponSell = cloneDeep(couponSell)
                  newCouponSell.price = idx(event, _ => +_.target.value || 0)
                  onChange({ index, value: newCouponSell })
                }}
                disabled={!!(couponSell.isLocked === 'TRUE' || couponSell.isLocked === 'UNSET')}
              />
            </Field>
            <Field label="張數" className={styles.priceField}>
              <Input
                value={couponSell.count}
                name="count"
                autoFocus={focus === 'count'}
                onKeyDown={event => handleKeyDown({ event, nextField: 'remark' })}
                data-testid={`couponSells-${index}-count`}
                onFocus={handleFocus}
                ref={countRef}
                onChange={event => {
                  const newCouponSell = cloneDeep(couponSell)
                  newCouponSell.count = idx(event, _ => +_.target.value || 1)
                  onChange({ index, value: newCouponSell })
                }}
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
          </Fragment>
        )}
        <RowIconButton
          label="清除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
          data-testid={`couponSells-${index}-clear`}
          onClick={() => {
            onClear({ index })
            setFocus('coupon')
          }}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first && (
          <RowIconButton
            label="刪除此列" className={`mr-1.5 ${ROW_ICON_ALIGN}`}
            data-testid={`couponSells-${index}-delete`}
            onClick={() => {
              removeCouponSell({
                index,
              })
              setFocus('coupon')
            }}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        )}
      </div>
      {last && (
        <AddRowButton
          data-testid={`couponSells-${index}-add`}
          onClick={() => {
            addCouponSell({
              index,
            })
            setFocus('coupon')
          }}
        />
      )}
    </Fragment>
  )
}
