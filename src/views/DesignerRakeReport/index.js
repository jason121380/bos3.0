/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Container, Grid, Typography, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import PageTitle from 'components/PageTitle'
import { startOfMonth } from 'date-fns'
import idx from 'idx'
import useFetchDesignerRakeReport from 'hooks/useFetchDesignersRakeReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '284px',
  }),
}

const DesignerRakeReport = () => {
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const designerRakeReportData = useFetchDesignerRakeReport({ input: date })
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])

  return (
    <Page css={styles.root} title="設計師抽成報表">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='設計師抽成報表' subTitle='Designer Rake Report' />
        <DateSelector
          date={date}
          attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
          dateChange={value => setDate(value)}
          margin
        />
        {!designerRakeReportData.loading ? (
          idx(designerRakeReportData, _ =>
            _.data.userRakeReport.length > 0 ? (
              <Grid container className="userRakeGrid" spacing={2}>
                <Results
                  designerRakeReport={_.data.userRakeReport}
                  isMemberShipCardActive={isMemberShipCardActive}
                />
              </Grid>
            ) : (
              <Typography variant="h3" gutterBottom component="div">
                無資料
              </Typography>
            )
          )
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default DesignerRakeReport
