/** @jsxImportSource @emotion/react */
import { AppBar, Toolbar } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'

const styles = {
  root: css({
    boxShadow: 'none',
    backgroundColor: '#202D50',
  }),
  logo: css({
    width: 'auto',
    height: '25px',
  }),
}

function Topbar({ ...rest }) {
  return (
    <AppBar {...rest} css={styles.root}>
      <Toolbar>
        <RouterLink to="/">
          <img css={styles.logo} alt="Logo" src={require('assets/images/bosLogoNew.png')} />
        </RouterLink>
      </Toolbar>
    </AppBar>
  )
}
export default Topbar
