import { MobileDatePicker } from 'ui/date-picker'
import { CalendarDays } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui/select'
import { cn, focusRing } from 'ui/utils'
import cloneDeep from 'lodash/cloneDeep'
import {
  isBefore, startOfDay, endOfDay, subDays, addDays,
  startOfMonth, endOfMonth, addMonths, subMonths,
  startOfWeek, endOfWeek, addWeeks, subWeeks,
  format, isSameDay
} from 'date-fns'
import { useHistory, useLocation } from 'react-router'
import useQueryString from 'hooks/useQueryString'
import { useEffect } from 'react'
import PropTypes from 'prop-types'

const DateSelector = ({
  date, dateChange, disabled, attributes, margin, getQueryData = true,
  onlyStart, pickerOption, inputFormat, rangelimit, ...rest
}) => {
  const history = useHistory()
  const location = useLocation()
  const [getQueryString] = useQueryString()

  const isToday = (startDate, endDate) => {
    const tStart = startOfDay(new Date()).getTime()
    const tEnd = endOfDay(new Date()).getTime()
    return startDate === tStart && endDate === tEnd
  }

  const isYesterday = (startDate, endDate) => {
    const yStart = startOfDay(subDays(new Date(), 1)).getTime()
    const yEnd = endOfDay(subDays(new Date(), 1)).getTime()
    return startDate === yStart && endDate === yEnd
  }

  const isDbyesterday = (startDate, endDate) => {
    const dStart = startOfDay(subDays(new Date(), 2)).getTime()
    const dEnd = endOfDay(subDays(new Date(), 2)).getTime()
    return startDate === dStart && endDate === dEnd
  }

  const isTomorrow = (startDate, endDate) => {
    const tStart = startOfDay(addDays(new Date(), 1)).getTime()
    const tEnd = endOfDay(addDays(new Date(), 1)).getTime()
    return startDate === tStart && endDate === tEnd
  }

  const isDatomorrow = (startDate, endDate) => {
    const dStart = startOfDay(addDays(new Date(), 2)).getTime()
    const dEnd = endOfDay(addDays(new Date(), 2)).getTime()
    return startDate === dStart && endDate === dEnd
  }

  const isThisMonth = (startDate, endDate) => {
    const mStart = startOfMonth(new Date()).getTime()
    const mEnd = endOfMonth(new Date()).getTime()
    return startDate === mStart && endDate === mEnd
  }

  const isLastMonth = (startDate, endDate) => {
    const lStart = startOfMonth(subMonths(new Date(), 1)).getTime()
    const lEnd = endOfMonth(subMonths(new Date(), 1)).getTime()
    return startDate === lStart && endDate === lEnd
  }

  const isThisWeek = (startDate, endDate) => {
    return isSameDay(startDate, startOfWeek(new Date())) && isSameDay(endDate, endOfWeek(new Date()))
  }

  const isLastWeek = (startDate, endDate) => {
    return isSameDay(startDate, startOfWeek(subWeeks(new Date(), 1))) && isSameDay(endDate, endOfWeek(subWeeks(new Date(), 1)))
  }

  const isNextWeek = (startDate, endDate) => {
    return isSameDay(startDate, startOfWeek(addWeeks(new Date(), 1))) && isSameDay(endDate, endOfWeek(addWeeks(new Date(), 1)))
  }
  // 快速區間選項：保留原本的標題、日期函式與「是否為目前區間」判斷，改由下拉選單呈現
  const getButton = (title, func, isActive) => ({ title, func, isActive })

  const buttonObj = {
    lastmonth: () => getButton('上個月', lastmonth, isLastMonth(date.startDate, date.endDate)),
    thismonth: () => getButton('本月', thismonth, isThisMonth(date.startDate, date.endDate)),
    today: () => getButton('今天', today, isToday(date.startDate, date.endDate)),
    yesterday: () => getButton('昨天', yesterday, isYesterday(date.startDate, date.endDate)),
    dbyesterday: () => getButton('前天', dbyesterday, isDbyesterday(date.startDate, date.endDate)),
    nextmonth: () => getButton('下個月', nextmonth),
    tomorrow: () => getButton('明天', tomorrow, isTomorrow(date.startDate, date.endDate)),
    datomorrow: () => getButton('後天', datomorrow, isDatomorrow(date.startDate, date.endDate)),
    thisweek: () => getButton('本週', thisweek, isThisWeek(date.startDate, date.endDate)),
    nextweek: () => getButton('下週', nextweek, isNextWeek(date.startDate, date.endDate)),
    lastweek: () => getButton('上週', lastweek, isLastWeek(date.startDate, date.endDate)),
    startDate: () => <DatePicker key='起始時間' type={'起始時間'} />,
    endDate: () => <DatePicker key='結束時間' type={'結束時間'} />,
  }

  const DatePicker = ({ type }) => {
    const key = type === '起始時間'
    return (
      <MobileDatePicker
        {...pickerOption}
        value={date[key ? 'startDate' : 'endDate']}
        onChange={value => handleDateChange(new Date(value).getTime(), key ? 'startDate' : 'endDate')}
        localeText={{
          toolbarTitle: onlyStart ? '選擇日期' : type
        }}
        slots={{
          field: inputProps => (
            <button
              type="button"
              onClick={inputProps.onClick}
              disabled={disabled}
              aria-label={onlyStart ? '選擇日期' : type}
              className={cn('h-full rounded-md px-2 text-body tabular-nums text-text hover:bg-surface-hover disabled:text-text-tertiary', focusRing)}
            >
              {format(inputProps.value, inputFormat)}
            </button>
          )
        }}
        slotProps={{
          toolbar: {
            toolbarFormat: 'M月d日'
          },
        }}
      />
    )
  }

  const handleDateChange = (value, pickerType) => {
    const newValue = cloneDeep(date)
    newValue[pickerType] = value
    if (pickerType === 'endDate' && isBefore(newValue.endDate, newValue.startDate)) {
      newValue.startDate = newValue.endDate
    } else if (pickerType === 'startDate' && isBefore(newValue.endDate, newValue.startDate)) {
      newValue.endDate = newValue.startDate
    }
    if (onlyStart) {
      newValue.endDate = endOfDay(newValue.startDate).getTime()
    }
    pushDate(newValue)
    dateChange(newValue)
  }

  const pushDate = ({ startDate, endDate }) => {
    history.push(
      `${location.pathname}?startDate=${startDate}&endDate=${endDate}`
    )
  }

  const today = () => {
    const date = {
      startDate: startOfDay(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const yesterday = () => {
    const date = {
      startDate: startOfDay(subDays(new Date(), 1)).getTime(),
      endDate: endOfDay(subDays(new Date(), 1)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const dbyesterday = () => {
    const date = {
      startDate: startOfDay(subDays(new Date(), 2)).getTime(),
      endDate: endOfDay(subDays(new Date(), 2)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const tomorrow = () => {
    const date = {
      startDate: startOfDay(addDays(new Date(), 1)).getTime(),
      endDate: endOfDay(addDays(new Date(), 1)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const datomorrow = () => {
    const date = {
      startDate: startOfDay(addDays(new Date(), 2)).getTime(),
      endDate: endOfDay(addDays(new Date(), 2)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const nextmonth = () => {
    const date = {
      startDate: startOfMonth(addMonths(new Date(), 1)).getTime(),
      endDate: endOfMonth(addMonths(new Date(), 1)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const lastmonth = () => {
    const date = {
      startDate: startOfMonth(subMonths(new Date(), 1)).getTime(),
      endDate: endOfMonth(subMonths(new Date(), 1)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const thismonth = () => {
    const date = {
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfMonth(new Date()).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const thisweek = () => {
    const date = {
      startDate: startOfWeek(new Date()).getTime(),
      endDate: endOfWeek(new Date()).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const lastweek = () => {
    const date = {
      startDate: startOfWeek(subWeeks(new Date(), 1)).getTime(),
      endDate: endOfWeek(subWeeks(new Date(), 1)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }
  const nextweek = () => {
    const date = {
      startDate: startOfWeek(addWeeks(new Date(), 1)).getTime(),
      endDate: endOfWeek(addWeeks(new Date(), 1)).getTime(),
    }
    pushDate(date)
    dateChange(date)
  }

  useEffect(() => {
    if (!getQueryData) return
    const startDate = Number(getQueryString('startDate'))
    const endDate = Number(getQueryString('endDate'))
    const data = { startDate, endDate }
    if (rangelimit && rangelimit(data)) return
    if (startDate && endDate) {
      if (onlyStart) {
        data.endDate = endOfDay(data.startDate).getTime()
      }
      dateChange(data)
    }
  }, [])

  const quickKeys = attributes.filter(key => key !== 'startDate' && key !== 'endDate')
  const quickOptions = quickKeys.map(key => buttonObj[key]())
  const activeQuick = quickOptions.find(option => option.isActive)
  const hasStart = attributes.includes('startDate')
  const hasEnd = attributes.includes('endDate')

  // 精簡版（STYLE.md §6）：「快速選擇」下拉 ＋ 一個日期區間欄位
  return (
    <>
    <div id='DateSelector' className={cn('ui-root noprint inline-flex flex-wrap items-center gap-2', margin && 'my-6')}>
      {quickOptions.length > 0 && (
        <Select
          value={activeQuick ? activeQuick.title : ''}
          onValueChange={title => {
            const option = quickOptions.find(d => d.title === title)
            option && option.func()
          }}
          disabled={disabled}
        >
          <SelectTrigger aria-label="快速選擇日期區間" className={cn('w-auto min-w-[112px] gap-2', activeQuick && 'border-accent/40 text-accent')}>
            <SelectValue placeholder="快速選擇" />
          </SelectTrigger>
          <SelectContent className="min-w-[140px]">
            {quickOptions.map(option => (
              <SelectItem key={option.title} value={option.title}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hasStart && (
        <div className="flex h-9 max-sm:h-10 items-center gap-0.5 rounded-md border border-solid border-border-strong bg-background pl-2.5 pr-1 hover:border-border-strong-hover">
          <CalendarDays className="mr-1 h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
          {buttonObj.startDate()}
          {hasEnd && (
            <>
              <span className="text-text-tertiary">–</span>
              {buttonObj.endDate()}
            </>
          )}
        </div>
      )}
    </div>
    </>
  )
}

DateSelector.propTypes = {
  date: PropTypes.shape({
    startDate: PropTypes.number,
    endDate: PropTypes.number
  }).isRequired,
  dateChange: PropTypes.func,
  disabled: PropTypes.bool,
  attributes: PropTypes.arrayOf(PropTypes.oneOf([
    'lastmonth', 'thismonth', 'today', 'yesterday',
    'dbyesterday', 'nextmonth', 'tomorrow', 'datomorrow',
    'thisweek', 'nextweek', 'lastweek', 'startDate', 'endDate'
  ])),
  margin: PropTypes.bool,
  onlyStart: PropTypes.bool,
  pickerOption: PropTypes.object,
  inputFormat: PropTypes.string,
  rest: PropTypes.any,
  rangelimit: PropTypes.func,
}

DateSelector.defaultProps = {
  dateChange: () => { },
  disabled: false,
  attributes: [],
  margin: false,
  onlyStart: false,
  pickerOption: {},
  inputFormat: 'yyyy/MM/dd',
  rest: {},
  rangelimit: () => false
}

export default DateSelector