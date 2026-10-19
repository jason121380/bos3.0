/** @jsxImportSource @emotion/react */
import React, { useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import {
  TextField, Button, Checkbox, FormControlLabel
} from '@mui/material'
import { Card } from 'ui/card'
import Page from 'components/Page'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  }),
  card: css({
    minWidth: 275,
    padding: theme.spacing(4),
    marginTop: theme.spacing(3),
  }),
  field: css({
    width: '100%',
    marginBottom: theme.spacing(2),
  }),
}

const CheckLineId = gql`
  query MlgMember($lineId: String!) {
    mlgMember(lineId: $lineId)
  }
`
const CreateMember = gql`
  mutation createMLGMember($input: CreateMLGMember!) {
    createMLGMember(input: $input)
  }
`

function Reservation({ match, location }) {
  const [name, setName] = useState('')
  const [cellphone, setCellphone] = useState('')
  const [box, setBox] = useState(true)
  const [btnLoading, setBtnLoading] = useState(false)
  const history = useHistory()
  // LINE
  const [lineId, setLineId] = useState(null)
  const [displayName, setDisplayName] = useState(null)
  const [pictureUrl, setPictureUrl] = useState(null)
  // Query
  const [checkLineId, getCheckLineId] = useLazyQuery(CheckLineId, {
    fetchPolicy: 'network-only',
    ssr: false,
  })
  const [createMember] = useMutation(CreateMember)

  React.useEffect(() => {
    if (getCheckLineId.data) {
      if (getCheckLineId.data.mlgMember) {
        // 已註冊
        // alert('已註冊')
        // window.liff.closeWindow()
        history.push(`/ehs2/ehs2?isMember=true`)
      }
    }
  }, [getCheckLineId, history])

  React.useEffect(() => {
    const LIFFLogin = () => {
      window.liff
        .init({
          liffId: '1654347144-w0mKXyWa',
        })
        .then(() => {
          if (window.liff.isLoggedIn()) {
            window.liff.getProfile().then(profile => {
              setLineId(profile.userId)
              setDisplayName(profile.displayName)
              setPictureUrl(profile.pictureUrl)

              checkLineId({
                variables: {
                  lineId: profile.userId,
                },
              })
            })
          } else {
            window.liff.login().then(() => {
              window.liff
                .getProfile()
                .then(profile => {
                  setLineId(profile.userId)
                  setDisplayName(profile.displayName)
                  setPictureUrl(profile.pictureUrl)
                  checkLineId({
                    variables: {
                      lineId: profile.userId,
                    },
                  })
                })
                .catch(err => {
                  throw new Error(`${err.code}: ${err.message}`)
                })
            })
          }
        })
    }
    LIFFLogin()
  }, [checkLineId])

  // 提交訂單
  const submit = async () => {
    if (cellphone.length !== 10) {
      alert('手機格式不正確')
      return ''
    }
    if (cellphone.substring(0, 2) !== '09') {
      alert('手機格式不正確')
      return ''
    }
    setBtnLoading(true)
    const data = {
      name,
      cellphone,
      policy: box,
      lineId,
      displayName,
      pictureUrl,
    }
    const resp = await createMember({
      variables: {
        input: data,
      },
    })
    const result = JSON.parse(resp.data.createMLGMember)
    if (result.returnCode === '0000') {
      history.push(`/ehs2/ehs2?isMember=false&reg=${result.registerResult}`)
    } else if (result.returnCode === '0302') {
      history.push(`/ehs2/ehs2?isMember=true&reg=${result.registerResult}`)
    }
  }

  // 按鈕狀態
  let disabled = true
  if (name && cellphone && box) {
    disabled = false
  }
  if (btnLoading) {
    disabled = true
  }

  return (
    <Page css={styles.root} title="加入會員">
      <Card css={styles.card}>
        {/* <img css={styles.field} src="https://i.imgur.com/chpDbjI.png" alt="" /> */}
        <TextField
          vlaue={name}
          onChange={e => setName(e.target.value.trim())}
          css={styles.field}
          fullWidth
          required
          id="standard-required"
          label="姓名"
          variant="outlined"
        />
        <TextField
          inputProps={{
            maxLength: 10,
          }}
          type="tel"
          vlaue={cellphone}
          onChange={e => setCellphone(e.target.value.trim())}
          css={styles.field}
          fullWidth
          required
          id="standard-required"
          label="手機"
          variant="outlined"
        />
        <FormControlLabel
          css={styles.field}
          control={
            <Checkbox
              checked={box}
              onChange={e => setBox(e.target.checked)}
              name="checkedB"
              color="primary"
            />
          }
          label={
            <label htmlFor="">
              我同意
              <a href="/ehs2/privacy" target="_blank" rel="noopener noreferrer">
                名留集團
              </a>
              暨
              <a
                href="https://m.etmall.com.tw/HelpCenter/PrivacyStatement"
                target="_blank"
                rel="noopener noreferrer"
              >
                東森購物
              </a>
              會員條款
            </label>
          }
        />
        {/* <Typography variant="subtitle1" gutterBottom>
        <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
          我同意名留暨東森購物會員條款
        </Typography> */}
        <Button disabled={disabled} variant="contained" fullWidth color="primary" onClick={submit}>
          {btnLoading ? '努力加入中...' : '加入會員'}
        </Button>
      </Card>
    </Page>
  )
}

export default React.memo(Reservation)
