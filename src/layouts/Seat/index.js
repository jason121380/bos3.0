import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import React from 'react'
import { renderRoutes } from 'react-router-config'

function Pad({ route }) {
  return (
    <React.Fragment>
      <Snackbar />
      <div className="min-h-[100vh] flex">
        <div className="grow max-w-full overflow-x-hidden">
          <React.Suspense fallback={<div className="ui-root h-0.5 w-full animate-pulse bg-accent" />}>
            {renderRoutes(route.routes)}
          </React.Suspense>
        </div>
      </div>
    </React.Fragment>
  )
}

Pad.propTypes = {
  route: PropTypes.object,
}

export default Pad
