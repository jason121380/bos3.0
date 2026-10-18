/** @jsxImportSource @emotion/react */
import { Button, TextField } from '@mui/material'
import useFetchVerificationCode from 'hooks/useFetchVerificationCode'
import useForgotPasswordVerify from 'hooks/useForgotPasswordVerify'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import validate from 'validate.js'
import { css } from '@emotion/react'
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
    borderRadius: '27px !important', // Pill-shaped
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
      borderRadius: '30px !important', // Pill-shaped
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
        backgroundColor: 'rgb(var(--background))',
        '& fieldset': {
          borderColor: 'rgb(var(--accent)) !important',
          borderWidth: '2px !important',
        },
      },
    },
    '& .MuiInputBase-input': {
      padding: '18px 24px !important',
    },
    '& .MuiInputLabel-root': {
      fontSize: '15px',
      color: '#86868B',
      marginLeft: '8px',
      '&.Mui-focused': {
        color: 'rgb(var(--accent))',
      },
    },
  }),
}

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
        localStorage.setItem('user', JSON.stringify(data.forgetPasswordVerify))
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
    <form {...rest} css={css([styles.root, className])} onSubmit={handleSubmit}>
      <div css={styles.fields}>
        <TextField
          error={hasError('phone')}
          fullWidth
          helperText={hasError('phone') ? formState.errors.phone[0] : null}
          label="電話號碼"
          name="phone"
          onChange={handleOnChange}
          value={formState.values.phone || ''}
          variant="outlined"
          type="tel"
          disabled={showVerification.open}
          css={styles.input}
        />
        {showVerification.open ? (
          <TextField
            error={hasError('verificationCode')}
            fullWidth
            helperText={hasError('verificationCode') ? formState.errors.verificationCode[0] : null}
            label="驗證碼"
            name="verificationCode"
            onChange={handleOnChange}
            value={formState.values.verificationCode || ''}
            variant="outlined"
            css={styles.input}
          />
        ) : (
          ''
        )}
      </div>
      <Button
        css={styles.submitButton}
        color="primary"
        disabled={!formState.isValid}
        size="large"
        type="submit"
        variant="contained"
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
