/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import _ from 'lodash'
import React, { Fragment, useState, useEffect, useRef } from 'react'
import billContext from 'context/keyInContext'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  // 項目列：欄位靠底對齊（標籤在上），窄螢幕換行不擠壓（比照打帳單）
  couponSells: css({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    rowGap: '12px',
    marginBottom: theme.spacing(3),
  }),
  fieldWidth: css({
    width: '250px',
    maxWidth: '100%',
    display: 'flex',
    marginRight: '12px',
  }),
  field: css({
    minWidth: '150px',
    width: 150,
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
  getData
}) {
  const { setCouponAlready, orderId } = React.useContext(billContext)

  const [focus, setFocus] = useState('')
  const couponRef = useRef()
  const availableCountRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()
  const remarkRef = useRef()
  const checkboxRef = useRef()

  useEffect(() => {
    if (expanded && focusFirstField) {
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
      <div css={styles.couponSells}>
        {index === 0 ? (
          <RowIconButton label="從清單選擇預收卡" className="mx-1.5" onClick={handleOpenCouponModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="卡券">
        <TicketAutoComplete
          setCouponAlready={setCouponAlready}
          className={styles.fieldWidth}
          inputProps={{ placeholder: '卡券名稱/代號' }}
          value={couponSell.serviceId}
          ref={couponRef}
          name="coupon"
          autoFocus={focus === 'coupon'}
          orderId={orderId}
          onFocus={handleFocus}
          tabIndex={focusRow + '0'}
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
            <Field label="可使用次數" css={styles.priceField}>
            <TextField
              fullWidth
              variant="outlined"
              value={couponSell.availableCount}
              inputRef={availableCountRef}
              name="availableCount"
              onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
              onFocus={handleFocus}
              tabIndex={focusRow + '1'}
              onChange={function (event) {
                const newCouponSell = _.cloneDeep(couponSell)
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
            <Field label="價格" css={styles.priceField}>
            <TextField
              fullWidth
              variant="outlined"
              value={couponSell.price}
              name="price"
              tabIndex={focusRow + '2'}
              autoFocus={focus === 'price'}
              onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
              onFocus={handleFocus}
              inputRef={priceRef}
              onChange={function (event) {
                const newCouponSell = _.cloneDeep(couponSell)
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
            <Field label="張數" css={styles.priceField}>
            <TextField
              fullWidth
              variant="outlined"
              value={couponSell.count}
              name="count"
              tabIndex={focusRow + '2'}
              autoFocus={focus === 'count'}
              onFocus={handleFocus}
              inputRef={countRef}
              onKeyDown={event => handleKeyDown({ event, nextField: 'remark' })}
              onChange={function (event) {
                const newCouponSell = _.cloneDeep(couponSell)
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
            <Field label="備註" css={styles.field}>
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
                const newCouponSell = _.cloneDeep(couponSell)
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
            label="清除此列" className="mr-1.5"
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
            label="刪除此列" className="mr-1.5"
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
