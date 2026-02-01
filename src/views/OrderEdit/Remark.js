/** @jsxImportSource @emotion/react */
import { TextField } from '@mui/material'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import SourceSelect from 'components/SourceSelect'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  payment: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '350px',
    display: 'flex',
    marginRight: '12px !important',
    justifyContent: 'flex-start',
  }),
  field2: css({
    width: '200px !important',
    display: 'flex',
    marginRight: '12px',
    justifyContent: 'flex-start',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  action: css({
    width: '50px',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
}

function Remark() {
  const { bill, handleBillChange } = useContext(billContext)

  return (
    <div css={styles.payment}>
      <TextField
        value={bill.remark ? bill.remark : ''}
        variant="outlined"
        label="備註"
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
