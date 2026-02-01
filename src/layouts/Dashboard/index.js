/** @jsxImportSource @emotion/react */
import { LinearProgress } from '@mui/material'
import ChangePassword from 'components/ChangePassword'
import Snackbar, { openSnackbar } from 'elements/snackbars'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import React, { Fragment, Suspense, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { renderRoutes } from 'react-router-config'
import useFetchCheckPageAuthority from 'hooks/useFetchCheckPageAuthority'
import useFetchGetUserMerchant from 'hooks/useFetchGetUserMerchant'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import NavBar from './NavBar'
import TopBar from './TopBar'

const styles = {
  container: ({ openDesktop }) => css({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 64,
    transition: theme.transitions.create(['padding-left'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter,
    }),
    [theme.breakpoints.up('lg')]: {
      paddingLeft: openDesktop ? 260 : 0,
    },
    '@media all and (-ms-high-contrast:none)': {
      height: 0 // IE11 fix
    }
  }),
  content: css({
    flexGrow: 1,
    maxWidth: '100%',
    overflowX: 'hidden',
  })
}

function Dashboard({ route, location }) {
  const [openNavBarMobile, setOpenNavBarMobile] = useState(false)
  const [openNavBarDesktop, setOpenNavBarDesktop] = useState(true)
  const [url, setUrl] = useState(location.pathname)
  const { open, toggle } = useToggle()
  const history = useHistory()
  const [checkPageAuthorityLazy, checkPageAuthorityData] = useFetchCheckPageAuthority()
  const userMerchants = useFetchGetUserMerchant()

  useEffect(() => {
    history.listen((location) => {
      setUrl(location.pathname)
    })
  }, [history, url])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    const input = {
      id: user.id,
      url: url,
      page: null,
      currentTab: null
    }
    const tab = url.split('/').pop()
    if (url.includes('/profile/')) {
      input.page = 'PROFILE'
      input.currentTab = tab
      if (tab === 'pinnedTable') return
    } else if (url.includes('/management/employee/') && url.length > 21) {
      input.page = 'EMPLOYEE'
      input.currentTab = tab
    }
    checkPageAuthorityLazy({
      variables: {
        input: input
      }
    })
  }, [url])

  useEffect(() => {
    if (!checkPageAuthorityData.loading && checkPageAuthorityData.data) {
      const data = idx(checkPageAuthorityData, _ => _.data.checkPageAuthority)
      if (!data && url === '/profile/general') {
        // 使用者連個人詳細頁基本資料都沒權限的話
        openSnackbar({
          message: '權限異常！請洽詢各店主管',
          variant: 'warning'
        })
      } else if (!data) {
        history.push('/profile/general')
      }
    }
  }, [checkPageAuthorityData.loading])

  const handleToggleNavBar = () => {
    if (window.innerWidth >= 1280) { // lg breakpoint
      setOpenNavBarDesktop(!openNavBarDesktop)
    } else {
      setOpenNavBarMobile(true)
    }
  }

  return (
    <Fragment>
      <Snackbar />
      <TopBar
        userMerchants={userMerchants}
        onOpenNavBarMobile={handleToggleNavBar}
      />
      <NavBar
        onMobileClose={() => setOpenNavBarMobile(false)}
        openMobile={openNavBarMobile}
        openDesktop={openNavBarDesktop}
      />
      <div css={styles.container({ openDesktop: openNavBarDesktop })}>
        <div id='printContainer' css={styles.content}>
          <Suspense fallback={<LinearProgress />}>{renderRoutes(route.routes)}</Suspense>
        </div>
      </div>
      <ChangePassword open={open} handleClose={toggle} />
    </Fragment>
  )
}

Dashboard.propTypes = {
  route: PropTypes.object,
}

export default React.memo(Dashboard)
