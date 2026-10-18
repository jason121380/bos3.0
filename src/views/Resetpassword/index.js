/** @jsxImportSource @emotion/react */
import { Card, CardContent, Typography } from '@mui/material'
import { VpnKey as VpnKeyIcon } from 'ui/icons'
import Page from 'components/Page'
import gradients from 'utils/gradients'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ResetPasswordForm from './ResetPasswordForm'

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
    backgroundColor: 'rgb(var(--background)) !important',
    overflow: 'hidden',
  }),
  content: css({
    padding: theme.spacing(10, 5, 8, 5),
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(8, 3),
    },
  }),
  resetPasswordForm: css({
    marginTop: theme.spacing(3),
    width: '100%',
  }),
}

function ResetPassword() {
  return (
    <Page css={styles.root} title="重設密碼">
      <Card css={styles.card}>
        <CardContent css={styles.content}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#1D1D1F',
              fontSize: '26px !important',
              letterSpacing: '-0.4px',
              mb: 1
            }}
          >
            重設密碼
          </Typography>

          <ResetPasswordForm className={styles.resetPasswordForm} />
        </CardContent>
      </Card>
    </Page>
  )
}

export default ResetPassword
