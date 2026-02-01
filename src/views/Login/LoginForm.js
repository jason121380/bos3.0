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
  root: css({}),
  fields: css({
    margin: theme.spacing(-1),
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      flexGrow: 1,
      margin: theme.spacing(1) + '!important',
    },
  }),
  submitButton: css({
    marginTop: theme.spacing(4),
    width: '100%',
    height: '50px !important',
    borderRadius: '12px !important',
    fontSize: '16px !important',
    fontWeight: '700 !important',
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3) !important',
  }),
  input: css({
    backgroundColor: '#F9F9FB',
    borderRadius: '10px !important',
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px !important',
    },
    '& :-webkit-autofill': {
      'WebkitTextFillColor': 'black',
      'WebkitBoxShadow': '0 0 0px 1000px #F9F9FB inset',
      borderRadius: '10px'
    },
  })
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
        style={{ marginTop: '16px', color: '#86868B' }}
        control={<Checkbox color="primary" onChange={handleLoginSession} />}
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
