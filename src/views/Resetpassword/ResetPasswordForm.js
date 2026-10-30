import useFetchVerificationCode from 'hooks/useFetchVerificationCode'
import useForgotPasswordVerify from 'hooks/useForgotPasswordVerify'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
// validate.js 的自訂驗證器（regex／checked）只有這一頁用：改在此頁登記，不再於 App.js 全域載入（入口 chunk 少 14 KB）
import 'mixins/validate'
import validate from 'validate.js'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { saveStoredUser } from 'lib/stored-user'

function ResetPasswordForm({ className, ...rest }) {
  const [schema, setSchema] = useState({
    phone: {
      presence: { allowEmpty: false, message: '必填' },
    },
  })
  const showVerification = useToggle()
  const history = useHistory()
  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
  })
  const { fetchVerificationCode } = useFetchVerificationCode()
  const { forgotPasswordVerify } = useForgotPasswordVerify()

  const handleOnChange = event => {
    event.persist()
    setFormState(prevFormState => ({
      ...prevFormState,
      values: {
        ...prevFormState.values,
        [event.target.name]:
          event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      },
      touched: {
        ...prevFormState.touched,
        [event.target.name]: true,
      },
    }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormState({
      ...formState,
      isValid: false,
    })
    if (!showVerification.open) {
      showVerification.toggle()
      setSchema({
        ...schema,
        verificationCode: {
          presence: { allowEmpty: false, message: '必填' },
        },
      })

      fetchVerificationCode({ cellphone: formState.values.phone })
        .then(() => {
          localStorage.setItem('countdownForVerify', true)
        })
        .catch(err => console.log(err.message))
    } else {
      forgotPasswordVerify({
        cellphone: formState.values.phone,
        verifyCode: formState.values.verificationCode,
      }).then(({ data }) => {
        saveStoredUser(data.forgetPasswordVerify)
        localStorage.setItem('userMerchant', JSON.stringify(data.forgetPasswordVerify.merchants[0]))
        localStorage.removeItem('countdownForVerify')
        history.push('/')
      })
    }
  }

  const hasError = field => !!(formState.touched[field] && formState.errors[field])

  useEffect(() => {
    const errors = validate(formState.values, schema)
    setFormState(prevFormState => ({
      ...prevFormState,
      isValid: !errors,
      errors: errors || {},
    }))
  }, [formState.values, schema])

  return (
    <form {...rest} className="mt-6 flex flex-col" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <Field
          label="電話號碼"
          htmlFor="reset-phone"
          error={hasError('phone') ? formState.errors.phone[0] : null}
        >
          <Input
            id="reset-phone"
            invalid={hasError('phone')}
            name="phone"
            onChange={handleOnChange}
            value={formState.values.phone || ''}
            type="tel"
            autoComplete="tel"
            disabled={showVerification.open}
          />
        </Field>
        {showVerification.open ? (
          <Field
            label="驗證碼"
            htmlFor="reset-verification-code"
            error={hasError('verificationCode') ? formState.errors.verificationCode[0] : null}
          >
            <Input
              id="reset-verification-code"
              invalid={hasError('verificationCode')}
              name="verificationCode"
              onChange={handleOnChange}
              value={formState.values.verificationCode || ''}
              autoComplete="one-time-code"
            />
          </Field>
        ) : (
          ''
        )}
      </div>
      <Button
        className="mt-6 w-full"
        variant="primary"
        disabled={!formState.isValid}
        aria-describedby={!formState.isValid ? 'reset-password-missing' : undefined}
        size="lg"
        type="submit"
      >
        {showVerification.open ? '重設密碼' : `發送驗證碼`}
      </Button>
      {/* 停用原因（STYLE.md §6）：依 validate.js schema 的必填欄位（電話號碼；送出驗證碼後加驗證碼） */}
      {!formState.isValid && (
        <p id="reset-password-missing" role="status" className="mt-2 text-center text-caption text-text-secondary">
          尚缺：{[formState.errors.phone && '電話號碼', formState.errors.verificationCode && '驗證碼'].filter(Boolean).join('、') || '電話號碼'}
        </p>
      )}
    </form>
  )
}

ResetPasswordForm.propTypes = {
  className: PropTypes.object,
}

export default ResetPasswordForm
