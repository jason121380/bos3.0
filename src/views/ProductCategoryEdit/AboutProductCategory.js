/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, TextField } from '@mui/material'
import PropTypes from 'prop-types'
import useStore from 'hooks/useStore'

import styles from './styles/AboutProductCategory'

function AboutProductCategory({ className, productCategory, onChange, ...rest }) {
  const { errors, register } = useStore()

  return (
    <Card {...rest} css={className}>
      <CardHeader title="一般資訊" />
      <CardContent>
        <TextField
          name="no"
          inputProps={{
            ref: register({
              required: '代號 為必填',
            }),
            'data-testid': 'no',
          }}
          label="代號"
          variant="outlined"
          fullWidth
          error={!!errors.no}
          helperText={errors.no && errors.no.message}
          css={styles.formControl}
        />
        <TextField
          label="名稱"
          variant="outlined"
          error={!!errors.name}
          fullWidth
          css={styles.formControl}
          name="name"
          helperText={errors.name && errors.name.message}
          inputProps={{
            ref: register({
              required: '名稱 為必填',
            }),
            'data-testid': 'name',
          }}
        />
      </CardContent>
    </Card>
  )
}

AboutProductCategory.propTypes = {
  className: PropTypes.object,
}

export default AboutProductCategory
