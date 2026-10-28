import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import { Fragment, Suspense } from 'react'
import { renderRoutes } from 'react-router-config'
import PageLoadingFallback from 'components/PageLoadingFallback'

function Line({ route }) {
  return (
    <Fragment>
      <Snackbar />
      <div className="min-h-[100vh] flex">
        <div className="grow max-w-full overflow-x-hidden">
          <Suspense fallback={<PageLoadingFallback />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
    </Fragment>
  )
}

Line.propTypes = {
  route: PropTypes.object,
}

export default Line
