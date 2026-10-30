import { TextField } from 'ui/text-field'
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import CustomerTicketRecordAutoComplete from 'components/CustomerTicketRecordAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import idx from 'idx'
import React, { Fragment } from 'react'
import useCouponUseRow from 'views/OrderShared/useCouponUseRow'
import { ROW_INLINE_ALIGN } from 'views/OrderShared/rowAlign'

export default function CouponUse({ index, couponUsages, couponUsage, onChange }) {
  const { bill, orderId } = React.useContext(billContext)
  // 金額、助理欄位與選卡券／改助理的處理（OrderShared/useCouponUseRow，與帳單詳細／掛單詳細共用）
  // 編輯帳單不得編輯預收卡使用：沒有清除／刪除／新增列，不傳 onClear（hook 的清除不會被呼叫）
  const { price, ticketOrderHelpers, handleCustomerTicketChange, handleAssistantChange, displayFloat } = useCouponUseRow({
    index,
    couponUsage,
    onChange,
  })

  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-start justify-start gap-y-[12px]">
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
              <TextField fullWidth variant="outlined" disabled value={displayFloat(price)} />
            </Field>
            {ticketOrderHelpers.map((data, helperIndex) => (
              <React.Fragment key={`${data.id}-ticketOrder-${helperIndex}-${data.helperId}`}>
                <Field label={data.type}>
                  <EmployeeAutoComplete
                    // 與同列輸入框同高（36px、手機 40px；原本 small 34px 比同列矮 2px，Jason 2026/10/22 fix all）
                    size="medium"
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
                  className={`mr-[12px] flex w-[100px] last:mr-0 ${ROW_INLINE_ALIGN}`}
                  disabled
                />
              </React.Fragment>
            ))}
          </React.Fragment>
        )}
      </div>
    </Fragment>
  )
}
