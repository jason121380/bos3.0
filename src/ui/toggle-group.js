import React, { createContext, useContext } from 'react'
import { cn, focusRing } from './utils'

// 分段切換（Segmented control），取代 MUI ToggleButtonGroup / ToggleButton
// 介面與 MUI 相容，替換時 handler 一字不改：
//   <ToggleGroup value exclusive onChange={(event, newValue) => …}>
//     <ToggleGroupItem value={任何型別}>…</ToggleGroupItem>
//   </ToggleGroup>
//   - exclusive：單選；再按一次已選項目時 newValue 為 null（與 MUI 相同）
//   - 非 exclusive：value 為陣列，newValue 為新增／移除後的新陣列
//   - 單獨使用 ToggleGroupItem：selected + onChange(event, value) / onClick（與 MUI ToggleButton 相同），外觀為篩選鈕（選取時主題色）
// 選取狀態：白底＋陰影（淺灰軌道上），文字 text；未選為 text-secondary

const GroupContext = createContext(null)

const sizes = { sm: 'h-7 px-2.5 text-label max-sm:min-h-10', md: 'h-8 px-3.5 text-label max-sm:min-h-10' }
// 也接受 MUI 的 size 名稱，替換時可原樣保留
const sizeKey = size => ({ small: 'sm', medium: 'md', large: 'md' })[size] || size

function ToggleGroup({ value, exclusive = false, onChange, disabled, size = 'md', fullWidth, className, children, ...props }) {
  const isSelected = v => (exclusive ? value === v : Array.isArray(value) && value.includes(v))
  const toggle = (event, v) => {
    if (!onChange) return
    if (exclusive) {
      onChange(event, value === v ? null : v)
    } else {
      const list = Array.isArray(value) ? value : []
      onChange(event, list.includes(v) ? list.filter(x => x !== v) : [...list, v])
    }
  }
  return (
    <GroupContext.Provider value={{ isSelected, toggle, disabled, size, fullWidth }}>
      <div
        role="group"
        className={cn(
          'ui-root inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-surface-hover p-0.5',
          fullWidth && 'flex w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </GroupContext.Provider>
  )
}

const ToggleGroupItem = React.forwardRef(({ value, selected, onChange, onClick, disabled, size, className, children, ...props }, ref) => {
  const group = useContext(GroupContext)
  const isOn = group ? group.isSelected(value) : !!selected
  const isDisabled = disabled || (group && group.disabled)
  const handleClick = event => {
    if (onClick) onClick(event, value)
    if (event.defaultPrevented) return
    if (group) group.toggle(event, value)
    else if (onChange) onChange(event, value)
  }
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={isOn}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        !group && 'ui-root', // 單獨使用時自帶 ui-root 基礎樣式
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-0 font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4',
        sizes[sizeKey(size || (group && group.size))] || sizes.md,
        group
          ? isOn
            ? 'bg-background text-text shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
            : 'bg-transparent text-text-secondary hover:text-text'
          : isOn
            ? 'bg-accent/8 text-accent hover:bg-accent/15'
            : 'bg-surface-hover text-text-secondary hover:bg-surface-active hover:text-text',
        group && group.fullWidth && 'flex-1',
        focusRing,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
