/** @jsxImportSource @emotion/react */
import { Field, Input } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import SourceSelect from 'components/SourceSelect'

import styles from './styles/Remark'


function Remark() {
  const { bill, handleBillChange } = useContext(billContext)
  return (
    <div css={styles.payment}>
      <Field label="備註" css={styles.field}>
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
      <Field label="訂單來源" css={styles.field2}>
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
