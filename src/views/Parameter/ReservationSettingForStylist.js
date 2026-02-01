/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, Divider,
  FormControlLabel, Checkbox
} from '@mui/material'
import { memo } from 'react'
import _ from 'lodash'
import styles from './styles/ReservationSettingForStylist'

function ReservationSettingForStylist({
  className, inputEnable, CBRDStylist, setCBRDStylist
}) {
  return (
    <Card css={className}>
      <CardHeader title="預約設定" />
      <Divider />
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