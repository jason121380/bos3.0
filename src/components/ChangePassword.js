/** @jsxImportSource @emotion/react */
import {
  FormControl, InputAdornment, InputLabel,
  OutlinedInput,
} from '@mui/material'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Visibility, VisibilityOff } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import useFetchChangePassword from 'hooks/useFetchChangePassword'
import produce from 'immer'
import { Fragment, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../theme'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1) + '!important',
  }),
  form: css({
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: '100%',
    '& > *': {
      marginBottom: theme.spacing(2) + '!important',
    },
  }),
}

export default function ChangePassword({ open, handleClose }) {
  const { changePassword } = useFetchChangePassword()

  const [formData, setFormData] = useState({
    password: {
      value: '',
      error: false,
      showPassword: false,
    },
    secondPassword: {
      value: '',
      error: false,
      showPassword: false,
    },
  })

  const handleOnChange = ({ name, event }) => {
    event.persist()
    setFormData(
      produce(formData => {
        formData[name].value = event.target.value
        formData[name].error =
          name === 'password'
            ? !!(
              formData.password.value !== formData.secondPassword.value &&
              !!formData.secondPassword.value
            )
            : name === 'secondPassword'
              ? !!(
                formData.password.value !== formData.secondPassword.value &&
                !!formData.password.value
              )
              : false
      })
    )
  }

  const handleClickShowPassword = name => {
    setFormData(
      produce(formData => {
        formData[name].showPassword = !formData[name].showPassword
      })
    )
  }

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }
  const handleOnChangePassword = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (
      !formData.password.error &&
      !formData.password.error &&
      formData.password.value &&
      formData.secondPassword.value &&
      formData.password.value === formData.secondPassword.value
    ) {
      changePassword({
        password: formData.password.value,
        secondPassword: formData.secondPassword.value,
      }).then(() => {
        user.isNeedChangePassword = !user.isNeedChangePassword
        localStorage.setItem('user', JSON.stringify(user))
        handleClose()
        openSnackbar({ message: '成功變更密碼', variant: 'success' })
      })
    } else {
      openSnackbar({ message: '確認密碼是否填寫正確', variant: 'error' })
    }
  }
  return (
    <Fragment>
      {/* 舊版 MUI Dialog 未設 onClose（強制改密碼、只能成功後關閉），故不傳 onOpenChange 並 hideClose */}
      <Dialog open={open}>
        <DialogContent size="sm" hideClose aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>重新設定密碼</DialogTitle>
          </DialogHeader>
          <DialogBody>
          <p className="m-0 mb-3 text-body text-text-secondary">為了您的帳號安全, 您必須變更預設密碼才能繼續使用。</p>
          <form css={styles.form} noValidate>
            <FormControl css={styles.margin} variant="outlined">
              <InputLabel htmlFor="password">密碼</InputLabel>
              <OutlinedInput
                variant='outlined'
                id="password"
                fullWidth
                onChange={event => handleOnChange({ name: 'password', event })}
                type={formData.password.showPassword ? 'text' : 'password'}
                value={formData.password.value}
                error={formData.password.error}
                endAdornment={
                  <InputAdornment position="end">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      aria-label="toggle password visibility" title="切換密碼顯示"
                      onClick={() => handleClickShowPassword('password')}
                    >
                      {formData.password.showPassword ? <Visibility /> : <VisibilityOff />}
                    </Button>
                  </InputAdornment>
                }
              />
            </FormControl>
            <FormControl css={styles.margin} variant="outlined">
              <InputLabel htmlFor="secondPassword">確認密碼</InputLabel>
              <OutlinedInput
                id="secondPassword"
                onChange={event => handleOnChange({ name: 'secondPassword', event })}
                type={formData.secondPassword.showPassword ? 'text' : 'password'}
                value={formData.secondPassword.value}
                error={formData.secondPassword.error}
                fullWidth
                endAdornment={
                  <InputAdornment position="end">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      aria-label="toggle password visibility" title="切換密碼顯示"
                      onClick={() => handleClickShowPassword('secondPassword')}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {formData.secondPassword.showPassword ? <Visibility /> : <VisibilityOff />}
                    </Button>
                  </InputAdornment>
                }
              />
            </FormControl>
          </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="primary" onClick={handleOnChangePassword}>
              更新密碼
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
