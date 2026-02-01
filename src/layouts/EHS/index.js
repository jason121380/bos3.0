import React, { Suspense, Fragment } from 'react'
import { renderRoutes } from 'react-router-config'
import PropTypes from 'prop-types'
import { LinearProgress } from '@mui/material'
import Snackbar from 'elements/snackbars'

function Line({ route }) {
  return (
    <Fragment>
      <Snackbar />
      <div>
        <div>
          <Suspense fallback={<LinearProgress />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
    </Fragment>
  )
}

Line.propTypes = {
  route: PropTypes.object,
}

export default Line
