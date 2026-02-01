/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  colors,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { openSnackbar } from 'elements/snackbars'
import useFetchUserGeneral from 'hooks/useFetchUserGeneral'
import produce from 'immer'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

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
    <Card {...rest} css={styles.root}>
      <form onSubmit={handleSubmit}>
        <CardHeader title="個人資料" />
        <Divider />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="姓氏"
                name="lastName"
                onChange={handleFiledChange}
                value={values.lastName !== null ? values.lastName : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="名字"
                name="firstName"
                onChange={handleFiledChange}
                value={values.firstName !== null ? values.firstName : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <DatePicker
                css={styles.datePicker}
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
            </Grid>
            <Grid item md={6} xs={12}>
              <FormLabel>性別</FormLabel>
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
            </Grid>
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
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="暱稱"
                name="nickName"
                onChange={handleFiledChange}
                type="text"
                value={values.nickName !== null ? values.nickName : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="設計師編號"
                name="designerNo"
                onChange={handleFiledChange}
                type="text"
                value={values.designerNo !== null ? values.designerNo : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="手機號碼"
                name="cellphone"
                type="text"
                onChange={handleFiledChange}
                value={values.cellphone !== null ? values.cellphone : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                fullWidth
                label="身分證字號"
                name="serialNumber"
                onChange={handleFiledChange}
                type="text"
                value={values.serialNumber !== null ? values.serialNumber : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                fullWidth
                label="電子信箱"
                name="email"
                onChange={handleFiledChange}
                value={values.email !== null ? values.email : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                fullWidth
                label="通訊住址"
                name="contactAddress"
                onChange={handleFiledChange}
                type="text"
                value={values.contactAddress !== null ? values.contactAddress : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                fullWidth
                label="戶籍住址"
                name="address"
                onChange={handleFiledChange}
                type="text"
                value={values.address !== null ? values.address : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                fullWidth
                label="自我介紹"
                name="selfIntroduction"
                onChange={handleFiledChange}
                type="text"
                value={values.selfIntroduction !== null ? values.selfIntroduction : ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                fullWidth
                name='selfIntroductionLink'
                variant='outlined'
                label='自介連結'
                placeholder='請輸入網址 ex: https://www.mlgroup.io'
                value={values.selfIntroductionLink !== null ? values.selfIntroductionLink : ""}
                onChange={handleFiledChange}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            css={styles.saveButton}
            type="submit"
            variant="contained"
            disabled={!vaild}
          >
            儲存變更
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

GeneralSettings.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default GeneralSettings
