import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { useState, useEffect } from 'react'
import Page from 'components/Page'
import idx from 'idx'
import compareNo from 'utils/compareNo'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import ReferToggleButton from 'components/ReferToggleButton'
import { startOfMonth, format } from 'date-fns'
import useFetchDesignerPerforamnceAnalyzeReport, { useFetchDesignerPerforamnceAnalyzeCompareReport } from 'hooks/useFetchDesignerPerforamnceAnalyzeReport'
import { useFetchDesignerPerforamnceAnalyzeExcelLazy } from 'hooks/useFetchDesignerPerforamnceAnalyzeExcel'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import DateSelector from 'components/DateSelector'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import Results from './Results'
import produce from 'immer'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import { Switch } from 'ui/switch'
import CompareFilter from './CompareFilter'
import Compare from './Compare'
import { Autocomplete } from 'ui/combobox'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

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
    // 編號自然排序（英數編號也有效）、空編號排最後（原本 a.userNo - b.userNo 對英數編號得 NaN、空編號當 0 排最前；Jason 2026/10/22 fix all）
    const newOptions = [...options].sort((a, b) => compareNo(a.userNo, b.userNo))
    if (keyWord !== '' && keyWord.trim() !== '') {
      const filterData = newOptions.filter(data =>
        (data.userNo !== null && data.userNo !== '' && data.userNo.toLowerCase() === keyWord.toLowerCase()) ||
        (data.userNickName !== null && data.userNickName !== '' && data.userNickName.toLowerCase().includes(keyWord.toLowerCase())) ||
        (data.userName !== null && data.userName !== '' && data.userName.toLowerCase().includes(keyWord.toLowerCase()))
      )
      return filterData
    } else {
      return newOptions
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
    <Page className="ui-root" title="設計師業績分析表">
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
      <PageHeader
        title="設計師業績分析表"
        actions={
          <>
            {compareDisplay && (
              <Button
                variant="primary"
                disabled={getUserList.loading}
                onClick={() => setOpenModal(true)}
              >
                設定條件
              </Button>
            )}
            <Switch label="比較模式" labelPlacement="start" checked={compareDisplay} onChange={(e, v) => setCompareDisplay(v)} />
            {/* 報表版型（STYLE §14）：匯出／列印固定在頁首右側；比較模式下原本整區隱藏，維持不顯示 */}
            {!compareDisplay && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleExcel}
                  disabled={designerPerforamnceAnalyzeExcelLazyData.loading}
                >
                  <Download strokeWidth={1.75} />
                  報表匯出
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.print()}
                >
                  <Printer strokeWidth={1.75} />
                  列印
                </Button>
              </>
            )}
          </>
        }
      />

      {/* 比較模式時整列隱藏（原樣）；日期在外、其餘條件收進「篩選」，搜尋留在外面（STYLE §14） */}
      <div style={{ display: compareDisplay ? 'none' : '' }}>
        <ReportToolbar
          date={
            <DateSelector
              date={inputData.dateRange}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={date => {
                setInputData(
                  produce(draft => {
                    draft.dateRange = date
                  })
                )
              }}
            />
          }
          filters={
            <>
              <div className="printGrid flex flex-wrap items-end gap-3">
                {!isDisplayTogglePerformanceButton && (
                  <div className="flex flex-col gap-1.5">
                    <span className="divText text-label text-text-secondary">業績依據</span>
                    <ReferToggleButton
                      value={inputData.displayReference}
                      onChange={value => value && setInputData({ ...inputData, displayReference: value })}
                    />
                  </div>
                )}
              </div>
              <div className="min-w-0">
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
                        style={{ color: 'rgb(var(--text))', marginRight: 8 }}
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
              </div>
            </>
          }
          actions={
            <Button
              variant="primary"
              disabled={analyzeReport.loading || !analyzeReport.data}
              onClick={handleSearch}
            >
              搜尋
            </Button>
          }
        />
      </div>
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
        // 載入中：與舊版 CircularProgress 相同時機顯示
        <div className="mt-6 flex flex-col gap-6" aria-busy="true" aria-label="載入中">
          <Skeleton className="h-[280px] w-full rounded-lg" />
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
    </Page>
  )
}

export default DesignerPerforamnceAnalyzeReport
