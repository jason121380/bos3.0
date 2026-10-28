import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import { Suspense, useEffect } from 'react'
import { useHistory } from 'react-router'
import { renderRoutes } from 'react-router-config'

import Topbar from './Topbar'
import PageLoadingFallback from 'components/PageLoadingFallback'

function Auth({ route }) {
  const history = useHistory()
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      history.push('/')
    }
  }, [history])

  return (
    <>
      <Topbar />
      <Snackbar />
      <div className="flex min-h-screen bg-canvas">
        <div className="max-w-full flex-1 overflow-x-hidden pt-14">
          <Suspense fallback={<PageLoadingFallback />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
    </>
  )
}

Auth.propTypes = {
  route: PropTypes.object,
}

export default Auth
