import { TextField } from '@mui/material'
import PropTypes from 'prop-types'
import useStore from 'hooks/useStore'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

function AboutProject({ className }) {
  const { register, errors } = useStore()
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <TextField
          label="代號"
          variant="outlined"
          fullWidth
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
