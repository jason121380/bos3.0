/** @jsxImportSource @emotion/react */
import { Container } from '@mui/material'
import Page from 'components/Page'
import { startOfDay } from 'date-fns'
import { useFetchUserDecrease, useFetchUserIncrease } from 'hooks/useFetchUsers'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import DecreaseResult from './DecreaseResult'
import Header from './Header'
import IncreaseResult from './IncreaseResult'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

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
    <Page css={styles.root} title="薪資明細表">
      <Container maxWidth={false}>
        <Header onDateChange={handleDateChange} />
        {idx(
          userIncrease,
          _ =>
            _.data.users.users && (
              <IncreaseResult
                className={styles.results}
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
                className={styles.results}
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
      </Container>
    </Page>
  )
}

export default CustomerManagementList
