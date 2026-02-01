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
  colors
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import idx from 'idx'
import PropTypes from 'prop-types'
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
    '& span.MuiRadio-root': {
      padding: 9
    }
  }),
  btnDiv: css({
    display: 'flex',
    justifyContent: 'space-between',
  })
}

function GeneralSettings({ profile, onSubmit, onChange, onEmployeeResign, ...rest }) {
  const vaild =
    Object.keys(profile)
      .filter(d => profile[d] === '' || (profile[d] === 0 && d !== 'designerNo'))
      .indexOf(true) !== -1
  return (
    <Card {...rest} css={styles.root}>
      <CardHeader title="個人資料" />
      <Divider />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="姓氏"
              name="lastName"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              value={profile.lastName !== null ? profile.lastName : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="名字"
              name="firstName"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              value={profile.firstName !== null ? profile.firstName : ""}
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
              onChange={event =>
                onChange(idx(event, _ => ({ value: new Date(event).getTime(), key: 'birthday' })))
              }
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <FormLabel>性別</FormLabel>
            <RadioGroup
              aria-label="gender"
              name="gender"
              value={profile.gender !== null ? profile.gender : ""}
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: 'gender' })))
              }
              css={styles.gender}
            >
              <FormControlLabel value="MALE" control={<Radio />} label="男" />
              <FormControlLabel value="FEMALE" control={<Radio />} label="女" />
            </RadioGroup>
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="暱稱"
              name="nickName"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.nickName !== null ? profile.nickName : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="員工編號"
              name="designerNo"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.designerNo !== null ? profile.designerNo : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="手機號碼"
              name="cellphone"
              type="text"
              value={profile.cellphone !== null ? profile.cellphone : ""}
              variant="outlined"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
            />
          </Grid>
          {/* <Grid item md={3} xs={12}>
            <TextField
              fullWidth
              label="勞健保級距"
              name="insuranceGrade"
              type="number"
              value={profile.insuranceGrade}
              variant="outlined"
              onChange={event =>
                onChange(idx(event, _ => ({ value: parseInt(_.target.value), key: _.target.name })))
              }
            />
          </Grid>
          <Grid item md={3} xs={12}>
            <TextField
              fullWidth
              label="勞健保自付款"
              name="insuranceDeductible"
              type="number"
              value={profile.insuranceDeductible}
              variant="outlined"
              onChange={event =>
                onChange(idx(event, _ => ({ value: parseInt(_.target.value), key: _.target.name })))
              }
            />
          </Grid> */}
          <Grid item md={6} xs={12}>
            <DatePicker
              css={styles.datePicker}
              label="到職日期"
              value={profile.employmentStartDate !== null ? profile.employmentStartDate : ""}
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
              onChange={event =>
                onChange(idx(event, _ => ({ value: new Date(event).getTime(), key: 'employmentStartDate' })))
              }
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <TextField
              fullWidth
              label="銀行代號"
              name="bankCode"
              type="text"
              value={profile.bankCode !== null ? profile.bankCode : ""}
              variant="outlined"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <TextField
              fullWidth
              label="匯款銀行"
              name="bankName"
              type="text"
              value={profile.bankName !== null ? profile.bankName : ""}
              variant="outlined"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <TextField
              fullWidth
              label="匯款分行"
              name="bankBranchName"
              type="text"
              value={profile.bankBranchName !== null ? profile.bankBranchName : ""}
              variant="outlined"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              fullWidth
              label="匯款帳號"
              name="bankAccount"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.bankAccount !== null ? profile.bankAccount : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              fullWidth
              label="身分證字號"
              name="serialNumber"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.serialNumber !== null ? profile.serialNumber : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              fullWidth
              label="電子信箱"
              name="email"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              value={profile.email !== null ? profile.email : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              fullWidth
              label="通訊住址"
              name="contactAddress"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.contactAddress !== null ? profile.contactAddress : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              fullWidth
              label="戶籍住址"
              name="address"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.address !== null ? profile.address : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              fullWidth
              label="自我介紹"
              name="selfIntroduction"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.selfIntroduction !== null ? profile.selfIntroduction : ""}
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
              value={profile.selfIntroductionLink !== null ? profile.selfIntroductionLink : ""}
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              fullWidth
              label="備註"
              name="remark"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.remark !== null ? profile.remark : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={3} xs={12}>
            <TextField
              fullWidth
              label="家屬姓名"
              name="familyMemberName"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.familyMemberName !== null ? profile.familyMemberName : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={2} xs={12}>
            <TextField
              fullWidth
              label="關係"
              name="familyMemberRelation"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.familyMemberRelation !== null ? profile.familyMemberRelation : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={3} xs={12}>
            <TextField
              fullWidth
              label="電話"
              name="familyMemberPhone"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.familyMemberPhone !== null ? profile.familyMemberPhone : ""}
              variant="outlined"
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <TextField
              fullWidth
              label="住址"
              name="familyMemberAddress"
              onChange={event =>
                onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))
              }
              type="text"
              value={profile.familyMemberAddress !== null ? profile.familyMemberAddress : ""}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions css={styles.btnDiv}>
        <Button
          type="submit"
          variant="contained"
          color='error'
          onClick={onEmployeeResign}
        >
          員工離職
        </Button>
        <Button
          css={styles.saveButton}
          type="submit"
          variant="contained"
          disabled={vaild}
          onClick={onSubmit}
        >
          儲存並返回列表
        </Button>
      </CardActions>
    </Card>
  )
}

GeneralSettings.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default GeneralSettings
