import useFetchLoginV2 from 'hooks/useFetchLoginV2'
import useFetchLoginForLine, { persistLineLoginSession } from 'hooks/useFetchUserLoginForLine'
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
  const [profileError, setProfileError] = useState('')
  const { fetchProfile, profile } = useLazyFetchProfile()
  const { register, handleSubmit, errors } = useForm()
  const [isKeepLogin, setIsKeepLogin] = useState(false)
  const useGetQueryStringValueRef = useRef(getQueryStringValue)
  const [merchantData, setMerchantData] = useState({})
  const onSubmit = async data => {
    setProfileError('')
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
            // userLoginForLine 沒有 token 欄位（見 persistLineLoginSession）。沒有使用者物件就不算登入成功。
            if (!persistLineLoginSession(data && data.userLoginForLine)) {
              setDisabledLoginBtn(false)
              if (accountRef.current) accountRef.current.focus()
              return
            }
            fetchProfile()
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
  // 登入 mutation 成功後還要等 PROFILE。查詢失敗時按鈕不能停在「登入中」，要顯示錯誤並允許再按一次。
  useEffect(() => {
    if (!profile.called || profile.loading) return
    if (profile.data) {
      setProfileError('')
      if (localStorage.getItem('userMerchant') && localStorage.getItem('user')) {
        history.push(`${useGetQueryStringValueRef.current('redirect')}`)
      } else {
        localStorage.setItem('userMerchant', JSON.stringify(merchantData))
        history.push(`${useGetQueryStringValueRef.current('redirect')}`)
      }
      return
    }
    if (profile.error) {
      setProfileError('登入成功，但讀取個人資料失敗，請再試一次')
      setDisabledLoginBtn(false)
      if (accountRef.current) accountRef.current.focus()
    }
  }, [profile.called, profile.data, profile.loading, profile.error, history, merchantData])

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
      {profileError ? (
        <p role="alert" className="mt-4 text-label text-danger">
          {profileError}
        </p>
      ) : null}
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
