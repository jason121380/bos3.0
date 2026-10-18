/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, CircularProgress, Button, Grid, Autocomplete,
  TextField, Checkbox, Switch, Typography
} from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import PageTitle from 'components/PageTitle'
import ReferToggleButton from 'components/ReferToggleButton'
import { startOfMonth, format } from 'date-fns'
import useFetchDesignerPerforamnceAnalyzeReport, { useFetchDesignerPerforamnceAnalyzeCompareReport } from 'hooks/useFetchDesignerPerforamnceAnalyzeReport'
import { useFetchDesignerPerforamnceAnalyzeExcelLazy } from 'hooks/useFetchDesignerPerforamnceAnalyzeExcel'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import DateSelector from 'components/DateSelector'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Results from './Results'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import produce from 'immer'
import CompareFilter from './CompareFilter'
import Compare from './Compare'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

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
  printBtn: css({
    backgroundColor: 'rgb(var(--accent))',
  }),
}

const checkArray = [
  'totalPerformance', 'totalOrderCount', 'orderAveragePrice', 'orderDesignateCount',
  'orderDesignatePercentage', 'orderNonDesignateCount', 'orderNonDesignatePercentage',
  'productPerformance', 'productPerformancePercentage', 'serviceTypeAnalyze',
]

const DesignerPerforamnceAnalyzeReport = () => {
  const getUserList = useFetchUsersOrderableList()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [inputData, setInputData] = useState({
    dateRange: {
      startDate: startOfMonth(new Date()).getTime(),
      endDate: new Date().getTime(),
    },
    designerIds: [],
    displayReference: 'FAKE',
  })
  const [compareInputData, setCompareInputData] = useState([])
  const [getAnalyzeReport, analyzeReport] = useFetchDesignerPerforamnceAnalyzeReport()
  const [getAnalyzeCompareReport, analyzeCompareReport] = useFetchDesignerPerforamnceAnalyzeCompareReport()
  const [compareDisplay, setCompareDisplay] = useState(false)
  const [designerPerforamnceAnalyzeExcelLazy, designerPerforamnceAnalyzeExcelLazyData] = useFetchDesignerPerforamnceAnalyzeExcelLazy()
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(true)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [userList, setUserList] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [compareData, setCompareData] = useState([])

  const handleExcel = () => {
    designerPerforamnceAnalyzeExcelLazy({
      variables: {
        input: inputData.dateRange,
        designerIds: inputData.designerIds,
        displayReference: inputData.displayReference,
      }
    })
  }

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    const newOptions = options.sort((a, b) => {
      return a.userNo - b.userNo
    })
    if (keyWord !== '' && keyWord.trim() !== '') {
      const filterData = newOptions.filter(data =>
        (data.userNo !== null && data.userNo !== '' && data.userNo.toLowerCase() === keyWord.toLowerCase()) ||
        (data.userNickName !== null && data.userNickName !== '' && data.userNickName.toLowerCase().includes(keyWord.toLowerCase())) ||
        (data.userName !== null && data.userName !== '' && data.userName.toLowerCase().includes(keyWord.toLowerCase()))
      )
      return filterData
    } else {
      return options
    }
  }

  const handleSearch = () => {
    getAnalyzeReport({
      variables: {
        input: inputData.dateRange,
        designerIds: inputData.designerIds,
        displayReference: inputData.displayReference,
      }
    })
  }

  const handleAddRow = () => {
    setCompareInputData(
      produce(draft => {
        draft.push({
          dateRange: {
            startDate: startOfMonth(new Date()).getTime(),
            endDate: new Date().getTime(),
          },
          designerIds: [],
          displayReference: 'FAKE',
        })
      })
    )
  }

  const handleSetData = (key, i, value) => {
    setCompareInputData(
      produce(draft => {
        draft[i][key] = value
      })
    )
  }

  const handleRemoveRow = index => {
    setCompareInputData(
      produce(draft => {
        draft.splice(index, 1)
      })
    )
  }

  const handleGetCompareData = async () => {
    if (!compareInputData.length) return
    getAnalyzeCompareReport({
      variables: {
        input: compareInputData
      }
    })
  }

  useEffect(() => {
    if (!getUserList.loading) {
      const data = idx(getUserList, _ => _.data.getUserOrderableList)
      setUserList(data)
    }
  }, [getUserList.loading])

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading) {
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
  }, [isDisplayTogglePerformanceButtonData.loading])

  useEffect(() => {
    if (!compareDisplay) return
    if (
      !analyzeCompareReport.loading && analyzeCompareReport.data &&
      !isMemberShipCardActiveData.loading
    ) {
      const reportData = []
      const report = idx(
        analyzeCompareReport, _ => _.data.designerPerforamnceAnalyzeCompareReport
      )
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      report.forEach(data => {
        const filterData = data.filter(d => {
          return checkArray.some(key => (
            key === 'serviceTypeAnalyze' ? d[key].length !== 0 : d[key] !== 0
          ))
        })
        reportData.push(filterData)
      });
      const isMembershipIsZero = reportData.some(reports => {
        return reports.some(d => d.membershipPerformance !== 0)
      })
      setIsMemberShipCardActive(isMemberShipCardActive || isMembershipIsZero)
      setCompareData(reportData)
    }
  }, [
    analyzeCompareReport.loading,
    isMemberShipCardActiveData.loading,
    compareDisplay
  ])

  useEffect(() => {
    if (compareDisplay) return
    if (
      !analyzeReport.loading && analyzeReport.data &&
      !isMemberShipCardActiveData.loading
    ) {
      const report = idx(
        analyzeReport,
        _ => _.data.designerPerforamnceAnalyzeReport
      )
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      const isMembershipIsZero = report.some(result => result.membershipPerformance !== 0)
      const filrterData = report.filter(data => {
        return checkArray.some(key => (
          key === 'serviceTypeAnalyze' ? data[key].length !== 0 : data[key] !== 0
        ))
      })
      setIsMemberShipCardActive(isMemberShipCardActive || isMembershipIsZero)
      setReportForDisplay(filrterData)
    }
  }, [
    analyzeReport.loading,
    isMemberShipCardActiveData.loading,
    compareDisplay
  ])

  useEffect(() => {
    if (!designerPerforamnceAnalyzeExcelLazyData.loading && designerPerforamnceAnalyzeExcelLazyData.data !== undefined) {
      const url = idx(designerPerforamnceAnalyzeExcelLazyData, _ => _.data.designerPerforamnceAnalyzeExcel)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [designerPerforamnceAnalyzeExcelLazyData.loading])

  useEffect(() => {
    handleSearch()
  }, [inputData.dateRange, inputData.displayReference])

  return (
    <Page css={styles.root} title="設計師業績分析表">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(inputData.dateRange.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  -  ' +
              format(new Date(inputData.dateRange.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '設計師業績分析表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <PageTitle title='設計師業績分析表' subTitle='Designer Perforamnce Analyze Report' />
          <div style={{ display: 'flex', 'alignItems': 'center', gap: 10 }}>
            {compareDisplay && (
              <Button
                variant="contained"
                color="primary"
                disabled={getUserList.loading}
                onClick={() => setOpenModal(true)}
              >
                設定條件
              </Button>
            )}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16 }}>比較模式</Typography><Switch checked={compareDisplay} onChange={(e, v) => setCompareDisplay(v)} />
            </div>
          </div>
        </div>

        <Grid container style={{ gap: 10, display: compareDisplay ? 'none' : '' }}>
          <Grid
            container
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
            className="noprint"
          >
            <Grid item className="noprint" style={{ display: 'flex', alignItems: 'center', columnGap: 10, rowGap: 30, flexWrap: 'wrap' }}>
              <Grid item>
                <DateSelector
                  date={inputData.dateRange}
                  margin
                  attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
                  dateChange={date => {
                    setInputData(
                      produce(draft => {
                        draft.dateRange = date
                      })
                    )
                  }}
                />
              </Grid>
            </Grid>
            <Grid
              item
              className="printGrid"
              style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px 20px', justifyContent: 'space-between', gap: 10 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {!isDisplayTogglePerformanceButton && (
                  <div style={{ marginTop: '-23px' }}>
                    <div className="divText">業績依據：</div>
                    <ReferToggleButton
                      value={inputData.displayReference}
                      onChange={value => value && setInputData({ ...inputData, displayReference: value })}
                    />
                  </div>
                )}
                <Button
                  style={{ whiteSpace: 'nowrap' }}
                  size="medium"
                  variant="contained"
                  color="primary"
                  onClick={handleExcel}
                  disabled={designerPerforamnceAnalyzeExcelLazyData.loading}
                >
                  報表匯出
                </Button>
                <Button
                  style={{ height: '36px' }}
                  size="medium"
                  variant="contained"
                  color="primary"
                  onClick={() => window.print()}
                >
                  列印
                </Button>
              </div>
            </Grid>
          </Grid>
          <Grid item container wrap='nowrap' alignItems='center' style={{ gap: 10 }}>
            <Grid item flexGrow={1}>
              <Autocomplete
                multiple
                autoHighlight
                fullWidth
                options={userList}
                disableCloseOnSelect
                disabled={getUserList.loading}
                onChange={(e, value) => {
                  const ids = value.map(d => d.userId)
                  setInputData(
                    produce(draft => {
                      draft.designerIds = ids
                    })
                  )
                }}
                getOptionLabel={option =>
                  option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName
                }
                filterOptions={filterOptions}
                renderOption={({ key, ...props }, option, { selected }) => (
                  <li key={option.userId} {...props}>
                    <Checkbox
                      style={{ color: '#202D50', marginRight: 8 }}
                      icon={icon}
                      checkedIcon={checkedIcon}
                      checked={selected}
                    />
                    {option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName}
                    {option.userNo !== null && option.userNo.trim() ? ` - ${option.userNo}` : ''}
                  </li>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="設計師篩選"
                    placeholder="選擇設計師"
                  />
                )}
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                disabled={analyzeReport.loading || !analyzeReport.data}
                onClick={handleSearch}
              >
                搜尋
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {compareDisplay ? (
          <Compare
            compareData={compareData}
            loading={analyzeCompareReport.loading}
            date={inputData.dateRange}
            isMemberShipCardActive={isMemberShipCardActive}
            compareInputData={compareInputData}
          />
        ) : (!analyzeReport.loading && analyzeReport.data && !isMemberShipCardActiveData.loading && reportForDisplay !== null ? (
          <Results
            report={reportForDisplay}
            date={inputData.dateRange}
            isMemberShipCardActive={isMemberShipCardActive}
          />
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        ))
        }
        <CompareFilter
          open={openModal}
          setOpenModal={setOpenModal}
          compareInputData={compareInputData}
          handleAddRow={handleAddRow}
          handleRemoveRow={handleRemoveRow}
          userList={userList}
          filterOptions={filterOptions}
          handleSetData={handleSetData}
          handleGetCompareData={handleGetCompareData}
        />
      </Container>
    </Page>
  )
}

export default DesignerPerforamnceAnalyzeReport
