import React from 'react'
import { cn } from './utils'
import { Typography } from './display-compat'
import './display-compat.css'
import './list-compat.css'

// 舊頁面用的清單（取代 MUI List／ListItemButton／ListItemText／ListItemAvatar／ListItemIcon，Jason 2026/10/20 拍版「MUI 整包移除」）。
// 介面與 MUI 相容（頁面只換 import），輸出 MUI 同名元素與 class，樣式由 list-compat.css 重現。
// ListItemButton 同 MUI ButtonBase：div＋role=button、可 Tab 聚焦、Enter／空白鍵觸發 onClick；disabled 時不可點也不可聚焦。
// 新畫面請用 ui 元件（如 DropdownMenu）。

const ListContext = React.createContext({ dense: false })

const List = React.forwardRef(function List({ component: Component = 'ul', dense = false, disablePadding = false, subheader, className, children, ...rest }, ref) {
  const value = React.useMemo(() => ({ dense }), [dense])
  return (
    <ListContext.Provider value={value}>
      <Component ref={ref} className={cn('MuiList-root', !disablePadding && 'MuiList-padding', dense && 'MuiList-dense', subheader && 'MuiList-subheader', className)} {...rest}>
        {subheader}
        {children}
      </Component>
    </ListContext.Provider>
  )
})

const ListItemButton = React.forwardRef(function ListItemButton(
  { component: Component = 'div', dense: denseProp, disabled = false, disableGutters = false, divider = false, selected = false, alignItems = 'center', autoFocus, disableRipple, focusRipple, onClick, onKeyDown, onKeyUp, tabIndex, role = 'button', className, children, ...rest },
  ref
) {
  const ctx = React.useContext(ListContext)
  const dense = denseProp || ctx.dense
  const value = React.useMemo(() => ({ dense }), [dense])
  const isNativeButton = Component === 'button'
  return (
    <ListContext.Provider value={value}>
      <Component
        ref={ref}
        role={isNativeButton ? undefined : role}
        tabIndex={disabled ? -1 : tabIndex !== undefined ? tabIndex : 0}
        aria-disabled={!isNativeButton && disabled ? true : undefined}
        disabled={isNativeButton ? disabled : undefined}
        className={cn(
          'MuiButtonBase-root MuiListItemButton-root',
          dense && 'MuiListItemButton-dense',
          !disableGutters && 'MuiListItemButton-gutters',
          divider && 'MuiListItemButton-divider',
          alignItems === 'flex-start' && 'MuiListItemButton-alignItemsFlexStart',
          disabled && 'Mui-disabled',
          selected && 'Mui-selected',
          className
        )}
        onClick={event => {
          if (disabled) return
          if (onClick) onClick(event)
        }}
        onKeyDown={event => {
          if (onKeyDown) onKeyDown(event)
          // 同 ButtonBase：非原生按鈕以 Enter 觸發點擊（空白鍵在 keyup）
          if (!isNativeButton && !disabled && event.target === event.currentTarget && event.key === 'Enter') {
            event.preventDefault()
            if (onClick) onClick(event)
          }
          if (!isNativeButton && event.target === event.currentTarget && event.key === ' ') event.preventDefault()
        }}
        onKeyUp={event => {
          if (onKeyUp) onKeyUp(event)
          if (!isNativeButton && !disabled && event.target === event.currentTarget && event.key === ' ' && onClick) onClick(event)
        }}
        {...rest}
      >
        {children}
      </Component>
    </ListContext.Provider>
  )
})

const ListItemText = React.forwardRef(function ListItemText(
  { primary: primaryProp, secondary: secondaryProp, children, inset = false, disableTypography = false, primaryTypographyProps, secondaryTypographyProps, className, ...rest },
  ref
) {
  const { dense } = React.useContext(ListContext)
  let primary = primaryProp != null ? primaryProp : children
  let secondary = secondaryProp
  if (primary != null && primary.type !== Typography && !disableTypography) {
    primary = (
      <Typography variant={dense ? 'body2' : 'body1'} component={primaryTypographyProps && primaryTypographyProps.variant ? undefined : 'span'} {...primaryTypographyProps} className={cn('MuiListItemText-primary', primaryTypographyProps && primaryTypographyProps.className)}>
        {primary}
      </Typography>
    )
  }
  if (secondary != null && secondary.type !== Typography && !disableTypography) {
    secondary = (
      <Typography variant="body2" {...secondaryTypographyProps} className={cn('MuiListItemText-secondary', secondaryTypographyProps && secondaryTypographyProps.className)}>
        {secondary}
      </Typography>
    )
  }
  return (
    <div ref={ref} className={cn('MuiListItemText-root', dense && 'MuiListItemText-dense', inset && 'MuiListItemText-inset', primary && secondary && 'MuiListItemText-multiline', className)} {...rest}>
      {primary}
      {secondary}
    </div>
  )
})

const ListItemAvatar = React.forwardRef(function ListItemAvatar({ className, ...rest }, ref) {
  return <div ref={ref} className={cn('MuiListItemAvatar-root', className)} {...rest} />
})

const ListItemIcon = React.forwardRef(function ListItemIcon({ className, ...rest }, ref) {
  return <div ref={ref} className={cn('MuiListItemIcon-root', className)} {...rest} />
})

export { List, ListItemButton, ListItemText, ListItemAvatar, ListItemIcon }
