import { DialogFooter as DialogActions, Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from 'ui/dialog'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { TextField } from 'ui/text-field'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import BelongAutocomplete from 'components/BelongAutocomplete'
import { useFetchCustomersWithoutSorting } from 'hooks/useFetchCustomers'
import idx from 'idx'
import produce from 'immer'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import { DatePicker } from 'ui/date-picker'
import { ChevronDown, Trash2, ListFilter } from 'lucide-react'
import useMediaQuery from 'hooks/useMediaQuery'
import { useFetchCustomersWithoutSortingExcelLazy } from 'hooks/useFetchCustomersWithoutSortingExcel'
import { theme } from '../../theme'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import BackendExportNotice from 'components/BackendExportNotice'
import useFetchCustomerDataMarked from 'hooks/useFetchGetCustomerDataMarkedDefault'
import { isCustomerExportMaskSettingOff } from 'helper/exportCustomerMask'

import Results from './Results'
import { PageHeader } from 'ui/page-header'

let once = false

const styles = {
  formGroup: 'w-[170px] m-[10px]',
}

const selecter = [
  {
    label: '之前',
    value: 'LESSTHAN',
  },
  {
    label: '之後',
    value: 'GREATERTHAN',
  },
]

const selecterCustomer = [
  {
    label: '有',
    value: true,
  },
  {
    label: '無',
    value: false,
  },
]

function CustomerFilterExport() {
  const history = useHistory()
  const location = useLocation()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md').replace(/^@media( ?)/m, ''))
  const [timeValue, setTimeValue] = useState({
    startDate: null,
    endDate: null,
  })
  const [fromDateValue, setFromDateValue] = useState({
    baseDate: null,
    dayNumber: 0,
    toDate: 'LESSTHAN',
  })
  const [open, setOpen] = React.useState(false)
  const [isComeValue, setIsComeValue] = useState(true)
  const valid = fromDateValue.baseDate
  const [pageSetting, setPageSetting] = useState({
    keyword: '',
    preferDesigner: '',
    latestDesigner: '',
    birthday: {
      year: '',
      month: '',
      day: '',
    },
    source: '',
    pageLimit: 50,
    pageOffset: 0,
    consumptionRange: null,
    baseDateRange: null,
    customerIsCome: null,
    isUnwelcome: 'ALL',
    category: []
  })
  const [disable, setDisable] = useState([false, false])
  const [belong, setBelong] = useState([])
  const [customerIsCome, setCustomerIsCome] = useState(null)
  const [showFilter, setShowFilter] = useState(false)
  const customerList = useFetchCustomersWithoutSorting(pageSetting)
  const customerDataMarked = useFetchCustomerDataMarked()
  const exportMaskOff = isCustomerExportMaskSettingOff(customerDataMarked)
  const [getCustomersWithoutSortingExcelLazy, getCustomersWithoutSortingExcelLazyData] = useFetchCustomersWithoutSortingExcelLazy()

  const handleExcel = () => {
    if (exportMaskOff) return
    getCustomersWithoutSortingExcelLazy({
      variables: {
        input: pageSetting
      }
    })
  }

  useEffect(() => {
    if (!getCustomersWithoutSortingExcelLazyData.loading && getCustomersWithoutSortingExcelLazyData.data !== undefined) {
      const url = idx(getCustomersWithoutSortingExcelLazyData, _ => _.data.customersWithoutSortingExcel)
      url && window.open(url)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getCustomersWithoutSortingExcelLazyData.loading])

  const handlePageChange = ({ value, key }) => {
    setPageSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleStartTimeChange = newTimeValue => {
    setTimeValue({ ...timeValue, startDate: new Date(newTimeValue).getTime() })
    setDisable([false, true])
  }

  const handleEndTimeChange = newTimeValue => {
    setTimeValue({ ...timeValue, endDate: new Date(newTimeValue).getTime() })
    setDisable([false, true])
  }

  const handleFromDateChange = newTimeValue => {
    setFromDateValue({ ...fromDateValue, baseDate: new Date(newTimeValue).getTime() })
    setDisable([true, false])
  }
  const handleCustomerIsCome = e => {
    setIsComeValue(e)
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleClearData = () => {
    setPageSetting({
      ...pageSetting,
      consumptionRange: null,
      baseDateRange: null,
    })
    setTimeValue({
      startDate: null,
      endDate: null,
    })
    setFromDateValue({
      baseDate: null,
      dayNumber: 0,
      toDate: 'LESSTHAN',
    })
    setDisable([false, false])
    history.push('/management/customer-filter-export')
  }

  const handleSearchDate = () => {
    if (!fromDateValue.baseDate && (timeValue.endDate || timeValue.startDate)) {
      setPageSetting({
        ...pageSetting,
        baseDateRange: null,
        customerIsCome: isComeValue,
        consumptionRange: timeValue,
      })
    } else if (fromDateValue.baseDate && !timeValue.endDate && !timeValue.startDate) {
      setPageSetting({
        ...pageSetting,
        baseDateRange: fromDateValue,
        customerIsCome: isComeValue,
        consumptionRange: null,
      })
    } else if (!fromDateValue.baseDate && !timeValue.endDate && !timeValue.startDate) {
      setPageSetting({
        ...pageSetting,
        baseDateRange: null,
        customerIsCome: isComeValue,
        consumptionRange: null,
      })
    }
    setOpen(false)
  }

  const handleSearch = value => {
    setPageSetting(
      produce(draft => {
        draft.keyword = value
        draft.customerIsCome = customerIsCome
        draft.category = belong
      })
    )
  }

  useEffect(() => {
    const queryString = new URLSearchParams(location.search).get("pageSetting")
    if (queryString) {
      const parseData = JSON.parse(queryString)
      const { startDate = null, endDate = null } = parseData.consumptionRange ?? {};
      setPageSetting(parseData)
      setCustomerIsCome(parseData.customerIsCome)
      setBelong(parseData.category)

      if (startDate || endDate) setTimeValue({ startDate, endDate })

      parseData.baseDateRange && setFromDateValue(parseData.baseDateRange)

      if (parseData.baseDateRange) {
        setDisable([true, false])
      } else if (startDate || endDate) {
        setDisable([false, true])
      } else {
        setDisable([false, false])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在掛載時執行一次
  }, [])

  useEffect(() => {
    once && history.replace(`/management/customer-filter-export?pageSetting=${JSON.stringify(pageSetting)}`)
    if (!customerList.loading) {
      once = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [customerList.loading, history] 變動時執行；pageSetting 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [customerList.loading, history])

  return (
    <Page className="ui-root" title="客資篩選匯出">
        <PageHeader
          title='客資篩選匯出'
          actions={
            <>
              <Button
                variant="secondary"
                aria-pressed={!!showFilter}
                onClick={() => setShowFilter(!showFilter)}
                className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
              >
                <ListFilter strokeWidth={1.75} />
                篩選
              </Button>
              <Button variant="primary" onClick={handleExcel} disabled={getCustomersWithoutSortingExcelLazyData.loading || exportMaskOff}>
                {'報表匯出'}
              </Button>
            </>
          }
        />
        <BackendExportNotice settingOff={exportMaskOff} />
        {/* 以 hidden 收合（取代 MUI Collapse）：SearchBar 內有非受控輸入，保持掛載，收合後內容與舊版一樣保留 */}
        <div hidden={!showFilter}>
          <Card className="mb-6 p-4">
            <SearchBar
              setCustomerNoSort={setPageSetting}
              inCustomerFilterExport
              setBelong={setBelong}
              setCustomerIsCome={setCustomerIsCome}
              handleClearData={handleClearData}
              getQuery
              onSearchV2={event =>
                handleSearch(event)
              }
              onDesignerV2={event =>
                handlePageChange({
                  key: 'preferDesigner',
                  value: event.userId,
                })
              }
              onDesignerV3={event =>
                handlePageChange({
                  key: 'latestDesigner',
                  value: event.userId,
                })
              }
              onBirthdayStart={event =>
                handlePageChange({
                  key: 'birthday',
                  value: event,
                })
              }
              onCustomerSource={event => {
                handlePageChange({
                  key: 'source',
                  value: event.props.value,
                })
              }}
              onIsUnwelcome={event => {
                handlePageChange({
                  key: 'isUnwelcome',
                  value: event.target.value,
                })
              }}
            />

            <div className="mt-3 flex flex-wrap items-end gap-2.5">
              <Button variant="secondary" className="shrink-0" onClick={handleClickOpen} >
                篩選最後消費週期
                <ChevronDown strokeWidth={1.75} />
              </Button>
              <div className="flex w-fit flex-col gap-1 text-label text-text-secondary">
                來店消費：
                <ToggleGroup
                  size='small'
                  exclusive
                  value={customerIsCome === null ? '' : customerIsCome}
                  onChange={(e, v) => {
                    setCustomerIsCome(v === '' ? null : v)
                    if (v === '') {
                      setBelong([])
                    }
                  }}
                >
                  <ToggleGroupItem value=''>全部</ToggleGroupItem>
                  <ToggleGroupItem value={true}>有</ToggleGroupItem>
                  <ToggleGroupItem value={false}>無</ToggleGroupItem>
                </ToggleGroup>
              </div>
              {customerIsCome !== null && (
                <div className="flex-[1_1_250px]">
                  <BelongAutocomplete
                    fetchData
                    value={belong}
                    onChange={v => setBelong(v)}
                  />
                </div>
              )}
              <Dialog open={open} onOpenChange={o => { if (!o) handleClose() }}>
                {/* 保留原 600px；原 md 以下全螢幕。 */}
                <DialogContent hideClose
          onOpenAutoFocus={event => {
            // 沿用舊 Modal：保留已有欄位焦點，否則聚焦面板，避免手機自動叫出鍵盤。
            event.preventDefault()
            if (!event.target.contains(document.activeElement)) event.target.focus()
          }} aria-describedby={undefined} className={fullScreen ? "!inset-0 !h-[100dvh] !max-h-[100dvh] !w-full !max-w-none !translate-x-0 !translate-y-0 !rounded-none overflow-hidden" : "!max-w-[600px] overflow-hidden"}>
                <DialogHeader><DialogTitle>更多篩選</DialogTitle></DialogHeader>
                <DialogBody>
                  <div
                    className={styles.formGroup}
                    style={{
                      margin: '20px auto',
                    }}
                  >
                    <NativeSelect
                      onChange={event => {
                        handleCustomerIsCome(event.target.value)
                      }}
                      value={isComeValue}
                      displayEmpty={false}
                      placeholder="請選擇…"
                      label="來店之顧客"
                    >
                      {selecterCustomer.map((data, index) => (
                        <NativeSelectOption key={index} value={data.value}>{data.label}</NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="h-px bg-border" />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: '20px 0px',
                    }}
                  >
                    <div className={styles.formGroup}>
                      <DatePicker
                        disabled={disable[0]}
                        label="最後消費開始日期"
                        format="yyyy/MM/dd"
                        value={timeValue.startDate}
                        onChange={handleStartTimeChange}
                      />
                    </div>
                    <span className="text-caption text-text-secondary">至</span>
                    <div className={styles.formGroup}>
                      <DatePicker
                        disabled={disable[0]}
                        label="最後消費結束日期"
                        format="yyyy/MM/dd"
                        value={timeValue.endDate}
                        onChange={handleEndTimeChange}
                      />
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      margin: '20px 0px',
                    }}
                  >
                    <div className={styles.formGroup}>
                      <DatePicker
                        disabled={disable[1]}
                        label="基準日期"
                        format="yyyy/MM/dd"
                        value={fromDateValue.baseDate}
                        onChange={handleFromDateChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <NativeSelect
                        disabled={disable[1] || !valid}
                        onChange={event => {
                          setFromDateValue({
                            ...fromDateValue,
                            toDate: event.target.value,
                          })
                        }}
                        value={fromDateValue.toDate}
                        displayEmpty={false}
                        placeholder="請選擇…"
                        label="之前/之後"
                      >
                        {selecter.map((data, index) => (
                          <NativeSelectOption key={index} value={data.value}>{data.label}</NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>
                    <div className={styles.formGroup}>
                      <TextField
                        disabled={disable[1] || !valid}
                        type="number"
                        variant="outlined"
                        label="天數"
                        name="dayNumber"
                        value={fromDateValue.dayNumber}
                        onChange={event => {
                          setFromDateValue({
                            ...fromDateValue,
                            dayNumber: parseInt(event.target.value, 10),
                          })
                        }}
                        onWheel={() => document.activeElement.blur()}
                      />
                    </div>
                  </div>
                </DialogBody>
                <DialogActions className="ui-root gap-2" style={{ margin: '10px' }}>
                  <Button
                    variant="ghost"
                    className="mr-auto text-danger hover:bg-danger/8"
                    onClick={handleClearData}
                  >
                    <Trash2 strokeWidth={1.75} />
                    清除
                  </Button>
                  <Button onClick={handleClose} variant="secondary">
                    取消
                  </Button>
                  <Button
                    onClick={handleSearchDate}
                    variant="primary"
                  >
                    確認
                  </Button>
                </DialogActions>
              </DialogContent></Dialog>
            </div>
          </Card>
        </div>
        {customerList.error ? (
          <QueryFailed onRetry={() => customerList.refetch()} />
        ) : !customerList.loading ?
          idx(customerList.data, _ => (
            <Results
              customers={_.customersWithoutSorting.customers}
              refetch={customerList.refetch}
              pageLimit={_.customersWithoutSorting.pageLimit}
              pageOffset={_.customersWithoutSorting.pageOffset}
              totalCount={_.customersWithoutSorting.totalCount}
              onPageChange={handlePageChange}
            />
          )) : <div className="flex flex-col gap-3" aria-busy="true" aria-label="載入中"><Skeleton className="h-[320px] w-full rounded-lg" /></div>
        }
    </Page>
  )
}

export default CustomerFilterExport
