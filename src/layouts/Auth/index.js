import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import { Suspense, useEffect } from 'react'
import { useHistory } from 'react-router'
import { renderRoutes } from 'react-router-config'

import { MuiScope } from 'ui/mui-theme'
import Topbar from './Topbar'

function Auth({ route }) {
  const history = useHistory()
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      history.push('/')
    }
  }, [history])

  return (
    <MuiScope>
      <Topbar />
      <Snackbar />
      <div className="flex min-h-screen bg-canvas">
        <div className="max-w-full flex-1 overflow-x-hidden pt-14">
          <Suspense fallback={<div className="h-0.5 w-full animate-pulse bg-accent" />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
    </MuiScope>
  )
}

Auth.propTypes = {
  route: PropTypes.object,
}

export default Auth
