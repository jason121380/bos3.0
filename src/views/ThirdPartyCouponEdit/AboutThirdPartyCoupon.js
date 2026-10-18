// 扣項方式 Select 的值可能為空字串，保留 MUI Select；同卡片的 TextField（名稱以 inputProps 帶 data-testid）一併保留（橋接主題已套新外觀）
import {
  FormControl, InputLabel, MenuItem,
  Select, TextField, FormControlLabel, Checkbox,
} from '@mui/material'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

const thirdPartyCouponDeductionType = [
  {
    label: '百分比',
    value: 'PERCENT',
  },
  {
    label: '固定金額',
    value: 'AMOUNT',
  },
]

function AboutThirdPartyCoupon({ className, thirdPartyCoupon, onChange, ...rest }) {
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-6">
        <TextField
          value={thirdPartyCoupon.name}
          label="名稱"
          variant="outlined"
          fullWidth
          onChange={event => onChange({ event, key: 'name' })}
          inputProps={{
            'data-testid': 'name',
          }}
        />
        <TextField
          type="number"
          value={thirdPartyCoupon.handlingFee}
          label="手續費"
          variant="outlined"
          onChange={event =>
            onChange({
              event: {
                target: {
                  value: idx(event, _ => parseFloat(_.target.value)),
                },
              },
              key: 'handlingFee',
            })
          }
          fullWidth
          onWheel={() => document.activeElement.blur()}
        />
        <FormControl variant="outlined" fullWidth>
          <InputLabel>手續費扣項方式</InputLabel>
          <Select
            label='手續費扣項方式'
            value={thirdPartyCoupon.type}
            onChange={event =>
              onChange({
                event,
                key: 'type',
              })
            }
          >
            <MenuItem value="" disabled>
              <em>選擇手續費扣項方式</em>
            </MenuItem>
            {thirdPartyCouponDeductionType.map(key => (
              <MenuItem value={key.value} key={`thirdPartyCoupon-${key.value}`}>
                {key.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Checkbox color="primary" />}
          label="金額呈現為0"
          checked={thirdPartyCoupon.isNoCash}
          onChange={() => {
            onChange({
              event: {
                target: {
                  value: !thirdPartyCoupon.isNoCash,
                },
              },
              key: 'isNoCash',
            })
          }}
        />
      </CardContent>
    </Card>
  )
}

AboutThirdPartyCoupon.propTypes = {
  className: PropTypes.object,
}

export default AboutThirdPartyCoupon
