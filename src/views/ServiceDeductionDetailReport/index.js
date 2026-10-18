/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
// 抽成類別的選項含 value={null}（全部），Radix Select 不支援空值，保留 MUI Select
import { Select, InputLabel, FormControl, MenuItem } from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import ServicesIncludesTicketsAutoComplete from 'components/ServicesIncludesTicketsAutoComplete'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { endOfMonth } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchServiceDedcutionDetailMultiple from 'hooks/useFetchGetUserServiceDeductionDetialMultiple'
import { css } from '@emotion/react'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

// ServicesIncludesTicketsAutoComplete 以 css={className} 套用，需傳 emotion 樣式物件
const styles = {
  field: css({
    minWidth: '180px !important'
  }),
}

// MerchantSearchBar 內部為 MUI Grid container，沿用舊版取消其寬度
const topDiv = 'flex flex-row flex-wrap items-center gap-2.5 [&_.MuiGrid-container]:!w-[unset]'

const ServiceDeductionDetailReport = () => {
  const getAttributionForRake = useFetchGetAttributionForRake()
  const [attributions, setAttributions] = useState([])
  const [inputData, setInputData] = useState({
    startDate: new Date().getTime(),
    endDate: endOfMonth(new Date()).getTime(),
    employeeId: [],
    serviceId: [],
    rakeWays: [],
  })
  const [excelData, setExcelData] = useState([])
  const serviceDedcutionDetailData = useFetchServiceDedcutionDetailMultiple({
    input: {
      dateRange: {
        startDate: inputData.startDate,
        endDate: inputData.endDate,
      },
      userId: inputData.employeeId !== '' ? inputData.employeeId : [],
      serviceIds: inputData.serviceId !== null ? inputData.serviceId : [],
      rakeWays: inputData.rakeWays,
    },
  })
  const hanldeOnChange = event => {
    if (event.target.value === null) {
      setInputData({ ...inputData, rakeWays: [] })
    } else {
      setInputData({ ...inputData, rakeWays: [event.target.value] })
    }
  }

  useEffect(() => {
    if (!getAttributionForRake.loading) {
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake)
      setAttributions(data)
    }
  }, [getAttributionForRake.loading])

  return (
    <Page className="ui-root" title="服務扣項明細表">
      <div>
        <AdminPageHeader title='服務扣項明細表' />
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className={topDiv}>
            <MerchantSearchBar
              values={inputData}
              onFilter={values => setInputData(values)}
              outside
              visible={['datePicker', 'employee']}
              lastInLeaderBoard={true}
            />
            <div className={topDiv}>
              <ServicesIncludesTicketsAutoComplete
                className={styles.field}
                label="服務名稱/代號"
                value={inputData.serviceId}
                name="service"
                onChange={value => {
                  setInputData({ ...inputData, serviceId: value ? value.id : [] })
                }}
              />
              <FormControl css={styles.field} variant="outlined">
                <InputLabel>抽成類別</InputLabel>
                <Select label='抽成類別' onChange={event => hanldeOnChange(event)}>
                  <MenuItem value={null}>全部</MenuItem>
                  {attributions.map((data, index) => (
                    <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
          <Button asChild variant="secondary">
            <CSVLink
              data={excelData}
              filename="服務扣項明細表.csv"
            >
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        </div>
        {!serviceDedcutionDetailData.loading ? (
          idx(serviceDedcutionDetailData, _ =>
            _.data.getUserServiceDeductionDetialMultiple !== null ? (
              _.data.getUserServiceDeductionDetialMultiple.length > 0 ? (
                <Results
                  userServiceDeductionDetial={_.data.getUserServiceDeductionDetialMultiple}
                  setExcelData={setExcelData}
                />
              ) : (
                <Card className="mt-3">
                  <EmptyState title="無資料" />
                </Card>
              )
            ) : (
              <Card className="mt-3">
                <EmptyState title="請選擇日期與設計師" />
              </Card>
            )
          )
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="mt-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default ServiceDeductionDetailReport
