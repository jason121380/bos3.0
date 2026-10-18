// 打卡類型切換保留 MUI ToggleButtonGroup（onChange(event, value) 簽名；橋接主題已套新外觀）
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
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
          <span className="text-display tabular-nums text-accent">
            {format(countDownTime, 'mm:ss')}
          </span>
        </div>
        {isLoading ? (
          <Skeleton className="mb-6 h-[250px] w-[250px]" aria-label="載入中" />
        ) : (
          <img src={url} alt="" className="mb-6 h-[250px] w-[250px]" />
        )}
        <ToggleButtonGroup
          size="small"
          exclusive
          disabled={isLoading}
          value={clockInType}
          onChange={(event, value) => value && setClockInType(value)}
          sx={{
            backgroundColor: 'rgb(var(--surface))',
            borderRadius: '24px',
            padding: '4px',
            border: 'none',
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              borderRadius: '20px !important',
              margin: '0 2px',
            },
          }}
        >
          {clockInOptions.map((data, idx) => (
            <ToggleButton
              key={`${data.label}-${idx}`}
              value={data.value}
              name={data.label}
              sx={{
                padding: '6px 20px',
                color: 'rgb(var(--text-secondary))',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                border: 'none !important',
                '&.Mui-selected': {
                  backgroundColor: 'rgb(var(--background)) !important',
                  color: 'rgb(var(--text)) !important',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                },
                '&:hover': {
                  backgroundColor: 'rgb(var(--surface-hover))',
                },
              }}
            >
              {data.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Card>
    </div>
  )
}
export default Results
