/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import _ from 'lodash'
import { Fragment, useContext } from 'react'
import billContext from 'context/keyInContext'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  // 項目列（比照打帳單 views/OrderCreate/styles/CouponSells）：上方標籤、控制項靠底對齊、窄螢幕換行不擠壓
  couponSells: css({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    rowGap: '12px',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    minWidth: '150px',
    width: 150,
    display: 'flex',
    marginRight: '12px !important',
  }),
  fieldWidth: css({
    width: '250px',
    maxWidth: '100%',
    display: 'flex',
    marginRight: '12px',
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
}) {
  const { setCouponAlready } = useContext(billContext)
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
            css={styles.fieldWidth}
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
        </Field>
        {couponSell.serviceId ? (
          <Fragment>
            <Field label="可使用次數" css={styles.priceField}>
              <TextField
                fullWidth
                variant="outlined"
                value={couponSell.availableCount}
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
                value={couponSell.remark ? couponSell.remark : ''}
                variant="outlined"
                name="remark"
                onChange={event => {
                  const newCouponSell = _.cloneDeep(couponSell)
                  newCouponSell.remark = event.target.value
                  onChange({ index, value: newCouponSell })
                }}
              />
            </Field>
          </Fragment>
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
