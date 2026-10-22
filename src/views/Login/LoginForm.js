import useFetchLoginV2 from 'hooks/useFetchLoginV2'
import useFetchLoginForLine from 'hooks/useFetchUserLoginForLine'
import { useLazyFetchProfile } from 'hooks/useFetchProfile'
import PropTypes from 'prop-types'
import { useRef, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { openSnackbar } from 'elements/snackbars'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Field, Input } from 'ui/input'
import { saveStoredUser } from 'lib/stored-user'

function LoginForm({ className, location, ...rest }) {
  const { loginV2 } = useFetchLoginV2()
  const { loginForLine } = useFetchLoginForLine()
  const history = useHistory()
  // 舊版曾把 liffId 存成字串 "null"（見 memberChangeLineMenu），視同沒有
  const storedLiffId = localStorage.getItem('liffId')
  const liffIdFromStorage = storedLiffId === 'null' || storedLiffId === '' ? null : storedLiffId
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
            saveStoredUser(user)
            localStorage.setItem('keepLogin', JSON.stringify(isKeepLogin))
            document.cookie = 'keepLogin=hello;expires=0;path=/'
          })
          .catch(() => {
            setDisabledLoginBtn(false)
            accountRef.current.focus()
          })
      } else {
        // token
        await loginV2({ ...data, isKeepLogin: isKeepLogin })
          .then(({ data }) => {
            const user = data.userLoginV2.user
            const token = data.userLoginV2.token
            saveStoredUser(user)
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
            accountRef.current.focus()
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
  // 登入成功但讀個人資料失敗（提示由 errorLink 負責）：按鈕恢復可按，可以再登入一次；原本永遠停在「登入中」
  useEffect(() => {
    if (profile.error) setDisabledLoginBtn(false)
  }, [profile.error])
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

    <form {...rest} className="mt-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <Field
          label="電話號碼"
          htmlFor="login-cellphone"
          error={errors.cellphone && errors.cellphone.message}
        >
          <Input
            id="login-cellphone"
            name="cellphone"
            autoComplete="username"
            invalid={!!errors.cellphone}
            ref={e => {
              accountRef.current = e
              register(e, {
                required: '電話號碼為必填',
              })
            }}
            data-testid='cellphone'
          />
        </Field>
        <Field
          label="密碼"
          htmlFor="login-password"
          error={errors.password && errors.password.message}
        >
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            ref={register({ required: '密碼為必填' })}
            data-testid='password'
          />
        </Field>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 self-start text-label text-text-secondary">
        <Checkbox onChange={handleLoginSession} />
        保持登入狀態
      </label>
      <Button
        className="mt-6 w-full"
        variant="primary"
        size="lg"
        type="submit"
        data-testid="login-btn"
        disabled={disabledLoginBtn}
      >
        {!disabledLoginBtn ? '登入' : '登入中'}
      </Button>
    </form>
  )
}

LoginForm.propTypes = {
  className: PropTypes.object,
}

export default LoginForm
