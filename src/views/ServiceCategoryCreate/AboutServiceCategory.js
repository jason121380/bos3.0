// 代號／類別名稱改 Field＋ui Input：register 仍以 ref 掛 react-hook-form、error 訊息由 Field 呈現（文字／驗證時機不變）；備註 multiline 與 Select 保留 MUI
import { FormControl, InputLabel, Select, MenuItem } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import PropTypes from 'prop-types'
import useStore from 'hooks/useStore'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

function AboutServiceCategory({ className, attributions, setAttr, attr, ...rest }) {
  const { register, errors } = useStore()
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Field label="代號" htmlFor="service-category-create-no" error={errors.no && errors.no.message}>
          <Input
            id="service-category-create-no"
            name="no"
            invalid={!!errors.no}
            aria-describedby={errors.no ? 'service-category-create-no-helper-text' : undefined}
            data-testid="no"
            ref={register({
              required: '請填入代號',
            })}
          />
        </Field>
        <Field label="類別名稱" htmlFor="service-category-create-name" error={errors.name && errors.name.message}>
          <Input
            id="service-category-create-name"
            name="name"
            invalid={!!errors.name}
            aria-describedby={errors.name ? 'service-category-create-name-helper-text' : undefined}
            data-testid="name"
            ref={register({
              required: '請填入類別',
            })}
          />
        </Field>
        {/* 服務歸屬是受控下拉（預設「燙」），沒有交給 react-hook-form 驗證，不會有錯誤訊息；原本的 errors.attribution 判斷跑不到，已移除 */}
        <FormControl variant="outlined" fullWidth>
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
