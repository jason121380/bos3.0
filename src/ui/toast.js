import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn, focusRing } from './utils'

// STYLE.md §6：右下角；成功 3 秒自動消失，錯誤需手動關閉
// 用法：在 App 放一個 <Toaster />，任何地方呼叫 toast.success('已儲存') / toast.error('標題', '說明')
const DURATION = { success: 3000, info: 3000, error: null }
const ICON = { success: CheckCircle2, info: Info, error: AlertCircle }
const ICON_COLOR = { success: 'text-success', info: 'text-text-secondary', error: 'text-danger' }

let listeners = []
let items = []
let seq = 0
const emit = () => listeners.forEach(l => l(items))

function dismiss(id) {
  items = items.filter(t => t.id !== id)
  emit()
}

function show(variant, title, description) {
  const id = ++seq
  items = [...items, { id, variant, title, description }]
  emit()
  if (DURATION[variant]) setTimeout(() => dismiss(id), DURATION[variant])
  return id
}

const toast = {
  success: (title, description) => show('success', title, description),
  error: (title, description) => show('error', title, description),
  info: (title, description) => show('info', title, description),
  dismiss,
}

function Toaster() {
  const [list, setList] = React.useState(items)
  React.useEffect(() => {
    listeners.push(setList)
    return () => {
      listeners = listeners.filter(l => l !== setList)
    }
  }, [])

  return (
    <div className="ui-root pointer-events-none fixed bottom-0 right-0 z-[1500] flex w-full max-w-[400px] flex-col gap-2 p-6 max-lg:pb-[calc(72px+env(safe-area-inset-bottom))] max-sm:px-4">
      {list.map(({ id, variant, title, description }) => {
        const Icon = ICON[variant]
        return (
          <div
            key={id}
            role={variant === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-solid border-border bg-background p-4 shadow-float animate-in fade-in-0 slide-in-from-bottom-2"
          >
            <Icon className={cn('mt-0.5 h-4 w-4', ICON_COLOR[variant])} strokeWidth={1.75} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-body font-medium text-text">{title}</p>
              {description && <p className="text-caption text-text-secondary">{description}</p>}
            </div>
            <button type="button" aria-label="關閉" onClick={() => dismiss(id)} className={cn('rounded-md p-0.5 text-text-tertiary hover:text-text', focusRing)}>
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export { toast, Toaster }
