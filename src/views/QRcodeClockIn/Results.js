// 打卡類型切換改 ui/toggle-group（onChange(event, value) 原樣、`value &&` 守衛不變；原 sx 選取外觀由 ui 預設樣式取代）
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Timer } from 'lucide-react'
import format from 'date-fns/format'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

const clockInOptions = [
  { label: '上班', value: 'CLOCKIN' },
  { label: '下班', value: 'CLOCKOUT' },
  { label: '休息開始', value: 'BREAKSTART' },
  { label: '休息結束', value: 'BREAKEND' },
]

function Results({ clockInType, setClockInType, isLoading, url, countDownTime }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card className="flex flex-col items-center px-6 py-8">
        <div className="mb-5 flex flex-col items-center rounded-lg bg-accent/8 px-6 py-3">
          <span className="mb-1 flex items-center gap-1 text-label text-text-secondary">
            <Timer className="h-4 w-4" strokeWidth={1.75} />
            有效時間
          </span>
          <span className="text-display tabular-nums text-accent">{format(countDownTime, 'mm:ss')}</span>
        </div>
        {isLoading ? (
          <Skeleton className="mb-6 h-[250px] w-[250px]" aria-label="載入中" />
        ) : (
          <img src={url} alt="" className="mb-6 h-[250px] w-[250px]" />
        )}
        <ToggleGroup size="small" exclusive disabled={isLoading} value={clockInType} onChange={(event, value) => value && setClockInType(value)}>
          {clockInOptions.map((data, idx) => (
            <ToggleGroupItem className="px-5" key={`${data.label}-${idx}`} value={data.value} name={data.label}>
              {data.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Card>
    </div>
  )
}
export default Results
