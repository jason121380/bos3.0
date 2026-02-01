/** @jsxImportSource @emotion/react */
import DateSelector from 'components/DateSelector'
import PageTitle from 'components/PageTitle'
import { startOfMonth } from 'date-fns'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  calendar: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  }),
  calendarButton: css({
    backgroundColor: theme.palette.common.white,
  }),
  calendarTodayIcon: css({
    marginRight: theme.spacing(1),
  }),
}

function Header({ className, onDateChange, ...rest }) {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()).getTime())
  const handleCalendarAccept = date => {
    setStartDate(startOfMonth(new Date(date)).getTime())
    onDateChange(startOfMonth(new Date(date)).getTime())
  }

  return (
    <div {...rest} css={css([styles.root, className])}>
      <PageTitle title='薪資明細表' subTitle='Salary Detail' />
      <div style={{ margin: '12px 0px' }} >
        <DateSelector
          date={{ startDate: startDate }}
          attributes={['startDate']}
          dateChange={({ startDate }) => handleCalendarAccept(startDate)}
          onlyStart
          inputFormat='yyyy/MM'
          pickerOption={{
            views: ['month', 'year']
          }}
        />
      </div>
    </div>
  )
}

Header.propTypes = {
  className: PropTypes.object,
}

export default Header
