import { DatePicker } from 'ui/date-picker'
import { openSnackbar } from 'elements/snackbars'
import useFetchUserGeneral from 'hooks/useFetchUserGeneral'
import produce from 'immer'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input, Label } from 'ui/input'
import { RadioField } from 'ui/radio'

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
    // 姓、名、手機必填：按鈕已停用，表單以 Enter 送出時也提示且不送出（Jason 2026/10/22「照建議」）
    if (missingFields.length > 0) {
      openSnackbar({ message: `請填寫${missingFields.join('、')}後再儲存`, variant: 'warning' })
      return
    }
    if (values.cellphone.trim().length < 7) {
      openSnackbar({ message: '手機長度必須大於六碼', variant: 'warning' })
    } else {
      // 原本 openSnackbar 寫成 .then 的第二個參數，會在送出當下就執行：存檔還沒完成、甚至失敗也顯示「儲存成功」
      fetchUpdateUserGeneral(values).then(() => {
        refetchProfile()
        openSnackbar({ message: '儲存成功', variant: 'success' })
      })
    }
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
  // 必填（比照新增員工：姓氏、名字、手機號碼）未填時停用「儲存變更」並說明原因（Jason 2026/10/22；
  // 原本 .filter(...).indexOf(true) 永遠是 -1，按鈕永遠可按）
  const missingFields = [
    { key: 'lastName', label: '姓氏' },
    { key: 'firstName', label: '名字' },
    { key: 'cellphone', label: '手機號碼' },
  ]
    .filter(({ key }) => !String(values[key] || '').trim())
    .map(({ label }) => label)
  const vaild = missingFields.length === 0
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
                  value={values.lastName !== null ? values.lastName : ''}
                />
              </Field>
            </div>
            <div>
              <Field label="名字" htmlFor="profile-general-firstName">
                <Input
                  id="profile-general-firstName"
                  name="firstName"
                  onChange={handleFiledChange}
                  value={values.firstName !== null ? values.firstName : ''}
                />
              </Field>
            </div>
            <div>
              <DatePicker
                // 月曆 facade：label 改由 ui/date-picker 放在欄位上方；textField 的 variant 由 facade 統一成 outlined
                // （原 standard，屬本批預期的視覺改變）
                label="生日"
                value={values.birthday !== null ? values.birthday : ''}
                format="yyyy/MM/dd"
                openTo="year"
                orientation="portrait"
                localeText={{
                  toolbarTitle: '選擇日期',
                }}
                slotProps={{
                  toolbar: {
                    toolbarFormat: 'yyyy年M月d日',
                  },
                  textField: {
                    variant: 'standard',
                    fullWidth: true,
                  },
                }}
                onChange={handleBirthday}
              />
            </div>
            <div>
              <Label>性別</Label>
              <div className="flex flex-row gap-4" role="radiogroup" aria-label="gender">
                <RadioField
                  name="gender"
                  value="MALE"
                  checked={(values.gender !== null ? values.gender : '') === 'MALE'}
                  onChange={handleGenderChange}
                  label="男"
                />
                <RadioField
                  name="gender"
                  value="FEMALE"
                  checked={(values.gender !== null ? values.gender : '') === 'FEMALE'}
                  onChange={handleGenderChange}
                  label="女"
                />
              </div>
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
                  value={values.nickName !== null ? values.nickName : ''}
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
                  value={values.designerNo !== null ? values.designerNo : ''}
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
                  value={values.cellphone !== null ? values.cellphone : ''}
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
                  value={values.serialNumber !== null ? values.serialNumber : ''}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="電子信箱" htmlFor="profile-general-email">
                <Input id="profile-general-email" name="email" onChange={handleFiledChange} value={values.email !== null ? values.email : ''} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="通訊住址" htmlFor="profile-general-contactAddress">
                <Input
                  id="profile-general-contactAddress"
                  name="contactAddress"
                  onChange={handleFiledChange}
                  type="text"
                  value={values.contactAddress !== null ? values.contactAddress : ''}
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
                  value={values.address !== null ? values.address : ''}
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
                  value={values.selfIntroduction !== null ? values.selfIntroduction : ''}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="自介連結" htmlFor="profile-general-selfIntroductionLink">
                <Input
                  id="profile-general-selfIntroductionLink"
                  name="selfIntroductionLink"
                  placeholder="請輸入網址 ex: https://www.mlgroup.io"
                  value={values.selfIntroductionLink !== null ? values.selfIntroductionLink : ''}
                  onChange={handleFiledChange}
                />
              </Field>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!vaild && (
            <p id="profile-general-missing" className="text-caption text-text-secondary">
              {`請填寫${missingFields.join('、')}後再儲存`}
            </p>
          )}
          <Button type="submit" variant="primary" disabled={!vaild} aria-describedby={!vaild ? 'profile-general-missing' : undefined}>
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
