/** @jsxImportSource @emotion/react */
import React, { Fragment } from 'react'
import {
  Card, CardContent, CardHeader, FormControl, TextField, Grid,
  Container, Divider, Radio, RadioGroup, FormControlLabel, Button,
  CircularProgress, Snackbar, Alert
} from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
// import ReCAPTCHA from "react-google-recaptcha-enterprise"
import styles from './Styles'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const General = ({
  data, handleSetInputValue, isClick, closeSnackBar,
  openSnack, handleSubmit, /* reCaptchaRef */
}) => {
  return (
    <Fragment>
      <Container maxWidth='md'>
        <Card>
          <CardHeader title={`${data.merchantName}  顧客資料建立`} />
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                姓名<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.name}
                  fullWidth
                  variant="outlined"
                  inputProps={{ maxLength: 20 }}
                  placeholder='字數限制20字'
                  onChange={e => handleSetInputValue(e.target.value, 'name')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                電話<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.cellphone}
                  inputProps={{ maxLength: 10 }}
                  placeholder='ex:0912345678'
                  fullWidth
                  variant="outlined"
                  type="tel"
                  onChange={e => {
                    if (e.target.value.match(/^[0-9]+$/) || e.target.value === '') {
                      handleSetInputValue(e.target.value, 'cellphone')
                    }
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                暱稱
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.nickName}
                  fullWidth
                  variant="outlined"
                  onChange={e => handleSetInputValue(e.target.value, 'nickName')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                性別<span>*</span>
              </Grid>
              <Grid item xs={9}>
                <FormControl component="fieldset">
                  <RadioGroup value={data.gender} onChange={(e, v) => handleSetInputValue(v, 'gender')} row>
                    <FormControlLabel value="MALE" control={<Radio />} label="男" />
                    <FormControlLabel value="FEMALE" control={<Radio />} label="女" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                Email
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.email}
                  fullWidth
                  variant="outlined"
                  type="email"
                  onChange={e => handleSetInputValue(e.target.value, 'email')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                Line ID
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.lineId}
                  fullWidth
                  variant="outlined"
                  onChange={e => handleSetInputValue(e.target.value, 'lineId')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                生日
              </Grid>
              <Grid item xs={9}>
                <MobileDatePicker
                  closeOnSelect
                  format="yyyy/MM/dd"
                  openTo='year'
                  value={data.birthday}
                  localeText={{
                    toolbarTitle: '選擇生日'
                  }}
                  slotProps={{
                    textField: {
                      placeholder: '',
                      fullWidth: true
                    },
                    toolbar: {
                      toolbarFormat: 'yyyy年M月d日'
                    }
                  }}
                  onChange={value => handleSetInputValue(new Date(value).getTime(), 'birthday')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={3} css={styles.label}>
                地址
              </Grid>
              <Grid item xs={9}>
                <TextField
                  value={data.address}
                  fullWidth
                  variant="outlined"
                  onChange={e => handleSetInputValue(e.target.value, 'address')}
                />
              </Grid>
            </Grid>
            {/* <Grid container spacing={2} style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <ReCAPTCHA
                sitekey='6Ld-aOIoAAAAAGbZQp0OxepSjatcmlUIxPuJA8uq'
                onChange={v => handleSetInputValue(v, 'recaptchaToken')}
                ref={reCaptchaRef}
                type='image'
              />
            </Grid> */}
          </CardContent>
        </Card>
        <ThemeProvider theme={theme}>
          <Button
            style={{ marginTop: 20, width: '100%', fontSize: 16, minHeight: 40 }}
            disabled={isClick || !data.recaptchaToken}
            color='primary'
            variant='contained'
            onClick={handleSubmit}
          >{isClick ? <CircularProgress style={{ color: 'white' }} size={22} /> : '提交'}</Button>
        </ThemeProvider>
      </Container>
      <Snackbar
        onClose={closeSnackBar}
        open={openSnack.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert elevation={6} severity={openSnack.severity} variant="filled">{openSnack.message}</Alert>
      </Snackbar>
    </Fragment>
  )
}

export default General