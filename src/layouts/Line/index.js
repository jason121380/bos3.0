/** @jsxImportSource @emotion/react */
import { LinearProgress } from '@mui/material'
import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import { Fragment, Suspense } from 'react'
import { renderRoutes } from 'react-router-config'
import { css } from '@emotion/react'

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
  }),
}

function Line({ route }) {
  return (
    <Fragment>
      <Snackbar />
      <div css={styles.container}>
        <div css={styles.content}>
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
