/** @jsxImportSource @emotion/react */
import {
  FormControlLabel, Checkbox
} from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import _ from 'lodash'
import styles from './styles/ReservationSettingForStylist'

function ReservationSettingForStylist({
  className, inputEnable, CBRDStylist, setCBRDStylist
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>預約設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div >
          <FormControlLabel
            disabled={!inputEnable}
            css={styles.isUsing}
            control={<Checkbox color="primary" />}
            label='預約總覽顯示顧客備註'
            checked={CBRDStylist}
            onChange={(e, v) => setCBRDStylist(v)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(ReservationSettingForStylist)