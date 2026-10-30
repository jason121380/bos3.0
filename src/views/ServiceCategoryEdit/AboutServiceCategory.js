import { FormControl, FormHelperText } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { TextField } from 'ui/text-field'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import useStore from 'hooks/useStore'

function AboutServiceCategory({ serviceCategory, className, onChange, attributions, ...rest }) {
  const { errors, register, setValue, watch } = useStore()
  const watchAttribution = watch('attribution')

  useEffect(() => {
    register({ name: 'attribution' }, { required: '請選擇服務' })
  }, [register])

  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent>
        <Field label="代號" htmlFor="service-category-edit-no" className="mb-6" error={errors.no && errors.no.message}>
          <Input
            id="service-category-edit-no"
            name="no"
            invalid={!!errors.no}
            aria-describedby={errors.no ? 'service-category-edit-no-helper-text' : undefined}
            data-testid="no"
            ref={register({
              required: '代號為必填',
            })}
          />
        </Field>
        <Field label="類別名稱" htmlFor="service-category-edit-name" className="mb-6" error={errors.name && errors.name.message}>
          <Input
            id="service-category-edit-name"
            name="name"
            invalid={!!errors.name}
            aria-describedby={errors.name ? 'service-category-edit-name-helper-text' : undefined}
            data-testid="name"
            ref={register({
              required: '類別為必填',
            })}
          />
        </Field>
        <FormControl
          variant="outlined"
          fullWidth
          className="mb-[24px]"
          error={!!errors.attribution}
        >
          <NativeSelect
            name="attribution"
            onChange={e => setValue('attribution', e.target.value)}
            defaultValue={''}
            value={watchAttribution || ''}
            displayEmpty={false}
            placeholder="請選擇…"
            error={!!errors.attribution}
            label="服務歸屬"
          >
            <NativeSelectOption value={''}>None</NativeSelectOption>
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
          className="mb-[24px]"
          multiline
          minRows="4"
          inputProps={{
            ref: register,
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
