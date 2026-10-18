/** @jsxImportSource @emotion/react */
// 大型頁策略：表單欄位（TextField、DatePicker、RadioGroup）保留 MUI，只換外框與區塊標題
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import idx from 'idx'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'
import { Card, CardContent } from 'ui/card'

const styles = {
  datePicker: css({
    width: '100%',
  }),
}

const SectionTitle = ({ children }) => <h3 className="mb-4 text-heading text-text">{children}</h3>

function GeneralSettings({ profile, onSubmit, onChange, onEmployeeResign, ...rest }) {
  const vaild =
    Object.keys(profile)
      .filter(d => profile[d] === '' || (profile[d] === 0 && d !== 'designerNo'))
      .indexOf(true) !== -1
  return (
    <Card {...rest}>
      <CardContent className="flex flex-col gap-8">
        {/* 基本資料 */}
        <section>
          <SectionTitle>基本資料</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <TextField
                fullWidth
                label="姓氏"
                name="lastName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.lastName || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="名字"
                name="firstName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.firstName || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="暱稱"
                name="nickName"
                placeholder="例如: 小王"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.nickName || ""}
                variant="outlined"
              />
            </div>
            <div>
              <DatePicker
                css={styles.datePicker}
                label="出生日期"
                value={profile.birthday || null}
                format='yyyy/MM/dd'
                onChange={value => onChange({ value: new Date(value).getTime(), key: 'birthday' })}
                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              />
            </div>
            <div>
              <div className="relative">
                <span className="absolute -top-2 left-2.5 z-[1] bg-background px-1 text-caption text-text-secondary">性別</span>
                <div className="box-border flex h-[42px] items-center gap-6 rounded-md border border-solid border-border-strong px-3.5 hover:border-accent">
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
            </div>
            <div>
              <TextField
                fullWidth
                label="員工編號 / 代碼"
                name="designerNo"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.designerNo || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="手機號碼"
                name="cellphone"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.cellphone || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="電子信箱"
                name="email"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.email || ""}
                variant="outlined"
              />
            </div>
            <div>
              <DatePicker
                css={styles.datePicker}
                label="到職日期"
                value={profile.employmentStartDate || null}
                format='yyyy/MM/dd'
                onChange={value => onChange({ value: new Date(value).getTime(), key: 'employmentStartDate' })}
                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="通訊住址"
                name="contactAddress"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.contactAddress || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="戶籍住址"
                name="address"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.address || ""}
                variant="outlined"
              />
            </div>
          </div>
        </section>

        {/* 銀行帳戶資料 */}
        <section>
          <SectionTitle>匯款帳戶資料</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <TextField
                fullWidth
                label="銀行代號"
                name="bankCode"
                placeholder="例如: 822"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankCode || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="匯款銀行名稱"
                name="bankName"
                placeholder="例如: 中國信託"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankName || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="分行名稱"
                name="bankBranchName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankBranchName || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="銀行匯款帳號"
                name="bankAccount"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.bankAccount || ""}
                variant="outlined"
              />
            </div>
          </div>
        </section>

        {/* 其他與緊急聯繫人 */}
        <section>
          <SectionTitle>其他與緊急聯繫人</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <TextField
                fullWidth
                label="聯絡人姓名"
                name="familyMemberName"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberName || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="關係"
                name="familyMemberRelation"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberRelation || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="聯絡電話"
                name="familyMemberPhone"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberPhone || ""}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="聯絡地址"
                name="familyMemberAddress"
                onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                value={profile.familyMemberAddress || ""}
                variant="outlined"
              />
            </div>
            <div className="md:col-span-2">
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
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}

GeneralSettings.propTypes = {
  profile: PropTypes.object.isRequired,
}

export default GeneralSettings
