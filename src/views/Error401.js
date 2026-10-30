import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Button } from 'ui/button'
import { EmptyState } from 'ui/empty-state'

function Error401() {
  return (
    <Page className="ui-root flex min-h-[70vh] items-center justify-center px-4 py-12" title="Error 401">
      <EmptyState
        className="max-w-xl"
        icon={Lock}
        title="401: We are sorry but we are not able to authenticate you."
        description={<>You either tried some shady route or you came here by mistake. Whichever it is, try using the navigation</>}
        action={
          <Button asChild variant="primary">
            <RouterLink to="/">Back to home</RouterLink>
          </Button>
        }
      />
    </Page>
  )
}

export default Error401
