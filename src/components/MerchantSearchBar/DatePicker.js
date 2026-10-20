import { MobileDatePicker } from 'ui/date-picker'
import { endOfDay, startOfDay, startOfMonth, endOfMonth, format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { inputClass } from 'ui/input'
import { cn } from 'ui/utils'
import { Button as UiButton } from 'ui/button'


// 日期欄：外觀比照 ui Input 的原生 button；onClick 與顯示文字與舊版 Button 相同
function UiDateField({ onClick, value, format: valueFormat }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'ui-root inline-flex w-[140px] cursor-pointer items-center justify-between gap-2 text-left',
        inputClass
      )}
    >
      <span>{format(value, valueFormat)}</span>
      <CalendarDays className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
    </button>
  )
}

export default function DatePicker({
  jumpToToday,
  jumpToYesterday,
  jumpToBeforeYesterday,
  jumpToLastMonth,
  jumpToWholeMonth,
  jumpToTomorrow,
  jumpAfterToTomorrow,
  date,
  onChange,
  hideEndDate,
  hideStartDate,
  onlyMonthYear,
  displayMonth,
  inMerchantDailyReport,
  lastInLeaderBoard,
  onlyDayTime,
  futureDate,
  // 舊參數：新樣式已全面啟用，保留參數讓既有呼叫端不必改
  uiDateField: _uiDateField,
}) {

  const { startDate, endDate } = date

  const handleCalendarAccept = (date, edge) => {
    date = new Date(date).getTime()
    if (edge === 'start') {
      if (onlyMonthYear) {
        onChange({
          target: 'startDate',
          value: startOfMonth(date).getTime(),
        })
        onChange({
          target: 'endDate',
          value: endOfMonth(date).getTime(),
        })
      } else {
        onChange({
          target: 'startDate',
          value: startOfDay(date).getTime(),
        })

        if (date > endDate) {
          onChange({
            target: 'endDate',
            value: endOfDay(date).getTime(),
          })
        }
      }
    } else {
      onChange({
        target: 'endDate',
        value: endOfDay(date).getTime(),
      })

      if (date < startDate) {
        onChange({
          target: 'startDate',
          value: startOfDay(date).getTime(),
        })
      }
    }
    if (inMerchantDailyReport && onlyDayTime && edge === 'end') {
      onChange({
        target: 'startDate',
        value: startOfDay(date).getTime(),
      })
      onChange({
        target: 'endDate',
        value: endOfDay(date).getTime(),
      })
    }
  }

  const handleJumpToday = () => {
    jumpToToday()
  }
  const handleJumpYesterday = () => {
    jumpToYesterday()
  }
  const handleJumpBeforeYesterday = () => {
    jumpToBeforeYesterday()
  }
  const handleJumpLastMonth = () => {
    jumpToLastMonth()
  }
  const handleJumpWholeMonth = () => {
    jumpToWholeMonth()
  }
  const handleJumpToTomorrow = () => {
    jumpToTomorrow()
  }
  const handleJumpAfterToTomorrow = () => {
    jumpAfterToTomorrow()
  }
  return (
    <div className='DatePicker my-6 box-border flex flex-wrap items-center'>
      {/* 報表統一（STYLE §14）：快捷鈕一律 ui 次要小按鈕、日期欄一律 ui 欄位；原藍色 ButtonGroup 已全面停用 */}
      {displayMonth ? (
        <div>
          <div className="ui-root flex items-center gap-2">
            <UiButton variant="secondary" size="sm" onClick={handleJumpLastMonth}>
              上個月
            </UiButton>
            <UiButton variant="secondary" size="sm" onClick={handleJumpWholeMonth}>
              本月
            </UiButton>
          </div>
        </div>
      ) : (
        <div>
          <div className="ui-root flex items-center gap-2">
            {(!inMerchantDailyReport || !onlyDayTime) && (
              <UiButton variant="secondary" size="sm" onClick={handleJumpWholeMonth}>
                本月
              </UiButton>
            )}
            {lastInLeaderBoard && (
              <UiButton variant="secondary" size="sm" onClick={handleJumpLastMonth}>
                上個月
              </UiButton>
            )}
            {!futureDate &&
              <UiButton variant="secondary" size="sm" onClick={handleJumpBeforeYesterday}>
                前天
              </UiButton>
            }
            {!futureDate &&
              <UiButton variant="secondary" size="sm" onClick={handleJumpYesterday}>
                昨天
              </UiButton>
            }
            <UiButton variant="secondary" size="sm" onClick={handleJumpToday}>
              今天
            </UiButton>
            {futureDate &&
              <UiButton variant="secondary" size="sm" onClick={handleJumpToTomorrow}>
                明天
              </UiButton>
            }
            {futureDate &&
              <UiButton variant="secondary" size="sm" onClick={handleJumpAfterToTomorrow}>
                後天
              </UiButton>
            }
          </div>
        </div>
      )}
      <div>
        {/* 不傳 label 給 facade：facade 有 label 會以 Field 在欄位上方渲染標籤，塞進 flex 會擠成兩層重疊；彈層標題仍由 localeText.toolbarTitle='選擇日期' 提供 */}
        <div className="ui-root flex items-center gap-2">
          {!hideStartDate && (
            <MobileDatePicker
              closeOnSelect
              value={startDate}
              onChange={date => handleCalendarAccept(date, 'start')}
              format={onlyMonthYear ? 'yyyy/MM' : 'yyyy/MM/dd'}
              localeText={{
                toolbarTitle: '選擇日期'
              }}
              slots={{
                field: UiDateField
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                },
              }}
            />
          )}
          {!hideEndDate && (
            <MobileDatePicker
              closeOnSelect
              value={endDate}
              onChange={date => handleCalendarAccept(date, 'end')}
              format='yyyy/MM/dd'
              localeText={{
                toolbarTitle: '選擇日期'
              }}
              slots={{
                field: UiDateField
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
