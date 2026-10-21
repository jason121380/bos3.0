import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import TicketAutoComplete from 'components/TicketAutoComplete'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { Fragment, useContext } from 'react'
import billContext from 'context/keyInContext'

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
      <div className="mb-6 flex flex-wrap items-end justify-start gap-y-[12px]">
        {index === 0 ? (
          <RowIconButton label="從清單選擇預收卡" className="mx-1.5" onClick={handleOpenCouponModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="卡券">
          <TicketAutoComplete
            setCouponAlready={setCouponAlready}
            className="mr-[12px] flex w-[250px] max-w-full"
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
            <Field label="可使用次數" className="!mr-[12px] flex w-[65px]">
              <TextField
                fullWidth
                variant="outlined"
                value={couponSell.availableCount}
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
                value={couponSell.remark ? couponSell.remark : ''}
                variant="outlined"
                name="remark"
                onChange={event => {
                  const newCouponSell = cloneDeep(couponSell)
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
