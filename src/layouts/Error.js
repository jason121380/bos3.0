/** @jsxImportSource @emotion/react */
import { LinearProgress } from '@mui/material'
import PropTypes from 'prop-types'
import { Suspense } from 'react'
import { renderRoutes } from 'react-router-config'
import { css } from '@emotion/react'

const styles = {
  root: css({
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

function Error({ route }) {
  return (
    <div css={styles.root}>
      <div css={styles.content}>
        <Suspense fallback={<LinearProgress />}>{renderRoutes(route.routes)}</Suspense>
      </div>
    </div>
  )
}

Error.propTypes = {
  route: PropTypes.object,
}

export default Error
