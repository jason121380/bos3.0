/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  colors,
} from '@mui/material'
import { openSnackbar } from 'elements/snackbars'
import useFetchChangePassword from 'hooks/useFetchChangePassword'
import { useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  saveButton: css({
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900],
    },
  }),
}

function Security({ className, ...rest }) {
  const [values, setValues] = useState({
    password: '',
    confirm: '',
  })

  const handleOnChange = event => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  const valid = values.password && values.password === values.confirm

  const { changePassword } = useFetchChangePassword()
  const handleOnChangePassword = () => {
    const userId = JSON.parse(localStorage.getItem('user')).id

    changePassword({
      password: values.password,
      secondPassword: values.confirm,
      userId,
    }).then(() => {
      openSnackbar({ variant: 'success', message: '成功變更密碼' })
      setValues({
        password: '',
        confirm: '',
      })
    })
  }
  return (
    <Card {...rest} css={styles.root}>
      <CardHeader title="更改密碼" />
      <Divider />
      <CardContent>
        <form>
          <Grid container spacing={3}>
            <Grid item md={4} sm={6} xs={12}>
              <TextField
                fullWidth
                label="密碼"
                name="password"
                onChange={handleOnChange}
                type="password"
                value={values.password}
                variant="outlined"
              />
            </Grid>
            <Grid item md={4} sm={6} xs={12}>
              <TextField
                fullWidth
                label="確認密碼"
                name="confirm"
                onChange={handleOnChange}
                type="password"
                value={values.confirm}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </form>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          css={styles.saveButton}
          disabled={!valid}
          variant="contained"
          onClick={handleOnChangePassword}
        >
          儲存變更
        </Button>
      </CardActions>
    </Card>
  )
}

export default Security
