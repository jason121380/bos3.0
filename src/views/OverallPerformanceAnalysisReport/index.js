/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Button, CircularProgress, Grid, ToggleButton, ToggleButtonGroup
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import DateSelector from 'components/DateSelector'
import { endOfMonth, startOfMonth, format } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchGetOverallPerformanceAnalysisReport from 'hooks/useFetchGetOverallPerformanceAnalysisReport'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '100px',
  })
}

const include = [
  { label: '業績', value: 'SERVICE' },
  { label: '店販', value: 'PRODUCT' },
  { label: '預收卡', value: 'TICKET' },
  { label: '會員卡', value: 'MEMBERSHIP' },
]

const OverallPerformanceAnalysisReport = () => {
  const [excelData, setExcelData] = useState([])
  const [merchantSelect, setMerchantSelect] = useState([])
  const [performanceInclude, setPerformanceInclude] = useState(['SERVICE'])
  const [overAllReport, setOverAllReport] = useState([])
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })

  const [getOverallPerformanceAnalysisReportLazy, overallPerformanceAnalysisReportLazyData] = useFetchGetOverallPerformanceAnalysisReport()

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
        break
    }
  }

  useEffect(() => {
    getOverallPerformanceAnalysisReportLazy({
      variables: {
        input: {
          storeIds: merchantSelect,
          dateRange: date,
          performanceInclude: performanceInclude,
        },
      },
    })
  }, [date])

  useEffect(() => {
    if (!overallPerformanceAnalysisReportLazyData.loading && overallPerformanceAnalysisReportLazyData.data !== undefined) {
      const reportData = idx(overallPerformanceAnalysisReportLazyData, _ => _.data.overallPerformanceAnalysisReport)
      setOverAllReport(reportData)
      if (!!reportData.merchantNameList) {
        const excelData = []
        reportData.performanceAnalysis.map(data => {
          const obj = {}
          obj['日期'] = `${format(new Date(data.date), 'yyyy/MM/dd')}  ${weekDisplay(format(new Date(data.date), 'eeee'))}`
          data.merchantPerformance.map((d, index) => {
            if (d.merchantName === reportData.merchantNameList[index]) {
              obj[d.merchantName] = d.performance
            } else {
              // 如果資料的順序跟merchantNameList的順序不一樣 就以merchantNameList的順序為主
              const correctData = data.merchantPerformance.filter(d => {
                return d.merchantName === reportData.merchantNameList[index]
              })
              obj[correctData[0].merchantName] = correctData[0].performance
            }
          })
          excelData.push(obj,)
        })

        const summeryObj = { '日期': '區間合計', }
        reportData.performanceSummary.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            summeryObj[d.merchantName] = Math.round(d.performance)
          } else {
            const correctData = reportData.performanceSummary.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            summeryObj[correctData[0].merchantName] = correctData[0].performance
          }
        })
        excelData.push(summeryObj)

        const workingDayObj = { '日期': '實際工作天數', }
        reportData.workingDay.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            workingDayObj[d.merchantName] = d.dayCount
          } else {
            const correctData = reportData.workingDay.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            workingDayObj[correctData[0].merchantName] = correctData[0].dayCount
          }
        })
        excelData.push(workingDayObj)

        const averagePerformanceObj = { '日期': '單日平均', }
        reportData.averagePerformance.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            averagePerformanceObj[d.merchantName] = d.performance
          } else {
            const correctData = reportData.averagePerformance.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            averagePerformanceObj[correctData[0].merchantName] = correctData[0].performance
          }
        })
        excelData.push(averagePerformanceObj)

        const expectedPerformanceAllMonthObj = { '日期': '當月預估', }
        reportData.expectedPerformanceAllMonth.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            expectedPerformanceAllMonthObj[d.merchantName] = d.performance
          } else {
            const correctData = reportData.expectedPerformanceAllMonth.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            expectedPerformanceAllMonthObj[correctData[0].merchantName] = correctData[0].performance
          }
        })
        excelData.push(expectedPerformanceAllMonthObj)

        setExcelData(excelData)
      }
    }
  }, [overallPerformanceAnalysisReportLazyData.loading])

  const handleToggleButtonChange = (_event, state) => {
    setPerformanceInclude(state)
  }

  const handleChecked = value => {
    if (value.length > 0) {
      setMerchantSelect(value)
    } else if (value.length === 0) {
      setMerchantSelect([])
      getOverallPerformanceAnalysisReportLazy({
        variables: {
          input: {
            storeIds: [],
            dateRange: date,
            performanceInclude: performanceInclude,
          },
        },
      })
    }
  }
  const handleSearchReport = () => {
    getOverallPerformanceAnalysisReportLazy({
      variables: {
        input: {
          storeIds: merchantSelect,
          dateRange: date,
          performanceInclude: performanceInclude,
        },
      },
    })
  }
  return (
    <Page css={styles.root} title="多店業績統計表">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='多店業績統計表' />
        <Grid container alignItems='center' justifyContent='space-between' >
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />

          <Grid
            item
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10
            }}
          >
            <Grid style={{ marginTop: -22 }}>
              <div>業績包含</div>
              <ToggleButtonGroup
                size="small"
                value={performanceInclude}
                onChange={handleToggleButtonChange}
              >
                {include.map((data, idx) => (
                  <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                    {data.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <div>
              <CSVLink data={excelData} filename="多店業績統計表.csv"
                onClick={() => {
                  if (overallPerformanceAnalysisReportLazyData.loading ||
                    overallPerformanceAnalysisReportLazyData.data === undefined ||
                    excelData.length === 0) {
                    return false
                  }
                }}>
                <Button disabled={overallPerformanceAnalysisReportLazyData.loading ||
                  overallPerformanceAnalysisReportLazyData.data === undefined ||
                  excelData.length === 0}
                  variant="contained" color="primary">
                  報表匯出
                </Button>
              </CSVLink>
            </div>
          </Grid>
        </Grid>
        <div style={{ display: 'flex', margin: '10px 0' }}>
          <MerchantListAutocpmplete
            onValueChange={value => {
              handleChecked(value)
            }}
          />
          <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchReport}
              css={styles.searchBtn}
            >
              搜尋
            </Button>
          </div>
        </div>
        {!overallPerformanceAnalysisReportLazyData.loading && overallPerformanceAnalysisReportLazyData.data !== undefined ? (
          <Results
            weekDisplay={weekDisplay}
            overAllReport={overAllReport}
          />
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default OverallPerformanceAnalysisReport
