/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Button, CircularProgress, Grid, ToggleButton, ToggleButtonGroup
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfMonth, format, isSameDay } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchDesignersLeaderboard from 'hooks/useFetchDesignersLeaderboard'
import useFetchMonthlyAverageDisplayForDesignerLeaderBoard from 'hooks/useFetchGetMonthlyAverageDisplayForDesignerLeaderBoard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import { useFetchGetDRRDataDisplay } from 'hooks/useFetchGetParameterReportSetting'
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
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '100px',
  }),
}

const isIncludeProductPerformanceValue = [
  { label: '含店販', value: true },
  { label: '不含入店販', value: false },
]
const isIncludeMemberPerformanceValue = [
  { label: '含會員卡', value: true },
  { label: '不含會員卡', value: false },
]
const DesignerPerformBasic = () => {
  const [excelData, setExcelData] = useState([])
  const [performReference, setPerformReference] = useState('FAKE')
  const [isIncludeProductPerformance, setIsIncludeProductPerformanceValue] = useState(false)
  const [isIncludeMemberPerformance, setIsIncludeMemberPerformanceValue] = useState(false)
  const [monthlyAveragePerformanceTotal, setMonthlyAveragePerformanceTotal] = useState(0)
  const [submitValue, setSubmitValue] = useState([])
  const [isSubmit, setIsSubmit] = useState(false)
  const [valueSelect, setValueSelect] = useState([])
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [performanceDisplay, setPerformanceDisplay] = useState('VISIBLE')
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })
  const [
    monthlyAverageDisplayForDesignerLeaderBoard,
    setMonthlyAverageDisplayForDesignerLeaderBoard,
  ] = useState(false)
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)
  const [dataDisplay, setDataDisplay] = useState({
    isDRROCDisplay: false,
    isDRRPEVDisplay: false,
  })

  const designersLeaboardData = useFetchDesignersLeaderboard({
    startDay: date.startDate,
    endDay: date.endDate,
    merchantId: submitValue,
    reference: performReference,
    isIncludeProductPerformance: isIncludeProductPerformance,
    isIncludeMembershipPerformance: isIncludeMemberPerformance
  })
  const monthlyAverageDisplayForDesignerLeaderBoardData = useFetchMonthlyAverageDisplayForDesignerLeaderBoard()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const getDRRDataDisplay = useFetchGetDRRDataDisplay()
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()

  useEffect(() => {
    if (!getDRRDataDisplay.loading) {
      const { isDRROCDisplay, isDRRPEVDisplay } = idx(getDRRDataDisplay, _ => _.data.getParameterReportSetting)
      setDataDisplay({
        isDRROCDisplay,
        isDRRPEVDisplay
      })
    }
  }, [getDRRDataDisplay.loading])

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading) {
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
  }, [isDisplayTogglePerformanceButtonData.loading])

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
    if (!monthlyAverageDisplayForDesignerLeaderBoardData.loading) {
      const monthlyAverageDisplayForDesignerLeaderBoard = idx(
        monthlyAverageDisplayForDesignerLeaderBoardData,
        _ => _.data.getMonthlyAverageDisplayForDesignerLeaderBoard
      )
      setMonthlyAverageDisplayForDesignerLeaderBoard(monthlyAverageDisplayForDesignerLeaderBoard)
    }
  }, [monthlyAverageDisplayForDesignerLeaderBoardData.loading])

  useEffect(() => {
    if (!designersLeaboardData.loading && !monthlyAverageDisplayForDesignerLeaderBoardData.loading && !isMemberShipCardActiveData.loading) {
      const report = idx(designersLeaboardData, _ => _.data.designerLeaderboard.designerLeaderBoard)
      const excelData = []
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      const monthlyAveragePerformanceTotal = idx(
        designersLeaboardData,
        _ => _.data.designerLeaderboard.monthlyAveragePerformanceTotal
      )
      const averageDisplay = idx(
        monthlyAverageDisplayForDesignerLeaderBoardData,
        _ => _.data.getMonthlyAverageDisplayForDesignerLeaderBoard
      )
      const membershipTotal = report.reduce((acc, curVal) => acc + curVal.membershipTotal, 0)
      const membershipDisplay = (isMemberShipCardActive || membershipTotal !== 0)
      
      // 是否顯示會員卡欄位
      setMembershipDisplay(isMemberShipCardActive || membershipTotal !== 0)
      
      const handleCountSummary = key => {
        return Math.round(report.reduce((acc, cur) => acc + cur[key], 0))
      }

      const deleteKey = (data) => {
        if (!membershipDisplay) {
          delete data['會員卡業績(虛)']
          delete data['會員卡業績(實)']
        }
        if (!averageDisplay) {
          delete data['服務業績月平均']
        }
        if (!dataDisplay.isDRRPEVDisplay) {
          delete data['業績預估值']
        }
        if (!dataDisplay.isDRROCDisplay) {
          delete data['客次數']
        }
        if (performanceDisplay !== 'VISIBLE') {
          delete data['服務業績(指)(實)']
          delete data['服務業績(指)(虛)']
          delete data['服務業績(不指)(實)']
          delete data['服務業績(不指)(虛)']
        }
      }
      if (performReference === 'FAKE') {
        report.forEach(data => {
          const currentData = {
            設計師: data.userName,
            所屬店家: data.storeName,
            總業績: Math.round(data.businessPerformanceTotal),
            服務業績月平均: Math.round(data.monthlyAveragePerformance),
            業績預估值: Math.round(data.performanceEV),
            '服務總業績(虛)': Math.round(data.serviceTotal),
            '服務業績(指)(虛)': Math.round(data.designateServiceTotal),
            '服務業績(不指)(虛)': Math.round(data.nonDesignateServiceTotal),
            '卡券使用業績(虛)': Math.round(data.usedTicketTotal),
            '卡券販賣(入業績)(虛)': Math.round(
              data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate
            ),
            '店販業績 (虛)': Math.round(data.productTotal),
            '會員卡業績(虛)': Math.round(data.membershipTotal),
            '互助使用(點數)/互助使用(金額)': `${Math.round(data.helperPaidPoint)}/${Math.round(data.helperPaidPrice)}`,
            客次數: data.orderCount,
          }

          deleteKey(currentData)

          excelData.push(currentData)
        })
        const totalData = {
          設計師: '合計',
          所屬店家: '',
          總業績: handleCountSummary('businessPerformanceTotal'),
          服務業績月平均: handleCountSummary('monthlyAveragePerformance'),
          業績預估值: handleCountSummary('performanceEV'),
          '服務總業績(虛)': handleCountSummary('serviceTotal'),
          '服務業績(指)(虛)': handleCountSummary('designateServiceTotal'),
          '服務業績(不指)(虛)': handleCountSummary('nonDesignateServiceTotal'),
          '卡券使用業績(虛)': handleCountSummary('usedTicketTotal'),
          '卡券販賣(入業績)(虛)': handleCountSummary('ticketSellIntoPerformanceDesignate') + handleCountSummary('ticketSellIntoPerformanceNonDesignate'),
          '店販業績 (虛)': handleCountSummary('productTotal'),
          '會員卡業績(虛)': handleCountSummary('membershipTotal'),
          '互助使用(點數)/互助使用(金額)': `${handleCountSummary('helperPaidPoint')}/${handleCountSummary('helperPaidPrice')}`,
          客次數: handleCountSummary('orderCount'),
        }

        deleteKey(totalData)

        excelData.push(totalData)
      } else {
        report.forEach(data => {
          const currentData = {
            設計師: data.userName,
            所屬店家: data.storeName,
            總業績: Math.round(data.businessPerformanceTotal),
            服務業績月平均: Math.round(data.monthlyAveragePerformance),
            業績預估值: Math.round(data.performanceEV),
            '服務總業績(實)': Math.round(data.serviceTotal),
            '服務業績(指)(實)': Math.round(data.designateServiceTotal),
            '服務業績(不指)(實)': Math.round(data.nonDesignateServiceTotal),
            '卡券使用業績(實)': Math.round(data.usedTicketTotal),
            '卡券販賣(入業績)(實)': Math.round(
              data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate
            ),
            '店販業績 (實)': Math.round(data.productTotal),
            '會員卡業績(實)': Math.round(data.membershipTotal),
            '互助使用(點數)/互助使用(金額)': `${Math.round(data.helperPaidPoint)}/${Math.round(
              data.helperPaidPrice
            )}`,
            客次數: data.orderCount,
          }

          deleteKey(currentData)

          excelData.push(currentData)
        })
        const totalData = {
          設計師: '合計',
          所屬店家: '',
          總業績: handleCountSummary('businessPerformanceTotal'),
          服務業績月平均: handleCountSummary('monthlyAveragePerformance'),
          業績預估值: handleCountSummary('performanceEV'),
          '服務總業績(實)': handleCountSummary('serviceTotal'),
          '服務業績(指)(實)': handleCountSummary('designateServiceTotal'),
          '服務業績(不指)(實)': handleCountSummary('nonDesignateServiceTotal'),
          '卡券使用業績(實)': handleCountSummary('usedTicketTotal'),
          '卡券販賣(入業績)(實)': handleCountSummary('ticketSellIntoPerformanceDesignate') + handleCountSummary('ticketSellIntoPerformanceNonDesignate'),
          '店販業績 (實)': handleCountSummary('productTotal'),
          '會員卡業績(實)': handleCountSummary('membershipTotal'),
          '互助使用(點數)/互助使用(金額)': `${handleCountSummary('helperPaidPoint')}/${handleCountSummary('helperPaidPrice')}`,
          客次數: handleCountSummary('orderCount'),
        }

        deleteKey(totalData)

        excelData.push(totalData)
      }

      setExcelData(excelData)
      setMonthlyAveragePerformanceTotal(monthlyAveragePerformanceTotal)
    }
  }, [
    designersLeaboardData.loading,
    performReference,
    membershipDisplay,
    monthlyAverageDisplayForDesignerLeaderBoardData.loading,
    isMemberShipCardActiveData.loading,
    dataDisplay,
    performanceDisplay
  ])

  useEffect(() => {
    if (date && valueSelect.length > 0) {
      setIsSubmit(true)
      setSubmitValue(valueSelect)
    }
  }, [date])

  const handleSearchReport = () => {
    if (valueSelect.length > 0 && valueSelect !== undefined) {
      setSubmitValue(valueSelect)
      setIsSubmit(true)
    } else {
      setSubmitValue([])
      setIsSubmit(false)
    }
  }

  const handleToggleButtonChange = value => {
    value && setPerformReference(value)
  }
  const handleProductPerformanceToggleButtonChange = (_event, state) => {
    state !== null && setIsIncludeProductPerformanceValue(state)
  }
  const handleMemberPerformanceToggleButtonChange = (_event, state) => {
    state !== null && setIsIncludeMemberPerformanceValue(state)
  }
  // 處理欄位的value
  const handleChecked = value => {
    if (value.length > 0) {
      setValueSelect(value)
    } else if (value.length === 0) {
      setValueSelect([])
      setIsSubmit(false)
    }
  }

  return (
    <Page css={styles.root} className='DesignerPerformBasic' title="設計師排行榜">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '設計師排行榜'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='設計師排行榜' />
        <Grid container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <Grid
            item
            className="noprint"
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              columnGap: '10px',
              flexWrap: 'wrap',
              rowGap: '30px',
            }}
          >
            <div style={{ marginTop: -23 }}>
              <div className="divText">服務業績指定/不指定：</div>
              <ToggleButtonGroup
                style={{ marginRight: '10px' }}
                size="small"
                exclusive
                value={performanceDisplay}
                onChange={(e, v) => v && setPerformanceDisplay(v)}
              >
                <ToggleButton value='VISIBLE'>顯示</ToggleButton>
                <ToggleButton value='HIDDEN'>不顯示</ToggleButton>
              </ToggleButtonGroup>
            </div>
            {!isDisplayTogglePerformanceButton && <div style={{ marginTop: -23 }}>
              <div className="divText">業績依據：</div>
              <ReferToggleButton
                value={performReference}
                onChange={handleToggleButtonChange}
              />
            </div>}
            <div style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center', marginTop: -23 }}>
              <div className="divText"
                style={{ width: '100%', textAlign: membershipDisplay ? 'center' : 'start' }}>
                總業績依據：
              </div>
              <div>
                <ToggleButtonGroup
                  style={{ marginRight: '10px' }}
                  size="small"
                  value={isIncludeProductPerformance}
                  onChange={handleProductPerformanceToggleButtonChange}
                  exclusive
                >
                  {isIncludeProductPerformanceValue.map((data, idx) => (
                    <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                      {data.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                {isMemberShipCardActive ?
                  <ToggleButtonGroup
                    size="small"
                    value={isIncludeMemberPerformance}
                    onChange={handleMemberPerformanceToggleButtonChange}
                    exclusive
                  >
                    {isIncludeMemberPerformanceValue.map((data, idx) => (
                      <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                        {data.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup> :
                  membershipDisplay ?
                    <ToggleButtonGroup
                      size="small"
                      value={isIncludeMemberPerformance}
                      onChange={handleMemberPerformanceToggleButtonChange}
                      exclusive
                    >
                      {isIncludeMemberPerformanceValue.map((data, idx) => (
                        <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                          {data.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup> : ''
                }

              </div>
            </div>
            {excelData.length !== 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CSVLink
                  data={excelData}
                  filename="設計師排行榜.csv"
                  style={{ display: 'inline' }}
                >
                  <Button variant="contained" color="primary" disabled={designersLeaboardData.loading}>
                    報表匯出
                  </Button>
                </CSVLink>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={designersLeaboardData.loading}
                  onClick={() => window.print()}
                >
                  列印
                </Button>
              </div>
            )}
          </Grid>
        </Grid>
        <div className="noprint" style={{ display: 'flex', margin: '8px 0' }}>
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
        {!designersLeaboardData.loading && !monthlyAverageDisplayForDesignerLeaderBoard.loading ? (
          <Results
            report={idx(designersLeaboardData, _ => _.data.designerLeaderboard.designerLeaderBoard)}
            performReference={performReference}
            monthlyAveragePerformanceTotal={monthlyAveragePerformanceTotal}
            monthlyAverageDisplayForDesignerLeaderBoard={
              monthlyAverageDisplayForDesignerLeaderBoard
            }
            isSubmit={isSubmit}
            membershipDisplay={membershipDisplay}
            setMembershipDisplay={setMembershipDisplay}
            dataDisplay={dataDisplay}
            performanceDisplay={performanceDisplay}
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

export default DesignerPerformBasic
