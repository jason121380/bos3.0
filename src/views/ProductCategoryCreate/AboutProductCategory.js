/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, TextField } from '@mui/material'
import PropTypes from 'prop-types'
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

function AboutProject({ className }) {
  const { register, errors } = useStore()
  return (
    <Card css={className}>
      <CardHeader title="一般資訊" />
      <CardContent>
        <TextField
          label="代號"
          variant="outlined"
          fullWidth
          css={styles.formGroup}
          name="no"
          error={!!errors.no}
          helperText={errors.no && errors.no.message}
          inputProps={{
            ref: register({
              required: '代號 為必填',
            }),
            'data-testid': 'no',
          }}
        />
        <TextField
          label="名稱"
          variant="outlined"
          fullWidth
          css={styles.formGroup}
          name="name"
          error={!!errors.name}
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

AboutProject.propTypes = {
  className: PropTypes.object,
}

export default AboutProject
