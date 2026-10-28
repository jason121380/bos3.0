import PropTypes from 'prop-types'
import { Suspense } from 'react'
import { renderRoutes } from 'react-router-config'
import PageLoadingFallback from 'components/PageLoadingFallback'

function Error({ route }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="max-w-full flex-1 overflow-x-hidden">
        <Suspense fallback={<PageLoadingFallback />}>{renderRoutes(route.routes)}</Suspense>
      </div>
    </div>
  )
}

Error.propTypes = {
  route: PropTypes.object,
}

export default Error
