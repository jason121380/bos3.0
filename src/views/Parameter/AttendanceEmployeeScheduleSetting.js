/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider, FormControlLabel,
  Checkbox
} from '@mui/material'
import { memo } from 'react'
import _ from 'lodash'

import styles from './styles/BookingNotificationLineAtSetting'

function AttendanceEmployeeScheduleSetting({
  className, UESUsing, setUESUsing, inputEnable
}) {
  return (
    <Card css={className}>
      <CardHeader title="考勤排班總表設定" />
      <Divider />
      <CardContent>
        <div css={styles.serviceInputGroup}>
          <FormControlLabel
            disabled={!inputEnable}
            css={styles.isUsing}
            control={<Checkbox color="primary" />}
            label="可編輯過往班別"
            checked={UESUsing}
            onChange={(e, v) => setUESUsing(v)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AttendanceEmployeeScheduleSetting)
