import { Button } from 'ui/button'
import { EmptyState } from 'ui/empty-state'

// 查詢失敗時的空狀態。盤點作業與切換店家同一套：不要停在骨架或轉圈。
function QueryFailed({ title = '無法載入資料', description = '請再試一次。列表不會一直停在載入中。', onRetry, retryLabel = '重新查詢' }) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null
      }
    />
  )
}

export default QueryFailed
