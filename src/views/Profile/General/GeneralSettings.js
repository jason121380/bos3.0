/** @jsxImportSource @emotion/react */
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  colors,
} from '@mui/material'
import { DatePicker } from 'ui/date-picker'
import { openSnackbar } from 'elements/snackbars'
import useFetchUserGeneral from 'hooks/useFetchUserGeneral'
import produce from 'immer'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../../theme'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input, Label } from 'ui/input'

const styles = {
  root: css({}),
  saveButton: css({
    color: theme.palette.common.white,
    backgroundColor: colors.green[600] + '!important',
    '&:hover': {
      backgroundColor: colors.green[900] + '!important',
    },
  }),
  datePicker: css({
    '& input.MuiInput-input': {
      padding: '6px 0 7px'
    }
  }),
  gender: css({
    display: 'flex',
    flexDirection: 'row',
  })
}

function GeneralSettings({
  profile,
  refetchProfile,
  // themeChange,
  // setThemeChangeData,
  ...rest
}) {
  const [values, setValues] = useState({
    userId: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    contactAddress: profile.contactAddress,
    address: profile.address,
    serialNumber: profile.serialNumber,
    birthday: profile.birthday,
    gender: profile.gender,
    nickName: profile.nickName,
    designerNo: profile.designerNo,
    cellphone: profile.cellphone,
    status: profile.status,
    selfIntroduction: profile.selfIntroduction,
    selfIntroductionLink: profile.selfIntroductionLink,
  })
  const { fetchUpdateUserGeneral } = useFetchUserGeneral()
  const handleFiledChange = event => {
    event.persist()
    setValues(
      produce(values => {
        values[event.target.name] =
          event.target.type === 'checkbox'
            ? event.target.name === 'isStaff' || event.target.name === 'notDesigner'
              ? event.target.checked === true
              : event.target.checked
            : event.target.value
      })
    )
  }
  const handleSubmit = event => {
    event.preventDefault()
    if (values.cellphone.trim().length < 7) {
      openSnackbar({ message: '手機長度必須大於六碼', variant: 'warning' })
    } else {
      fetchUpdateUserGeneral(values).then(
        () => refetchProfile(),
        openSnackbar({ message: '儲存成功', variant: 'success' })
      )
    }
    // const themeData = {
    //   userId: values.userId,
    //   theme: themeChange.theme,
    // }
    // setThemeChangeData({ input: themeData })
    //   .then(() => {
    //     openSnackbar({ message: '儲存成功', variant: 'success' })
    //     window.location.reload()
    //   })
    //   .catch(() => {
    //     openSnackbar({ message: '佈景主題更新失敗', variant: 'error' })
    //   })
  }
  const handleBirthday = e => {
    setValues(
      produce(produceData => {
        produceData.birthday = new Date(e).getTime()
      })
    )
  }
  const handleGenderChange = event => {
    setValues(
      produce(values => {
        values.gender = event.target.value
      })
    )
  }
  const vaild =
    !Object.keys(values)
      .filter(d => values[d] === '' || (values[d] === 0 && d !== 'designerNo'))
      .indexOf(true) !== -1
  return (
    <Card {...rest}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>個人資料</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Field label="姓氏" htmlFor="profile-general-lastName">
                <Input
                  id="profile-general-lastName"
                  name="lastName"
                  onChange={handleFiledChange}
                  value={values.lastName !== null ? values.lastName : ""}
                />
              </Field>
            </div>
            <div>
              <Field label="名字" htmlFor="profile-general-firstName">
                <Input
                  id="profile-general-firstName"
                  name="firstName"
                  onChange={handleFiledChange}
                  value={values.firstName !== null ? values.firstName : ""}
                />
              </Field>
            </div>
            <div>
              <DatePicker
                css={styles.datePicker}
                // 月曆 facade：label 改由 ui/date-picker 放在欄位上方；textField 的 variant 由 facade 統一成 outlined
                // （原 standard，屬本批預期的視覺改變；styles.datePicker 的 MuiInput 規則在 outlined 下不命中，無害）
                label="生日"
                value={profile.birthday !== null ? profile.birthday : ""}
                format='yyyy/MM/dd'
                openTo='year'
                orientation='portrait'
                localeText={{
                  toolbarTitle: '選擇日期'
                }}
                slotProps={{
                  toolbar: {
                    toolbarFormat: 'yyyy年M月d日'
                  },
                  textField: {
                    variant: 'standard',
                    fullWidth: true
                  }
                }}
                onChange={handleBirthday}
              />
            </div>
            <div>
              <Label>性別</Label>
              <RadioGroup
                aria-label="gender"
                name="gender"
                value={values.gender !== null ? values.gender : ""}
                onChange={handleGenderChange}
                css={styles.gender}
              >
                <FormControlLabel value="MALE" control={<Radio />} label="男" />
                <FormControlLabel value="FEMALE" control={<Radio />} label="女" />
              </RadioGroup>
            </div>
            {/* <Grid item md={6} xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">身份</FormLabel>
                <FormGroup aria-label="position" row>
                  <FormControlLabel
                    value={values.isStaff}
                    control={<Checkbox color="primary" checked={values.isStaff} />}
                    label="設計師身份"
                    labelPlacement="設計師身份"
                    name="isStaff"
                    onChange={handleFiledChange}
                  />
                  <FormControlLabel
                    value={values.notDesigner}
                    control={<Checkbox color="primary" checked={values.notDesigner} />}
                    label="純管理職(不計算薪資)"
                    labelPlacement="純管理職(不計算薪資)"
                    name="notDesigner"
                    onChange={handleFiledChange}
                  />
                </FormGroup>
              </FormControl>
            </Grid> */}
            <div>
              <Field label="暱稱" htmlFor="profile-general-nickName">
                <Input
                  id="profile-general-nickName"
                  name="nickName"
                  onChange={handleFiledChange}
                  type="text"
                  value={values.nickName !== null ? values.nickName : ""}
                />
              </Field>
            </div>
            <div>
              <Field label="設計師編號" htmlFor="profile-general-designerNo">
                <Input
                  id="profile-general-designerNo"
                  name="designerNo"
                  onChange={handleFiledChange}
                  type="text"
                  value={values.designerNo !== null ? values.designerNo : ""}
                />
              </Field>
            </div>
            <div>
              <Field label="手機號碼" htmlFor="profile-general-cellphone">
                <Input
                  id="profile-general-cellphone"
                  name="cellphone"
                  type="text"
                  onChange={handleFiledChange}
                  value={values.cellphone !== null ? values.cellphone : ""}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="身分證字號" htmlFor="profile-general-serialNumber">
                <Input
                  id="profile-general-serialNumber"
                  name="serialNumber"
                  onChange={handleFiledChange}
                  type="text"
                  value={values.serialNumber !== null ? values.serialNumber : ""}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="電子信箱" htmlFor="profile-general-email">
                <Input
                  id="profile-general-email"
                  name="email"
                  onChange={handleFiledChange}
                  value={values.email !== null ? values.email : ""}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="通訊住址" htmlFor="profile-general-contactAddress">
                <Input
                  id="profile-general-contactAddress"
                  name="contactAddress"
                  onChange={handleFiledChange}
                  type="text"
                  value={values.contactAddress !== null ? values.contactAddress : ""}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="戶籍住址" htmlFor="profile-general-address">
                <Input
                  id="profile-general-address"
                  name="address"
                  onChange={handleFiledChange}
                  type="text"
                  value={values.address !== null ? values.address : ""}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="自我介紹" htmlFor="profile-general-selfIntroduction">
                <Input
                  id="profile-general-selfIntroduction"
                  name="selfIntroduction"
                  onChange={handleFiledChange}
                  type="text"
                  value={values.selfIntroduction !== null ? values.selfIntroduction : ""}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="自介連結" htmlFor="profile-general-selfIntroductionLink">
                <Input
                  id="profile-general-selfIntroductionLink"
                  name='selfIntroductionLink'
                  placeholder='請輸入網址 ex: https://www.mlgroup.io'
                  value={values.selfIntroductionLink !== null ? values.selfIntroductionLink : ""}
                  onChange={handleFiledChange}
                />
              </Field>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="primary"
            disabled={!vaild}
          >
            儲存變更
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

GeneralSettings.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default GeneralSettings
