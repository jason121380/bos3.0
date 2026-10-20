import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { SidebarGroupButton, SidebarLink } from 'ui/sidebar'

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

function NavItem({
  title,
  href,
  depth,
  children,
  icon: Icon,
  className,
  open: openProp,
  label: Label,
  reportListExtended,
  ...rest
}) {
  const history = useHistory()
  const location = useLocation()
  const [open, setOpen] = useState(openProp)
  const linkRef = useRef(null)

  const handleToggle = () => {
    !(title === '報表及分析' && !reportListExtended) && setOpen(prevOpen => !prevOpen)
  }

  // 「報表及分析」未開啟細項時，點擊直接前往報表目錄、不展開（與舊版行為相同）
  const goReportList = () => (title === '報表及分析' && !reportListExtended) && history.push('/dashboard-list-detail')
  const hideChevron = title === '報表及分析' && !reportListExtended

  // 揭露目前位置：群組含目前頁面（或搜尋命中）時，換頁後自動展開；使用者手動收合仍有效，直到下次換頁
  // 「報表及分析」未開啟細項時本來就不展開，維持原樣
  useEffect(() => {
    if (openProp && !hideChevron) setOpen(true)
  }, [openProp, hideChevron, location.pathname])

  const exact = location.pathname === href
  const active = !children && isWithinHref(location.pathname, href)
  useEffect(() => {
    if (active) revealInSidebar(linkRef.current)
  }, [active])

  if (children) {
    return (
      <div {...rest} key={title}>
        <SidebarGroupButton
          icon={Icon}
          open={open}
          hideChevron={hideChevron}
          onClick={() => {
            handleToggle()
            goReportList()
          }}
        >
          {title}
        </SidebarGroupButton>
        {open && <div className="flex flex-col gap-0.5 pt-0.5">{children}</div>}
      </div>
    )
  }

  return (
    <SidebarLink
      {...rest}
      key={title}
      to={href}
      icon={Icon}
      indent={!Icon}
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
  className: PropTypes.object,
  depth: PropTypes.number.isRequired,
  href: PropTypes.string,
  icon: PropTypes.any,
  label: PropTypes.any,
  open: PropTypes.bool,
  title: PropTypes.string.isRequired,
}

NavItem.defaultProps = {
  open: false,
  className: {}
}

export default NavItem
