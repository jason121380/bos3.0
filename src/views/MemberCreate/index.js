/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardActions, CardContent, TextField,
  ToggleButton, ToggleButtonGroup
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import PageTitle from 'components/PageTitle'
import getQueryString from 'helper/getQueryString'
import useFetchUpdateCustomerProfile from 'hooks/useFetchUpdateCustomerProfile'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
  }),
  field: css({
    marginBottom: theme.spacing(2),
  }),
  bullet: css({
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  }),
  title: css({
    fontSize: 14,
  }),
  pos: css({
    marginBottom: 12,
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }),
}

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
    <Page css={styles.root} title="成為會員">
      <PageTitle title='成為會員' subTitle='Become a member' />
      <form onSubmit={handleSubmit} style={{ marginTop: theme.spacing(3) }}>
        <Card css={styles.root}>
          <CardContent css={styles.content}>
            <TextField
              placeholder="姓名..."
              value={profile.name}
              variant="outlined"
              name="name"
              onChange={handleFieldChange}
            />
            <ToggleButtonGroup
              exclusive
              value={profile.gender}
              name="gender"
              onChange={handleFieldChange}
            >
              <ToggleButton value="MALE" aria-label="男">
                男
              </ToggleButton>
              <ToggleButton value="FEMALE" aria-label="女">
                女
              </ToggleButton>
            </ToggleButtonGroup>
            <DatePicker
              format="yyyy/MM/dd"
              label="生日"
              onChange={handleFieldChange}
              value={profile.birthday}
              openTo='year'
              localeText={{
                toolbarTitle: '選擇日期'
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'yyyy年M月d日'
                },
                textField: {
                  variant: 'standard',
                }
              }}
            />
            <TextField
              placeholder="推薦碼..."
              variant="outlined"
              value={profile.recommandCode}
              name="recommandCode"
              onChange={handleFieldChange}
            />
          </CardContent>
          <CardActions>
            <Button type="submit" variant="contained" color="primary" disabled={vaild}>
              註冊
            </Button>
          </CardActions>
        </Card>
      </form>
    </Page>
  )
}
