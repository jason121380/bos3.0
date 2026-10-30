import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from './utils'

const TreeContext = React.createContext(null)
let treeSeed = 0
let itemSeed = 0

// 收合會卸載子層；選取與展開分開受控。鍵盤啟用與滑鼠共用列的 click，保留 currentTarget 查標籤的契約。
const TreeView = React.forwardRef(function TreeView(
  {
    expanded: expandedProp,
    defaultExpanded = [],
    onToggle,
    selected: selectedProp,
    defaultSelected = null,
    onSelect,
    defaultCollapseIcon = <ChevronDown />,
    defaultExpandIcon = <ChevronRight />,
    className,
    children,
    id,
    ...props
  },
  ref
) {
  const root = React.useRef(null)
  const [treeId] = React.useState(() => id || `ui-tree-${++treeSeed}`)
  const [innerExpanded, setExpanded] = React.useState(defaultExpanded)
  const [innerSelected, setSelected] = React.useState(defaultSelected)
  const [active, setActive] = React.useState(null)
  const expanded = expandedProp === undefined ? innerExpanded : expandedProp
  const selected = selectedProp === undefined ? innerSelected : selectedProp
  const items = () => Array.from(root.current.querySelectorAll('[role="treeitem"]:not([aria-disabled="true"])'))
  // 搜尋或受控收合可能移除目前項目；保持恰好一個可見項目可由 Tab 進入。
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意每次 render 後確認恰好一個項目可由 Tab 進入；有條件判斷，不會無限更新
  React.useLayoutEffect(() => {
    const visible = items()
    if (!visible.some(el => el.id === active)) {
      const next = visible.find(el => el.dataset.nodeId === selected) || visible[0]
      setActive(next ? next.id : null)
    }
  })
  const tree = {
    active,
    setActive,
    selected,
    expanded,
    treeId,
    defaultCollapseIcon,
    defaultExpandIcon,
    items,
    toggle(event, nodeId) {
      const next = expanded.includes(nodeId) ? expanded.filter(id => id !== nodeId) : [nodeId, ...expanded]
      if (expandedProp === undefined) setExpanded(next)
      if (onToggle) onToggle(event, next)
    },
    select(event, nodeId) {
      if (selectedProp === undefined) setSelected(nodeId)
      if (onSelect) onSelect(event, nodeId)
    },
  }
  return (
    <TreeContext.Provider value={tree}>
      <ul
        {...props}
        id={treeId}
        role="tree"
        ref={el => {
          root.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        className={cn('ui-root m-0 flex list-none flex-col gap-0.5 p-0 text-body text-text', className)}
      >
        {children}
      </ul>
    </TreeContext.Provider>
  )
})

const TreeItem = React.forwardRef(function TreeItem(
  {
    nodeId,
    label,
    children,
    selected: selectedProp,
    disabled = false,
    icon,
    expandIcon,
    collapseIcon,
    onClick,
    onKeyDown,
    className,
    groupClassName,
    contentClassName,
    id,
    ...props
  },
  ref
) {
  const tree = React.useContext(TreeContext)
  const row = React.useRef(null)
  const expandable = React.Children.toArray(children).some(Boolean)
  const expanded = expandable && tree.expanded.includes(nodeId)
  const selected = selectedProp === undefined ? tree.selected === nodeId : selectedProp
  const [instanceId] = React.useState(() => ++itemSeed)
  const itemId = id || `${tree.treeId}-item-${instanceId}`
  const shownIcon = icon || (expandable && (expanded ? collapseIcon || tree.defaultCollapseIcon : expandIcon || tree.defaultExpandIcon))
  const focus = el => el && el.focus()
  return (
    <li
      {...props}
      ref={ref}
      id={itemId}
      role="treeitem"
      data-node-id={nodeId}
      aria-labelledby={`${itemId}-label`}
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={!!selected}
      aria-disabled={disabled || undefined}
      tabIndex={!disabled && tree.active === itemId ? 0 : -1}
      className={cn('group/treeitem m-0 list-none rounded-md p-0 outline-none', selected && '!bg-transparent', className)}
      onFocus={event => {
        if (event.target === event.currentTarget && !disabled) tree.setActive(itemId)
      }}
      onKeyDown={event => {
        if (onKeyDown) onKeyDown(event)
        // 自訂標籤內的 checkbox／button 保留自身鍵盤操作，不把它再當樹節點啟用。
        if (event.defaultPrevented || event.target !== event.currentTarget || disabled) return
        const visible = tree.items(),
          current = event.currentTarget,
          index = visible.indexOf(current)
        if (event.key === 'ArrowDown') focus(visible[index + 1])
        else if (event.key === 'ArrowUp') focus(visible[index - 1])
        else if (event.key === 'Home') focus(visible[0])
        else if (event.key === 'End') focus(visible[visible.length - 1])
        else if (event.key === 'ArrowRight') {
          if (expandable && !expanded) tree.toggle(event, nodeId)
          else if (expanded) focus(visible[index + 1])
        } else if (event.key === 'ArrowLeft') {
          if (expanded) tree.toggle(event, nodeId)
          else focus(current.parentElement.closest('[role="treeitem"]'))
        } else if (event.key === 'Enter' || event.key === ' ') row.current.click()
        else return
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div
        ref={row}
        data-tree-content=""
        className={cn(
          'flex min-h-10 cursor-pointer items-center gap-1 rounded-md px-2 py-1 transition-colors',
          '[.group\/treeitem:focus-visible>&]:ring-2 [.group\/treeitem:focus-visible>&]:ring-accent',
          selected ? 'bg-accent/[0.12] font-medium text-accent hover:bg-accent/[0.12]' : 'hover:bg-surface-hover',
          disabled && 'cursor-default opacity-50',
          contentClassName
        )}
        onClick={event => {
          event.stopPropagation()
          if (disabled) return
          // 不攔截標籤內原生輸入的預設行為；列回呼的 currentTarget 固定是這個 div。
          if (!event.target.closest('input,button,a,select,textarea')) event.currentTarget.parentElement.focus()
          if (expandable) tree.toggle(event, nodeId)
          tree.select(event, nodeId)
          if (onClick) onClick(event)
        }}
      >
        {shownIcon && (
          <div aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center text-text-tertiary [&_svg]:h-4 [&_svg]:w-4">
            {shownIcon}
          </div>
        )}
        <div id={`${itemId}-label`} className={cn('min-w-0', selected && '[&_span]:font-medium [&_svg]:text-accent')}>
          {label}
        </div>
      </div>
      {expanded && (
        <ul role="group" className={cn('m-0 ml-6 flex list-none flex-col gap-1 p-0', groupClassName)}>
          {children}
        </ul>
      )}
    </li>
  )
})

export { TreeView, TreeItem }
