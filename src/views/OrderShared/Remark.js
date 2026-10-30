import { Field, Input } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import SourceSelect from 'components/SourceSelect'

// 「備註及來源」卡片內的欄位（2026/10/21 合併）。版面：欄位上方標籤、窄螢幕換行不超出卡片。

// 帳單來源：四頁相同
export function BillSourceField() {
  const { bill, handleBillChange } = useContext(billContext)
  return (
    <Field label="帳單來源" className="mr-[12px] flex !w-[200px] max-w-[calc(100%-12px)] justify-start">
      <SourceSelect
        emptyOption
        label=""
        value={bill.source || ''}
        onChange={e => {
          handleBillChange({
            key: 'source',
            value: e.target.value || null,
          })
        }}
      />
    </Field>
  )
}

// 備註＋帳單來源：打帳單與掛單詳細原本各一份、只差 class 順序，合一。
// 帳單詳細與重新開單的備註欄是另一種輸入框（值的處理也不同），各頁自己畫，只共用 BillSourceField
function Remark() {
  const { bill, handleBillChange } = useContext(billContext)

  return (
    <div className="mb-[24px] flex min-w-0 max-w-full flex-wrap items-end justify-start gap-[12px_0]">
      <Field label="備註" className="mr-[12px] flex !w-[350px] max-w-[calc(100%-12px)] justify-start">
        <Input
          value={bill.remark}
          data-testid={'remark'}
          onChange={event => {
            handleBillChange({
              key: 'remark',
              value: event.target.value,
            })
          }}
        />
      </Field>
      <BillSourceField />
    </div>
  )
}

export default memo(Remark)
