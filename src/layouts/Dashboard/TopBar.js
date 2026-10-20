import { Link as RouterLink } from 'react-router-dom'
import { Bell, BellRing, CircleAlert, CircleCheck, EllipsisVertical, LoaderCircle, Moon, PanelLeftClose, Pencil, RotateCcw, Store, Sun, Trash2 } from 'lucide-react'
import { Button } from 'ui/button'
import { Popover, PopoverAnchor, PopoverContent } from 'ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from 'ui/dropdown-menu'
import { cn, focusRing } from 'ui/utils'
import { APP_VERSION } from '../../version'
import useFetchSystemUpdateRecord from 'hooks/useFetchSystemUpdateRecord'
import useToggle from 'hooks/useToggle'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useRef, Fragment } from 'react'
import SlotPortal from 'components/SlotPortal'
import useMediaQuery from 'hooks/useMediaQuery'
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
import { getApiOrigin } from 'lib/api-base'
import { useDispatch } from 'react-redux'
import { socketActions } from './../../store/socket'
import { reservationActions } from './../../store/reservation'
import { QRcodeClockInActions } from './../../store/QRcodeClockIn'
import { deductionDisplayActions } from './../../store/deductionDisplay'
import bosLogo from 'assets/images/bosLogoNew.png'

// 側欄底部（NavBar 的 SidebarFooter，profile 載入後才出現）的插槽；插槽出現前先不渲染，出現後以 Portal 畫進去
const SIDEBAR_FOOTER_SLOT_ID = 'sidebar-merchant-switch-slot'
// 側欄頂列的搜尋鈕插槽（NavBar 以 Portal 畫進來）
export const SIDEBAR_SEARCH_SLOT_ID = 'sidebar-search-slot'
function SidebarFooterPortal({ children }) {
  return <SlotPortal slotId={SIDEBAR_FOOTER_SLOT_ID}>{children}</SlotPortal>
}

function TopBar({ onOpenNavBarMobile, userMerchants }) {
  const dispatch = useDispatch()
  const history = useHistory()
  const ref = useRef()
  const isDesktop = useMediaQuery('(min-width: 1024px)') // Tailwind lg：側欄常駐的斷點
  // 手機通知面板的虛擬錨點：畫面水平正中、鈴鐺下緣（Radix Popper 以 getBoundingClientRect 定位）
  const centeredAnchorRef = useRef({
    getBoundingClientRect: () => {
      const bottom = ref.current ? ref.current.getBoundingClientRect().bottom : 56
      const x = window.innerWidth / 2
      return { x, y: bottom, top: bottom, bottom, left: x, right: x, width: 0, height: 0, toJSON: () => ({}) }
    },
  })
  const { open, toggle } = useToggle()
  const profileIdentity = useFetchProfileIdentity()
  const profile = useFetchProfile()
  const merchantAuthData = useFetchMerchantAuthorities()
  // 未登入（無 user）時 NavBar 會導向登入頁；這裡不可讀 null.id，否則整個版面在導頁前就拋錯
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  const getTheme = idx(
    useFetchUser({ id: storedUser && storedUser.id }),
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

  // 建立 WebSocket 連線：位址與 GraphQL 同一個後端（api-base），斷線由 socket.io 內建機制自動重連；
  // 離開版面時關閉連線並移除所有監聽（原本重連時舊連線與監聽都沒釋放，事件會被重複處理）
  useEffect(() => {
    const socket = webSocket(getApiOrigin(), {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })
    setWs(socket)
    return () => {
      socket.off()
      socket.disconnect()
    }
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

  useEffect(() => {
    if (!ws) return undefined
    // 每次（重新）連上都要重新加入店家房間：伺服器端的房間成員在斷線後就失效
    const joinRoom = () => {
      const userMerchant = JSON.parse(localStorage.getItem('userMerchant') || 'null')
      if (userMerchant) ws.emit('roomKey', userMerchant.id)
    }
    const onOrderQueue = order => {
      handlesetOrderDetail(order)
      setOrderDetail(order)
    }
    const onNewSchedule = schedule => dispatch(socketActions.setSchedule(schedule))
    const onCalendars = data => dispatch(reservationActions.setReservation(data))
    const onQrcodeKeyExpired = key => dispatch(QRcodeClockInActions.setQRcodeKey(key))
    // 伺服器主動斷線時 socket.io 不會自動重連，需手動再連
    const onDisconnect = reason => {
      if (reason === 'io server disconnect') ws.connect()
    }

    ws.on('connect', joinRoom)
    ws.on('OrderQueue', onOrderQueue)
    ws.on('NEWSCHEDULE', onNewSchedule)
    ws.on('CALENDARS', onCalendars)
    ws.on('QRCODE_KEY_EXPIRED', onQrcodeKeyExpired)
    ws.on('disconnect', onDisconnect)
    if (ws.connected) joinRoom()

    return () => {
      ws.off('connect', joinRoom)
      ws.off('OrderQueue', onOrderQueue)
      ws.off('NEWSCHEDULE', onNewSchedule)
      ws.off('CALENDARS', onCalendars)
      ws.off('QRCODE_KEY_EXPIRED', onQrcodeKeyExpired)
      ws.off('disconnect', onDisconnect)
    }
  }, [ws])

  useEffect(() => {
    if (!merchantAuthData.loading && !profileIdentity.loading) {
      const merchantAuth = idx(merchantAuthData, _ => _.data.getMerchantAuthorities)
      const loginUserAuthName = idx(profileIdentity, _ => _.data.me.merchantIdentity.authorityName)
      // 權限資料取不到（API 失敗）時略過，維持預設的最小權限；原本直接 .filter(undefined) 拋錯，整個後台白畫面
      if (!Array.isArray(merchantAuth)) return
      const userAuth = merchantAuth.filter(data => data.authorityName === loginUserAuthName)
      if (!userAuth[0]) return
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
      if (!Array.isArray(merchantAuth)) return // API 失敗：同上，不讓版面拋錯
      const userAuth = merchantAuth.filter(data => data.authorityName === loginUserAuthName)
      // 找不到登入者的角色＝沒有任何頁面權限，與「權限全關」同樣導向個人頁（原本在這裡拋錯）
      if (!userAuth[0]) {
        history.push('/profile/general')
        return
      }
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
      // 佇列查詢失敗（無資料）時略過；原本 undefined.filter 會讓整個後台白畫面
      if (!Array.isArray(tmpData)) return
      handlesetOrderDetail(tmpData)
      setOrderDetail(tmpData)
    }
  }, [usingOrderQueue.loading])

  // 版本記錄
  useEffect(() => {
    if (!systemUpdateRecord.loading) {
      let tmp = {}
      const data = idx(systemUpdateRecord, _ => _.data.systemUpdateRecord)
      if (!Array.isArray(data)) return // 版本記錄查詢失敗時略過，不讓版面拋錯
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
  // 深淺色切換（Jason 2026/10/21「加回深色」）：沿用既有的 setTheme mutation 存到使用者設定，成功後重新整理套用；
  // 失敗時還原開關狀態（錯誤訊息由 Apollo errorLink 顯示），儲存中不重複送出
  const [themeSaving, setThemeSaving] = useState(false)
  const handleThemeToggle = () => {
    if (themeSaving || !storedUser) return
    const nextDark = !moodChange
    setThemeSaving(true)
    setMoodChange(nextDark)
    setThemeChangeData({
      input: {
        userId: storedUser.id,
        theme: nextDark ? 'DARK' : 'DEFAULT',
      },
    })
      .then(() => {
        window.location.reload()
      })
      .catch(() => {
        setMoodChange(!nextDark)
        setThemeSaving(false)
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
  const bellButton = (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className="relative"
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
  )
  return (
    <Fragment>
      <div className="flex h-10 items-center gap-1">
        {/* 桌機側欄 264px 放不下「Logo＋版號＋搜尋／鈴鐺／收合三顆鈕」一列，版號改疊在 Logo 下方（仍在 40px 列高內）；手機抽屜沒有收合鈕，維持同一列 */}
        <RouterLink to={loginUserAuth ? '/' : '/profile/general'} className={cn('flex min-w-0 items-center gap-2 rounded-md px-1 lg:flex-col lg:items-start lg:gap-0', focusRing)}>
          <img alt="BeautyOS" className="h-6 w-auto invert dark:invert-0" src={bosLogo} />
          <span className="whitespace-nowrap text-caption text-text-tertiary">{APP_VERSION}</span>
        </RouterLink>
        <div className="flex-1" />
        {/* 搜尋選單鈕由 NavBar 畫進這個插槽（搜尋狀態在 NavBar），位置在通知鈴鐺左側（Jason 2026/10/21） */}
        <span id={SIDEBAR_SEARCH_SLOT_ID} className="contents" />
        <Popover open={openButton} onOpenChange={o => !o && setOpenButton(false)}>
          {/* 桌機：面板貼著鈴鐺往右開（打開在內容區）；手機：側欄抽屜很窄，改以虛擬錨點讓面板在畫面水平置中、
              緊接在頂列下方（原本往右開放不下，被推出畫面左側） */}
          {isDesktop ? (
            <PopoverAnchor asChild>{bellButton}</PopoverAnchor>
          ) : (
            <Fragment>
              <PopoverAnchor virtualRef={centeredAnchorRef} />
              {bellButton}
            </Fragment>
          )}
          <PopoverContent
            align={isDesktop ? 'start' : 'center'}
            side={isDesktop ? 'right' : 'bottom'}
            sideOffset={isDesktop ? 6 : 8}
            collisionPadding={16}
            className="w-[min(360px,calc(100vw-32px))] p-0"
          >
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
                          <Button variant="ghost" size="icon" aria-label="更多操作" onClick={e => handleClickForMoreBtn(e, order.id)}>
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
        <Button variant="ghost" size="icon" className="hidden lg:inline-flex" aria-label="收合側欄" onClick={onOpenNavBarMobile}>
          <PanelLeftClose strokeWidth={1.75} />
        </Button>
      </div>
      {/* 切換店家：圖示鈕放在側欄底部登出鈕旁（Jason 2026/10/20）；以 Portal 畫到 NavBar 的插槽，toggle／MerchantBar 仍在本元件 */}
      <SidebarFooterPortal>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={moodChange ? '切換為淺色模式' : '切換為深色模式'}
          aria-pressed={moodChange}
          disabled={themeSaving}
          onClick={handleThemeToggle}
          data-testid="theme-toggle"
        >
          {themeSaving ? (
            <LoaderCircle className="animate-spin" strokeWidth={1.75} aria-hidden="true" />
          ) : moodChange ? (
            <Sun strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Moon strokeWidth={1.75} aria-hidden="true" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={`切換店家（目前：${JSON.parse(localStorage.getItem('userMerchant')).name}）`}
          title={`切換店家（目前：${JSON.parse(localStorage.getItem('userMerchant')).name}）`}
          onClick={toggle}
        >
          <Store strokeWidth={1.75} />
        </Button>
      </SidebarFooterPortal>
      <MerchantBar userMerchants={userMerchants} open={open} onClose={toggle} />
    </Fragment>
  )
}
TopBar.propTypes = {
  onOpenNavBarMobile: PropTypes.func,
}


export default TopBar
