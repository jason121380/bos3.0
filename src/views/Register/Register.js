import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import { Card, CardContent } from 'ui/card'
import { cn, focusRing } from 'ui/utils'

import RegisterForm from './RegisterForm'

function Register() {
  return (
    <Page className="ui-root flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12" title="Register">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <h1 className="m-0 text-center text-title !font-bold text-text">註冊 BeautyOS</h1>
          <RegisterForm />
          <div className="my-6 h-px bg-border" />
          <div className="flex justify-center">
            <RouterLink to="/auth/login" className={cn('rounded-md text-label text-accent underline', focusRing)}>
              已經有帳號了嗎?
            </RouterLink>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}

export default Register
