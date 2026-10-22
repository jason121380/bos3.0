// 人員類別多選（Autocomplete）保留 MUI
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchGetHelperPerformance } from 'hooks/useFetchGetHelperPerformance'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import React, { useEffect, useState } from 'react'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { EmptyState } from 'ui/empty-state'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { CSVLink } from "react-csv";
import { Autocomplete } from 'ui/combobox'

export default function HelperPerformance() {
  const [excelData, setExcelData] = useState([])

  const [pageSetting, setPageSetting] = React.useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const [jobTitle, setJobTitle] = useState([])
  const [selectTitle, setSelectTitle] = useState([])
  const useFetchGetHelperPerformanceData = useFetchGetHelperPerformance({
    input: {
      startDate: pageSetting.startDate,
      endDate: pageSetting.endDate,
    },
    jobTitle: selectTitle
  })
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()

  useEffect(() => {
    if (!merchantJobTitlePoint.loading) {
      // 查詢失敗（data 為 undefined）時沒有可選的人員類別，不讓整頁拋錯
      setJobTitle(idx(merchantJobTitlePoint, _ => _.data.merchantJobTitlePoint) || [])
    }
  }, [merchantJobTitlePoint.loading])

  useEffect(() => {
    const excelData = []
    if (useFetchGetHelperPerformanceData.loading || isMemberShipCardActiveData.loading) return
    // 查詢失敗（data 為 undefined）時當成沒有資料；沒有人員資料（只有合計或空）時清空匯出，不留著上一個區間的資料
    const report = idx(useFetchGetHelperPerformanceData, _ => _.data.helperPerformanceReport) || []
    if (report.length <= 1) {
      setExcelData([])
      return
    }
    // 複製：下面會移除會員卡欄（查詢結果唯讀；表格另在 Results 依 membershipDisplay 篩掉）
    const data = cloneDeep(report)
    const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
    const membershipTotal = data[data.length - 1].helperPerformance.find(d => d.typeName === '會員卡')
    const showMembership = membershipTotal ? (
      membershipTotal.count +
      membershipTotal.designateCount +
      membershipTotal.point +
      membershipTotal.priceNoPoint
    ) !== 0 : false
    const memberShipCardActive = (showMembership || isMemberShipCardActive)

    setMembershipDisplay(memberShipCardActive)
    if (!memberShipCardActive) {
      data.forEach(d => {
        d.helperPerformance.forEach((a, index) => {
          if (a.typeName === '會員卡') {
            d.helperPerformance.splice(index, 1)
          }
        })
      })
    }
    data.forEach(item => {
      const obj = {}
      obj['設計名稱'] = item.userName
      item.helperPerformance.forEach(item2 => {
        obj[`${item2.typeName}` + '人數'] = Math.round(item2.count)
        obj[`${item2.typeName}` + '抽成元'] = Math.round(item2.priceNoPoint)
        obj[`${item2.typeName}` + '指定'] = Math.round(item2.designateCount)
        obj[`${item2.typeName}` + '抽成點'] = Math.round(item2.point)
      })
      excelData.push(obj)
    })
    setExcelData(excelData)
  }, [useFetchGetHelperPerformanceData.loading, isMemberShipCardActiveData.loading])
  return (
    <Page title="互助業績報表" className="ui-root">
      <PageHeader
        title="互助業績報表"
        actions={
          <Button asChild variant="secondary">
            <CSVLink
              data={excelData}
              filename="互助業績報表.csv"
            >
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        }
      />
      <Toolbar>
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
          <DateSelector
            date={pageSetting}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setPageSetting(value)}
          />
        </div>
      </Toolbar>
      <div className="noprint pb-4">
        <Autocomplete
          multiple
          options={jobTitle}
          disableCloseOnSelect
          getOptionLabel={option => option.jobTitle}
          onChange={(event, value) => setSelectTitle(value.map(d => d.id))}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                icon={icon}
                checkedIcon={checkedIcon}
                checked={selected}
              />
              {option.jobTitle}
            </li>
          )}
          renderInput={params => (
            <TextField {...params} variant="outlined" label="人員類別" placeholder="人員名稱" />
          )}
        />
      </div>
      {!useFetchGetHelperPerformanceData.loading ? (
        idx(useFetchGetHelperPerformanceData, _ =>
          _.data.helperPerformanceReport.length > 0 ? (
            <Results
              membershipDisplay={membershipDisplay}
              helperPerformanceData={idx(
                useFetchGetHelperPerformanceData,
                _ => _.data.helperPerformanceReport
              )}
            />
          ) : (
            <EmptyState title="無資料" />
          )
        )
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}
