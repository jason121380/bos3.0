import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import useFetchUpdateCustomerProfile from 'hooks/useFetchUpdateCustomerProfile'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { DatePicker } from 'ui/date-picker'
import { Field, Input } from 'ui/input'

export default function Reservation({ location }) {
  const history = useHistory()
  const { updateCustomer } = useFetchUpdateCustomerProfile()
  React.useEffect(() => {
    const customer = localStorage.getItem('customer')
    if (!customer) {
      history.push(
        `/customer/login?merchantid=${getQueryString({
          key: 'merchantid',
          location,
        })}&redirect=/customer/member/create?merchantid=${getQueryString({
          key: 'merchantid',
          location,
        })}`
      )
      openSnackbar({
        message: '尚未登入',
        variant: 'warning',
      })
    }
  }, [history, location])

  const [profile, setProfile] = React.useState({
    name: '',
    gender: 'MALE',
    birthday: new Date().getTime(),
    recommandCode: '',
  })

  const handleFieldChange = (event, newAlignment) => {
    if (event && event.target) {
      idx(event.target, _ =>
        setProfile(
          produce(draft => {
            draft[_.name || 'gender'] = _.value || newAlignment
          })
        )
      )
    }
    if (event && !event.target) {
      setProfile(
        produce(draft => {
          draft.birthday = event && !event.target ? new Date(event).getTime() : new Date().getTime()
        })
      )
    }
  }

  const vaild = !(profile.name && profile.gender && profile.birthday > 0)
  const handleSubmit = event => {
    event.preventDefault()
    updateCustomer(profile).then(() => {
      openSnackbar({
        message: '註冊成功',
        variant: 'success',
      })
      window.location.href = '/customer/member/card'
    })
  }
  return (
    <Page className="ui-root flex flex-col gap-4" title="成為會員">
      <h1 className="text-title !font-bold text-text">成為會員</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Field label="姓名" htmlFor="member-create-name">
              <Input id="member-create-name" className="h-11" placeholder="姓名..." value={profile.name} name="name" onChange={handleFieldChange} />
            </Field>
            <ToggleGroup
              exclusive
              fullWidth
              value={profile.gender}
              name="gender"
              onChange={(event, newValue) => newValue !== null && handleFieldChange(event, newValue)}
            >
              <ToggleGroupItem className="h-11" value="MALE" aria-label="男">
                男
              </ToggleGroupItem>
              <ToggleGroupItem className="h-11" value="FEMALE" aria-label="女">
                女
              </ToggleGroupItem>
            </ToggleGroup>
            <DatePicker
              label="生日"
              format="yyyy/MM/dd"
              onChange={handleFieldChange}
              value={profile.birthday}
              openTo="year"
              localeText={{
                toolbarTitle: '選擇日期',
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'yyyy年M月d日',
                },
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                },
              }}
            />
            <Field label="推薦碼" htmlFor="member-create-recommand-code">
              <Input
                id="member-create-recommand-code"
                className="h-11"
                placeholder="推薦碼..."
                value={profile.recommandCode}
                name="recommandCode"
                onChange={handleFieldChange}
              />
            </Field>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="h-11 w-full"
              disabled={vaild}
              aria-describedby={vaild ? 'member-create-missing' : undefined}
            >
              註冊
            </Button>
            {/* 停用原因（STYLE.md §6）：依 vaild（姓名、性別、生日必填） */}
            {vaild && (
              <p id="member-create-missing" role="status" className="text-center text-caption text-text-secondary">
                尚缺：{[!profile.name && '姓名', !profile.gender && '性別', !(profile.birthday > 0) && '生日'].filter(Boolean).join('、')}
              </p>
            )}
          </CardContent>
        </Card>
      </form>
    </Page>
  )
}
