/** @jsxImportSource @emotion/react */
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { endOfMonth, format } from 'date-fns'
import idx from 'idx'
import React from 'react'
import useFetchMerchantIncomeStatementV2OuterStore from 'hooks/useFetchMerchantIncomeStatementV2ForOuterStore'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { HeaderActionsSlot, PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  result: css({
    marginTop: theme.spacing(1),
  }),
}

export default function IncomeStatementReport() {
  const [date, setDate] = React.useState({
    startDate: new Date().getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })
  const merchantIncomeStatementDataV2OuterStore = useFetchMerchantIncomeStatementV2OuterStore({
    date: date.startDate,
  })

  return (
    <Page title="損益表" className='IncomeStatementReport ui-root'>
      <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
        <div className="merchantNamePrint">
          {JSON.parse(localStorage.getItem('userMerchant')).name +
            '   ' +
            format(new Date(date.startDate), 'yyyy-MM').toLocaleString() +
            '   ' +
            '損益表'}
        </div>
        <div className="merchantNamePrint">
          {'列印時間： ' +
            format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
        </div>
      </div>
      <PageHeader
        title="損益表"
        actions={
          <>
            <HeaderActionsSlot />
            <Button
              variant="secondary"
              onClick={() => window.print()}
            >
              <Printer strokeWidth={1.75} />
              列印
            </Button>
          </>
        }
      />
      <Toolbar>
        <DateSelector
          date={date}
          attributes={['lastmonth', 'thismonth', 'startDate']}
          dateChange={value => setDate(value)}
          onlyStart
          inputFormat='yyyy/MM'
          pickerOption={{
            views: ['month', 'year']
          }}
        />
      </Toolbar>
      {merchantIncomeStatementDataV2OuterStore.loading ? (
        <Skeleton className="h-96" aria-busy="true" />
      ) : (
        idx(merchantIncomeStatementDataV2OuterStore, _ => (
          <React.Fragment>
            <Results
              className={styles.result}
              incomeStatement={_.data.merchantIncomeStatementV2ForOuterStore}
            />
          </React.Fragment>
        ))
      )}
    </Page>
  )
}
