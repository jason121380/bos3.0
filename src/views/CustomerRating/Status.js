import { CircleAlert as Error, CircleCheck as Check } from 'lucide-react'

const Status = ({ open = false, isComment }) => {
  const handleDisplayMessage = () => {
    switch (isComment) {
      case 'isCommented':
        return (
          <>
            <Check className="h-24 w-24 text-success" strokeWidth={1.5} />
            <p className="text-heading text-text">本次服務已完成評論，可關閉本視窗。</p>
          </>
        )
      case 'complete':
        return (
          <>
            <Check className="h-24 w-24 text-success" strokeWidth={1.5} />
            <p className="text-heading text-text">感謝您的評論，可關閉本視窗。</p>
          </>
        )
      case 'error':
        return (
          <>
            <Error className="h-24 w-24 text-danger" strokeWidth={1.5} />
            <p className="text-heading text-text">連結有誤</p>
          </>
        )
      case null:
        return null
      default:
        // 其他值不處理（與原本沒有 default 時相同）
        break
    }
  }
  return (
    <>{open && <div className="ui-root flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">{handleDisplayMessage()}</div>}</>
  )
}

export default Status
