/** @jsxImportSource @emotion/react */
import { Card, Button, Typography } from '@mui/material'
import React from 'react'
import getQueryString from 'helper/getQueryString'
import Page from 'components/Page'
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

function Reservation({ match, location }) {
  const queryString = getQueryString({ key: 'isMember', location })
  const reg = getQueryString({ key: 'reg', location })

  const isExist = `您已領取過東森幣
每位會員僅限領取乙次唷。
`
  const newText = `恭喜您！500枚東森幣已匯入至您的東森購物帳號！<br/><br/>
您無需重新註冊，立即登入即可<br/>
${reg === '0000'
      ? `登入帳號：您的手機號<br/>
登入密碼：已發送簡訊至您的手機號<br/><br/>`
      : `如您本來就是東森購物的會員<br/>
登入帳號：您的手機號<br/>
登入密碼：您本來的密碼`
    }`

  return (
    <Page css={styles.root} title="立即登入查看我的東森幣">
      <Card css={styles.card}>
        <Typography variant="subtitle1" gutterBottom>
          <div
            dangerouslySetInnerHTML={{
              __html: queryString === 'true' ? isExist : newText,
            }}
          ></div>
        </Typography>
        <a href="https://etu.tw/ABfNWQ" target="_blank" rel="noopener noreferrer">
          <Button variant="contained" fullWidth color="primary">
            立即登入查看我的東森幣
          </Button>
        </a>
      </Card>
    </Page>
  )
}

export default React.memo(Reservation)
