/** @jsxImportSource @emotion/react */
import { Card, CardContent, Divider, Link, Typography } from '@mui/material'
import { PersonAddOutlined as PersonAddIcon } from 'ui/icons'
import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import gradients from 'utils/gradients'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import RegisterForm from './RegisterForm'

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
  content: {
    padding: theme.spacing(8, 4, 3, 4),
  },
  media: css({
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    padding: theme.spacing(3),
    color: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  }),
  icon: css({
    backgroundImage: gradients.orange,
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
  registerForm: css({
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
}

function Register() {
  return (
    <Page css={styles.root} title="Register">
      <Card css={styles.card}>
        <CardContent css={styles.content}>
          <PersonAddIcon css={styles.icon} />
          <Typography gutterBottom variant="h3">
            Sign up
          </Typography>
          <Typography variant="subtitle2">註冊 BeautyOS</Typography>
          <RegisterForm className={styles.registerForm} />
          <Divider css={styles.divider} />
          <Link
            align="center"
            component={RouterLink}
            to="/auth/login"
            underline="always"
            variant="subtitle2"
          >
            已經有帳號了嗎?
          </Link>
        </CardContent>
      </Card>
    </Page>
  )
}

export default Register
