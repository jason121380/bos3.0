import useFetchRegister from 'hooks/useFetchRegister'
import { useRef } from 'react'
import { useHistory } from 'react-router'
import { useForm } from 'react-hook-form'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'

function RegisterForm({ className, ...rest }) {
  const fetchRegister = useFetchRegister()
  const signup = fetchRegister.register
  const history = useHistory()

  const cellphoneRef = useRef()

  const { register, handleSubmit, errors } = useForm()

  const onSubmit = data => {
    signup(data)
      .then(() => history.push('/auth/login'))
      .catch(cellphoneRef.current.focus)
  }

  return (
    <form {...rest} className="mt-6 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <Field label="電話號碼" htmlFor="register-cellphone" error={errors.cellphone && errors.cellphone.message}>
        <Input
          id="register-cellphone"
          name="cellphone"
          autoComplete="tel"
          invalid={!!errors.cellphone}
          data-testid="cellphone"
          ref={e => {
            cellphoneRef.current = e
            register(e, {
              required: '電話號碼為必填',
              minLength: {
                value: 10,
                message: '電話號碼最少為 10 碼',
              },
              maxLength: {
                value: 13,
                message: '電話號碼最多為 13 碼',
              },
            })
          }}
        />
      </Field>
      <Button className="mt-6 w-full" variant="primary" size="lg" type="submit" data-testid="submit">
        註冊
      </Button>
    </form>
  )
}

export default RegisterForm
