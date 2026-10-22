import { Field, Input } from 'ui/input'
import { CheckboxField } from 'ui/checkbox'
import CustomerTicketRecordAutoComplete from 'components/CustomerTicketRecordAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import billContext from 'context/keyInContext'
import idx from 'idx'
import React, { Fragment } from 'react'
import useCouponUseRow from 'views/OrderShared/useCouponUseRow'

// 版面比照打帳單（views/OrderCreate/styles/CouponUse）：欄位上方標籤、靠底對齊、窄螢幕換行不擠壓
// 原 emotion styles 逐值轉 Tailwind（spacing 單位 8px）。className 傳給自動完成元件（原以 css={className} 套在根節點）
const styles = {
  couponUse: 'flex items-end justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[150px] min-w-[150px] flex mr-[12px]',
  couponField: 'w-[250px] flex mr-[12px]',
  priceField: 'w-[65px] flex mr-[12px]',
  checkbox: 'w-[100px] flex mr-[12px] last:mr-0',
}

export default function CouponUse({
  index,
  couponUsages,
  couponUsage,
  onChange,
}) {
  const { bill, orderId } = React.useContext(billContext)
  // 金額、助理欄位與選卡券／改助理的處理（OrderShared/useCouponUseRow，與帳單詳細／掛單詳細共用）
  const {
    price, ticketOrderHelpers, handleCustomerTicketChange, handleAssistantChange, displayFloat,
  } = useCouponUseRow({ index, couponUsage, onChange })


  return (
    <Fragment>
      <div className={styles.couponUse}>
        {bill.customerId && (
          <Field label="預收卡">
            <CustomerTicketRecordAutoComplete
              className={styles.couponField}
              customerId={bill.customerId}
              value={couponUsage.customerTicketId}
              onChange={handleCustomerTicketChange}
              orderId={orderId}
              isUseTicket={true}
              couponUsages={couponUsages}
              editOrderUseTicketDisabled={true}
              inputProps={{ 'data-testid': '', placeholder: '卡券名稱/代號' }}
            />
          </Field>
        )}
        {couponUsage.customerTicketId && (
          <React.Fragment>
            <Field label="金額" className={styles.priceField}>
              <Input
                disabled
                value={displayFloat(price)}
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
                    className={styles.field}
                  />
                </Field>
                <CheckboxField
                  label="指定"
                  checked={data.isDesignate}
                  className={styles.checkbox}
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
