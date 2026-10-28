import React, { Suspense, Fragment } from 'react'
import { renderRoutes } from 'react-router-config'
import PropTypes from 'prop-types'
import Snackbar from 'elements/snackbars'
import PageLoadingFallback from 'components/PageLoadingFallback'

function Line({ route }) {
  return (
    <Fragment>
      <Snackbar />
      <div>
        <div>
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
