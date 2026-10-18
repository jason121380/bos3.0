import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import { Card, CardContent } from 'ui/card'
import { cn, focusRing } from 'ui/utils'

import LoginForm from './LoginForm'

function Login({ location }) {
  return (
    <Page className="ui-root flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12" title="Login">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <h1 className="m-0 text-center text-title !font-bold text-text">
            登入系統
          </h1>

          <LoginForm location={location} />

          <div className="my-6 h-px bg-border" />

          <div className="flex justify-center">
            <RouterLink
              to="/auth/resetpassword"
              className={cn('rounded-md text-label text-accent no-underline hover:underline', focusRing)}
            >
              忘記密碼?
            </RouterLink>
          </div>
        </CardContent>
      </Card>
    </Page>
  )
}

export default Login
