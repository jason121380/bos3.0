import { Plus } from 'lucide-react'
import { Button } from 'ui/button'
import { cn, focusRing } from 'ui/utils'

// 項目列（服務、店販、預收卡、會員卡、使用預收卡）共用的操作鈕。
// 原本是沒有文字的裸圖示（點了才知道做什麼），現在都是真的 <button>：
// 滑過顯示 title、讀屏有 aria-label、可 Tab 聚焦並用 Enter／空白鍵觸發。onClick、data-testid 由呼叫端原樣傳入。
// 觸控目標（STYLE §9 ≥40px）：外觀維持 32px，手機寬度以透明 ::after 向外各延伸 4px，命中區 40px、不改版面
export const RowIconButton = ({ label, className, children, ...props }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={cn(
      'ui-root relative mb-0.5 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text [&_svg]:size-[18px]',
      "max-sm:after:absolute max-sm:after:-inset-1 max-sm:after:content-['']",
      focusRing,
      className
    )}
    {...props}
  >
    {children}
  </button>
)

// 「+」改成看得懂的文字鈕：新增一列（手機高 40px 觸控目標，桌機維持 sm 32px）
export const AddRowButton = ({ children = '新增項目', className, ...props }) => (
  <Button variant="ghost" size="sm" className={cn('ui-root mb-3 text-accent hover:text-accent max-sm:h-10', className)} {...props}>
    <Plus aria-hidden="true" strokeWidth={1.75} />
    {children}
  </Button>
)
