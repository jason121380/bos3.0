import { Plus } from 'lucide-react'
import { Button } from 'ui/button'
import { cn, focusRing } from 'ui/utils'

// 項目列（服務、店販、預收卡、會員卡、使用預收卡）共用的操作鈕。
// 原本是沒有文字的裸圖示（點了才知道做什麼），現在都是真的 <button>：
// 滑過顯示 title、讀屏有 aria-label、可 Tab 聚焦並用 Enter／空白鍵觸發。onClick、data-testid 由呼叫端原樣傳入。
// 觸控目標（STYLE §9 ≥40px）：外層排版槽維持 32px（列對齊與 mx 不位移），按鈕本體 40×40 置中溢出，圖示維持 18px。
export const RowIconButton = ({ label, className, children, ...props }) => (
  <span className={cn('relative mb-0.5 inline-flex h-8 w-8 shrink-0 text-text-secondary [&_svg]:size-[18px]', className)}>
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'ui-root absolute left-1/2 top-1/2 inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-inherit transition-colors hover:bg-surface-hover hover:text-text',
        focusRing
      )}
      {...props}
    >
      {children}
    </button>
  </span>
)

// 「+」改成看得懂的文字鈕：新增一列（手機高 40px 觸控目標，桌機維持 sm 32px）
export const AddRowButton = ({ children = '新增項目', className, ...props }) => (
  <Button variant="ghost" size="sm" className={cn('ui-root mb-3 text-accent hover:text-accent max-sm:h-10', className)} {...props}>
    <Plus aria-hidden="true" strokeWidth={1.75} />
    {children}
  </Button>
)
