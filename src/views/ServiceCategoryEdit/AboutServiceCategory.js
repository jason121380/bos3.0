/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, CardHeader, FormControl, FormHelperText, MenuItem,
  InputLabel, Select, TextField,
} from '@mui/material'
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
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="一般資訊" />
      <CardContent>
        <TextField
          name="no"
          label="代號"
          variant="outlined"
          fullWidth
          css={styles.formGroup}
          inputProps={{
            ref: register({
              required: '代號為必填',
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
          css={styles.formGroup}
          inputProps={{
            ref: register({
              required: '類別為必填',
            }),
            'data-testid': 'name',
          }}
          error={!!errors.name}
          helperText={errors.name && errors.name.message}
        />
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
