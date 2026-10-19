import React from 'react'
import { cn } from './utils'

// 原生 range 滑桿，取代 MUI Slider；保留 MUI 的 onChange(event, value) 簽名（第二參數為 Number）
// 原生 range 以 step 連續輸出時會產生浮點誤差（如 step=0.1 得到 1.200000047），
// 故依 step 的小數位數四捨五入修整後再回呼，避免裁切 zoom 等連動值抖動／存值漂移
// 深藍主色以 accent-[rgb(var(--primary))] 對齊 ui/checkbox、ui/radio；不做數值泡泡（valueLabelDisplay）——
// 行事曆兩檔的泡泡去留待 Jason 拍板，本元件先只服務無泡泡的裁切情境，傳入 valueLabelDisplay 會被忽略不透傳 DOM
const roundToStep = (rawValue, step) => {
  const num = Number(rawValue)
  if (!Number.isFinite(num)) return num
  if (step == null || step === 'any') return num
  const stepText = String(step)
  const decimals = stepText.includes('e-')
    ? Number(stepText.split('e-')[1]) || 0
    : (stepText.split('.')[1] || '').length
  return decimals > 0 ? Number(num.toFixed(decimals)) : Math.round(num)
}

const Slider = React.forwardRef(({ className, value, onChange, min = 0, max = 100, step = 1, disabled, valueLabelDisplay, ...props }, ref) => (
  <input
    type="range"
    ref={ref}
    className={cn(
      'ui-root h-5 min-w-0 flex-1 cursor-pointer accent-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-40',
      'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
      className
    )}
    value={value}
    min={min}
    max={max}
    step={step}
    disabled={disabled}
    onChange={e => onChange && onChange(e, roundToStep(e.target.value, step))}
    {...props}
  />
))
Slider.displayName = 'Slider'

export { Slider }
