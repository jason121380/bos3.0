import useFetchVerificationCode from 'hooks/useFetchVerificationCode'
import useForgotPasswordVerify from 'hooks/useForgotPasswordVerify'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import validate from 'validate.js'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { saveStoredUser } from 'lib/stored-user'

function ResetPasswordForm({ className, ...rest }) {
  // 訊息前加 ^：validate.js 預設會在訊息前加英文欄位名（原本畫面顯示「Phone 必填」「Verification code 必填」）
  const [schema, setSchema] = useState({
    phone: {
      presence: { allowEmpty: false, message: '^必填' },
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
        // 表單只有電話、驗證碼兩個文字欄（原本的 checkbox 分支跑不到，已移除）
        [event.target.name]: event.target.value,
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
          presence: { allowEmpty: false, message: '^必填' },
        },
      })

      fetchVerificationCode({ cellphone: formState.values.phone })
        .then(() => {
          localStorage.setItem('countdownForVerify', true)
        })
        .catch(() => {
          // 寄送失敗（提示由 errorLink 負責）：回到輸入電話，可修改後再寄；原本停在驗證碼欄、電話鎖住無法重寄
          showVerification.setOpen(false)
          setSchema(schema)
        })
    } else {
      forgotPasswordVerify({
        cellphone: formState.values.phone,
        verifyCode: formState.values.verificationCode,
      })
        .then(({ data }) => {
          saveStoredUser(data.forgetPasswordVerify)
          localStorage.setItem('userMerchant', JSON.stringify(data.forgetPasswordVerify.merchants[0]))
          localStorage.removeItem('countdownForVerify')
          history.push('/')
        })
        .catch(() => {
          // 驗證失敗（提示由 errorLink 負責）：按鈕恢復可按；原本要改驗證碼才會重新檢查、才能再按
          setFormState(prevFormState => ({ ...prevFormState, isValid: !validate(prevFormState.values, schema) }))
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
        size="lg"
        type="submit"
      >
        {showVerification.open ? '重設密碼' : `發送驗證碼`}
      </Button>
    </form>
  )
}

ResetPasswordForm.propTypes = {
  className: PropTypes.object,
}

export default ResetPasswordForm
