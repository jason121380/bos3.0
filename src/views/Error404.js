import Page from 'components/Page'
import { Link as RouterLink } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from 'ui/button'
import { EmptyState } from 'ui/empty-state'

function Error404() {
  return (
    <Page className="ui-root flex min-h-[70vh] items-center justify-center px-4 py-12" title="Error 404">
      <EmptyState
        className="max-w-xl"
        icon={FileQuestion}
        title="404: The page you are looking for isn’t here"
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

export default Error404
