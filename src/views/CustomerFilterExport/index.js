/** @jsxImportSource @emotion/react */
import {
  Container, InputLabel, Select, FormControl, MenuItem, TextField,
  Grid, DialogActions, Dialog, DialogContent, DialogTitle, Button,
  Typography, CircularProgress, ToggleButton, ToggleButtonGroup,
  Divider, Collapse
} from '@mui/material'
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useMediaQuery from '@mui/material/useMediaQuery'
import DeleteIcon from '@mui/icons-material/Delete'
import { useFetchCustomersWithoutSortingExcelLazy } from 'hooks/useFetchCustomersWithoutSortingExcel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
    <Page css={styles.root} title="客資篩選匯出">
      <Container maxWidth={false}>
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
        <Collapse in={showFilter}>
          <div style={{ marginBottom: '8px', backgroundColor: 'rgb(var(--background))', borderRadius: '12px', padding: '12px', border: '1px solid rgb(var(--border))' }}>
            <SearchBar
              setCustomerNoSort={setPageSetting}
              inCustomerFilterExport
              setBelong={setBelong}
              setCustomerIsCome={setCustomerIsCome}
              handleClearData={handleClearData}
              getQuery
              style={{ marginTop: 0 }}
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

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 10, flexWrap: 'wrap' }}>
              <Button variant="contained" css={styles.filterButon} endIcon={<ExpandMoreIcon />} onClick={handleClickOpen} >
                篩選最後消費週期
              </Button>
              <div style={{ display: 'flex', flexDirection: 'column', width: 'fit-content' }}>
                來店消費：
                <ToggleButtonGroup
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
                  <ToggleButton value=''>全部</ToggleButton>
                  <ToggleButton value={true}>有</ToggleButton>
                  <ToggleButton value={false}>無</ToggleButton>
                </ToggleButtonGroup>
              </div>
              {customerIsCome !== null && (
                <div style={{ flex: '1 1 250px' }}>
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
                  <Divider spacing={1}></Divider>

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
                    <Typography variant="caption">至</Typography>
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
                  <Divider spacing={1}></Divider>
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
                <DialogActions style={{ margin: '10px' }}>
                  <Button
                    startIcon={<DeleteIcon />}
                    css={styles.deleteBtn}
                    onClick={handleClearData}
                    variant="contained"
                  >
                    清除
                  </Button>
                  <Button onClick={handleClose} variant="contained" css={styles.cancelBtn}>
                    取消
                  </Button>
                  <Button
                    onClick={handleSearchDate}
                    variant="contained"
                    css={styles.submitButton}
                  >
                    確認
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </Collapse>
        {!customerList.loading ?
          idx(customerList.data, _ => (
            <Results
              className={styles.results}
              customers={_.customersWithoutSorting.customers}
              refetch={customerList.refetch}
              pageLimit={_.customersWithoutSorting.pageLimit}
              pageOffset={_.customersWithoutSorting.pageOffset}
              totalCount={_.customersWithoutSorting.totalCount}
              onPageChange={handlePageChange}
            />
          )) : <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}

export default CustomerFilterExport
