/** @jsxImportSource @emotion/react */
import {
  AppBar, Badge, Button, Toolbar, FormGroup, FormControlLabel,
  Switch, Typography, Popper, Fade, CircularProgress, Box, MenuItem,
  List, Menu, Divider, Paper, IconButton, Fab, ListItemIcon, ListItem,
  ListItemText, ListItemButton, ListSubheader, styled, Avatar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import LayersIcon from '@mui/icons-material/Layers';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import SnoozeRoundedIcon from '@mui/icons-material/SnoozeRounded'

import DeleteIcon from '@mui/icons-material/Delete'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import NotificationImportantRoundedIcon from '@mui/icons-material/NotificationImportantRounded'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import InputIcon from '@mui/icons-material/Input'
import MenuIcon from '@mui/icons-material/Menu'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonIcon from '@mui/icons-material/Person'
import useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useRef, Fragment } from 'react'
import { useHistory } from 'react-router'
import { Link as RouterLink } from 'react-router-dom'
import useFetchProfile, { useFetchProfileIdentity } from 'hooks/useFetchProfile'
import useFetchMerchantAuthorities from 'hooks/useFetchGetMerchantAuthorities'
import idx from 'idx'
import useFetchUser from 'hooks/useFetchUser'
import useFetchSettingTheme from 'hooks/useFetchSettingTheme'
import useFetchGetUsingOrderQueue from 'hooks/useFetchGetUsingOrderQueue'
import useFetchReCheckoutOrderFromQueue from 'hooks/useFetchReCheckoutOrderFromQueue'
import useFetchDestroyQueueById from 'hooks/useFetchDestroyQueueById'
import MerchantBar from './MerchantBar'
import _ from 'lodash'
import { format } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import webSocket from "socket.io-client";
import { useDispatch } from 'react-redux'
import { socketActions } from './../../store/socket'
import { reservationActions } from './../../store/reservation'
import { QRcodeClockInActions } from './../../store/QRcodeClockIn'
import { deductionDisplayActions } from './../../store/deductionDisplay'
import { css, keyframes } from '@emotion/react'
import { theme } from '../../theme'

const shake = keyframes`
  0% {
    -webkit-transform: translate(0,0) rotate(0);
    -ms-transform: translate(0,0) rotate(0);
    transform: translate(0,0) rotate(0);
  }
  10.1% {
    -webkit-transform: translate(0px,0px) rotate(-12.150006768751156deg);
    -ms-transform: translate(0px,0px) rotate(-12.150006768751156deg);
    transform: translate(0px,0px) rotate(-12.150006768751156deg);
  }
  20.2% {
    -webkit-transform: translate(0px,0px) rotate(18.341532043913183deg);
    -ms-transform: translate(0px,0px) rotate(18.341532043913183deg);
    transform: translate(0px,0px) rotate(18.341532043913183deg);
  }
  30.3% {
    -webkit-transform: translate(0px,0px) rotate(2.6825725745137206deg);
    -ms-transform: translate(0px,0px) rotate(2.6825725745137206deg);
    transform: translate(0px,0px) rotate(2.6825725745137206deg);
  }
  31% {
    -webkit-transform: translate(0,0) rotate(0);
    -ms-transform: translate(0,0) rotate(0);
    transform: translate(0,0) rotate(0);
  }
`

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
  flexGrow: css({
    flexGrow: 1,
  }),
  chatButton: css({
    height: '40px !important',
    width: 'auto !important',
    minWidth: '40px !important',
    padding: '0 12px !important',
    marginLeft: 8,
    borderRadius: '12px !important',
    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
    display: 'flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
    '& svg': {
      color: '#FFFFFF'
    }
  }),
  menuButton: css({
    padding: '8px !important',
    color: '#FFFFFF'
  }),
  logoutButton: css({
    height: '40px !important',
    width: '40px !important',
    padding: '0 !important',
    marginLeft: 8,
    borderRadius: '12px !important',
    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
    color: '#FFFFFF !important',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
    }
  }),
  icon: css({
    cursor: 'pointer',
    color: '#FFFFFF',
    fontSize: '24px !important'
  }),
  subheader: css({
    fontSize: 14,
    fontWeight: 700,
    color: '#000000',
    backgroundColor: '#F2F2F7',
    lineHeight: '36px',
    padding: '0 16px'
  }),
  ListItem: css({
    display: 'flex',
    gap: 12,
    padding: '12px 16px !important',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: 'rgba(0, 122, 255, 0.05) !important'
    }
  }),
  ListItemText: css({
    lineHeight: '1.5 !important',
    '& p': {
      fontSize: 12,
      lineHeight: '1.5 !important',
      color: theme.palette.text.secondary
    }
  }),
  Menu: css({
    '& ul li': {
      paddingLeft: 16,
      paddingRight: 16
    }
  }),
  shake: css({
    animation: `${shake} 510ms infinite`
  }),
  badge: css({
    '& .MuiBadge-badge': {
      bottom: 0,
      right: 0
    }
  }),
  profile: css({
    display: 'flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
    height: '40px !important',
    minWidth: '40px !important',
    width: 'auto !important',
    marginLeft: 8,
    padding: '0 12px !important',
    cursor: 'pointer',
    borderRadius: '12px !important',
    backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
    }
  }),
  avatar: css({
    width: 32,
    height: 32,
  }),
  details: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    }
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

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 'fit-content !important',
  height: 34,
  padding: 7,
  overflow: 'visible',
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(10px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(30px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5 !important' : '#aab4be !important',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    width: 45,
    transform: 'translateX(5px)',
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5 !important' : '#aab4be !important',
    borderRadius: 20 / 2,
  },
}));

function TopBar({ onOpenNavBarMobile, userMerchants }) {
  const dispatch = useDispatch()
  const history = useHistory()
  const ref = useRef()
  const { open, toggle } = useToggle()
  const profileIdentity = useFetchProfileIdentity()
  const profile = useFetchProfile()
  const merchantAuthData = useFetchMerchantAuthorities()
  const getTheme = idx(
    useFetchUser({ id: JSON.parse(localStorage.getItem('user')).id }),
    _ => _.data.user.theme
  )
  const { setThemeChangeData } = useFetchSettingTheme()
  const [loginUserAuth, setLoginUserAuth] = useState(false)
  const [moodChange, setMoodChange] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [openButton, setOpenButton] = useState(false)
  const [placement, setPlacement] = useState()
  const [isNotification, setIsNotification] = useState(true)
  const [error, setError] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [targetID, setTargetID] = useState(null)
  const [anchorElForMoreBtn, setAnchorElForMoreBtn] = React.useState(null)
  const openForMoreBtn = Boolean(anchorElForMoreBtn)
  const [record, setRecord] = useState({
    content: '',
    systemUpdateId: '',
    title: '',
    updateTime: '',
    versionNo: ''
  })
  const [orderDetail, setOrderDetail] = useState([])
  const [ws, setWs] = useState(null)
  const usingOrderQueue = useFetchGetUsingOrderQueue()
  const [isClick, setIsClick] = useState(false)
  const { destroyQueueById } = useFetchDestroyQueueById()
  const { reCheckoutOrderFromQueue } = useFetchReCheckoutOrderFromQueue()
  const systemUpdateRecord = useFetchSystemUpdateRecord()

  const buttonSx = {
    boxShadow: 'none !important',
    height: '40px !important',
    width: '40px !important',
    minHeight: '40px !important',
    ...(!isNotification && {
      bgcolor: '#007AFF !important', // Apple Blue for processing
      color: 'white',
      '&:hover': {
        bgcolor: '#005AC1 !important',
      },
    }),
    ...(isNotification && {
      bgcolor: 'rgba(255, 255, 255, 0.1) !important',
      color: 'white',
      '&:hover': {
        bgcolor: 'rgba(255, 255, 255, 0.2) !important',
      },
    }),
    ...(error && {
      bgcolor: '#FF3B30 !important', // Apple Red for error
      color: 'white',
      '&:hover': {
        bgcolor: '#D7261B !important',
      },
    }),
  }
  const handlesetOrderDetail = tmpData => {
    const errorDataCount = tmpData.filter(d => d.status === 'fail')
    const isCreating = tmpData.filter(d => d.status === 'creating')
    if (errorDataCount.length > 0) {
      setError(true)
      setErrorCount(errorDataCount.length)
    } else {
      setError(false)
      setErrorCount(0)
    }
    if (isCreating.length > 0) {
      setIsNotification(false)
    } else {
      setIsNotification(true)
    }
  }

  useEffect(() => {
    connectWebSocket()
  }, [])

  useEffect(() => {
    let creating
    if (!isNotification) {
      creating = setTimeout(() => {
        usingOrderQueue.refetch()
        clearTimeout(creating)
      }, 10000);
    } else {
      clearTimeout(creating)
    }
    return () => {
      clearTimeout(creating)
    }
  }, [isNotification])

  const connectWebSocket = () => {
    let url = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app'
    if (window.location.href.indexOf('dev') !== -1) {
      url = 'https://crt-test-htlfg34mhq-de.a.run.app'
    } else if (window.location.href.indexOf('beautyos2') !== -1) {
      url = 'https://crt-test-htlfg34mhq-de.a.run.app'
    } else if (window.location.href.indexOf('localhost') !== -1) {
      // 測試區的後端
      url = 'https://crt-test-htlfg34mhq-de.a.run.app'

      //後端local
      // url = 'http://localhost:4849'

      // 正式區的後端
      // url = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app'
    }
    //開啟
    setWs(webSocket(url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: false
    }))
  }

  useEffect(() => {
    if (ws) {
      const id = JSON.parse(localStorage.getItem('userMerchant')).id
      ws.emit('roomKey', id)
      ws.on('OrderQueue', order => {
        handlesetOrderDetail(order)
        setOrderDetail(order)
      })
      ws.on('NEWSCHEDULE', schedule => {
        dispatch(socketActions.setSchedule(schedule))
      })
      ws.on('CALENDARS', data => {
        dispatch(reservationActions.setReservation(data))
      })
      ws.on('QRCODE_KEY_EXPIRED', key => {
        dispatch(QRcodeClockInActions.setQRcodeKey(key))
      })
      ws.on('disconnect', () => {
        connectWebSocket()
      })
      // ws.on('connect', () => console.log('connect', new Date(), ws))
    }
  }, [ws])

  useEffect(() => {
    if (!merchantAuthData.loading && !profileIdentity.loading) {
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities)
      const loginUserAuthName = idx(profileIdentity, _ => _.data.me.merchantIdentity.authorityName)
      const userAuth = merchantAuth.filter(data => data.authorityName === loginUserAuthName)
      setLoginUserAuth(
        JSON.parse(userAuth[0].authoritySettings).filter(d => d.pageTitle === '櫃檯作業')[0]
          .pageAuthority[0].authority
      )
      const filtData = JSON.parse(userAuth[0].authoritySettings).filter(d => d.pageTitle === '資料設定')[0].pageAuthority
      const service = filtData.find(d => d.pageName === '服務項目扣項設定')?.authority ?? false
      const coupon = filtData.find(d => d.pageName === '預收卡項目扣項設定')?.authority ?? false
      dispatch(deductionDisplayActions.setDisplay({ service, coupon }))
    }
  }, [merchantAuthData.loading, profileIdentity.loading])

  useEffect(() => {
    if (!merchantAuthData.loading && !profileIdentity.loading) {
      const userAuth1Count = []
      const userAuth2Count = []
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities)
      const loginUserAuthName = idx(profileIdentity, _ => _.data.me.merchantIdentity.authorityName)
      const userAuth = merchantAuth.filter(data => data.authorityName === loginUserAuthName)
      const allUserAuthData = JSON.parse(userAuth[0].authoritySettings)

      allUserAuthData.forEach(data => {
        if (data.authority) {
          userAuth1Count.push(data)
        }
      })

      allUserAuthData.forEach(data => {
        if (data.authority) {
          data.pageAuthority.forEach(data2 => {
            if (data2.authority) {
              userAuth2Count.push(data2)
            }
          })
        }
      })

      if (allUserAuthData.length === 0 || userAuth2Count.length === 0) {
        history.push('/profile/general')
      }
    }
  }, [merchantAuthData.loading, profileIdentity.loading])

  // getTheme
  useEffect(() => {
    if (getTheme != undefined) {
      if (getTheme === 'DARK') {
        setMoodChange(true)
        document.documentElement.setAttribute('data-color-mode', 'dark') // 切換markdown editor的顏色模式
      } else {
        setMoodChange(false)
        document.documentElement.setAttribute('data-color-mode', 'light')
      }
    }
  }, [getTheme])
  // get order queue data
  useEffect(() => {
    if (!usingOrderQueue.loading) {
      const tmpData = idx(usingOrderQueue, _ => _.data.getUsingOrderQueue)
      handlesetOrderDetail(tmpData)
      setOrderDetail(tmpData)
    }
  }, [usingOrderQueue.loading])

  // 版本記錄
  useEffect(() => {
    if (!systemUpdateRecord.loading) {
      let tmp = {}
      const data = idx(systemUpdateRecord, _ => _.data.systemUpdateRecord)
      data.map((d, index) => {
        if (index === 0) {
          tmp = {
            content: d.content,
            systemUpdateId: d.systemUpdateId,
            title: d.title,
            updateTime: format(d.updateTime, 'yyyy/MM/dd'),
            versionNo: d.versionNo
          }
        }
      })
      setRecord(tmp)
    }
  }, [systemUpdateRecord.loading])

  // click away
  useEffect(() => {
    const checkIfClickedOutside = e => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (openButton && ref.current && !ref.current.contains(e.target)) {
        setOpenButton(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)

    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [openButton])

  // open notification button handle
  const handleClickOpenNotification = newPlacement => event => {
    setAnchorEl(event.currentTarget)
    setOpenButton(prev => placement !== newPlacement || !prev)
    setPlacement(newPlacement)
  }
  // lightdark mode function
  const handleMoodChange = e => {
    setMoodChange(e.target.checked)
    setThemeChangeData({
      input: {
        userId: JSON.parse(localStorage.getItem('user')).id,
        theme: e.target.checked ? 'DARK' : 'DEFAULT',
      },
    }).then(() => {
      window.location.reload()
    })
  }
  // log out button handle
  const handleLogout = () => {
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    localStorage.clear()
    history.push('/auth/login')
    window.location.reload()
  }
  // open more button handle when order error
  const handleClickForMoreBtn = (event, id) => {
    setAnchorElForMoreBtn(event.currentTarget)
    setTargetID(id)
  }
  // close more button handle when order error
  const handleCloseForMoreBtn = () => {
    setAnchorElForMoreBtn(null)
  }
  const handleEditOrder = () => {
    if (targetID !== null) {
      history.push(`/queue-order-edit/${targetID}`)
      setAnchorElForMoreBtn(null)
      setOpenButton(false)
    }
  }

  const handleDeleteOrder = () => {
    if (targetID !== null) {
      destroyQueueById({ queueId: targetID })
        .then(() => {
          setAnchorElForMoreBtn(null)
          setOpenButton(false)
        })
        .catch((error) => {
          openSnackbar({
            message: `刪除訂單失敗: ${error}`,
            variant: 'error',
          })
          setAnchorElForMoreBtn(null)
          setTargetID(null)
        })
    }
  }

  const handleReCheckoutOrder = () => {
    if (targetID !== null) {
      reCheckoutOrderFromQueue({ queueId: targetID })
        .then(() => {
          setAnchorElForMoreBtn(null)
          setOpenButton(false)
          setTargetID(null)
        })
        .catch((error) => {
          openSnackbar({
            message: `重結失敗: ${error}`,
            variant: 'error',
          })
          setAnchorElForMoreBtn(null)
          setTargetID(null)
        })
    }
  }
  return (
    <Fragment >
      <AppBar css={styles.root}  >
        <Toolbar>
          <IconButton css={styles.menuButton} sx={{ display: { lg: 'none !important' } }} color="inherit" onClick={onOpenNavBarMobile}>
            <MenuIcon />
          </IconButton>
          {loginUserAuth ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RouterLink to="/">
                <img
                  alt="Logo"
                  css={styles.logo}
                  src={require('assets/images/bosLogoNew.png')}
                />
              </RouterLink>
              <span css={styles.versionTag}>v3.0</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RouterLink to="/profile/general">
                <img
                  alt="Logo"
                  css={styles.logo}
                  src={require('assets/images/bosLogoNew.png')}
                />
              </RouterLink>
              <span css={styles.versionTag}>v3.0</span>
            </div>
          )}
          {/* lightdark mode function */}
          <div css={styles.flexGrow} />
          {/* notification button */}
          <Box style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }} ref={ref} >
            <Box style={{ position: 'relative' }}>
              <Fab aria-label="save" size="small" style={{ borderRadius: '50%' }} sx={buttonSx} onClick={handleClickOpenNotification('bottom-end')}>
                {isNotification ? (
                  !error ? (
                    <NotificationsNoneRoundedIcon />
                  ) : (
                    <Badge
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      color="error"
                      badgeContent={errorCount}
                      overlap="circular"
                      css={styles.badge}
                    >
                      <NotificationImportantRoundedIcon css={styles.shake} />
                    </Badge>
                  )
                ) : (
                  <KeyboardDoubleArrowUpRoundedIcon />
                )}
              </Fab>
              {!isNotification &&
                <CircularProgress
                  size={50}
                  style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: '-5px',
                    left: '-5px',
                    color: 'orange',

                  }}
                />
              }
            </Box>
          </Box>
          {/* store icon and name */}
          <IconButton css={styles.chatButton} color="inherit" onClick={toggle}>
            <StorefrontIcon sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '20px' }} />
            <Typography
              variant="subtitle1"
              component="div"
              style={{
                fontWeight: 600,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '150px'
              }}
              sx={{ display: { xs: 'none', sm: 'block' }, color: '#FFFFFF' }}
            >
              {JSON.parse(localStorage.getItem('userMerchant')).name}
            </Typography>
          </IconButton>

          {/* User Profile Section moved to top right */}
          {!profile.loading && (
            <RouterLink to="/profile/general" style={{ textDecoration: 'none' }}>
              <div css={styles.profile}>
                <PersonIcon sx={{ display: { xs: 'block', sm: 'none' }, color: '#FFFFFF', fontSize: '20px' }} />
                <div css={styles.details} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '15px',
                      lineHeight: 1.2,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px'
                    }}
                  >
                    {idx(profile, _ => (_.data.me.name ? _.data.me.name : '使用者'))}
                  </Typography>
                </div>
              </div>
            </RouterLink>
          )}

          <IconButton css={styles.logoutButton} onClick={handleLogout}>
            <InputIcon style={{ fontSize: '20px' }} />
          </IconButton>
          {/* log out button */}
        </Toolbar>
        <MerchantBar userMerchants={userMerchants} open={open} onClose={toggle} />
      </AppBar>
      {/* notification content */}
      <Popper
        open={openButton}
        anchorEl={anchorEl}
        placement={placement}
        transition
        style={{
          zIndex: 1100,
          marginTop: 10,
          minWidth: '300px',
          transform: 'translate3d(-44.5px, 41px, 0px)',
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              ref={ref}
              elevation={4}
              style={{
                maxWidth: 360,
                transform: 'none',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <List
                style={{ maxHeight: '350px', overflowY: 'scroll' }}
                component="nav"
                aria-labelledby="nested-list-subheader"

                subheader={
                  <ListSubheader
                    component="div"
                    id="listSubheaderInQueue"
                    css={styles.subheader}
                  >
                    訂單
                  </ListSubheader>
                }
              >
                {orderDetail.length > 0 ? orderDetail.map((order, index) =>
                  <Fragment key={`fail-order-${index}`}>
                    <ListItem
                      css={styles.ListItem}
                      key={order.id}
                      secondaryAction={
                        order.status === 'fail' &&
                        (<Fragment>
                          <IconButton
                            edge="end"
                            aria-label="more"
                            id="long-button"
                            aria-controls={openForMoreBtn ? 'menu' : undefined}
                            aria-expanded={openForMoreBtn ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={(e) => handleClickForMoreBtn(e, order.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            style={{ pointerEvents: isClick && 'none' }}
                            css={styles.Menu}
                            id="menu"
                            MenuListProps={{
                              'aria-labelledby': 'long-button',
                            }}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                            anchorEl={anchorElForMoreBtn}
                            open={openForMoreBtn}
                            onClose={handleCloseForMoreBtn}
                            slotProps={{
                              elevation: 1,
                              style: {
                                left: '50% !important',
                                transform: 'translateX(-50%) translateY(28%) !important'
                              },
                            }}
                            TransitionComponent={Fade}
                          >
                            <MenuItem disabled={isClick} onClick={handleEditOrder}>
                              <EditIcon />
                              編輯
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem disabled={isClick} onClick={handleDeleteOrder}>
                              <DeleteIcon />
                              刪除
                            </MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem disabled={isClick} onClick={handleReCheckoutOrder}>
                              <RestartAltRoundedIcon />
                              重試
                            </MenuItem>
                          </Menu>
                        </Fragment>)
                      }
                    >
                      <ListItemIcon>
                        {order.status === 'creating' ? (
                          <Box position="relative" display="inline-flex">
                            <CircularProgress
                              size={35}
                              style={{ color: 'orange' }}
                            />
                            <Box
                              top={0}
                              left={0}
                              bottom={0}
                              right={0}
                              position="absolute"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <ArrowCircleUpRoundedIcon
                                fontSize="large"
                                style={{ color: '#08424c' }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          order.status === 'fail' ? (
                            <Box position="relative" display="inline-flex">
                              <ErrorOutlineRoundedIcon
                                style={{ color: '#b00020' }}
                                fontSize="large"
                              />
                            </Box>
                          ) : (
                            <Box position="relative" display="inline-flex">
                              <Box>
                                <CheckCircleOutlineRoundedIcon
                                  style={{ color: '#08424c' }}
                                  fontSize="large"
                                />
                              </Box>
                            </Box>
                          )
                        )
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={order.status !== 'creating' ? order.status === 'fail' ? '#' + order.orderNo + ' 訂單建立失敗' : '#' + order.orderNo + ' 訂單建立成功' : '#' + order.orderNo + " 訂單建立中"}
                        css={styles.ListItemText}
                        primaryTypographyProps={{
                          fontWeight: 'bold !important',
                          fontSize: '16px !important'
                        }}
                        secondary={
                          <Fragment>
                            <Typography
                              style={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              {'訂單日期： '}
                            </Typography>
                            {format(order.orderDate, 'yyyy/MM/dd')}
                            <br />
                            <Typography
                              style={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              {'建立時間： '}
                            </Typography>
                            {format(order.createTime, 'yyyy/MM/dd  HH:mm:ss')}
                            {order.status === 'fail' &&
                              <Fragment>
                                <br />
                                <Typography
                                  style={{ display: 'inline', color: '#b00020' }}
                                  component="span"
                                  variant="body2"
                                >
                                  {'失敗原因： '}
                                </Typography>
                                {order.message}
                              </Fragment>
                            }
                          </Fragment>
                        }
                      />
                    </ListItem>
                    {index !== orderDetail.length - 1 && <Divider />}
                  </Fragment>
                )
                  : (
                    <ListItem>
                      <ListItemIcon>
                        <Box position="relative" display="inline-flex">
                          <SnoozeRoundedIcon fontSize="large" style={{ color: '#08424c' }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary="佇列中沒有正在進行中的工作"
                        primaryTypographyProps={{
                          fontWeight: 'bold !important',
                          fontSize: '16px !important'
                        }}
                      />
                    </ListItem>
                  )
                }
              </List>
              {/* 版本記錄 */}
              {/* <List
                component="nav"
                aria-labelledby="subheader"
                style={{ overflowY: 'hidden' }}
                subheader={
                  <ListSubheader
                    component="div"
                    id="listSubheaderInQueue"
                    css={styles.subheader}
                  >
                    版本紀錄
                  </ListSubheader>
                }
              >
                <ListItem style={{ padding: 0 }}>
                  <ListItemButton css={styles.ListItem} style={{ padding: '8px 16px 8px 20px' }} onClick={() => history.push('/system-update-record')} >
                    <ListItemIcon >
                      <LayersIcon css={styles.icon} />
                    </ListItemIcon>
                    <ListItemText
                      primary={record.title}
                      primaryTypographyProps={{
                        fontWeight: 'bold !important',
                        fontSize: '16px !important'
                      }}
                      secondary={
                        <span
                          className='system-update-record-span'
                          style={{
                            fontSize: 12,
                            lineHeight: '18px',
                            color: theme.palette.text.secondary
                          }}
                        >
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="textPrimary"
                            style={{ color: theme.palette.text.primary }}
                          >
                            {record.updateTime}
                          </Typography>
                          {" - V" + record.versionNo}
                        </span>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </List> */}
            </Paper>
          </Fade>
        )}
      </Popper>
    </Fragment>
  )
}
TopBar.propTypes = {
  onOpenNavBarMobile: PropTypes.func,
}


export default TopBar
