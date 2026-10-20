/** @jsxImportSource @emotion/react */
// 「更多篩選」保留 MUI Dialog：內含 MUI DatePicker / Select（Radix Dialog 會擋住其彈出層）
import { DialogActions, Dialog, DialogContent, DialogTitle } from 'ui/modal-compat'
import { InputLabel, Select, FormControl, MenuItem } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import Page from 'components/Page'
import SearchBar from 'components/SearchBar'
import AdminPageHeader from 'components/AdminPageHeader'
import PageTitle from 'components/PageTitle'
import BelongAutocomplete from 'components/BelongAutocomplete'
import { useFetchCustomersWithoutSorting } from 'hooks/useFetchCustomers'
import idx from 'idx'
import produce from 'immer'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router'
import { DatePicker } from 'ui/date-picker'
import { ChevronDown, Trash2 } from 'lucide-react'
import { useMediaQuery } from 'ui/misc-compat'
import { useFetchCustomersWithoutSortingExcelLazy } from 'hooks/useFetchCustomersWithoutSortingExcel'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

let once = false

const styles = {
  root: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  }),
  results: css({
    marginTop: theme.spacing(0.5),
  }),
  formGroup: css({
    width: '170px',
    margin: '10px',
  }),
  cancelBtn: css({
    backgroundColor: '#d40202',
    marginLeft: theme.spacing(2),
    color: 'white',
    '&:hover': {
      backgroundColor: '#bd0101',
      color: 'white',
    }
  }),
  submitButton: css({
    marginLeft: theme.spacing(2),
    backgroundColor: '#9ad6f3',
    '&:hover': {
      backgroundColor: '#01a2ef',
    }
  }),
  filterButon: css({
    color: "white",
    backgroundColor: '#08424c !important',
    flexShrink: 0,
    '&:hover': {
      color: "white",
      backgroundColor: '#02181b !important',
    }
  })
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
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
  const [getCustomersWithoutSortingExcelLazy, getCustomersWithoutSortingExcelLazyData] = useFetchCustomersWithoutSortingExcelLazy()

  const handleExcel = () => {
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
        draft.keyword = value,
          draft.customerIsCome = customerIsCome,
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
  }, [])

  useEffect(() => {
    once && history.replace(`/management/customer-filter-export?pageSetting=${JSON.stringify(pageSetting)}`)
    if (!customerList.loading) {
      once = true
    }
  }, [customerList.loading])

  return (
    <Page className="ui-root" title="客資篩選匯出">
        <AdminPageHeader
          title='客資篩選匯出'
          showFilter={showFilter}
          onFilterClick={() => setShowFilter(!showFilter)}
          primaryAction={{
            label: '報表匯出',
            onClick: handleExcel,
            disabled: getCustomersWithoutSortingExcelLazyData.loading
          }}
        />
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
              <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>
                <DialogTitle>更多篩選</DialogTitle>
                <DialogContent>
                  <div
                    css={styles.formGroup}
                    style={{
                      margin: '20px auto',
                    }}
                  >
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>來店之顧客</InputLabel>
                      <Select
                        label='來店之顧客'
                        onChange={event => {
                          handleCustomerIsCome(event.target.value)
                        }}
                        value={isComeValue}
                      >
                        {selecterCustomer.map((data, index) => (
                          <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                    <div css={styles.formGroup}>
                      <DatePicker
                        disabled={disable[0]}
                        label="最後消費開始日期"
                        format="yyyy/MM/dd"
                        value={timeValue.startDate}
                        onChange={handleStartTimeChange}
                      />
                    </div>
                    <span className="text-caption text-text-secondary">至</span>
                    <div css={styles.formGroup}>
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
                    <div css={styles.formGroup}>
                      <DatePicker
                        disabled={disable[1]}
                        label="基準日期"
                        format="yyyy/MM/dd"
                        value={fromDateValue.baseDate}
                        onChange={handleFromDateChange}
                      />
                    </div>
                    <div css={styles.formGroup}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel>之前/之後</InputLabel>
                        <Select
                          disabled={disable[1] || !valid}
                          label='之前/之後'
                          onChange={event => {
                            setFromDateValue({
                              ...fromDateValue,
                              toDate: event.target.value,
                            })
                          }}
                          value={fromDateValue.toDate}
                        >
                          {selecter.map((data, index) => (
                            <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    <div css={styles.formGroup}>
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
                            dayNumber: parseInt(event.target.value),
                          })
                        }}
                        onWheel={() => document.activeElement.blur()}
                      />
                    </div>
                  </div>
                </DialogContent>
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
              </Dialog>
            </div>
          </Card>
        </div>
        {!customerList.loading ?
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
