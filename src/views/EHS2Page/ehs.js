import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import React, { useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import Page from 'components/Page'
import { useHistory } from 'react-router'

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
          if (!window.liff.isLoggedIn()) {
            // 尚未登入：導向 LINE 登入。LIFF v2 的 login() 不回傳 Promise（原本接 .then 會拋 TypeError），
            // 登入後 LINE 會重新開啟本頁，再走下面已登入的流程
            window.liff.login()
            return undefined
          }
          return window.liff.getProfile().then(profile => {
            setLineId(profile.userId)
            setDisplayName(profile.displayName)
            setPictureUrl(profile.pictureUrl)

            checkLineId({
              variables: {
                lineId: profile.userId,
              },
            })
          })
        })
        .catch(() => {
          // LINE 初始化或取個人資料失敗：原本沒有 catch（沒人接的 rejection），畫面沒有任何提示
          alert('無法取得 LINE 個人資料，請重新開啟此頁')
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
    let resp
    try {
      resp = await createMember({
        variables: {
          input: data,
        },
      })
    } catch (e) {
      // GraphQL／網路錯誤的提示由 errorLink 負責；按鈕恢復可按（原本永遠停在「努力加入中」）
      setBtnLoading(false)
      return ''
    }
    const result = JSON.parse(resp.data.createMLGMember)
    if (result.returnCode === '0000') {
      history.push(`/ehs2/ehs2?isMember=false&reg=${result.registerResult}`)
    } else if (result.returnCode === '0302') {
      history.push(`/ehs2/ehs2?isMember=true&reg=${result.registerResult}`)
    } else {
      // 其他回傳碼：提示並恢復按鈕（原本沒有任何提示、永遠停在「努力加入中」）
      alert('加入會員失敗，請稍後再試')
      setBtnLoading(false)
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
    <Page className="min-w-[275px] p-8 mt-6" title="加入會員">
      <Card className="min-w-[275px] p-8 mt-6">
        {/* <img className="w-full mb-4" src="https://i.imgur.com/chpDbjI.png" alt="" /> */}
        <TextField
          vlaue={name}
          onChange={e => setName(e.target.value.trim())}
          className="w-full mb-4"
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
          className="w-full mb-4"
          fullWidth
          required
          id="standard-required"
          label="手機"
          variant="outlined"
        />
        <FormControlLabel
          className="w-full mb-4"
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
        <Button disabled={disabled} variant="primary" className="w-full" onClick={submit}>
          {btnLoading ? '努力加入中...' : '加入會員'}
        </Button>
      </Card>
    </Page>
  )
}

export default React.memo(Reservation)
