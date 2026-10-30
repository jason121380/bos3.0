import PropTypes from 'prop-types'
import { useContext, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import useMediaQuery from 'hooks/useMediaQuery'
import {
  SIDEBAR_FLYOUT_MEDIA,
  SidebarFlyout,
  SidebarGroupButton,
  SidebarLink,
  SidebarRailContext,
  canHoverSidebarFlyout,
  claimSidebarFlyout,
  releaseSidebarFlyout,
} from 'ui/sidebar'

// 目前網址是否在這個選單項目底下（本身或其子頁，例如 /management/customers/123 屬於「客戶列表」）
export const isWithinHref = (pathname, href) => Boolean(href) && (pathname === href || pathname.startsWith(`${href}/`))

// 讓目前項目出現在側欄可視範圍內：只捲動側欄自己的 <nav>，不動頁面捲動
function revealInSidebar(el) {
  const box = el && el.closest('nav')
  if (!box) return
  const item = el.getBoundingClientRect()
  const view = box.getBoundingClientRect()
  if (item.top < view.top) box.scrollTop -= view.top - item.top + 8
  else if (item.bottom > view.bottom) box.scrollTop += item.bottom - view.bottom + 8
}

const FLYOUT_CLOSE_DELAY = 160

function NavItem({
  title,
  href,
  depth,
  children,
  renderItems,
  icon: Icon,
  className,
  open: openProp,
  forceOpen,
  label: Label,
  reportListExtended,
  ...rest
}) {
  const history = useHistory()
  const location = useLocation()
  const [open, setOpen] = useState(openProp)
  const [hovering, setHovering] = useState(false)
  const [pinned, setPinned] = useState(false)
  const linkRef = useRef(null)
  const anchorRef = useRef(null)
  const closeTimer = useRef(null)
  const pinnedRef = useRef(false)
  const closeFlyoutRef = useRef(() => {})
  // 以鍵盤（Enter／空白鍵）打開浮層時，開啟後把焦點移進第一個細項；失焦到側欄與浮層之外就關閉
  const keyboardOpenRef = useRef(false)
  // Esc 關閉後把焦點送回群組鈕時，不要因為 focus 事件又把浮層打開
  const skipFocusOpenRef = useRef(false)
  const tokenRef = useRef(null)
  if (!tokenRef.current) tokenRef.current = () => closeFlyoutRef.current()
  const collapsed = useContext(SidebarRailContext)
  const isLg = useMediaQuery('(min-width: 1024px)')
  const hoverFlyout = useMediaQuery(SIDEBAR_FLYOUT_MEDIA)
  const iconRail = collapsed && isLg
  const hideChevron = title === '報表及分析' && !reportListExtended
  const hasSubmenu = Boolean(renderItems || children)
  // 有 hover 的桌機改看浮層，不再點了讓子項在側欄裡上下開合。左右收合圖示欄不受影響。
  // 搜尋的 forceOpen 仍嵌進側欄，否則篩選結果要逐項 hover 才看得到。
  const useHoverMenu = hoverFlyout && hasSubmenu && !hideChevron

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const forceClose = () => {
    clearCloseTimer()
    pinnedRef.current = false
    keyboardOpenRef.current = false
    setHovering(false)
    setPinned(false)
    releaseSidebarFlyout(tokenRef.current)
  }
  closeFlyoutRef.current = forceClose

  const handleToggle = () => {
    !(title === '報表及分析' && !reportListExtended) && setOpen(prevOpen => !prevOpen)
  }

  // 「報表及分析」未開啟細項時，點擊直接前往報表目錄、不展開（與舊版行為相同）
  const goReportList = () => title === '報表及分析' && !reportListExtended && history.push('/dashboard-list-detail')

  // 揭露目前位置：群組含目前頁面（或搜尋命中）時，換頁後自動展開；使用者手動收合仍有效，直到下次換頁
  // 「報表及分析」未開啟細項時本來就不展開，維持原樣
  useEffect(() => {
    if (openProp && !hideChevron) setOpen(true)
  }, [openProp, hideChevron, location.pathname])

  useEffect(() => {
    pinnedRef.current = false
    setHovering(false)
    setPinned(false)
    releaseSidebarFlyout(tokenRef.current)
  }, [location.pathname])

  useEffect(() => {
    if (!iconRail) {
      pinnedRef.current = false
      setPinned(false)
    }
  }, [iconRail])

  useEffect(
    () => () => {
      clearCloseTimer()
      releaseSidebarFlyout(tokenRef.current)
    },
    []
  )

  const exact = location.pathname === href
  const active = !hasSubmenu && isWithinHref(location.pathname, href)
  useEffect(() => {
    if (active) revealInSidebar(linkRef.current)
  }, [active])

  // 內嵌子項已經展開時不再浮出第二份；圖示欄的內嵌子項被收起，仍要浮出。
  // 桌機 hover 沒有上下開合，子項只在浮層。
  const showInline = Boolean(open && !hideChevron && (!useHoverMenu || forceOpen))
  const showFlyout = hasSubmenu && !hideChevron && (hovering || pinned) && (iconRail || !showInline)

  const openHover = () => {
    if (!hasSubmenu || hideChevron || !canHoverSidebarFlyout()) return
    clearCloseTimer()
    claimSidebarFlyout(tokenRef.current)
    setHovering(true)
  }

  const scheduleClose = event => {
    const next = event && event.relatedTarget
    const anchor = anchorRef.current
    if (next && next.nodeType === 1 && anchor && anchor.contains(next)) return
    clearCloseTimer()
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null
      setHovering(false)
      if (!pinnedRef.current) releaseSidebarFlyout(tokenRef.current)
    }, FLYOUT_CLOSE_DELAY)
  }

  const renderSubmenu = () => (renderItems ? renderItems() : children)

  // 浮層掛在 document.body（portal），用 id 判斷焦點是否還在群組鈕或浮層內
  const flyoutId = `sidebar-flyout-${title}`
  const usesFlyout = !hideChevron && (iconRail || (useHoverMenu && !showInline))
  const focusWithinMenu = target => {
    if (!target || target.nodeType !== 1) return false
    if (anchorRef.current && anchorRef.current.contains(target)) return true
    const flyout = document.getElementById(flyoutId)
    return Boolean(flyout && flyout.contains(target))
  }

  // 鍵盤：Tab 停在群組鈕就先浮出細項（與滑鼠滑過相同）；焦點離開群組鈕與浮層才關閉
  const handleFocus = event => {
    if (skipFocusOpenRef.current) {
      skipFocusOpenRef.current = false
      return
    }
    if (!usesFlyout || event.target !== anchorRef.current?.querySelector('button')) return
    if (!canHoverSidebarFlyout() && !iconRail) return
    clearCloseTimer()
    claimSidebarFlyout(tokenRef.current)
    setHovering(true)
  }
  const handleBlur = event => {
    if (!usesFlyout) return
    if (focusWithinMenu(event.relatedTarget)) return
    // 滑鼠釘住（圖示欄點選）的維持原本行為：點到別處不關；鍵盤打開的失焦即關
    if (pinnedRef.current && !keyboardOpenRef.current) {
      setHovering(false)
      return
    }
    forceClose()
  }
  const handleKeyDown = event => {
    if (event.key !== 'Escape' || !(hovering || pinned)) return
    event.stopPropagation()
    forceClose()
    skipFocusOpenRef.current = true
    anchorRef.current?.querySelector('button')?.focus()
    skipFocusOpenRef.current = false
  }

  if (hasSubmenu) {
    return (
      <div
        {...rest}
        key={title}
        ref={anchorRef}
        className="relative"
        onMouseEnter={openHover}
        onMouseLeave={scheduleClose}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <SidebarGroupButton
          icon={Icon}
          open={open}
          hideChevron={hideChevron || (useHoverMenu && !showInline)}
          {...(useHoverMenu && !showInline
            ? { 'aria-expanded': showFlyout, 'aria-haspopup': 'true', 'aria-controls': showFlyout ? flyoutId : undefined }
            : {})}
          onClick={event => {
            if (!useHoverMenu) handleToggle()
            goReportList()
            // 圖示欄：點選釘住浮層，再點一次關閉（#312 現況）。
            // 桌機 hover 模式維持 #310–#314 的滑鼠行為（滑過浮出、移開關閉、點主項不開合）；
            // 只有鍵盤觸發的 click（Enter／空白鍵，event.detail 為 0）才釘住浮層並把焦點移進細項。
            const keyboard = !event || event.detail === 0
            if (usesFlyout && (iconRail || keyboard)) {
              const next = !pinnedRef.current
              pinnedRef.current = next
              keyboardOpenRef.current = next && keyboard
              setPinned(next)
              if (next) claimSidebarFlyout(tokenRef.current)
              else {
                setHovering(false)
                releaseSidebarFlyout(tokenRef.current)
              }
            }
          }}
        >
          {title}
        </SidebarGroupButton>
        {showInline && <div className="flex flex-col gap-0.5 pt-0.5 lg:group-data-[rail=true]/sidebar:hidden">{renderSubmenu()}</div>}
        {showFlyout && (
          <SidebarFlyout
            id={flyoutId}
            anchorRef={anchorRef}
            label={`${title}的細項`}
            autoFocus={keyboardOpenRef.current}
            onMouseEnter={openHover}
            onMouseLeave={scheduleClose}
            onKeyDown={event => {
              if (event.key !== 'Escape') return
              event.stopPropagation()
              forceClose()
              skipFocusOpenRef.current = true
              anchorRef.current?.querySelector('button')?.focus()
              skipFocusOpenRef.current = false
            }}
          >
            {renderSubmenu()}
          </SidebarFlyout>
        )}
      </div>
    )
  }

  return (
    <SidebarLink
      {...rest}
      key={title}
      to={href}
      icon={Icon}
      // 子層可以帶圖示（工程模式），仍維持與其他子頁相同的縮排
      indent={!Icon || depth > 0}
      active={active}
      // 本頁為 page；子頁（如顧客詳細）只標示所在區段
      aria-current={exact ? 'page' : active ? 'true' : undefined}
      innerRef={linkRef}
    >
      {title}
      {Label && (
        <span className="ml-auto flex items-center">
          <Label />
        </span>
      )}
    </SidebarLink>
  )
}

NavItem.propTypes = {
  children: PropTypes.node,
  renderItems: PropTypes.func,
  className: PropTypes.object,
  depth: PropTypes.number.isRequired,
  href: PropTypes.string,
  icon: PropTypes.any,
  label: PropTypes.any,
  open: PropTypes.bool,
  forceOpen: PropTypes.bool,
  title: PropTypes.string.isRequired,
}

NavItem.defaultProps = {
  open: false,
  forceOpen: false,
  className: {},
}

export default NavItem
