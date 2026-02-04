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
  root: css({
    borderRadius: '24px',
    boxShadow: 'none',
    border: 'none',
  }),
  section: css({
    marginBottom: '32px',
  }),
  sectionTitle: css({
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  sectionTitleBar: css({
    width: '4px',
    height: '18px',
    backgroundColor: '#1A73E8',
    borderRadius: '2px',
  }),
  datePicker: css({
    width: '100%',
    '& .MuiInputBase-root': {
      borderRadius: '8px',
    }
  }),
  genderContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '0 14px',
    backgroundColor: 'transparent',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    height: '42px',
    boxSizing: 'border-box',
    '&:hover': {
      borderColor: '#007AFF',
    },
  }),
  genderLabel: css({
    position: 'absolute',
    top: '-9px',
    left: '10px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.6)',
    backgroundColor: '#FFFFFF',
    padding: '0 4px',
    zIndex: 1,
  }),
  genderWrapper: css({
    position: 'relative',
  }),
}

function GeneralSettings({ profile, onSubmit, onChange, onEmployeeResign, ...rest }) {
  const vaild =
    Object.keys(profile)
      .filter(d => profile[d] === '' || (profile[d] === 0 && d !== 'designerNo'))
      .indexOf(true) !== -1
  return (
    <Card {...rest} css={styles.root}>
      <CardContent sx={{ padding: '32px !important' }}>
        {/* 基本資料 */}
        <div css={styles.section}>
          <div css={styles.sectionTitle}>
            <div css={styles.sectionTitleBar} />
            基本資料
          </div>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="姓氏"
                name="lastName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.lastName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="名字"
                name="firstName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.firstName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="暱稱"
                name="nickName"
                placeholder="例如: 小王"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.nickName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <DatePicker
                css={styles.datePicker}
                label="出生日期"
                value={profile.birthday || null}
                format='yyyy/MM/dd'
                onChange={value => onChange({ value: new Date(value).getTime(), key: 'birthday' })}
                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <div css={styles.genderWrapper}>
                <span css={styles.genderLabel}>性別</span>
                <div css={styles.genderContainer}>
                  <RadioGroup
                    row
                    name="gender"
                    value={profile.gender || ""}
                    onChange={event => onChange({ value: event.target.value, key: 'gender' })}
                  >
                    <FormControlLabel value="MALE" control={<Radio size="small" />} label="男" />
                    <FormControlLabel value="FEMALE" control={<Radio size="small" />} label="女" />
                  </RadioGroup>
                </div>
              </div>
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="員工編號 / 代碼"
                name="designerNo"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.designerNo || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="手機號碼"
                name="cellphone"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.cellphone || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="電子信箱"
                name="email"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.email || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <DatePicker
                css={styles.datePicker}
                label="到職日期"
                value={profile.employmentStartDate || null}
                format='yyyy/MM/dd'
                onChange={value => onChange({ value: new Date(value).getTime(), key: 'employmentStartDate' })}
                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="通訊住址"
                name="contactAddress"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.contactAddress || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="戶籍住址"
                name="address"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.address || ""}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </div>

        {/* 銀行帳戶資料 */}
        <div css={styles.section}>
          <div css={styles.sectionTitle}>
            <div css={styles.sectionTitleBar} />
            匯款帳戶資料
          </div>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="銀行代號"
                name="bankCode"
                placeholder="例如: 822"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankCode || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="匯款銀行名稱"
                name="bankName"
                placeholder="例如: 中國信託"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="分行名稱"
                name="bankBranchName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankBranchName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="銀行匯款帳號"
                name="bankAccount"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankAccount || ""}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </div>

        {/* 其他與緊急聯繫人 */}
        <div css={styles.section}>
          <div css={styles.sectionTitle}>
            <div css={styles.sectionTitleBar} />
            其他與緊急聯繫人
          </div>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="聯絡人姓名"
                name="familyMemberName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberName || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="關係"
                name="familyMemberRelation"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberRelation || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="聯絡電話"
                name="familyMemberPhone"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberPhone || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="聯絡地址"
                name="familyMemberAddress"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberAddress || ""}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="員工備註"
                name="remark"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.remark || ""}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </div>
      </CardContent>
    </Card>
  )
}

GeneralSettings.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default GeneralSettings
