/** @jsxImportSource @emotion/react */
// 用途下拉含空字串選項（全部），Radix Select 不支援空值，保留 MUI Select
import {
  MenuItem,
  InputLabel,
  FormControl,
  Select,
} from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import { useEffect, useState } from 'react'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import AdminPageHeader from 'components/AdminPageHeader'
import { startOfMonth, format } from 'date-fns'
import useFetchProductConsumeList from 'hooks/useFetchProductConsumeList'
import useFetchGetProductPurpose from 'hooks/useFetchGetProductPurpose'
import { CSVLink } from "react-csv";
import { css } from '@emotion/react'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const styles = {
  formControl: css({
    width: '100px',
  }),
}

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
      setPurpose(data)
    }
  }, [getProductPurpose.loading])

  useEffect(() => {
    if (!productConsumeListData.loading) {
      const excelData = []
      const reportDisplay = idx(productConsumeListData, _ => _.data.productConsumeList)
      if (reportDisplay !== undefined) {
        if (value != '') {
          reportDisplay.productConsumeRecord
            .filter(d => d.purpose === value)
            .map(data => {
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
            .map(data => {
              excelData.push({
                領料日期: data.purpose,
                員工編號: data.cost,
                員工姓名: data.price,
                商品編號: data.count,
              })
            })
        } else {
          reportDisplay.productConsumeRecord.map(data => {
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
          reportDisplay.productConsumeSummary.map(data => {
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
  }, [productConsumeListData.loading, value])
  return (
    <Page className="ui-root" title="商品消耗明細">
      <div>
        <AdminPageHeader title='商品消耗明細' />
        <div className="flex flex-wrap items-baseline justify-between gap-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div>
                <MerchantSearchBar
                  values={date}
                  onFilter={values => setDate(values)}
                  outside
                  visible={['datePicker', 'employee']}
                  lastInLeaderBoard={true}
                />
              </div>
              <div>
                <FormControl variant="outlined" css={styles.formControl}>
                  <InputLabel>用途</InputLabel>
                  <Select label='用途' disabled={purpose.length === 0} onChange={event => onChange({ event, key: 'purpose' })}>
                    <MenuItem value=''>全部</MenuItem>
                    {purpose.map(data => (
                      <MenuItem key={data} value={data}>{data}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
          <div className="mb-2.5">
            <Button asChild variant="secondary">
              <CSVLink data={excelData} filename="商品消耗明細.csv">
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          </div>
        </div>
        {!productConsumeListData.loading ? (
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
