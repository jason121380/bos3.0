// 用途下拉含空字串選項（全部），Radix Select 不支援空值，使用 ui/native-select NativeSelect
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import Page from 'components/Page'
import idx from 'idx'
import { useEffect, useState } from 'react'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { startOfMonth, format } from 'date-fns'
import useFetchProductConsumeList from 'hooks/useFetchProductConsumeList'
import useFetchGetProductPurpose from 'hooks/useFetchGetProductPurpose'
import { CSVLink } from "react-csv";
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

export default function Employees() {
  const [excelData, setExcelData] = useState([])
  const [value, setValue] = useState('')
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
    employeeId: null,
  })
  const getProductPurpose = useFetchGetProductPurpose()
  const productConsumeListData = useFetchProductConsumeList({
    dateRange: {
      startDate: date.startDate,
      endDate: date.endDate,
    },
    designerId:
      date.employeeId !== null ? (date.employeeId.length > 0 ? date.employeeId : null) : null,
    purpose: [],
  })
  const [purpose, setPurpose] = useState([])

  const onChange = event => {
    var tmp = idx(event, _ => _.event.target.value)
    setValue(tmp)
  }

  useEffect(() => {
    if (!getProductPurpose.loading) {
      const data = idx(getProductPurpose, _ => _.data.getProductPurpose)
      setPurpose(data || [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getProductPurpose.loading])

  useEffect(() => {
    if (!productConsumeListData.loading) {
      const excelData = []
      const reportDisplay = idx(productConsumeListData, _ => _.data.productConsumeList)
      if (reportDisplay !== undefined) {
        if (value !== '') {
          reportDisplay.productConsumeRecord
            .filter(d => d.purpose === value)
            .forEach(data => {
              excelData.push({
                領料日期: format(data.date, 'yyyy/MM/dd'),
                員工編號: data.designerNo,
                員工姓名: data.designerName,
                商品編號: data.productNo,
                商品名稱: data.productName,
                數量: data.count,
                單位: data.unit,
                成本: data.unitCost,
                單價: data.unitPrice,
                小計: data.subTotal,
                用途: data.purpose,
              })
            })
          excelData.push({
            領料日期: '',
          })
          excelData.push({
            領料日期: '',
            員工編號: '成本',
            員工姓名: '金額',
            商品編號: '數量',
          })
          reportDisplay.productConsumeSummary
            .filter(d => d.purpose === value)
            .forEach(data => {
              excelData.push({
                領料日期: data.purpose,
                員工編號: data.cost,
                員工姓名: data.price,
                商品編號: data.count,
              })
            })
        } else {
          reportDisplay.productConsumeRecord.forEach(data => {
            excelData.push({
              領料日期: format(data.date, 'yyyy/MM/dd'),
              員工編號: data.designerNo,
              員工姓名: data.designerName,
              商品編號: data.productNo,
              商品名稱: data.productName,
              數量: data.count,
              單位: data.unit,
              成本: data.unitCost,
              單價: data.unitPrice,
              小計: data.subTotal,
              用途: data.purpose,
            })
          })
          excelData.push({
            領料日期: '',
          })
          excelData.push({
            領料日期: '',
            員工編號: '成本',
            員工姓名: '金額',
            商品編號: '數量',
          })
          reportDisplay.productConsumeSummary.forEach(data => {
            excelData.push({
              領料日期: data.purpose,
              員工編號: data.cost,
              員工姓名: data.price,
              商品編號: data.count,
            })
          })
        }
      }
      setExcelData(excelData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [productConsumeListData.loading, value])
  return (
    <Page className="ui-root" title="商品消耗明細">
      <div>
        <PageHeader title='商品消耗明細'>
          <Button asChild variant="secondary">
            <CSVLink data={excelData} filename="商品消耗明細.csv">
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        </PageHeader>
        {/* 日期留在篩選列；其餘條件收進「篩選」（STYLE §14）。MerchantSearchBar 拆兩個實例共用同一份 values（同帳單列表），收合區的那個不讀網址日期 */}
        <ReportToolbar
          date={
            <MerchantSearchBar
              values={date}
              onFilter={values => setDate(values)}
              outside
              visible={['datePicker']}
              lastInLeaderBoard={true}
              uiDateField
            />
          }
          filters={
            <div className="flex flex-wrap items-center gap-2.5">
              <div>
                <MerchantSearchBar
                  values={date}
                  onFilter={values => setDate(values)}
                  outside
                  stopGetQueryString={true}
                  visible={['employee']}
                  lastInLeaderBoard={true}
                  uiDateField
                />
              </div>
              <div>
                <NativeSelect disabled={purpose.length === 0} onChange={event => onChange({ event, key: 'purpose' })} displayEmpty={false} placeholder="請選擇…" label="用途" fullWidth={false} className="min-w-[120px] align-top w-[100px]">
                  <NativeSelectOption value=''>全部</NativeSelectOption>
                  {purpose.map(data => (
                    <NativeSelectOption key={data} value={data}>{data}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
          }
        />
        {productConsumeListData.error ? (
          <QueryFailed onRetry={() => productConsumeListData.refetch()} />
        ) : !productConsumeListData.loading ? (
          <Results
            value={value != null ? value : ''}
            productConsumeListReport={idx(productConsumeListData, _ => _.data.productConsumeList)}
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
