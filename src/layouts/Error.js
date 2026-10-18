import PropTypes from 'prop-types'
import { Suspense } from 'react'
import { renderRoutes } from 'react-router-config'

function Error({ route }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="max-w-full flex-1 overflow-x-hidden">
        <Suspense fallback={<div className="h-0.5 w-full animate-pulse bg-accent" />}>{renderRoutes(route.routes)}</Suspense>
      </div>
    </div>
  )
}

Error.propTypes = {
  route: PropTypes.object,
}

export default Error
