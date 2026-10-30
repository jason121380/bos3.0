import React from 'react'
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from 'lucide-react'
import { cn, focusRing } from './utils'

// STYLE.md §6：右下角；成功／一般提示 3 秒自動消失，錯誤需手動關閉
// 用法：在 App 放一個 <Toaster />，任何地方呼叫 toast.success('已儲存') / toast.error('標題', '說明')
// 全站唯一的提示區：各版面（layouts/*）透過 elements/snackbars 掛一個 <Toaster>，openSnackbar 的訊息也畫在這裡（ToastCard 共用外觀）
const DURATION = { success: 3000, info: 3000, warning: 3000, error: null }
const ICON = { success: CheckCircle2, info: Info, warning: TriangleAlert, error: AlertCircle }
const ICON_COLOR = { success: 'text-success', info: 'text-text-secondary', warning: 'text-warning', error: 'text-danger' }

let listeners = []
let items = []
let seq = 0
const timers = new Map()
const holds = new Map()
const emit = () => listeners.forEach(l => l(items))

function clearTimer(id) {
  const handle = timers.get(id)
  if (handle) clearTimeout(handle)
  timers.delete(id)
}

function scheduleDismiss(id, ms) {
  clearTimer(id)
  if (!ms) return
  timers.set(
    id,
    setTimeout(() => dismiss(id), ms)
  )
}

function dismiss(id) {
  clearTimer(id)
  holds.delete(id)
  const next = items.filter(t => t.id !== id)
  if (next.length === items.length) return
  items = next
  emit()
}

function show(variant, title, description) {
  const id = ++seq
  const duration = DURATION[variant]
  items = [...items, { id, variant, title, description, duration }]
  emit()
  scheduleDismiss(id, duration)
  return id
}

// 滑鼠移入或聚焦時暫停；移出且不再聚焦後以一半時間重新計時（與 elements/snackbars 的 openSnackbar 相同）
function holdToast(id) {
  const item = items.find(t => t.id === id)
  if (!item || !item.duration) return
  holds.set(id, (holds.get(id) || 0) + 1)
  clearTimer(id)
}

function releaseToast(id) {
  const item = items.find(t => t.id === id)
  if (!item || !item.duration) return
  const current = holds.get(id) || 0
  if (current <= 1) {
    holds.delete(id)
    scheduleDismiss(id, item.duration / 2)
    return
  }
  holds.set(id, current - 1)
}

const toast = {
  success: (title, description) => show('success', title, description),
  error: (title, description) => show('error', title, description),
  info: (title, description) => show('info', title, description),
  warning: (title, description) => show('warning', title, description),
  dismiss,
}

// 單則提示的外觀（Toaster 的佇列與 openSnackbar 的訊息共用）：錯誤 role=alert（立即播報），其餘 role=status＋aria-live=polite
// trailing：取代關閉鈕的位置（例如結帳進度圈）；onClose 不給就不畫關閉鈕
const ToastCard = React.forwardRef(({ variant = 'info', title, description, onClose, trailing, className, children, ...props }, ref) => {
  const Icon = ICON[variant] || Info
  const isError = variant === 'error'
  return (
    <div
      ref={ref}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-solid border-border bg-background p-4 shadow-float animate-in fade-in-0 slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', ICON_COLOR[variant])} strokeWidth={1.75} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="break-words text-body font-medium text-text">{title}</p>
        {description && <p className="break-words text-caption text-text-secondary">{description}</p>}
        {children}
      </div>
      {trailing}
      {onClose && (
        <button
          type="button"
          aria-label="關閉"
          title="關閉"
          onClick={onClose}
          // 視覺 20px；以透明偽元素把命中區擴到 40px（STYLE §9 觸控目標）
          className={cn(
            "relative shrink-0 rounded-md p-0.5 text-text-tertiary before:absolute before:-inset-2.5 before:content-[''] hover:text-text",
            focusRing
          )}
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
})
ToastCard.displayName = 'ToastCard'

// 提示區：固定右下角（手機讓出底部分頁列）；children 畫在佇列之前（elements/snackbars 的單一訊息槽）
function Toaster({ children }) {
  const [list, setList] = React.useState(items)
  React.useEffect(() => {
    listeners.push(setList)
    return () => {
      listeners = listeners.filter(l => l !== setList)
    }
  }, [])

  return (
    <div className="ui-root pointer-events-none fixed bottom-0 right-0 z-[1500] flex w-full max-w-[400px] flex-col gap-2 p-6 max-lg:pb-[calc(72px+env(safe-area-inset-bottom))] max-sm:px-4 print:hidden">
      {children}
      {list.map(({ id, variant, title, description }) => (
        <ToastCard
          key={id}
          variant={variant}
          title={title}
          description={description}
          onClose={() => dismiss(id)}
          onMouseEnter={() => holdToast(id)}
          onMouseLeave={() => releaseToast(id)}
          onFocus={() => holdToast(id)}
          onBlur={() => releaseToast(id)}
        />
      ))}
    </div>
  )
}

export { toast, Toaster, ToastCard }
