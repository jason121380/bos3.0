import Page from 'components/Page'
import { startOfDay } from 'date-fns'
import { useFetchUserDecrease, useFetchUserIncrease } from 'hooks/useFetchUsers'
import idx from 'idx'
import produce from 'immer'
import React from 'react'

import { startOfMonth } from 'date-fns'
import DateSelector from 'components/DateSelector'
import AdminPageHeader from 'components/AdminPageHeader'

import DecreaseResult from './DecreaseResult'
import IncreaseResult from './IncreaseResult'

function CustomerManagementList() {
  const [setting, setSetting] = React.useState({
    date: startOfDay(new Date()).getTime(),
    userIncrease: {
      pageLimit: 20,
      pageOffset: 0,
      isStaff: false,
    },
    userDecrease: {
      pageLimit: 20,
      pageOffset: 0,
      isStaff: false,
    },
  })

  const userIncrease = useFetchUserIncrease({
    input: setting.userIncrease,
    date: setting.date,
  })
  const userDecrease = useFetchUserDecrease({
    input: setting.userDecrease,
    date: setting.date,
  })
  const handleOnChangePage = ({ key, page }) => {
    setSetting(
      produce(draft => {
        draft[key].pageOffset = page
      })
    )
  }
  const handleOnChangeRowsPerPage = ({ value, key }) => {
    setSetting(
      produce(draft => {
        draft[key].pageOffset = 0
        draft[key].pageLimit = value
      })
    )
  }
  const handleDateChange = date => {
    setSetting(
      produce(draft => {
        draft.date = date
      })
    )
  }
  return (
    <Page className="ui-root" title="薪資明細表">
      <div>
        <AdminPageHeader title="薪資明細表">
          <DateSelector
            date={{ startDate: setting.date }}
            attributes={['startDate']}
            dateChange={({ startDate }) => handleDateChange(startOfMonth(new Date(startDate)).getTime())}
            onlyStart
            inputFormat='yyyy/MM'
            pickerOption={{
              views: ['month', 'year']
            }}
          />
        </AdminPageHeader>
        {idx(
          userIncrease,
          _ =>
            _.data.users.users && (
              <IncreaseResult
                className="mt-[24px]"
                pageSetting={_.data.users}
                users={_.data.users.users}
                handleOnChangePage={(_event, page) =>
                  handleOnChangePage({ page, key: 'userIncrease' })
                }
                handleOnChangeRowsPerPage={event =>
                  handleOnChangeRowsPerPage({
                    value: idx(event, _ => _.target.value),
                    key: 'userIncrease',
                  })
                }
              />
            )
        )}
        {idx(
          userDecrease,
          _ =>
            _.data.users.users && (
              <DecreaseResult
                className="mt-[24px]"
                users={_.data.users.users}
                pageSetting={_.data.users}
                handleOnChangePage={(_event, page) =>
                  handleOnChangePage({ page, key: 'userDecrease' })
                }
                handleOnChangeRowsPerPage={event =>
                  handleOnChangeRowsPerPage({
                    value: idx(event, _ => _.target.value),
                    key: 'userDecrease',
                  })
                }
              />
            )
        )}
      </div>
    </Page>
  )
}

export default CustomerManagementList
