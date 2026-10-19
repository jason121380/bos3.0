import { Link as RouterLink } from 'react-router-dom'
import { Bell, BellRing, ChevronsUpDown, CircleAlert, CircleCheck, EllipsisVertical, LoaderCircle, Moon, PanelLeftClose, Pencil, RotateCcw, Store, Trash2 } from 'lucide-react'
import { Button } from 'ui/button'
import { Popover, PopoverAnchor, PopoverContent } from 'ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from 'ui/dropdown-menu'
import { cn, focusRing } from 'ui/utils'
import { APP_VERSION } from '../../version'
import useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useRef, Fragment } from 'react'
import { useHistory } from 'react-router'
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

  /**
   * 建立 WebSocket 連線
   * 根據當前環境 (prod, dev, localhost) 自動選擇 API 地址
   */
  const connectWebSocket = () => {
    let url = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app'
    if (window.location.href.indexOf('dev') !== -1 || window.location.href.indexOf('beautyos2') !== -1 || window.location.href.indexOf('localhost') !== -1) {
      url = 'https://crt-test-htlfg34mhq-de.a.run.app'
    }

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

      // 註冊 WebSocket 事件監聽
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
  // 側欄頂部：Logo、訂單佇列通知、收合按鈕、商家切換（STYLE.md §4 骨架）
  const queueIcon = !isNotification ? (
    <LoaderCircle className="animate-spin text-accent" strokeWidth={1.75} />
  ) : error ? (
    <BellRing className="text-danger" strokeWidth={1.75} />
  ) : (
    <Bell strokeWidth={1.75} />
  )
  return (
    <Fragment>
      <div className="flex h-10 items-center gap-1">
        <RouterLink to={loginUserAuth ? '/' : '/profile/general'} className={cn('flex items-center gap-2 rounded-md px-1', focusRing)}>
          <img alt="BeautyOS" className="h-6 w-auto invert dark:invert-0" src={require('assets/images/bosLogoNew.png')} />
          <span className="text-caption text-text-tertiary">{APP_VERSION}</span>
        </RouterLink>
        <div className="flex-1" />
        <Popover open={openButton} onOpenChange={o => !o && setOpenButton(false)}>
          <PopoverAnchor asChild>
            <Button
              ref={ref}
              variant="ghost"
              size="icon"
              className="relative h-8 w-8"
              aria-label={error ? `訂單佇列：${errorCount} 筆失敗` : '訂單佇列'}
              onClick={handleClickOpenNotification('bottom-end')}
            >
              {queueIcon}
              {error && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-medium leading-none text-white tabular-nums">
                  {errorCount}
                </span>
              )}
            </Button>
          </PopoverAnchor>
          <PopoverContent align="start" side="right" className="w-[360px] p-0">
            <div className="border-0 border-b border-solid border-border px-4 py-3 text-heading text-text">訂單佇列</div>
            <div className="max-h-[350px] overflow-y-auto">
              {orderDetail.length > 0 ? (
                orderDetail.map((order, index) => (
                  <div
                    key={`fail-order-${index}`}
                    className={cn('flex items-start gap-3 px-4 py-3', index !== orderDetail.length - 1 && 'border-0 border-b border-solid border-border')}
                  >
                    {order.status === 'creating' ? (
                      <LoaderCircle className="mt-0.5 h-5 w-5 animate-spin text-accent" strokeWidth={1.75} />
                    ) : order.status === 'fail' ? (
                      <CircleAlert className="mt-0.5 h-5 w-5 text-danger" strokeWidth={1.75} />
                    ) : (
                      <CircleCheck className="mt-0.5 h-5 w-5 text-success" strokeWidth={1.75} />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="text-body font-medium text-text">
                        {order.status !== 'creating' ? order.status === 'fail' ? '#' + order.orderNo + ' 訂單建立失敗' : '#' + order.orderNo + ' 訂單建立成功' : '#' + order.orderNo + ' 訂單建立中'}
                      </p>
                      <p className="text-caption tabular-nums text-text-secondary">訂單日期：{format(order.orderDate, 'yyyy/MM/dd')}</p>
                      <p className="text-caption tabular-nums text-text-secondary">建立時間：{format(order.createTime, 'yyyy/MM/dd  HH:mm:ss')}</p>
                      {order.status === 'fail' && <p className="text-caption text-danger">失敗原因：{order.message}</p>}
                    </div>
                    {order.status === 'fail' && (
                      <DropdownMenu modal={false} open={openForMoreBtn && targetID === order.id} onOpenChange={o => !o && handleCloseForMoreBtn()}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="更多操作" onClick={e => handleClickForMoreBtn(e, order.id)}>
                            <EllipsisVertical strokeWidth={1.75} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem disabled={isClick} onSelect={handleEditOrder}>
                            <Pencil strokeWidth={1.75} />
                            編輯
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={isClick} onSelect={handleReCheckoutOrder}>
                            <RotateCcw strokeWidth={1.75} />
                            重試
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem danger disabled={isClick} onSelect={handleDeleteOrder}>
                            <Trash2 strokeWidth={1.75} />
                            刪除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 px-4 py-6 text-body text-text-secondary">
                  <Moon className="h-5 w-5 text-text-tertiary" strokeWidth={1.75} />
                  佇列中沒有正在進行中的工作
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" className="hidden h-8 w-8 lg:inline-flex" aria-label="收合側欄" onClick={onOpenNavBarMobile}>
          <PanelLeftClose strokeWidth={1.75} />
        </Button>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-md border border-solid border-border bg-background px-3 text-left text-body font-medium text-text hover:border-border-strong',
          focusRing
        )}
      >
        <Store className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
        <span className="flex-1 truncate">{JSON.parse(localStorage.getItem('userMerchant')).name}</span>
        <ChevronsUpDown className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
      </button>
      <MerchantBar userMerchants={userMerchants} open={open} onClose={toggle} />
    </Fragment>
  )
}
TopBar.propTypes = {
  onOpenNavBarMobile: PropTypes.func,
}


export default TopBar
