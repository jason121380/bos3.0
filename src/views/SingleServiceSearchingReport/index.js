import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { useState, useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { endOfDay, startOfMonth } from 'date-fns'
import idx from 'idx'
import { useFetchServicesForAutoComplete } from 'hooks/useFetchServices'
import useFetchGetSingleServiceItemV2 from 'hooks/useFetchGetSingleServiceItemV2'
import useFetchSingleServiceReportExcelV2 from 'hooks/useFetchSingleServiceReportExcelV2'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import useFetchTickets from 'hooks/useFetchTickets'
import produce from 'immer'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'
import { ReportToolbar } from 'ui/page-header'

import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import AdminPageHeader from 'components/AdminPageHeader'
import Results from './Results'
import { Autocomplete } from 'ui/combobox'

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
      serviceData.forEach(service => {
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
      ticketData.forEach(ticket => {
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
        <AdminPageHeader title='單一服務項目查詢'>
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
        </AdminPageHeader>
        <ReportToolbar
          date={
            <DateSelector
              date={inputData.dateRange}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => handleSetInputData('dateRange', value)}
            />
          }
          filters={
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary">排序依據</span>
                  <ToggleGroup
                    value={sort}
                    size="small"
                    exclusive
                    onChange={(event, value) => {
                      value && setSort(value)
                    }}
                  >
                    {performanceEnum.map((data, idx) => (
                      <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                        {data.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
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
            </>
          }
          actions={
            <Button
              variant="primary"
              onClick={handleDoSearch}
              className="w-[100px] shrink-0"
            >
              搜尋
            </Button>
          }
        />
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
