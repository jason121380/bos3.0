/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { memo } from 'react'

import styles from './styles/AboutMerchantLockedDefault'

const fakePerformanceRefer = [
  {
    value: 'CASH',
    label: '實收金額',
  },
  {
    value: 'PERFORMANCE',
    label: '服務人員業績',
  },
]

function AboutMerchantFakePerformanceReference({
  className,
  setMerchantFakePerformanceRefer,
  merchantFakePerformanceRefer,
  inputEnable,
}) {
  return (
    <Card css={className}>
      <CardHeader title="虛業績依據設定" />
      <Divider />
      <CardContent>
        <div css={styles.serviceInputGroup}>
          <CardActions>
            <FormControl disabled={!inputEnable} variant="outlined" css={styles.field}>
              <InputLabel>虛業績依據</InputLabel>
              <Select
                label='虛業績依據'
                value={merchantFakePerformanceRefer}
                onChange={e => setMerchantFakePerformanceRefer(e.target.value)}
              >
                {fakePerformanceRefer.map((data, idx) => (
                  <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardActions>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutMerchantFakePerformanceReference)
