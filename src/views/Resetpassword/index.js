/** @jsxImportSource @emotion/react */
import { Card, CardContent, Typography } from '@mui/material'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import Page from 'components/Page'
import gradients from 'utils/gradients'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ResetPasswordForm from './ResetPasswordForm'

const styles = {
  root: css({
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 2),
  }),
  card: css({
    width: theme.breakpoints.values.sm,
    maxWidth: '100%',
    overflow: 'visible',
    display: 'flex',
    position: 'relative',
    '& > *': {
      flexGrow: 1,
      flexBasis: '50%',
      width: '50%',
    },
  }),
  content: css({
    padding: theme.spacing(8, 4, 3, 4),
  }),
  icon: css({
    backgroundImage: gradients.blue,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    position: 'absolute',
    top: -32,
    left: theme.spacing(3),
    height: 64,
    width: 64,
    fontSize: 32,
  }),
  resetPasswordForm: css({
    marginTop: theme.spacing(3),
  }),
  person: css({
    marginTop: theme.spacing(2),
    display: 'flex',
  }),
  avatar: css({
    marginRight: theme.spacing(2),
  }),
}

function ResetPassword() {
  return (
    <Page css={styles.root} title="Login">
      <Card css={styles.card}>
        <CardContent css={styles.content}>
          <VpnKeyIcon css={styles.icon} />
          <Typography gutterBottom variant="h3">
            Reset password
          </Typography>
          <Typography variant="subtitle2">重設密碼</Typography>
          <ResetPasswordForm className={styles.resetPasswordForm} />
        </CardContent>
      </Card>
    </Page>
  )
}

export default ResetPassword
