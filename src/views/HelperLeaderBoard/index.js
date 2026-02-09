/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Button, CircularProgress, Grid,
  ToggleButtonGroup, ToggleButton
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfMonth, format } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import produce from 'immer'
import useFetchHelperLeaderboard from 'hooks/useFetchHelperLeaderboard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import Results from './Results'
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
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '100px',
  }),
  exportBtn: css({
    float: 'right',
  }),
  formGroup: css({
    width: '10rem',
    marginLeft: theme.spacing(3),
  }),
  topDiv: css({
    display: 'flex',
    alignItems: 'center',
  }),
}

const HelperLeaderBoard = () => {
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [displayReportWithMembership, setDisplayReportWithMembership] = useState(false)
  const [sort, setSort] = useState([])
  const [inputValue, setInputValue] = useState({
    startDay: startOfMonth(new Date()).getTime(),
    endDay: endOfDay(new Date()).getTime(),
    merchantId: [],
    reference: 'FAKE',
    orderBy: 'POINT'
  })
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const helperLeaboardData = useFetchHelperLeaderboard(inputValue)
  // 隱藏虛實業績切換按鈕 --------------------------------------------------------------------------------
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(true)

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading) {
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
  }, [isDisplayTogglePerformanceButtonData.loading])
  // ---------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (!helperLeaboardData.loading && !isMemberShipCardActiveData.loading) {
      const usersReport = idx(helperLeaboardData, _ => _.data.helperLeaderboard)
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      if (usersReport !== null) {
        const excelData = []
        let isDisplayExcelWithMembership = false
        const isMembershipIsZero = usersReport.filter(result => result.membershipTotal === 0)
        if (isMembershipIsZero.length !== usersReport.length) {
          setDisplayReportWithMembership(true)
          isDisplayExcelWithMembership = true
        } else if (isMemberShipCardActive) {
          setDisplayReportWithMembership(true)
          isDisplayExcelWithMembership = true
        } else {
          setDisplayReportWithMembership(false)
          isDisplayExcelWithMembership = false
        }
        setReportForDisplay(usersReport)
        const key = inputValue.reference === 'TRUTH' ? '店販業績 (實)' : '店販業績 (虛)'
        const key2 = inputValue.reference === 'TRUTH' ? '會員卡業績 (實)' : '會員卡業績 (虛)'
        usersReport.forEach(data => {
          const obj = {}
          obj[key] = Math.round(data.productTotal)
          if (isDisplayExcelWithMembership) {
            obj[key2] = Math.round(data.membershipTotal)
          }
          excelData.push({
            設計師: data.userName,
            所屬店家: data.storeName,
            '互助獲得(點數)': Math.round(data.helperReceivedPoint),
            '互助使用(點數)': Math.round(data.helperReceivedPrice),
            ...obj,
          })
        })
        const obj = {}
        obj[key] = Math.round(usersReport.reduce((accu, curVal) => accu + curVal.productTotal, 0))
        if (isDisplayExcelWithMembership) {
          obj[key2] = Math.round(usersReport.reduce((accu, curVal) => accu + curVal.membershipTotal, 0))
        }
        excelData.push({
          設計師: "合計",
          '互助獲得(點數)': Math.round(usersReport.reduce((accu, curVal) => accu + curVal.helperReceivedPoint, 0)),
          '互助使用(點數)': Math.round(usersReport.reduce((accu, curVal) => accu + curVal.helperReceivedPrice, 0)),
          ...obj,
        })
        setExcelData(excelData)
      }
    }
  }, [helperLeaboardData.loading, isMemberShipCardActiveData.loading])

  const handleSearchReport = () => {
    handleValueChange('merchantId', sort)
  }

  const handleValueChange = (key = null, value, isDate = false) => {
    setInputValue(
      produce(draft => {
        if (isDate) {
          draft.startDay = value.startDate
          draft.endDay = value.endDate
        } else {
          draft[key] = value
        }
      })
    )
  }

  // 處理欄位的value
  const getSubmitValue = v => {
    if (v.length === 0) {
      setSort([])
      handleValueChange('merchantId', [])
    } else {
      setSort(v)
    }
  }

  useEffect(() => {
    handleSearchReport()
  }, [inputValue.startDay, inputValue.endDay])

  return (
    <Page css={styles.root} className='HelperLeaderBoard' title="互助排行榜">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(inputValue.startDay), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(inputValue.endDay), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '互助排行榜'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='互助排行榜' />
        <Grid className="noprint" container style={{ display: 'flex', justifyContent: 'space-between' }}>
          <DateSelector
            date={{ startDate: inputValue.startDay, endDate: inputValue.endDay }}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => handleValueChange(undefined, value, true)}
            margin
          />
          <Grid
            item
            className="noprint"
            style={{
              display: 'flex',
              alignItems: 'center',
              rowGap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ marginRight: '20px', marginTop: -23 }}>
              <div className="divText">排序依據：</div>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={inputValue.orderBy}
                onChange={(e, v) => handleValueChange('orderBy', v)}
              >
                <ToggleButton value='POINT'>依點數</ToggleButton>
                <ToggleButton value='PRICE'>依金額</ToggleButton>
              </ToggleButtonGroup>
            </div>
            {!isDisplayTogglePerformanceButton &&
              <div style={{ marginRight: '20px', marginTop: -23 }}>
                <div className="divText">業績依據：</div>
                <ReferToggleButton
                  value={inputValue.reference}
                  onChange={value => value && handleValueChange('reference', value)}
                />
              </div>}
            <div style={{ marginRight: '20px' }}>
              <CSVLink
                data={excelData}
                filename="互助排行榜.csv"
                style={{ display: 'inline' }}
              >
                <Button variant="contained" color="primary" css={styles.exportBtn}>
                  報表匯出
                </Button>
              </CSVLink>
            </div>
            <div>
              <Button onClick={() => window.print()} variant="contained" color="primary" css={styles.exportBtn}>
                列印
              </Button>
            </div>
          </Grid>
        </Grid>
        <div className="noprint" style={{ display: 'flex', margin: '10px 0' }}>
          <MerchantListAutocpmplete
            onValueChange={value => {
              getSubmitValue(value)
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

        {helperLeaboardData.loading ? (
          <div style={{ marginTop: '50px' }} css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        ) : reportForDisplay !== null && inputValue.merchantId.length > 0 ? (
          <Results report={reportForDisplay} performReference={inputValue.reference} displayReportWithMembership={displayReportWithMembership} />
        ) : (
          ''
        )}
      </Container>
    </Page>
  )
}

export default HelperLeaderBoard
