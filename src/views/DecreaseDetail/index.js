/** @jsxImportSource @emotion/react */
import { Container, Typography, CircularProgress } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchUserHelperRetrieve } from 'hooks/useFetchGetUserHelperRetrieve'
import idx from 'idx'
import React from 'react'
import DesignerBeenAssistedAutoComplete from 'components/DesignerBeenAssistedAutoComplete'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import DecreaseResults from './DecreaseResults'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  searchBar: css({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px 10px'
  })
}

export default function DecreaseDetail() {
  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    serviceId: '',
  })

  const [beenAssistedDesigner, setBeenAssistedDesigner] = React.useState()

  const userHelperRetrieveData = useFetchUserHelperRetrieve({
    startDate: pageSetting.startDate,
    endDate: pageSetting.endDate,
    designerId: pageSetting.employeeId === '' ? '' : pageSetting.employeeId,
    serviceId: pageSetting.serviceId === '' ? '' : pageSetting.serviceId,
  })

  return (
    <Page title="互助點數明細" css={styles.root}>
      <Container maxWidth={false}>
        <AdminPageHeader title='互助點數明細' />
        <div css={styles.searchBar}>
          <div>
            <MerchantSearchBar
              values={pageSetting}
              onFilter={values => setPageSetting(values)}
              outside
              visible={['datePicker', 'employee', 'service']}
              initFirst={!pageSetting.employeeId ? ['employee'] : []}
              useInDecreaseDetailReport={true}
              lastInLeaderBoard={true}
            />
          </div>
          <DesignerBeenAssistedAutoComplete
            label="設計師編號/姓名"
            value={beenAssistedDesigner}
            onChange={value => setBeenAssistedDesigner(value.userId)}
          />
        </div>
        {!userHelperRetrieveData.loading ? (
          idx(userHelperRetrieveData, _ =>
            _.data.getUserHelperRetrieve.helperRecord.length > 0 ? (
              <DecreaseResults
                results={_.data.getUserHelperRetrieve.helperRecord}
                summary={_.data.getUserHelperRetrieve.summary}
                pointSummary={_.data.getUserHelperRetrieve.pointSummary}
                beenAssistedDesigner={beenAssistedDesigner}
              />
            ) : (
              <Typography variant="h3" gutterBottom component="div">
                無資料
              </Typography>
            )
          )
        ) : (
          <div style={{ textAlign: 'center', marginTop: 150 }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}
