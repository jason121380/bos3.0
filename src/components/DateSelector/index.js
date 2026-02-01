/** @jsxImportSource @emotion/react */
import { Button, ButtonGroup } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { cloneDeep } from 'lodash'
import {
  isBefore, startOfDay, endOfDay, subDays, addDays,
  startOfMonth, endOfMonth, addMonths, subMonths,
  startOfWeek, endOfWeek, addWeeks, subWeeks,
  format
} from 'date-fns'
import { useHistory, useLocation } from 'react-router'
import useQueryString from 'hooks/useQueryString'
import { useEffect } from 'react'
import PropTypes from 'prop-types'

const index = ({
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
  const getButton = (title, func, isActive) => (
    <Button
      variant="text"
      onClick={func}
      key={title}
      disabled={disabled}
      css={{
        wordBreak: 'keep-all',
        height: '32px',
        minWidth: '70px',
        padding: '0 16px',
        borderRadius: '16px',
        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
        color: '#000000 !important',
        fontWeight: 'bold',
        fontSize: '13px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
        border: 'none',
        margin: '0 2px',
      }}
    >
      {title}
    </Button>
  )

  const buttonObj = {
    lastmonth: () => getButton('上個月', lastmonth, isLastMonth(date.startDate, date.endDate)),
    thismonth: () => getButton('本月', thismonth, isThisMonth(date.startDate, date.endDate)),
    today: () => getButton('今天', today, isToday(date.startDate, date.endDate)),
    yesterday: () => getButton('昨天', yesterday, isYesterday(date.startDate, date.endDate)),
    dbyesterday: () => getButton('前天', dbyesterday, isDbyesterday(date.startDate, date.endDate)),
    nextmonth: () => getButton('下個月', nextmonth),
    tomorrow: () => getButton('明天', tomorrow),
    datomorrow: () => getButton('後天', datomorrow),
    thisweek: () => getButton('本週', thisweek),
    nextweek: () => getButton('下週', nextweek),
    lastweek: () => getButton('上週', lastweek),
    startDate: () => <DatePicker key='起始時間' type={'起始時間'} />,
    endDate: () => <DatePicker key='結束時間' type={'結束時間'} />,
  }

  const DatePicker = ({ type }) => {
    const key = type === '起始時間'
    return (
      <MobileDatePicker
        {...pickerOption}
        label={onlyStart ? '選擇日期' : type}
        value={date[key ? 'startDate' : 'endDate']}
        onChange={value => handleDateChange(new Date(value).getTime(), key ? 'startDate' : 'endDate')}
        localeText={{
          toolbarTitle: onlyStart ? '選擇日期' : type
        }}
        slots={{
          field: inputProps => (
            <Button
              variant='text'
              onClick={inputProps.onClick}
              disabled={disabled}
              css={{
                wordBreak: 'keep-all',
                height: '34px',
                padding: '0 12px',
                borderRadius: '17px',
                color: '#000000 !important',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              {format(inputProps.value, inputFormat)}
            </Button>
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

  return (
    <div
      id='DateSelector'
      className='noprint'
      style={{
        display: 'inline-flex',
        flexWrap: 'nowrap',
        gap: '4px',
        height: '42px',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: '0 4px',
        borderRadius: '21px',
        margin: margin ? '24px 0px 24px 0' : ''
      }}
    >
      {attributes.map((item, index) => {
        if (item === 'startDate' && attributes[index + 1] === 'endDate') {
          return (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {buttonObj[item]()}
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>至</span>
            </div>
          )
        }
        return buttonObj[item]()
      })}
    </div>
  )
}

index.propTypes = {
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

index.defaultProps = {
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

export default index