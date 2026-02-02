/** @jsxImportSource @emotion/react */
import { Button, TextField, Checkbox, FormControlLabel, Typography } from '@mui/material'
import useFetchLoginV2 from 'hooks/useFetchLoginV2'
import useFetchLoginForLine from 'hooks/useFetchUserLoginForLine'
import { useLazyFetchProfile } from 'hooks/useFetchProfile'
import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { openSnackbar } from 'elements/snackbars'
import getQueryString from 'helper/getQueryString'
import { css } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../../theme'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  }),
  fields: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
  }),
  submitButton: css({
    marginTop: theme.spacing(4),
    height: '54px !important',
    borderRadius: '27px !important', // Pill-shaped (half of height)
    fontSize: '17px !important',
    fontWeight: '600 !important',
    boxShadow: 'none !important',
    textTransform: 'none !important',
    transition: 'all 0.2s ease-in-out !important',
    '&:hover': {
      backgroundColor: '#0062CC !important',
      boxShadow: 'none !important',
    },
    '&:active': {
      backgroundColor: '#0056b3 !important',
    },
  }),
  input: css({
    '& .MuiOutlinedInput-root': {
      borderRadius: '30px !important', // Pill-shaped (half of 60px height)
      backgroundColor: '#F5F5F7',
      height: '60px !important',
      transition: 'all 0.2s ease',
      '& fieldset': {
        border: '1px solid transparent',
        transition: 'all 0.2s ease',
      },
      '&:hover': {
        backgroundColor: '#EBEBEF',
        '& fieldset': {
          borderColor: 'rgba(0, 122, 255, 0.1)',
        },
      },
      '&.Mui-focused': {
        backgroundColor: '#FFFFFF',
        '& fieldset': {
          borderColor: '#007AFF !important',
          borderWidth: '2px !important',
        },
      },
    },
    '& .MuiInputBase-input': {
      padding: '18px 16px !important', // Adjusted internal padding for taller look
    },
    '& .MuiInputLabel-root': {
      fontSize: '15px',
      color: '#86868B',
      '&.Mui-focused': {
        color: '#007AFF',
      },
    },
    '& :-webkit-autofill': {
      'WebkitTextFillColor': '#1D1D1F',
      'WebkitBoxShadow': '0 0 0px 1000px #F5F5F7 inset',
      borderRadius: '14px',
    },
  }),
  checkboxLabel: css({
    marginTop: theme.spacing(1.5),
    alignSelf: 'flex-start',
    marginLeft: '-11px !important',
    color: '#86868B',
    '& .MuiTypography-root': {
      fontSize: '13.5px',
      fontWeight: 500,
    },
    '& .MuiCheckbox-root': {
      color: '#D2D2D7',
      '&.Mui-checked': {
        color: '#007AFF',
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 122, 255, 0.04)',
      },
    },
  }),
}

function LoginForm({ className, location, ...rest }) {
  const liffId = getQueryString({ key: 'liffId', location })
  const { loginV2 } = useFetchLoginV2()
  const { loginForLine } = useFetchLoginForLine()
  const history = useHistory()
  const liffIdFromStorage = localStorage.getItem('liffId')
  const accountRef = useRef()
  const [disabledLoginBtn, setDisabledLoginBtn] = useState(false)
  const { fetchProfile, profile } = useLazyFetchProfile()
  const { register, handleSubmit, errors } = useForm()
  const [isKeepLogin, setIsKeepLogin] = useState(false)
  const useGetQueryStringValueRef = useRef(getQueryStringValue)
  const [merchantData, setMerchantData] = useState({})
  const onSubmit = async data => {
    setDisabledLoginBtn(true)
    if (data.cellphone.includes(' ')) {
      openSnackbar({
        message: '登入號碼格式不正確',
        variant: 'warning',
      })
      setDisabledLoginBtn(false)
    } else {
      if (liffIdFromStorage !== null) {
        loginForLine(data)
          .then(({ data }) => {
            const user = data.userLoginForLine
            fetchProfile()
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('keepLogin', JSON.stringify(isKeepLogin))
            document.cookie = 'keepLogin=hello;expires=0;path=/'
          })
          .catch(() => setDisabledLoginBtn(false), accountRef.current.focus)
      } else {
        // token
        await loginV2({ ...data, isKeepLogin: isKeepLogin })
          .then(({ data }) => {
            const user = data.userLoginV2.user
            const token = data.userLoginV2.token
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('keepLogin', JSON.stringify(isKeepLogin))
            localStorage.setItem('token', token)
            setMerchantData({
              id: data.userLoginV2.officialBrandMerchantId,
              name: data.userLoginV2.officialBrandMerchantName,
            })
            fetchProfile()
            document.cookie = 'keepLogin=hello;expires=0;path=/'
          })
          .catch(() => {
            setDisabledLoginBtn(false)
            accountRef.current.focus
          })
      }
    }
  }
  function getQueryStringValue(key) {
    return decodeURIComponent(
      location.search.replace(
        new RegExp(
          '^(?:.*[&\\?]' +
          encodeURIComponent(key).replace(/[.+*]/g, '\\$&') +
          '(?:\\=([^&]*))?)?.*$',
          'i'
        ),
        '$1'
      )
    )
  }
  useEffect(() => {
    if (!profile.loading && profile.data) {
      if (localStorage.getItem('userMerchant') && localStorage.getItem('user')) {
        history.push(`${useGetQueryStringValueRef.current('redirect')}`)
      } else {
        localStorage.setItem('userMerchant', JSON.stringify(merchantData))
        history.push(`${useGetQueryStringValueRef.current('redirect')}`)
      }
    }
  }, [profile.data, profile.loading, history])

  // 保持登入
  const handleLoginSession = event => {
    setIsKeepLogin(event.target.checked)
  }
  return (

    <form {...rest} css={css([styles.root, className])} onSubmit={handleSubmit(onSubmit)}>
      <div css={styles.fields}>
        <TextField
          fullWidth
          label="電話號碼"
          name="cellphone"
          variant="outlined"
          error={!!errors.cellphone}
          helperText={errors.cellphone && errors.cellphone.message}
          inputProps={{
            ref: e => {
              accountRef.current = e
              register(e, {
                required: '電話號碼為必填',
              })
            },
            'data-testid': 'cellphone',
          }}
          css={styles.input}
        />
        <TextField
          fullWidth
          error={!!errors.password}
          helperText={errors.password && errors.password.message}
          label="密碼"
          name="password"
          type="password"
          variant="outlined"
          inputProps={{
            ref: register({ required: '密碼為必填' }),
            'data-testid': 'password',
          }}
          css={styles.input}
        />
      </div>
      <FormControlLabel
        css={styles.checkboxLabel}
        control={<Checkbox onChange={handleLoginSession} />}
        label={<Typography variant="body2">保持登入狀態</Typography>}
      />
      <ThemeProvider theme={theme}>
        <Button
          css={styles.submitButton}
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          data-testid="login-btn"
          disabled={disabledLoginBtn}
        >
          {!disabledLoginBtn ? '登入' : '登入中'}
        </Button>
      </ThemeProvider>
    </form>
  )
}

LoginForm.propTypes = {
  className: PropTypes.object,
}

export default LoginForm
