// 大型頁策略：DatePicker 改用 ui/date-picker facade；單行純文字欄改 Field 上方標籤＋ui Input（TextField 試點，name／value／onChange 原樣）；多行備註 TextField 保留 MUI；性別改 ui/radio（RadioField 原生圓點，name/value/onChange 原樣）
import { TextField } from 'ui/text-field'
import { DatePicker } from 'ui/date-picker'
import { RadioField } from 'ui/radio'
import { Field, Input } from 'ui/input'
import idx from 'idx'
import PropTypes from 'prop-types'
import { Card, CardContent } from 'ui/card'


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
              <Field label="姓氏">
                <Input
                  name="lastName"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.lastName || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="名字">
                <Input
                  name="firstName"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.firstName || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="暱稱">
                <Input
                  name="nickName"
                  placeholder="例如: 小王"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.nickName || ""}
                />
              </Field>
            </div>
            <div>
              <DatePicker
                className="w-full"
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
                  <div role="radiogroup" aria-label="性別" className="flex items-center gap-4">
                    <RadioField name="gender" value="MALE" checked={(profile.gender || "") === 'MALE'} onChange={event => onChange({ value: event.target.value, key: 'gender' })} label="男" />
                    <RadioField name="gender" value="FEMALE" checked={(profile.gender || "") === 'FEMALE'} onChange={event => onChange({ value: event.target.value, key: 'gender' })} label="女" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Field label="員工編號 / 代碼">
                <Input
                  name="designerNo"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.designerNo || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="手機號碼">
                <Input
                  name="cellphone"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.cellphone || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="電子信箱">
                <Input
                  name="email"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.email || ""}
                />
              </Field>
            </div>
            <div>
              <DatePicker
                className="w-full"
                label="到職日期"
                value={profile.employmentStartDate || null}
                format='yyyy/MM/dd'
                onChange={value => onChange({ value: new Date(value).getTime(), key: 'employmentStartDate' })}
                slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              />
            </div>
            <div>
              <Field label="通訊住址">
                <Input
                  name="contactAddress"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.contactAddress || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="戶籍住址">
                <Input
                  name="address"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.address || ""}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* 銀行帳戶資料 */}
        <section>
          <SectionTitle>匯款帳戶資料</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Field label="銀行代號">
                <Input
                  name="bankCode"
                  placeholder="例如: 822"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.bankCode || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="匯款銀行名稱">
                <Input
                  name="bankName"
                  placeholder="例如: 中國信託"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.bankName || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="分行名稱">
                <Input
                  name="bankBranchName"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.bankBranchName || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="銀行匯款帳號">
                <Input
                  name="bankAccount"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.bankAccount || ""}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* 其他與緊急聯繫人 */}
        <section>
          <SectionTitle>其他與緊急聯繫人</SectionTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Field label="聯絡人姓名">
                <Input
                  name="familyMemberName"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.familyMemberName || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="關係">
                <Input
                  name="familyMemberRelation"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.familyMemberRelation || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="聯絡電話">
                <Input
                  name="familyMemberPhone"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.familyMemberPhone || ""}
                />
              </Field>
            </div>
            <div>
              <Field label="聯絡地址">
                <Input
                  name="familyMemberAddress"
                  onChange={event => onChange(idx(event, _ => ({ value: _.target.value, key: _.target.name })))}
                  value={profile.familyMemberAddress || ""}
                />
              </Field>
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
