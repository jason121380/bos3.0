/** @jsxImportSource @emotion/react */
import { Container } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchMoneyAccountDetail from 'hooks/useFetchMoneyAccountDetail'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({
    padding: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

export default function AccountingSubject({ history, location }) {
  const [date, setDate] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const [resultSetting, setResultSetting] = React.useState({
    moneyAccountDetail: {
      pageLimit: 20,
      pageOffset: 0,
    },
  })
  const moneyAccountDetail = useFetchMoneyAccountDetail({
    ...date,
    ...resultSetting.moneyAccountDetail,
  })

  const handleOnChangePage = ({ key, page }) => {
    setResultSetting(
      produce(draft => {
        draft[key].pageOffset = page
      })
    )
  }
  const handleOnChangeRowsPerPage = ({ value, key }) => {
    setResultSetting(
      produce(draft => {
        draft[key].pageOffset = 0
        draft[key].pageLimit = value
      })
    )
  }
  return (
    <Page title="收支科目明細" css={styles.root}>
      <Container maxWidth={false}>
        <PageTitle title='收支科目明細' subTitle='Accounting Subject Detail' />
        <MerchantSearchBar
          values={date}
          onFilter={values => setDate(values)}
          outside
          visible={['datePicker', 'payment']}
        />
        {idx(
          moneyAccountDetail,
          _ =>
            _.data.moneyAccountDetail && (
              <Results
                className={styles.results}
                results={_.data.moneyAccountDetail}
                handleOnChangePage={(_event, page) =>
                  handleOnChangePage({ page, key: 'moneyAccountDetail' })
                }
                handleOnChangeRowsPerPage={event =>
                  handleOnChangeRowsPerPage({
                    value: idx(event, _ => _.target.value),
                    key: 'moneyAccountDetail',
                  })
                }
              />
            )
        )}
      </Container>
    </Page>
  )
}
