/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Button, CircularProgress, Grid, TextField, Checkbox,
  ToggleButton, ToggleButtonGroup, Autocomplete
} from '@mui/material'
import { endOfDay, startOfMonth } from 'date-fns'
import idx from 'idx'
import { useFetchServicesForAutoComplete } from 'hooks/useFetchServices'
import useFetchGetSingleServiceItemV2 from 'hooks/useFetchGetSingleServiceItemV2'
import useFetchSingleServiceReportExcelV2 from 'hooks/useFetchSingleServiceReportExcelV2'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import useFetchTickets from 'hooks/useFetchTickets'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import produce from 'immer'

import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />

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
    marginTop: '5px',
  })
}

const performanceEnum = [
  { label: '全店', value: 'ALL' },
  { label: '設計師', value: 'BYDESIGNER' },
  { label: '日期', value: 'BYDATE' },
]

const DesignerPerformBasic = () => {
  const [inputData, setInputData] = useState({
    dateRange: {
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime()
    },
    serviceIds: []
  })
  const [tmpService, setTmpService] = useState([])
  const [getServiceItem, serviceItemData] = useFetchGetSingleServiceItemV2()
  const [singleServiceReportExcel, singleServiceReportExcelData] = useFetchSingleServiceReportExcelV2()
  const [sort, setSort] = useState('ALL')
  const [reportData, setReportData] = useState([])
  const services = useFetchServicesForAutoComplete({})
  const ticket = useFetchTickets()

  const handleDoSearch = () => {
    getServiceItem({
      variables: {
        input: {
          dateRange: inputData.dateRange,
          serviceIds: inputData.serviceIds.map(d => d.value)
        }
      }
    })
  }

  const handleSetInputData = (key, value) => {
    setInputData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  useEffect(() => {
    if (!singleServiceReportExcelData.loading && singleServiceReportExcelData.data) {
      const url = idx(singleServiceReportExcelData, _ => _.data.singleServiceItemExcelV2)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [singleServiceReportExcelData.loading])

  useEffect(() => {
    inputData.serviceIds.length && handleDoSearch()
  }, [inputData.dateRange])

  useEffect(() => {
    if (!serviceItemData.loading && serviceItemData.data) {
      const data = serviceItemData.data.singleServiceItemV2
      setReportData(data)
    }
  }, [serviceItemData.loading, serviceItemData.data])

  useEffect(() => {
    if (!services.loading && !ticket.loading) {
      const serviceData = idx(services, _ => _.data.services.data)
      const ticketData = idx(ticket, _ => _.data.tickets)
      const tmpServiceData = []
      serviceData.map(service => {
        if (service.no.trim().length > 0) {
          tmpServiceData.push({
            label: service.no + ' - ' + service.name,
            value: service.id,
          })
        } else {
          tmpServiceData.push({
            label: service.name,
            value: service.id,
          })
        }
      })
      ticketData.map(ticket => {
        if (ticket.no.trim().length > 0) {
          tmpServiceData.push({
            label: ticket.no + ' - ' + ticket.name,
            value: ticket.id,
          })
        } else {
          tmpServiceData.push({
            label: ticket.name,
            value: ticket.id,
          })
        }
      })
      setTmpService(tmpServiceData)
    }
  }, [services.loading, ticket.loading])

  return (
    <Page css={styles.root} title="單一服務項目查詢">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='單一服務項目查詢' />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0 20px', flexWrap: 'wrap' }}>
          <Grid item >
            <DateSelector
              date={inputData.dateRange}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => handleSetInputData('dateRange', value)}
              margin
            />
          </Grid>
          <div style={{ display: 'flex', flexWrap: 'wrap', flexGrow: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <Grid
              style={{
                marginBottom: '23px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="divText">排序依據:</div>
              <ToggleButtonGroup
                value={sort}
                size="small"
                exclusive
                onChange={(event, value) => {
                  value && setSort(value)
                }}
              >
                {performanceEnum.map((data, idx) => (
                  <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                    {data.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Grid>
              <Button
                variant="contained"
                color="primary"
                disabled={singleServiceReportExcelData.loading}
                onClick={() => singleServiceReportExcel({
                  variables: {
                    input: {
                      dateRange: inputData.dateRange,
                      serviceIds: inputData.serviceIds.map(d => d.value)
                    },
                    sortBy: sort
                  }
                })}
              >報表匯出</Button>
            </Grid>
          </div>
        </div>
        <div style={{ display: 'flex', margin: '10px 0', flexWrap: 'nowrap', gap: 10, alignItems: 'center' }}>
          <div style={{ flexGrow: 1 }}>
            <Autocomplete
              freeSolo
              multiple
              options={tmpService}
              autoHighlight
              value={inputData.serviceIds}
              disableCloseOnSelect
              // disableClearable={true}
              getOptionLabel={option => option.label}
              onChange={(event, value) => handleSetInputData('serviceIds', value)}
              fullWidth
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                    icon={icon}
                    checkedIcon={checkedIcon}
                    checked={selected}
                  />
                  {option.label}
                </li>
              )}
              renderInput={params => (
                <TextField {...params} variant="outlined" label="服務項目" placeholder="服務" />
              )}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDoSearch}
          >
            搜尋
          </Button>
        </div>
        {!serviceItemData.loading ? (
          <Results
            reportData={reportData}
            inputData={inputData}
            sort={sort}
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
