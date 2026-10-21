import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import CustomerTicketRecordAutoComplete from 'components/CustomerTicketRecordAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import idx from 'idx'
import React, { Fragment } from 'react'
import useCouponUseRow from 'views/OrderShared/useCouponUseRow'


export default function CouponUse({
  index,
  first,
  last,
  addCouponUse,
  removeCouponUse,
  couponUsages,
  couponUsage,
  onClear,
  onChange,
}) {
  const { bill, orderId } = React.useContext(billContext)
  // 金額、助理欄位與選卡券／改助理／清除的處理（OrderShared/useCouponUseRow，與帳單詳細／掛單詳細共用）
  const {
    price, ticketOrderHelpers, handleCustomerTicketChange, handleAssistantChange, handleClear, displayFloat,
  } = useCouponUseRow({ index, couponUsage, onChange, onClear })


  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-end justify-start gap-y-[12px]">
        {bill.customerId && (
          <Field label="預收卡">
          <CustomerTicketRecordAutoComplete
            className="mr-[12px] flex w-[250px] max-w-full"
            customerId={bill.customerId}
            inputProps={{ 'data-testid': '', placeholder: '卡券名稱/代號' }}
            value={couponUsage.customerTicketId}
            onChange={handleCustomerTicketChange}
            orderId={orderId}
            isUseTicket={true}
            couponUsages={couponUsages}
            editOrderUseTicketDisabled={true}
          />
          </Field>
        )}
        {couponUsage.customerTicketId && (
          <React.Fragment>
            <Field label="金額" className="!mr-[12px] flex w-[65px]">
            <TextField
              fullWidth
              variant="outlined"
              disabled
              value={displayFloat(price)}
              onChange={event =>
                onChange({
                  value: idx(event, _ => _.target.value),
                  key: 'customerTicketId',
                  index,
                })
              }
            />
            </Field>
            {ticketOrderHelpers.map((data, helperIndex) => (
              <React.Fragment key={`${data.id}-ticketOrder-${helperIndex}-${data.helperId}`}>
                <Field label={data.type}>
                <EmployeeAutoComplete
                  placeholder={data.type}
                  value={data.helperId}
                  onChange={value =>
                    handleAssistantChange({
                      value: idx(value, _ => _.userId),
                      assistantIndex: helperIndex,
                      key: 'helperId',
                    })
                  }
                  className="!mr-[12px] flex !w-[150px] !min-w-[150px]"
                />
                </Field>
                <CheckboxField
                  label="指定"
                  checked={data.isDesignate}
                  className="mr-[12px] flex w-[100px] last:mr-0"
                  onChange={(_event, state) =>
                    handleAssistantChange({
                      value: state,
                      assistantIndex: helperIndex,
                      key: 'isDesignate',
                    })
                  }
                  disabled
                />
              </React.Fragment>
            ))}
          </React.Fragment>
        )}
        {/* <BackspaceOutlinedIcon css={styles.action} onClick={handleClear} /> */}
        {/* {!first && couponUsage.customerTicketId && (
          <DeleteForeverIcon
            css={styles.action}
            onClick={function () {
              removeCouponUse({ index })
            }}
          />
        )} */}
      </div>
      {/* {last && couponUsage.customerTicketId && (
        <AddIcon css={styles.action} onClick={addCouponUse} />
      )} */}
    </Fragment>
  )
}
