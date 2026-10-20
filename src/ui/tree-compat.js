import React from 'react'
import { cn } from './utils'
import './accordion-compat.css'
import './tree-compat.css'

// 舊頁面用的樹狀選單（取代 @mui/x-tree-view 的 TreeView／TreeItem，Jason 2026/10/20 拍版「樹狀選單自己做、保留原樣」）。
// 介面與 MUI 相容（頁面只換 import），輸出 MUI 同名 DOM 與 class：各頁以 .MuiTreeItem-content 等選擇器排版，
// 且 handleNodeFocus 以 event.currentTarget（點擊的 content）找第一個 span 的 id——點擊事件的 currentTarget 必須是 content。
// 行為比照 MUI：expanded 受控／defaultExpanded 非受控，點 content 先切換展開（有子項才切換）、再選取、最後呼叫 TreeItem 的 onClick；
// 收合時子層卸載（unmountOnExit）；方向鍵上下移動、右展開、左收合、Enter 切換（aria-activedescendant 指向目前節點）。

const TreeContext = React.createContext(null)
const DepthContext = React.createContext(0)

const TreeView = React.forwardRef(function TreeView(
  {
    expanded: expandedProp,
    defaultExpanded = [],
    onNodeToggle,
    selected: selectedProp,
    defaultSelected = null,
    onNodeSelect,
    defaultCollapseIcon,
    defaultExpandIcon,
    defaultEndIcon,
    defaultParentIcon,
    disableSelection = false,
    multiSelect = false,
    className,
    children,
    onKeyDown,
    onBlur,
    id: idProp,
    ...rest
  },
  ref
) {
  const rootRef = React.useRef(null)
  const idRef = React.useRef(null)
  if (idRef.current === null) idRef.current = idProp || `tree-${Math.random().toString(36).slice(2, 8)}`
  const [innerExpanded, setInnerExpanded] = React.useState(defaultExpanded)
  const expanded = expandedProp !== undefined ? expandedProp : innerExpanded
  const [innerSelected, setInnerSelected] = React.useState(defaultSelected)
  const selected = selectedProp !== undefined ? selectedProp : innerSelected
  const [focused, setFocused] = React.useState(null)
  // 同 MUI 6.17：只有 tree 根節點本身持有焦點時才標示 Mui-focused（滑鼠點擊時焦點在 li 上，不標示）
  const [rootFocused, setRootFocused] = React.useState(false)

  const toggle = React.useCallback(
    (event, nodeId) => {
      const next = expanded.indexOf(nodeId) !== -1 ? expanded.filter(id => id !== nodeId) : [nodeId, ...expanded]
      if (onNodeToggle) onNodeToggle(event, next)
      if (expandedProp === undefined) setInnerExpanded(next)
    },
    [expanded, expandedProp, onNodeToggle]
  )
  const select = React.useCallback(
    (event, nodeId) => {
      if (disableSelection) return
      if (onNodeSelect) onNodeSelect(event, nodeId)
      if (selectedProp === undefined) setInnerSelected(nodeId)
    },
    [disableSelection, onNodeSelect, selectedProp]
  )
  const nodeDomId = React.useCallback(nodeId => `${idRef.current}-${nodeId}`, [])
  const value = React.useMemo(
    () => ({ expanded, selected, focused: rootFocused ? focused : null, setFocused, toggle, select, nodeDomId, icons: { defaultCollapseIcon, defaultExpandIcon, defaultEndIcon, defaultParentIcon } }),
    [expanded, selected, focused, rootFocused, toggle, select, nodeDomId, defaultCollapseIcon, defaultExpandIcon, defaultEndIcon, defaultParentIcon]
  )

  // 鍵盤：依畫面上可見的節點順序移動焦點
  const handleKeyDown = event => {
    if (onKeyDown) onKeyDown(event)
    if (!focused || !rootRef.current) return
    const items = Array.from(rootRef.current.querySelectorAll('[role="treeitem"]'))
    const current = rootRef.current.querySelector(`[data-node-id="${CSS.escape(focused)}"]`)
    const i = items.indexOf(current)
    const focusAt = el => el && setFocused(el.getAttribute('data-node-id'))
    const expandable = current && current.getAttribute('aria-expanded') !== null
    const isOpen = current && current.getAttribute('aria-expanded') === 'true'
    if (event.key === 'ArrowDown') focusAt(items[i + 1])
    else if (event.key === 'ArrowUp') focusAt(items[i - 1])
    else if (event.key === 'Home') focusAt(items[0])
    else if (event.key === 'End') focusAt(items[items.length - 1])
    else if (event.key === 'ArrowRight') {
      if (expandable && !isOpen) toggle(event, focused)
      else if (isOpen) focusAt(items[i + 1])
    } else if (event.key === 'ArrowLeft') {
      if (isOpen) toggle(event, focused)
      else focusAt(current && current.parentElement && current.parentElement.closest('[role="treeitem"]'))
    } else if (event.key === 'Enter') {
      if (expandable) toggle(event, focused)
      else select(event, focused)
    } else if (event.key === ' ') select(event, focused)
    else return
    event.preventDefault()
  }

  return (
    <TreeContext.Provider value={value}>
      <ul
        ref={el => {
          rootRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        role="tree"
        id={idRef.current}
        aria-multiselectable={multiSelect}
        aria-activedescendant={focused ? nodeDomId(focused) : undefined}
        tabIndex={0}
        className={cn('MuiTreeView-root', className)}
        onKeyDown={handleKeyDown}
        onFocus={event => {
          if (event.target !== event.currentTarget) return
          setRootFocused(true)
          // Tab 進入 tree：焦點落在已選取的項目，否則第一個項目
          if (!focused && rootRef.current) {
            const first = (selected && rootRef.current.querySelector(`[data-node-id="${CSS.escape(String(selected))}"]`)) || rootRef.current.querySelector('[role="treeitem"]')
            if (first) setFocused(first.getAttribute('data-node-id'))
          }
        }}
        onBlur={event => {
          if (onBlur) onBlur(event)
          if (event.target === event.currentTarget) setRootFocused(false)
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null)
        }}
        {...rest}
      >
        {children}
      </ul>
    </TreeContext.Provider>
  )
})

const TreeItem = React.forwardRef(function TreeItem(
  { nodeId, label, children, icon, collapseIcon, expandIcon, endIcon, disabled = false, onClick, onMouseDown, className, ContentProps, TransitionComponent, TransitionProps, id, ...rest },
  ref
) {
  const tree = React.useContext(TreeContext)
  const depth = React.useContext(DepthContext)
  const expandable = React.Children.toArray(children).some(Boolean)
  const expanded = expandable && tree.expanded.indexOf(nodeId) !== -1
  const selected = tree.selected === nodeId
  const focused = tree.focused === nodeId
  const expansionIcon = expandable ? (expanded ? collapseIcon || tree.icons.defaultCollapseIcon : expandIcon || tree.icons.defaultExpandIcon) : undefined
  const displayIcon = expandable ? tree.icons.defaultParentIcon : endIcon || tree.icons.defaultEndIcon
  const shownIcon = icon || expansionIcon || displayIcon
  return (
    <li
      ref={ref}
      role="treeitem"
      id={id || tree.nodeDomId(nodeId)}
      data-node-id={nodeId}
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={selected ? true : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      className={cn('MuiTreeItem-root', className)}
      onFocus={event => {
        // 同 MUI：點到項目時記下目前節點（鍵盤方向鍵由此出發）
        if (event.target === event.currentTarget && !disabled) tree.setFocused(nodeId)
      }}
      {...rest}
    >
      <div
        {...ContentProps}
        className={cn('MuiTreeItem-content', expanded && 'Mui-expanded', selected && 'Mui-selected', focused && 'Mui-focused', disabled && 'Mui-disabled', ContentProps && ContentProps.className)}
        onMouseDown={event => {
          // 同 MUI：按住 Shift／Ctrl 點選時避免選到文字
          if (event.shiftKey || event.ctrlKey || event.metaKey) event.preventDefault()
          if (onMouseDown) onMouseDown(event)
        }}
        onClick={event => {
          if (!disabled) {
            if (expandable) tree.toggle(event, nodeId)
            tree.select(event, nodeId)
          }
          if (onClick) onClick(event)
        }}
      >
        <div className="MuiTreeItem-iconContainer">{shownIcon}</div>
        <div className="MuiTreeItem-label">{label}</div>
      </div>
      {expandable && expanded && (
        <ul role="group" className="MuiCollapse-root MuiCollapse-vertical MuiCollapse-entered MuiTreeItem-group">
          <div className="MuiCollapse-wrapper MuiCollapse-vertical">
            <div className="MuiCollapse-wrapperInner MuiCollapse-vertical">
              <DepthContext.Provider value={depth + 1}>{children}</DepthContext.Provider>
            </div>
          </div>
        </ul>
      )}
    </li>
  )
})

export { TreeView, TreeItem }
