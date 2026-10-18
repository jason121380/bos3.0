/** @jsxImportSource @emotion/react */
import { Container, Card } from '@mui/material'
import ProgressBar from 'components/ProgressBar'
import PageTitle from 'components/PageTitle'
import Page from 'components/Page'
import { endOfDay, startOfDay } from 'date-fns'
import useFetchMerchantDashboard from 'hooks/useFetchMerchantDashboard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import React, { Fragment, useEffect, useState } from 'react'
import DateSelector from 'components/DateSelector'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import Results from './Results'
import Overview from './Overview'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

function MerchantBusinessDashboard() {
  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const [progress, setProgress] = React.useState(0)
  const [membershipDisplay, setMembershipDisplay] = useState(false)

  const merchantDashboardData = useFetchMerchantDashboard({
    input: pageSetting,
  })

  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const overview = idx(merchantDashboardData, _ => _.data.merchantDashboard.intervalSummary) || {}
  const results = idx(merchantDashboardData, _ => _.data.merchantDashboard) || {}

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading && !merchantDashboardData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const membership = idx(merchantDashboardData, _ => _.data.merchantDashboard.intervalSummary.membership)
      setMembershipDisplay(isMemberShipCardActive || membership !== 0)
    }
  }, [isMemberShipCardActiveData.loading, merchantDashboardData.loading])
  return (
    <Page css={styles.root} title="營業儀表板">
      <Container maxWidth={false} css={styles.container}>
        <Card
          css={css({
            display: 'flex',
            padding: '0 0 24px 0',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            borderRadius: 0,
            boxShadow: 'none',
            border: 'none !important',
            marginBottom: 0,
            flexWrap: 'wrap',
            gap: '12px'
          })}
        >
          <PageTitle title='營業儀表板' style={{ color: '#1A73E8' }} />
          <DateSelector
            date={pageSetting}
            attributes={[
              'thismonth', 'lastmonth', 'dbyesterday',
              'yesterday', 'today', 'startDate', 'endDate'
            ]}
            dateChange={value => setPageSetting(value)}
          />
        </Card>
        {!merchantDashboardData.loading ? (
          <Fragment>
            <Overview membershipDisplay={membershipDisplay} overview={overview} />
            <Results results={results} />
          </Fragment>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <ProgressBar
              setProgress={setProgress}
              progress={progress}
              dataLoading={merchantDashboardData.loading}
            />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default MerchantBusinessDashboard
