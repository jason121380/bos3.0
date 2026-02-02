/** @jsxImportSource @emotion/react */
import { Card, CardContent, Divider, Link, Typography, Box } from '@mui/material'
import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import LoginForm from './LoginForm'

const styles = {
  root: css({
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7', // iOS System Background
    padding: theme.spacing(3),
  }),
  card: css({
    width: 420,
    maxWidth: '100%',
    borderRadius: '28px !important',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.08) !important',
    border: '1px solid rgba(0, 0, 0, 0.02) !important',
    backgroundColor: '#FFFFFF !important',
    overflow: 'hidden',
  }),
  content: css({
    padding: theme.spacing(10, 5, 8, 5),
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(8, 3),
    },
  }),
  loginForm: css({
    marginTop: theme.spacing(3), // Reduced from 6 to 3
    width: '100%',
  }),
  divider: css({
    margin: theme.spacing(4, 0),
    opacity: 0.5,
    borderBottomWidth: '1px',
    borderColor: '#F2F2F7',
  }),
  helper: css({
    display: 'flex',
    justifyContent: 'center',
  }),
}

function Login({ location }) {
  return (
    <Page css={styles.root} title="Login">
      <Card css={styles.card}>
        <CardContent css={styles.content}>
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: '#1D1D1F',
                fontSize: '26px !important',
                letterSpacing: '-0.4px'
              }}
            >
              登入系統
            </Typography>
          </Box>

          <LoginForm className={styles.loginForm} location={location} />

          <Divider css={styles.divider} />

          <div css={styles.helper}>
            <Link
              align="center"
              color="textSecondary"
              component={RouterLink}
              to="/auth/resetpassword"
              sx={{
                fontSize: '13px',
                color: '#007AFF', // iOS Link Blue
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
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
