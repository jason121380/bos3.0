/** @jsxImportSource @emotion/react */
import { Grid } from '@mui/material'
import { endOfDay, startOfDay, addDays, startOfMonth, endOfMonth } from 'date-fns'
import useQueryString from 'hooks/useQueryString'
import produce from 'immer'
import PropTypes from 'prop-types'
import React from 'react'
import { withMuiScope } from 'ui/mui-theme'
import { useHistory, useLocation } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import DatePicker from './DatePicker'
import Requirement from './Requirement'
import Search from './Search'

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }),
  search: css({
    flexGrow: 1,
    maxWidth: 480,
    flexBasis: 480,
  }),
  field: css({
    width: '150px',
    marginLeft: theme.spacing(2),
  }),
  filterButton: css({
    marginLeft: 'auto',
  }),
  filterIcon: css({
    marginRight: theme.spacing(1),
  }),
  birth: css({
    marginRight: theme.spacing(2),
  }),
}
function MerchantSearchBar({
  onFilter,
  onSearch,
  values,
  initFirst = [],
  outside,
  visible = [],
  multiple = [],
  searchByBirth = false,
  hideEndDate = false,
  hideStartDate = false,
  onlyMonthYear = false,
  relationUserId = false,
  displayMonth = false,
  useInDecreaseDetailReport = false,
  inMerchantDailyReport = false,
  onlyDayTime = false,
  lastInLeaderBoard = false,
  getThirdPartyName = false,
  futureDate = false,
  stopGetQueryString = false,
  uiDateField = false
}) {
  const [setting, setSetting] = React.useState(values)

  const [getQueryString] = useQueryString()

  const location = useLocation()
  const history = useHistory()

  React.useEffect(() => {
    setSetting(values)
  }, [values])

  const useOnFilterRef = React.useRef(onFilter)

  React.useEffect(() => {
    useOnFilterRef.current(setting)
  }, [setting])

  const handleChange = ({ target, value }) => {
    setSetting(
      produce(draft => {
        draft[target] = value
      })
    )

    const date = {
      startDate: Number(getQueryString('startDate') || setting.startDate),
      endDate: Number(getQueryString('endDate') || setting.endDate),
    }
    date[target] = value

    if ((setting.startDate || setting.endDate) && onlyDayTime) {
      history.push(
        `${location.pathname}?startDate=${startOfDay(date.endDate).getTime()}&endDate=${endOfDay(
          date.endDate
        ).getTime()}`
      )
    } else if (setting.startDate || setting.endDate && onlyMonthYear) {
      history.push(
        `${location.pathname}?startDate=${startOfMonth(date.endDate).getTime()}&endDate=${endOfMonth(
          date.endDate
        ).getTime()}`
      )
    } else if (setting.startDate || setting.endDate) {
      history.push(
        `${location.pathname}?startDate=${startOfDay(date.startDate).getTime()}&endDate=${endOfDay(
          date.endDate
        ).getTime()}`
      )
    }
  }

  const handleJumpToToday = () => {
    if (inMerchantDailyReport) {
      const currentDate = {
        startDate: startOfMonth(new Date()).getTime(),
        endDate: endOfDay(new Date()).getTime(),
      }
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
    } else {
      const currentDate = {
        startDate: startOfDay(new Date()).getTime(),
        endDate: endOfDay(new Date()).getTime(),
      }
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
    }
    if (onlyDayTime) {
      const currentDate = {
        startDate: startOfDay(new Date()).getTime(),
        endDate: endOfDay(new Date()).getTime(),
      }
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
    }
  }
  const handleJumpToYesterday = () => {
    if (inMerchantDailyReport) {
      const currentDate = {
        startDate: startOfMonth(new Date()).getTime(),
        endDate: endOfDay(addDays(new Date(), -1)).getTime(),
      }

      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
    } else {
      const currentDate = {
        startDate: startOfDay(addDays(new Date(), -1)).getTime(),
        endDate: endOfDay(addDays(new Date(), -1)).getTime(),
      }
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )

      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
    }
    if (onlyDayTime) {
      const currentDate = {
        startDate: startOfDay(addDays(new Date(), -1)).getTime(),
        endDate: endOfDay(addDays(new Date(), -1)).getTime(),
      }

      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
    }
  }
  const handleJumpToTomorrow = () => {
    const currentDate = {
      startDate: startOfDay(addDays(new Date(), 1)).getTime(),
      endDate: endOfDay(addDays(new Date(), 1)).getTime(),
    }
    history.push(
      `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
    )
    setSetting(
      produce(draft => {
        draft.startDate = currentDate.startDate
        draft.endDate = currentDate.endDate
      })
    )
  }
  const handleJumpAfterToTomorrow = () => {
    const currentDate = {
      startDate: startOfDay(addDays(new Date(), 2)).getTime(),
      endDate: endOfDay(addDays(new Date(), 2)).getTime(),
    }
    history.push(
      `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
    )
    setSetting(
      produce(draft => {
        draft.startDate = currentDate.startDate
        draft.endDate = currentDate.endDate
      })
    )
  }
  const handleJumpToBeforeYesterday = () => {
    if (inMerchantDailyReport) {
      const currentDate = {
        startDate: startOfMonth(new Date()).getTime(),
        endDate: endOfDay(addDays(new Date(), -2)).getTime(),
      }
      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
    } else {
      const currentDate = {
        startDate: startOfDay(addDays(new Date(), -2)).getTime(),
        endDate: endOfDay(addDays(new Date(), -2)).getTime(),
      }
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
    }
    if (onlyDayTime) {
      const currentDate = {
        startDate: startOfDay(addDays(new Date(), -2)).getTime(),
        endDate: endOfDay(addDays(new Date(), -2)).getTime(),
      }
      setSetting(
        produce(draft => {
          draft.startDate = currentDate.startDate
          draft.endDate = currentDate.endDate
        })
      )
      history.push(
        `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
      )
    }
  }
  const handleJumpToLastMonth = () => {
    // const currentDate = {
    //   startDate: startOfMonth(
    //     //只跑到系統紀錄月份的上個月
    //     // addDays(
    //     //   new Date(setting.startDate),
    //     //   new Date(setting.startDate).getMonth() === 2 ? -28 : -30
    //     // )
    //     //只跑到當時的月份的上個月
    //     addDays(new Date(), new Date().getMonth() === 2 ? -28 : -30)
    //   ).getTime(),
    //   endDate: endOfMonth(
    //     //只跑到系統紀錄月份的上個月
    //     // addDays(new Date(setting.endDate), new Date(setting.endDate).getDate() === 28 ? -28 : -31)
    //     //只跑到當時的月份的上個月
    //     addDays(new Date(), new Date().getMonth() === 2 ? -28 : -31)
    //   ).getTime(),
    // }
    // let month = 0
    // switch (new Date().getMonth()) {
    //   case 1 || 3 || 5 || 7 || 8 || 10 || 12:
    //     month = 31
    //     break
    //   case 2:
    //     month = 28
    //     break
    //   case 4 || 6 || 9 || 11:
    //     month = 30
    //     break
    //   default:
    //     break
    // }

    const currentDate = {
      startDate: startOfMonth(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      ).getTime(),
      endDate: endOfMonth(
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      ).getTime(),
    }
    setSetting(
      produce(draft => {
        draft.startDate = currentDate.startDate
        draft.endDate = currentDate.endDate
      })
    )
    history.push(
      `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
    )
  }

  const handleJumpToWholeMonth = () => {
    const currentDate = {
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfMonth(new Date()).getTime(),
    }
    setSetting(
      produce(draft => {
        draft.startDate = currentDate.startDate
        draft.endDate = currentDate.endDate
      })
    )
    history.push(
      `${location.pathname}?startDate=${currentDate.startDate}&endDate=${currentDate.endDate}`
    )
  }

  const useHandleChangeRef = React.useRef(handleChange)

  const useGetQueryStringRef = React.useRef(getQueryString)

  React.useEffect(() => {
    if (stopGetQueryString) return
    const startDateFromQuery = useGetQueryStringRef.current('startDate')
    const endDateFromQuery = useGetQueryStringRef.current('endDate')
    if (startDateFromQuery && endDateFromQuery) {
      const defaultDate = {
        startDate: Number(startDateFromQuery),
        endDate: Number(endDateFromQuery),
      }
      Object.keys(defaultDate).forEach(key => {
        useHandleChangeRef.current({ target: key, value: defaultDate[key] })
      })
    }
  }, [])

  const initial = initFirst.reduce((total, item) => ({ ...total, [item]: true }), {})
  multiple = multiple.reduce((total, item) => ({ ...total, [item]: true }), {})
  return (
    <Grid container css={styles.container} className='MerchantSearchBar'>
      {searchByBirth && <div css={styles.birth}>生日/偏好設計師搜尋</div>}
      {onSearch && (
        <Grid item>
          <Search className={styles.search} onSearch={onSearch} />
        </Grid>
      )}
      {visible.indexOf('datePicker') !== -1 && (
        <Grid item>
          <DatePicker
            onChange={handleChange}
            jumpToToday={handleJumpToToday}
            jumpToYesterday={handleJumpToYesterday}
            jumpToBeforeYesterday={handleJumpToBeforeYesterday}
            jumpToLastMonth={handleJumpToLastMonth}
            jumpToWholeMonth={handleJumpToWholeMonth}
            jumpToTomorrow={handleJumpToTomorrow}
            jumpAfterToTomorrow={handleJumpAfterToTomorrow}
            date={setting}
            hideEndDate={hideEndDate}
            hideStartDate={hideStartDate}
            onlyMonthYear={onlyMonthYear}
            displayMonth={displayMonth}
            onlyDayTime={onlyDayTime}
            inMerchantDailyReport={inMerchantDailyReport}
            lastInLeaderBoard={lastInLeaderBoard}
            futureDate={futureDate}
            uiDateField={uiDateField}
          />
        </Grid>
      )}

      <Requirement
        values={setting}
        initial={initial}
        multiple={multiple}
        visible={visible}
        onChange={handleChange}
        outside={outside}
        relationUserId={relationUserId}
        useInDecreaseDetailReport={useInDecreaseDetailReport}
        getThirdPartyName={getThirdPartyName}
      />
    </Grid>
  )
}

MerchantSearchBar.propTypes = {
  onFilter: PropTypes.func,
  onSearch: PropTypes.func,
}

// 外觀套用新版橋接主題（篩選欄位 36px、控制項邊框），邏輯不變
export default withMuiScope(MerchantSearchBar)
