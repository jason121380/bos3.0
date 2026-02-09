/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Button } from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import AdminPageHeader from 'components/AdminPageHeader'
import { startOfMonth, addDays, format, differenceInDays } from 'date-fns'
import useFetchMoneyFlowDailyReport from 'hooks/useFetchMoneyFlowDailyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import Results from './Results'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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

export default function Employees() {
  const [displayDate, setDisplayDate] = useState([])
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [excelData, secExcelData] = useState([])

  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const moneyFlowDailyReportData = useFetchMoneyFlowDailyReport({
    startDate: date.startDate,
    endDate: date.endDate,
  })

  const weekDisplay = week => {
    switch (week) {
      case 'Monday':
        return '(一)'
      case 'Tuesday':
        return '(二)'
      case 'Wednesday':
        return '(三)'
      case 'Thursday':
        return '(四)'
      case 'Friday':
        return '(五)'
      case 'Saturday':
        return '(六)'
      case 'Sunday':
        return '(日)'
      default:
        console.log(week)
        break
    }
  }
  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])

  useEffect(() => {
    const displayDate = []
    const dayCount = Math.abs(differenceInDays(date.startDate, date.endDate))
    let add = 0
    for (let i = 0; i <= dayCount; i++) {
      displayDate.push(
        `${format(addDays(new Date(date.startDate), add).getTime(), 'MM/dd')}${weekDisplay(
          format(addDays(new Date(date.startDate), add).getTime(), 'eeee')
        )}`
      )
      add++
    }
    setDisplayDate(displayDate)
  }, [date])

  return (
    <Page css={styles.root} title="每日收支明細">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='每日收支明細(已日結)' />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <CSVLink data={excelData} filename="高階收支登錄.csv" >
            <Button style={{ height: 'fit-content', whiteSpace: 'nowrap' }} variant="contained" color="primary">
              報表匯出
            </Button>
          </CSVLink>
        </div>
        {!moneyFlowDailyReportData.loading && !isMemberShipCardActiveData.loading ?
          (idx(moneyFlowDailyReportData, _ => (
            <Results
              className={styles.results}
              moneyFlowDailyReport={_.data.moneyFlowDailyReport}
              displayDate={displayDate}
              secExcelData={secExcelData}
              isMemberShipCardActive={isMemberShipCardActive}
            />
          ))
          ) : (
            <div style={{ textAlign: 'center' }}>
              <CircularProgress />
            </div>
          )}
      </Container>
    </Page>
  )
}
