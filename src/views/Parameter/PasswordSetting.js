import { Field, Input } from 'ui/input'
import { CheckboxField } from 'ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import produce from 'immer'


const passwordArr = [
  { label: '編輯訂單密碼', key: 'reCheckoutOrder' },
  { label: '刪除訂單密碼', key: 'deleteOrder' },
  { label: '解除日結密碼', key: 'restoreCheckout' },
  { label: '刪除服務/卡券密碼', key: 'deleteService' },
  { label: '刪除商品密碼', key: 'deleteProduct' },
  { label: '刪除客人密碼', key: 'deleteCustomer' },
  { label: '編輯收支密碼', key: 'editMoneyFlow' },
  { label: '商品入庫密碼', key: 'purchaseStockIn' },
  { label: '取消商品入庫', key: 'purchaseStockInUndo' },
  { label: '取消預約', key: 'cancelReservation' },
]

function PasswordSetting({ className, setPasswordSetting, passwordSetting, inputEnable }) {
  const handlePasswordOnchange = (key, value) => {
    setPasswordSetting(
      produce(draft => {
        draft[key].password = value
      })
    )
  }

  const handleIsUsingOnchange = (key, value) => {
    setPasswordSetting(
      produce(draft => {
        draft[key].isUsing = value
      })
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>密碼設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-[24px]">
          <Field label="萬能密碼" className="w-56">
            <Input
              type="password"
              disabled={!inputEnable}
              value={passwordSetting.superPassword}
              onChange={e => {
                setPasswordSetting(
                  produce(draft => {
                    draft.superPassword = e.target.value
                  })
                )
              }}
            />
          </Field>
        </div>
        {passwordArr.map(({ label, key }) => (
          <div key={label} className="flex items-center mb-[24px]">
            <Field label={label} className="w-56">
              <Input
                type="password"
                disabled={!inputEnable}
                value={passwordSetting[key].password}
                onChange={e => handlePasswordOnchange(key, e.target.value)}
              />
            </Field>
            <CheckboxField
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label="啟用"
              checked={passwordSetting[key].isUsing}
              onChange={(e, v) => handleIsUsingOnchange(key, v)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default memo(PasswordSetting)
