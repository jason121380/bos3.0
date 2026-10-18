import PropTypes from 'prop-types'
import { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { SidebarGroupButton, SidebarLink } from 'ui/sidebar'

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

  const handleToggle = () => {
    !(title === '報表及分析' && !reportListExtended) && setOpen(prevOpen => !prevOpen)
  }

  // 「報表及分析」未開啟細項時，點擊直接前往報表目錄、不展開（與舊版行為相同）
  const goReportList = () => (title === '報表及分析' && !reportListExtended) && history.push('/dashboard-list-detail')
  const hideChevron = title === '報表及分析' && !reportListExtended

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
    <SidebarLink {...rest} key={title} to={href} icon={Icon} indent={!Icon} active={location.pathname === href}>
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
