/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { Add as AddIcon, BackspaceOutlined as BackspaceOutlinedIcon, DeleteForever as DeleteForeverIcon, FilterNone as FilterNoneIcon } from 'ui/icons'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import _ from 'lodash'
import { Fragment, useContext } from 'react'
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
}) {
  const { setCouponAlready } = useContext(billContext)
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
          css={styles.field}
          label="卡券名稱/代號"
          value={couponSell.serviceId}
          isLaunched
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
          }}
          inputProps={{
            'data-testid': `couponSells-${index}-coupon`,
          }}
          isTicketSellingEditable={isTicketSellingEditable}
        />
        {couponSell.serviceId ? (
          <Fragment>
            <TextField
              variant="outlined"
              label="可使用次數"
              value={couponSell.availableCount}
              css={styles.priceField}
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
              value={couponSell.remark ? couponSell.remark : ''}
              variant="outlined"
              label="備註"
              name="remark"
              css={styles.field}
              onChange={event => {
                const newCouponSell = _.cloneDeep(couponSell)
                newCouponSell.remark = event.target.value
                onChange({ index, value: newCouponSell })
              }}
            />
          </Fragment>
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
