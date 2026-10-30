// 代號／類別名稱改 Field＋ui Input：register 仍以 ref 掛 react-hook-form、error 訊息由 Field 呈現（文字／驗證時機不變）；備註 multiline 使用 ui/form-control、下拉使用 ui/native-select
import { FormControl, FormHelperText } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
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
        <FormControl variant="outlined" fullWidth error={!!errors.attribution}>
          <NativeSelect
            name="attribution"
            value={attr}
            onChange={e => setAttr(e.target.value)}
            displayEmpty={false}
            placeholder="請選擇…"
            error={!!errors.attribution}
            label="服務歸屬"
          >
            {attributions.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`attribution-${idx}`}>
                {data.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
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
