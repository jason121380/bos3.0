import { openSnackbar } from 'elements/snackbars'
import useFetchChangePassword from 'hooks/useFetchChangePassword'
import { useState } from 'react'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

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
    <Card {...rest}>
      <CardHeader>
        <CardTitle>更改密碼</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Field label="密碼" htmlFor="profile-security-password">
              <Input
                id="profile-security-password"
                name="password"
                onChange={handleOnChange}
                type="password"
                value={values.password}
              />
            </Field>
            <Field label="確認密碼" htmlFor="profile-security-confirm">
              <Input
                id="profile-security-confirm"
                name="confirm"
                onChange={handleOnChange}
                type="password"
                value={values.confirm}
              />
            </Field>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          disabled={!valid}
          variant="primary"
          onClick={handleOnChangePassword}
        >
          儲存變更
        </Button>
      </CardFooter>
    </Card>
  )
}

export default Security
