import { CheckboxField } from 'ui/checkbox'
import { Field, Input } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'

function AboutMerchantBankSettings({ 
  className, 
  merchantBankSettings, 
  onChange, 
  inputEnable, 
  setDisplayNonBankAccountInBankTransferReport, 
  displayNonBankAccountInBankTransferReport 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>薪資轉帳設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-[24px]">
          <CheckboxField
            disabled={!inputEnable}
            label="薪資轉帳明細顯示未設定銀行帳號的員工"
            checked={displayNonBankAccountInBankTransferReport}
            onChange={() =>
              setDisplayNonBankAccountInBankTransferReport(!displayNonBankAccountInBankTransferReport)
            }
          />
        </div>
        <Field className="max-w-xs mb-[24px]" label="匯款人姓名" htmlFor="merchantBank-remitterName">
          <Input
            id="merchantBank-remitterName"
            disabled={!inputEnable}
            type="text"
            value={merchantBankSettings.remitterName}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterName' })}
          />
        </Field>
        <Field className="max-w-xs mb-[24px]" label="匯款人銀行名稱" htmlFor="merchantBank-remitterBankName">
          <Input
            id="merchantBank-remitterBankName"
            disabled={!inputEnable}
            type="text"
            value={merchantBankSettings.remitterBankName}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankName' })}
          />
        </Field>
        <Field className="max-w-xs mb-[24px]" label="匯款人帳號" htmlFor="merchantBank-remitterBankAccount">
          <Input
            id="merchantBank-remitterBankAccount"
            disabled={!inputEnable}
            type="text"
            value={merchantBankSettings.remitterBankAccount}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankAccount' })}
          />
        </Field>
        <Field className="max-w-xs mb-[24px]" label="匯款人銀行分行名稱" htmlFor="merchantBank-remitterBankBranchName">
          <Input
            id="merchantBank-remitterBankBranchName"
            disabled={!inputEnable}
            type="text"
            value={merchantBankSettings.remitterBankBranchName}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankBranchName' })}
          />
        </Field>
        <Field className="max-w-xs mb-[24px]" label="匯款人銀行分行代號" htmlFor="merchantBank-remitterBankBranchCode">
          <Input
            id="merchantBank-remitterBankBranchCode"
            disabled={!inputEnable}
            type="text"
            value={merchantBankSettings.remitterBankBranchCode}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankBranchCode' })}
          />
        </Field>
        <Field className="max-w-xs mb-[24px]" label="委託人名稱" htmlFor="merchantBank-trustorName">
          <Input
            id="merchantBank-trustorName"
            disabled={!inputEnable}
            type="text"
            value={merchantBankSettings.trustorName}
            onChange={e => onChange({ changedData: e.target.value, key: 'trustorName' })}
          />
        </Field>
        <Field className="max-w-xs mb-[24px]" label="委託人電話" htmlFor="merchantBank-trustorPhone">
          <Input
            id="merchantBank-trustorPhone"
            disabled={!inputEnable}
            type="text"
            value={merchantBankSettings.trustorPhone}
            onChange={e => onChange({ changedData: e.target.value, key: 'trustorPhone' })}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

export default memo(AboutMerchantBankSettings)
