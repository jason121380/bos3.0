/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, Divider, TextField, FormControlLabel, Checkbox } from '@mui/material'
import { memo } from 'react'
import _ from 'lodash'

import styles from './styles/AboutMerchantBankSettings'

function AboutMerchantBankSettings({ 
  className, 
  merchantBankSettings, 
  onChange, 
  inputEnable, 
  setDisplayNonBankAccountInBankTransferReport, 
  displayNonBankAccountInBankTransferReport 
}) {
  return (
    <Card css={className}>
      <CardHeader title="薪資轉帳設定" />
      <Divider />
      <CardContent>
        <div css={styles.serviceInputGroup}>
          <FormControlLabel
            disabled={!inputEnable}
            css={styles.isUsing}
            control={<Checkbox color="primary" />}
            label="薪資轉帳明細顯示未設定銀行帳號的員工"
            checked={displayNonBankAccountInBankTransferReport}
            onChange={() =>
              setDisplayNonBankAccountInBankTransferReport(!displayNonBankAccountInBankTransferReport)
            }
          />
        </div>
        <div css={styles.input}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="匯款人姓名"
            type="text"
            value={merchantBankSettings.remitterName}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterName' })}
          />
        </div>
        <div css={styles.input}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="匯款人銀行名稱"
            type="text"
            value={merchantBankSettings.remitterBankName}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankName' })}
          />
        </div>
        <div css={styles.input}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="匯款人帳號"
            type="text"
            value={merchantBankSettings.remitterBankAccount}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankAccount' })}
          />
        </div>
        <div css={styles.input}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="匯款人銀行分行名稱"
            type="text"
            value={merchantBankSettings.remitterBankBranchName}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankBranchName' })}
          />
        </div>
        <div css={styles.input}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="匯款人銀行分行代號"
            type="text"
            value={merchantBankSettings.remitterBankBranchCode}
            onChange={e => onChange({ changedData: e.target.value, key: 'remitterBankBranchCode' })}
          />
        </div>
        <div css={styles.input}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="委託人名稱"
            type="text"
            value={merchantBankSettings.trustorName}
            onChange={e => onChange({ changedData: e.target.value, key: 'trustorName' })}
          />
        </div>
        <div css={styles.input}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="委託人電話"
            type="text"
            value={merchantBankSettings.trustorPhone}
            onChange={e => onChange({ changedData: e.target.value, key: 'trustorPhone' })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutMerchantBankSettings)
