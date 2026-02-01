/** @jsxImportSource @emotion/react */
import { Card, CardContent, Divider, Link, Typography } from '@mui/material'
import bosLogo from 'assets/images/bosLogoNew.png'
import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import gradients from 'utils/gradients'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import LoginForm from './LoginForm'

const styles = {
  root: css({
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBEBF0',
    padding: theme.spacing(2),
  }),
  logo: css({
    width: '120px',
    marginBottom: theme.spacing(3),
  }),
  card: css({
    width: 450,
    maxWidth: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '24px !important',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1) !important',
    border: 'none !important',
  }),
  content: css({
    padding: theme.spacing(6, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),
  loginForm: css({
    marginTop: theme.spacing(3),
  }),
  divider: css({
    margin: theme.spacing(2, 0),
  }),
  person: css({
    marginTop: theme.spacing(2),
    display: 'flex',
  }),
  avatar: css({
    marginRight: theme.spacing(2),
  }),
  helper: css({
    display: 'flex',
    justifyContent: 'space-between',
  }),
}

function Login({ location }) {
  return (
    <Page css={styles.root} title="Login">
      <Card css={styles.card}>
        <CardContent css={styles.content}>
          <img
            alt="Logo"
            css={styles.logo}
            src={bosLogo}
          />
          <Typography
            gutterBottom
            variant="h2"
            style={{ fontWeight: 700, color: '#1D1D1F', marginBottom: '8px' }}
          >
            登入系統
          </Typography>
          <Typography
            variant="body1"
            style={{ color: '#86868B', marginBottom: '32px' }}
          >
            BeautyOS · 您的專業美容管理夥伴
          </Typography>
          <LoginForm className={styles.loginForm} location={location} />
          <Divider css={styles.divider} />
          <div css={styles.helper}>
            {/* <Link
              align="center"
              color="secondary"
              component={RouterLink}
              to="/auth/register"
              underline="always"
              variant="subtitle2"
            >
              還沒有帳號嗎?
            </Link> */}
            <Link
              align="center"
              color="secondary"
              component={RouterLink}
              to="/auth/resetpassword"
              underline="always"
              variant="subtitle2"
            >
              忘記密碼?
            </Link>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}

export default Login
