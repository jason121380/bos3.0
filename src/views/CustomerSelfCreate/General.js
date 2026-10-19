import React, { Fragment } from 'react'
import {
  FormControl, Radio, RadioGroup, FormControlLabel,
  Snackbar, Alert
} from '@mui/material'
import { MobileDatePicker } from 'ui/date-picker'
// import ReCAPTCHA from "react-google-recaptcha-enterprise"
import { LoaderCircle } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'

const General = ({
  data, handleSetInputValue, isClick, closeSnackBar,
  openSnack, handleSubmit, /* reCaptchaRef */
}) => {
  return (
    <Fragment>
      <div className="flex flex-col gap-4">
        <h1 className="text-title !font-bold text-text">{`${data.merchantName}  顧客資料建立`}</h1>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Field label="姓名" required htmlFor="self-create-name">
              <Input
                id="self-create-name"
                className="h-11"
                value={data.name}
                maxLength={20}
                placeholder='字數限制20字'
                onChange={e => handleSetInputValue(e.target.value, 'name')}
              />
            </Field>
            <Field label="電話" required htmlFor="self-create-cellphone">
              <Input
                id="self-create-cellphone"
                className="h-11"
                value={data.cellphone}
                maxLength={10}
                placeholder='ex:0912345678'
                type="tel"
                onChange={e => {
                  if (e.target.value.match(/^[0-9]+$/) || e.target.value === '') {
                    handleSetInputValue(e.target.value, 'cellphone')
                  }
                }}
              />
            </Field>
            <Field label="暱稱" htmlFor="self-create-nickname">
              <Input
                id="self-create-nickname"
                className="h-11"
                value={data.nickName}
                onChange={e => handleSetInputValue(e.target.value, 'nickName')}
              />
            </Field>
            <Field label="性別" required>
              <FormControl component="fieldset">
                <RadioGroup value={data.gender} onChange={(e, v) => handleSetInputValue(v, 'gender')} row>
                  <FormControlLabel value="MALE" control={<Radio />} label="男" />
                  <FormControlLabel value="FEMALE" control={<Radio />} label="女" />
                </RadioGroup>
              </FormControl>
            </Field>
            <Field label="Email" htmlFor="self-create-email">
              <Input
                id="self-create-email"
                className="h-11"
                value={data.email}
                type="email"
                onChange={e => handleSetInputValue(e.target.value, 'email')}
              />
            </Field>
            <Field label="Line ID" htmlFor="self-create-line-id">
              <Input
                id="self-create-line-id"
                className="h-11"
                value={data.lineId}
                onChange={e => handleSetInputValue(e.target.value, 'lineId')}
              />
            </Field>
            <Field label="生日">
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
            </Field>
            <Field label="地址" htmlFor="self-create-address">
              <Input
                id="self-create-address"
                className="h-11"
                value={data.address}
                onChange={e => handleSetInputValue(e.target.value, 'address')}
              />
            </Field>
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
        <Button
          variant="primary"
          size="lg"
          className="h-11 w-full"
          disabled={isClick || !data.recaptchaToken}
          onClick={handleSubmit}
        >{isClick ? <LoaderCircle className="animate-spin" strokeWidth={1.75} /> : '提交'}</Button>
      </div>
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
