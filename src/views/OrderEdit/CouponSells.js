/** @jsxImportSource @emotion/react */
import { TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import _ from 'lodash'
import React, { Fragment, useState, useEffect, useRef } from 'react'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import billContext from 'context/keyInContext'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  couponSells: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
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
  action: css({
    width: '50px !important',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  createIcon: css({
    cursor: 'pointer',
    margin: '10px',
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
          <FilterNoneIcon css={styles.createIcon} onClick={handleOpenCouponModal} />
        ) : (
          <span style={{ margin: '22px' }} />
        )}
        <TicketAutoComplete
          setCouponAlready={setCouponAlready}
          className={styles.field}
          label="卡券名稱/代號"
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
        {couponSell.serviceId ? (
          <React.Fragment>
            <TextField
              variant="outlined"
              label="可使用次數"
              value={couponSell.availableCount}
              css={styles.priceField}
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
            <TextField
              variant="outlined"
              label="價格"
              css={styles.field}
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
            <TextField
              variant="outlined"
              label="張數"
              css={styles.priceField}
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
            <TextField
              value={couponSell.remark}
              variant="outlined"
              label="備註"
              name="remark"
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
          </React.Fragment>
        ) : (
          ''
        )}
        {isTicketSellingEditable && (
          <BackspaceOutlinedIcon
            css={styles.action}
            onClick={function () {
              onClear({ index })
            }}
            data-testid={`couponSells-${index}-clear`}
          />
        )}
        {!first && isTicketSellingEditable ? (
          <DeleteForeverIcon
            css={styles.action}
            onClick={function () {
              removeCouponSell({
                index,
              })
            }}
            data-testid={`couponSells-${index}-delete`}
          />
        ) : (
          ''
        )}
      </div>
      {last && isTicketSellingEditable ? (
        <AddIcon
          css={styles.action}
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
