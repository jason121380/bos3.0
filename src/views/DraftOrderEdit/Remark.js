import { Field, Input } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import SourceSelect from 'components/SourceSelect'

// 版面比照打帳單（views/OrderCreate/styles/Remark）：欄位上方標籤、窄螢幕換行不超出卡片
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
      <Field label="訂單來源" className="mr-[12px] flex !w-[200px] max-w-[calc(100%-12px)] justify-start">
        <SourceSelect
          emptyOption
          label=''
          value={bill.source || ''}
          onChange={e => {
            handleBillChange({
              key: 'source',
              value: e.target.value || null,
            })
          }}
        />
      </Field>
    </div>
  )
}

export default memo(Remark)
