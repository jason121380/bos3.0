/** @jsxImportSource @emotion/react */
import { TextField } from '@mui/material'
import { Add as AddIcon, BackspaceOutlined as BackspaceOutlinedIcon, DeleteForever as DeleteForeverIcon, FilterNone as FilterNoneIcon } from 'ui/icons'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import _ from 'lodash'
import { Fragment, useEffect, useRef, useState, useContext } from 'react'
import billContext from 'context/keyInContext'

import styles from './styles/CouponSells'

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
  getData
}) {
  const { setCouponAlready } = useContext(billContext)
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
          <FilterNoneIcon css={styles.createIcon} onClick={handleOpenCouponModal} />
        ) : (
          <span style={{ margin: '22px' }} />
        )}
        <TicketAutoComplete
          className={styles.fieldWidth}
          label="卡券名稱/代號"
          value={couponSell.serviceId}
          ref={couponRef}
          name="coupon"
          fieldProps={{ InputLabelProps: { shrink: true } }}
          autoFocus={focus === 'coupon'}
          onFocus={handleFocus}
          tabIndex={focusRow + '0'}
          isLaunched
          setCouponAlready={setCouponAlready}
          getData={getData}
          onKeyDown={event => {
            if (couponSell.isLocked !== 'FALSE') {
              handleKeyDown({ event, nextField: "count" })
            } else {
              handleKeyDown({ event, nextField: "availableCount" })
            }
          }}
          onChange={function (value) {
            const newCouponSell = _.cloneDeep(couponSell)
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
        />
        {couponSell.serviceId && (
          <Fragment>
            <TextField
              variant="outlined"
              label="可使用次數"
              value={couponSell.availableCount}
              InputLabelProps={{ shrink: true }}
              autoFocus={focus === 'availableCount'}
              css={styles.priceField}
              inputRef={availableCountRef}
              name="availableCount"
              onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
              onFocus={handleFocus}
              tabIndex={focusRow + '1'}
              inputProps={{
                'data-testid': `couponSells-${index}-count`,
              }}
              onChange={event => {
                const newCouponSell = _.cloneDeep(couponSell)
                newCouponSell.availableCount = idx(event, _ => +_.target.value || 1)
                onChange({ index, value: newCouponSell })
                if (event.keyCode === 13) setFocus('availableCount')
              }}
              disabled={!!(couponSell.isLocked === 'TRUE' || couponSell.isLocked === 'UNSET')}
            />
            <TextField
              variant="outlined"
              label="價格"
              css={styles.priceField}
              value={couponSell.price}
              name="price"
              InputLabelProps={{ shrink: true }}
              tabIndex={focusRow + '2'}
              autoFocus={focus === 'price'}
              onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
              inputProps={{
                'data-testid': `couponSells-${index}-price`,
              }}
              onFocus={handleFocus}
              inputRef={priceRef}
              onChange={event => {
                const newCouponSell = _.cloneDeep(couponSell)
                newCouponSell.price = idx(event, _ => +_.target.value || 0)
                onChange({ index, value: newCouponSell })
                if (event.keyCode === 13) setFocus('count')
              }}
              disabled={!!(couponSell.isLocked === 'TRUE' || couponSell.isLocked === 'UNSET')}
            />
            <TextField
              variant="outlined"
              label="張數"
              css={styles.priceField}
              value={couponSell.count}
              name="count"
              InputLabelProps={{ shrink: true }}
              tabIndex={focusRow + '2'}
              autoFocus={focus === 'count'}
              onKeyDown={event => handleKeyDown({ event, nextField: 'remark' })}
              inputProps={{
                'data-testid': `couponSells-${index}-count`,
              }}
              onFocus={handleFocus}
              inputRef={countRef}
              onChange={event => {
                const newCouponSell = _.cloneDeep(couponSell)
                newCouponSell.count = idx(event, _ => +_.target.value || 1)
                onChange({ index, value: newCouponSell })
                if (event.keyCode === 13) setFocus('remark')
              }}
            />
            <TextField
              value={couponSell.remark}
              variant="outlined"
              label="備註"
              name="remark"
              InputLabelProps={{ shrink: true }}
              onFocus={handleFocus}
              inputRef={remarkRef}
              css={styles.field}
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
          </Fragment>
        )}
        <BackspaceOutlinedIcon
          css={styles.action}
          data-testid={`couponSells-${index}-clear`}
          onClick={() => {
            onClear({ index })
            setFocus('coupon')
          }}
        />
        {!first && (
          <DeleteForeverIcon
            css={styles.action}
            data-testid={`couponSells-${index}-delete`}
            onClick={() => {
              removeCouponSell({
                index,
              })
              setFocus('coupon')
            }}
          />
        )}
      </div>
      {last && (
        <AddIcon
          css={styles.action}
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
