/** @jsxImportSource @emotion/react */
import Snackbar from 'elements/snackbars'
import PropTypes from 'prop-types'
import React from 'react'
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

function Pad({ route }) {
  return (
    <React.Fragment>
      <Snackbar />
      <div css={styles.container}>
        <div css={styles.content}>
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
