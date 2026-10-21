import { Field, Input } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import SourceSelect from 'components/SourceSelect'

const styles = {
  payment: 'flex min-w-0 max-w-full flex-wrap gap-[12px_0] items-end justify-start mb-[24px]',
  field: '!w-[350px] max-w-[calc(100%-12px)] flex mr-[12px] justify-start',
  field2: '!w-[200px] max-w-[calc(100%-12px)] flex mr-[12px] justify-start',
}

function Remark() {
  const { bill, handleBillChange } = useContext(billContext)
  return (
    <div className={styles.payment}>
      <Field label="備註" className={styles.field}>
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
      <Field label="帳單來源" className={styles.field2}>
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
