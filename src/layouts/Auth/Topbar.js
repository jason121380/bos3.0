/** @jsxImportSource @emotion/react */
import { AppBar, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    boxShadow: 'none !important',
    backgroundColor: '#1E1E1E !important',
    color: '#FFFFFF !important',
    padding: '0 16px',
    zIndex: 1100,
    borderRadius: '0px !important',
    [theme.breakpoints.down('sm')]: {
      padding: '0 8px',
    },
  }),
  logo: css({
    width: 'auto',
    height: '25px',
  }),
  versionTag: css({
    height: '24px !important',
    padding: '0 8px !important',
    marginLeft: 12,
    borderRadius: '8px !important',
    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
    color: '#FFFFFF !important',
    fontSize: '11px !important',
    fontWeight: 'bold !important',
    display: 'flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
    fontFamily: 'monospace !important',
    opacity: 0.8,
  }),
}

function Topbar({ ...rest }) {
  return (
    <AppBar {...rest} css={styles.root}>
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RouterLink to="/">
            <img css={styles.logo} alt="Logo" src={require('assets/images/bosLogoNew.png')} />
          </RouterLink>
          <span css={styles.versionTag}>v3.0</span>
        </div>
      </Toolbar>
    </AppBar>
  )
}
export default Topbar
