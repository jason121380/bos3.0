// 文字欄位以 inputProps.ref 掛 react-hook-form 的 register 並有 helperText 驗證訊息，依遷移指南保留 MUI TextField／Select
import {
  FormControl, InputLabel, Select,
  TextField, FormHelperText, MenuItem
} from '@mui/material'
import PropTypes from 'prop-types'
import useStore from 'hooks/useStore'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

function AboutServiceCategory({ className, attributions, setAttr, attr, ...rest }) {
  const { register, errors } = useStore()
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <TextField
          name="no"
          label="代號"
          variant="outlined"
          fullWidth
          inputProps={{
            ref: register({
              required: '請填入代號',
            }),
            'data-testid': 'no',
          }}
          error={!!errors.no}
          helperText={errors.no && errors.no.message}
        />
        <TextField
          name="name"
          label="類別名稱"
          variant="outlined"
          fullWidth
          inputProps={{
            ref: register({
              required: '請填入類別',
            }),
            'data-testid': 'name',
          }}
          error={!!errors.name}
          helperText={errors.name && errors.name.message}
        />
        <FormControl
          variant="outlined"
          fullWidth
          error={!!errors.attribution}
        >
          <InputLabel>服務歸屬</InputLabel>
          <Select
            label="服務歸屬"
            name="attribution"
            value={attr}
            onChange={e => setAttr(e.target.value)}
          >
            {attributions.map((data, idx) => (
              <MenuItem
                value={data.value}
                key={`attribution-${idx}`}
              >
                {data.name}
              </MenuItem>
            ))}
          </Select>
          {errors.attribution && <FormHelperText>{errors.attribution.message}</FormHelperText>}
        </FormControl>
        <TextField
          name="remark"
          label="備註"
          variant="outlined"
          fullWidth
          multiline
          minRows="4"
          inputProps={{
            ref: register,
            'data-testid': 'remark',
          }}
        />
      </CardContent>
    </Card>
  )
}

AboutServiceCategory.propTypes = {
  className: PropTypes.object,
}

export default AboutServiceCategory
