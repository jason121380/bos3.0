/** @jsxImportSource @emotion/react */
import {
  TextField, Checkbox, FormControlLabel
} from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import produce from 'immer'
import _ from 'lodash'

import styles from './styles/Services'

function NonDesignationBookingLimitSetting({
  className, inputEnable, aboutBooking, setAboutBooking
}) {
  const handleInputChange = (event, key) => {
    setAboutBooking(
      produce( draft => {
        draft[key] = parseInt(event.target.value === "" ? 0 : Math.abs(event.target.value))
      })
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>同時段預約人數上限</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ gap: 12, flexWrap: 'wrap' }} css={styles.serviceInputGroup}>
          <TextField
            disabled={!inputEnable || aboutBooking.isDynamicBookingLimitUsing}
            variant="outlined"
            label="不指定人數"
            type="number"
            value={aboutBooking.nonDesignationOrderLimit}
            onChange={event => handleInputChange(event, 'nonDesignationOrderLimit')}
            onFocus={e => e.target.select()}
            onWheel={() => document.activeElement.blur()}       
          />
          <FormControlLabel
            disabled={!inputEnable}
            control={<Checkbox color="primary" />}
            label='浮動式預約人數上限'
            checked={aboutBooking.isDynamicBookingLimitUsing}
            onChange={(e, v) => {
              setAboutBooking(
                produce(draft => { draft.isDynamicBookingLimitUsing = v })
              )
            }}
          />
        </div>
        <div css={styles.serviceInputGroup}>
          <TextField
            disabled={!inputEnable}
            variant="outlined"
            label="指定人數"
            type="number"
            value={aboutBooking.designationOrderLimit}
            onChange={event => handleInputChange(event, 'designationOrderLimit')}
            onFocus={e => e.target.select()}
            onWheel={() => document.activeElement.blur()}              
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(NonDesignationBookingLimitSetting)
