import { useState, useEffect } from 'react'
import {
  TextField, Checkbox,
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
import produce from 'immer'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'

import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />


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
    <Page className="ui-root" title="單一服務項目查詢">
      <div>
        <AdminPageHeader title='單一服務項目查詢' />
        <div className="flex flex-wrap items-center gap-x-5">
          <div>
            <DateSelector
              date={inputData.dateRange}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => handleSetInputData('dateRange', value)}
              margin
            />
          </div>
          <div className="flex flex-grow flex-wrap items-center justify-between">
            <div className="mb-[23px] flex flex-col">
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
            </div>
            <div>
              <Button
                variant="secondary"
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
              ><Download strokeWidth={1.75} />報表匯出</Button>
            </div>
          </div>
        </div>
        <div className="my-2.5 flex flex-nowrap items-center gap-2.5">
          <div className="min-w-0 flex-grow">
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
            variant="primary"
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
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default DesignerPerformBasic
