import React from 'react'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'

// 預約人的姓名、電話。原本預留的「好友」標題列與移除鈕（沒有新增好友的入口，永遠不會出現）與沒有掛到元素上的標籤寬度量測已移除；
// data-testid 維持原本預約人（第 0 位）的 customer-name-0／customer-cellphone-0
export default function Customer({ customer, onCustomerChange }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Field label="顧客姓名" required>
          <Input
            className="h-11"
            value={customer.name}
            placeholder="顧客姓名 *"
            onChange={e => {
              onCustomerChange({ value: e.target.value, customerKey: 'name' })
            }}
            required
            data-testid="customer-name-0"
          />
        </Field>

        <Field label="顧客電話" required>
          <Input
            className="h-11"
            type="tel"
            value={customer.cellphone}
            placeholder="顧客電話 *"
            invalid={customer.cellphoneErr}
            onChange={e => {
              onCustomerChange({ value: e.target.value, customerKey: 'cellphone' })
            }}
            required
            data-testid="customer-cellphone-0"
          />
          {customer.cellphoneErr ? <p className="text-caption text-danger">＊請輸入有效手機號碼</p> : ''}
        </Field>
      </CardContent>
    </Card>
  )
}
