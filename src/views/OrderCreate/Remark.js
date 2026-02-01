/** @jsxImportSource @emotion/react */
import { TextField } from '@mui/material'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import SourceSelect from 'components/SourceSelect'

import styles from './styles/Remark'


function Remark() {
  const { bill, handleBillChange } = useContext(billContext)
  return (
    <div css={styles.payment}>
      <TextField
        value={bill.remark}
        variant="outlined"
        label="備註"
        InputLabelProps={{ shrink: true }}
        inputProps={{
          'data-testid': 'remark',
        }}
        css={styles.field}
        onChange={event => {
          handleBillChange({
            key: 'remark',
            value: event.target.value,
          })
        }}
      />
      <SourceSelect
        emptyOption
        className={styles.field2}
        label='訂單來源'
        InputLabelProps={{ shrink: true }}
        value={bill.source || ''}
        onChange={e => {
          handleBillChange({
            key: 'source',
            value: e.target.value || null,
          })
        }}
      />
    </div>
  )
}

export default memo(Remark)
