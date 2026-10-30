import React from 'react'
import { cn } from './utils'

// 原生 range 滑桿，取代 MUI Slider；保留 MUI 的 onChange(event, value) 簽名（第二參數為 Number）
// 原生 range 以 step 連續輸出時會產生浮點誤差（如 step=0.1 得到 1.200000047），
// 故依 step 的小數位數四捨五入修整後再回呼，避免裁切 zoom 等連動值抖動／存值漂移
// 深藍主色以 accent-[rgb(var(--primary))] 對齊 ui/checkbox、ui/radio
// valueLabelDisplay（同 MUI）：'auto' 在滑過／聚焦／拖曳時於拇指上方顯示數值泡泡，'on' 常駐；未傳則維持單純的 input（不多包一層）
// 泡泡外觀保留 MUI 原樣（灰底白字、下方小箭頭），Jason 2026/10/20 拍版「行事曆拉桿數值泡泡自己做、保留原樣」
const roundToStep = (rawValue, step) => {
  const num = Number(rawValue)
  if (!Number.isFinite(num)) return num
  if (step == null || step === 'any') return num
  const stepText = String(step)
  const decimals = stepText.includes('e-') ? Number(stepText.split('e-')[1]) || 0 : (stepText.split('.')[1] || '').length
  return decimals > 0 ? Number(num.toFixed(decimals)) : Math.round(num)
}

const THUMB = 16 // Chromium 原生 range 拇指寬度（px），泡泡位置以此校正

const Slider = React.forwardRef(({ className, value, onChange, min = 0, max = 100, step = 1, disabled, valueLabelDisplay, style, ...props }, ref) => {
  const [active, setActive] = React.useState({ hover: false, focus: false, drag: false })
  const input = (
    <input
      type="range"
      ref={ref}
      className={cn(
        'ui-root h-5 min-w-0 flex-1 cursor-pointer accent-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40',
        'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        className
      )}
      style={valueLabelDisplay ? undefined : style}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={e => onChange && onChange(e, roundToStep(e.target.value, step))}
      {...props}
    />
  )
  if (valueLabelDisplay !== 'auto' && valueLabelDisplay !== 'on') return input
  const pct = max > min ? (Number(value) - min) / (max - min) : 0
  const visible = valueLabelDisplay === 'on' || active.hover || active.focus || active.drag
  const set = patch => setActive(prev => ({ ...prev, ...patch }))
  return (
    <span
      className="ui-root relative inline-flex min-w-0 items-center"
      style={style}
      onMouseEnter={() => set({ hover: true })}
      onMouseLeave={() => set({ hover: false })}
      onFocus={() => set({ focus: true })}
      onBlur={() => set({ focus: false })}
      onPointerDown={() => set({ drag: true })}
      onPointerUp={() => set({ drag: false })}
    >
      {React.cloneElement(input, { className: cn(input.props.className, 'w-full') })}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm bg-[#757575] px-3 py-1 text-[14px] font-medium leading-5 text-white transition-[opacity,transform] duration-150',
          "after:absolute after:left-1/2 after:top-full after:-mt-1 after:h-2 after:w-2 after:-translate-x-1/2 after:rotate-45 after:bg-[#757575] after:content-['']",
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        )}
        style={{ left: `calc(${pct * 100}% + ${THUMB / 2 - pct * THUMB}px)` }}
      >
        {value}
      </span>
    </span>
  )
})
Slider.displayName = 'Slider'

export { Slider }
