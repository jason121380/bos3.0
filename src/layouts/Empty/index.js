import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import React, { Fragment, Suspense } from 'react'
import { renderRoutes } from 'react-router-config'

function Line({ route }) {
  return (
    <Fragment>
      <Snackbar />
      <div>
        <div>
          <Suspense fallback={<div className="ui-root h-0.5 w-full animate-pulse bg-accent" />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
    </Fragment>
  )
}

Line.propTypes = {
  route: PropTypes.object,
}

export default Line
