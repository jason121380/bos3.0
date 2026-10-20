/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import billContext from 'context/keyInContext'
import { useContext, memo } from 'react'
import SourceSelect from 'components/SourceSelect'
import { css } from '@emotion/react'
import { theme } from '../../theme'

// 比照打帳單 views/OrderCreate/styles/Remark：上方標籤、窄螢幕換行且不超出卡片
const styles = {
  payment: css({
    display: 'flex',
    minWidth: 0,
    maxWidth: '100%', // 父層是 flex，沒有上限會被內容撐寬、超出卡片
    flexWrap: 'wrap', // 窄螢幕時「訂單來源」換到下一列，不再被切掉
    gap: '12px 0',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '350px !important',
    maxWidth: 'calc(100% - 12px)', // 扣掉 marginRight，窄螢幕才不會超出卡片
    display: 'flex',
    marginRight: '12px',
    justifyContent: 'flex-start',
  }),
  field2: css({
    width: '200px !important',
    maxWidth: 'calc(100% - 12px)', // 扣掉 marginRight，窄螢幕才不會超出卡片
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
      <Field label="備註" css={styles.field}>
        <TextField
          fullWidth
          value={bill.remark}
          variant="outlined"
          inputProps={{
            'data-testid': 'remark',
          }}
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
