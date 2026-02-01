/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, TextField, Autocomplete } from '@mui/material'
import _ from 'lodash'
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

function AboutMerchantVendorEdit({ className, vendorOption, isLodaing, submitData, setSubmitData }) {
  const handleInputChange = (key, value) => {
    const newData = _.cloneDeep(submitData)
    newData[key] = value
    setSubmitData(newData)
  }

  return (
    <Card css={className}>
      <CardHeader title="廠商資訊" style={{ paddingBottom: '0' }} />
      <CardContent>
        <Autocomplete
          disabled={isLodaing}
          css={styles.formGroup}
          options={vendorOption}
          value={submitData.vendorUUId}
          autoHighlight
          getOptionLabel={option => option ? option.name : ''}
          onChange={(event, value) => handleInputChange('vendorUUId', value)}
          renderOption={(props, option) => (
            <li {...props}>{option.name}</li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              label="選擇廠商"
              variant="outlined"
              fullWidth
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password',
              }}
            />
          )}
        />
        <TextField
          label="代號"
          variant="outlined"
          fullWidth
          value={submitData.no}
          onChange={event => handleInputChange('no', event.target.value)}
          css={styles.formGroup}
        />
        <TextField
          label="名稱"
          variant="outlined"
          fullWidth
          value={submitData.name}
          onChange={event => handleInputChange('name', event.target.value)}
          css={styles.formGroup}
        />
        <TextField
          label="暱稱"
          variant="outlined"
          fullWidth
          value={submitData.nickname}
          onChange={event => handleInputChange('nickname', event.target.value)}
          css={styles.formGroup}
        />
        <TextField
          label="備註"
          variant="outlined"
          fullWidth
          value={submitData.remark}
          onChange={event => handleInputChange('remark', event.target.value)}
          css={styles.formGroup}
        />
      </CardContent>
    </Card>
  )
}
export default AboutMerchantVendorEdit