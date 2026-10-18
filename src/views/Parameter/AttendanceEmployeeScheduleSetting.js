/** @jsxImportSource @emotion/react */
import {
  FormControlLabel, Checkbox
} from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import _ from 'lodash'

import styles from './styles/BookingNotificationLineAtSetting'

function AttendanceEmployeeScheduleSetting({
  className, UESUsing, setUESUsing, inputEnable
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>考勤排班總表設定</CardTitle>
      </CardHeader>
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
