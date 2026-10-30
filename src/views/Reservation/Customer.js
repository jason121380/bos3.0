import { X } from 'lucide-react'
import React from 'react'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'

export default function Customer({ onDelete, customer, friendsNumber, onCustomerChange, customerKey }) {
  const [serviceCategoryLabelWidth, setServiceCategoryLabelWidth] = React.useState(0)
  const serviceCategoryRef = React.useRef()
  let FN
  if (friendsNumber) {
    FN = friendsNumber
  } else {
    FN = 0
  }
  React.useEffect(() => {
    setServiceCategoryLabelWidth(serviceCategoryRef.current && serviceCategoryRef.current.offsetWidth ? serviceCategoryRef.current.offsetWidth : 0)
  }, [])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {customerKey !== 'main' ? (
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-heading text-text">{`好友 ${friendsNumber}`}</h2>
            <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="移除好友" onClick={onDelete} data-testid="remove-friend">
              <X strokeWidth={1.75} />
            </Button>
          </div>
        ) : (
          ''
        )}
        <Field label="顧客姓名" required>
          <Input
            className="h-11"
            value={customer.name}
            placeholder="顧客姓名 *"
            onChange={e => {
              onCustomerChange({ value: e.target.value, customerKey: 'name' })
            }}
            required
            data-testid={`customer-name-${FN}`}
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
            data-testid={`customer-cellphone-${FN}`}
          />
          {customer.cellphoneErr ? <p className="text-caption text-danger">＊請輸入有效手機號碼</p> : ''}
        </Field>
      </CardContent>
    </Card>
  )
}
