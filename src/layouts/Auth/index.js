/** @jsxImportSource @emotion/react */
import { LinearProgress } from '@mui/material'
import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import { Fragment, Suspense, useEffect } from 'react'
import { useHistory } from 'react-router'
import { renderRoutes } from 'react-router-config'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Topbar from './Topbar'

const styles = {
  container: css({
    minHeight: '100vh',
    display: 'flex',
    '@media all and (-ms-high-contrast:none)': {
      height: 0, // IE11 fix
    },
  }),
  content: css({
    flexGrow: 1,
    maxWidth: '100%',
    overflowX: 'hidden',
    paddingTop: 64,
    [theme.breakpoints.down('xs')]: {
      paddingTop: 56,
    },
  }),
}

function Auth({ route }) {
  const history = useHistory()
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      history.push('/')
    }
  }, [history])

  return (
    <Fragment>
      <Topbar />
      <Snackbar />
      <div css={styles.container}>
        <div css={styles.content}>
          <Suspense fallback={<LinearProgress />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
    </Fragment>
  )
}

Auth.propTypes = {
  route: PropTypes.object,
}

export default Auth
