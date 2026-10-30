import Page from 'components/Page'
import { Card, CardContent } from 'ui/card'

import ResetPasswordForm from './ResetPasswordForm'

function ResetPassword() {
  return (
    <Page className="ui-root flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12" title="重設密碼">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <h1 className="m-0 text-center text-title !font-bold text-text">重設密碼</h1>

          <ResetPasswordForm />
        </CardContent>
      </Card>
    </Page>
  )
}

export default ResetPassword
