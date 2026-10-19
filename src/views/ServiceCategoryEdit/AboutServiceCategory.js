/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { FormControl, FormHelperText, MenuItem, InputLabel, Select } from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import useStore from 'hooks/useStore'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3),
  }),
  fieldGroup: css({
    display: 'flex',
    alignItems: 'center',
  }),
  fieldHint: css({
    margin: theme.spacing(1, 0),
  }),
  tags: css({
    marginTop: theme.spacing(1),
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  }),
  flexGrow: css({
    flexGrow: 1,
  }),
  dateField: css({
    '& + &': {
      marginLeft: theme.spacing(2),
    },
  }),
}

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
          css={styles.formGroup}
          error={!!errors.attribution}
        >
          <InputLabel>服務歸屬</InputLabel>
          <Select
            name="attribution"
            label='服務歸屬'
            onChange={e => setValue('attribution', e.target.value)}
            defaultValue={''}
            value={watchAttribution || ''}
          >
            <MenuItem value={''}>None</MenuItem>
            {attributions.map((data, idx) => (
              <MenuItem value={data.value} key={`attribution-${idx}`}>
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
          css={styles.formGroup}
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
