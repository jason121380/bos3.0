import { useState, useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import Page from 'components/Page'
import { endOfDay, startOfMonth } from 'date-fns'
import { CSVLink } from "react-csv";
import useFetchGetProductLeaderBoardV2 from 'hooks/useFetchGetProductLeaderBoardV2'
import DateSelector from 'components/DateSelector'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'
import QueryFailed from 'components/QueryFailed'
import { ReportToolbar, PageHeader } from 'ui/page-header'
import ProductListTreeView from 'components/ProductListTreeView'

import Results from './Results'

const ProductLeaderBoard = () => {
  const [reportForDisplay, setReportForDisplay] = useState([])
  const [excelData, setExcelData] = useState([])
  const [inputData, setInputData] = useState({
    startDay: startOfMonth(new Date()).getTime(),
    endDay: endOfDay(new Date()).getTime(),
    productIds: [],
    types: ['SELLING']    // SELLING PICKING
  })
  const [getProductLeaderBoardV2, productLeaderBoardV2Data] = useFetchGetProductLeaderBoardV2()

  const handleSearch = () => {
    getProductLeaderBoardV2({
      variables: {
        input: inputData
      }
    })
  }

  useEffect(() => {
    if (!productLeaderBoardV2Data.loading && productLeaderBoardV2Data.data) {
      const excelData = []
      const report = productLeaderBoardV2Data.data.getProductLeaderBoardV2
      setReportForDisplay(report)
      report.forEach(data => {
        excelData.push({
          商品名稱: data.productName,
          商品代號: data.productNo,
          消費次數: data.totalCount,
          消費累計: data.totalPrice,
        })
      })
      excelData.push({
        商品名稱: '合計',
        消費次數: report.reduce((accu, curVal) => accu + curVal.totalCount, 0),
        消費累計: report.reduce((accu, curVal) => accu + curVal.totalPrice, 0),
      })
      setExcelData(excelData)
    }
  }, [productLeaderBoardV2Data.loading])

  useEffect(() => {
    handleSearch()
  }, [inputData.startDay, inputData.endDay])
  
  return (
    <Page className="ui-root" title="商品銷售排行榜">
      <div>
        <PageHeader
          title='商品銷售排行榜'
          actions={
            <>
              {excelData.length !== 0 && (
                <Button asChild variant="secondary" className="shrink-0">
                  <CSVLink
                    data={excelData}
                    filename="商品銷售排行榜.csv"
                  >
                    <Download strokeWidth={1.75} />
                    報表匯出
                  </CSVLink>
                </Button>
              )}
            </>
          }
        />
        <ReportToolbar
          date={
            <DateSelector
              date={{
                startDate: inputData.startDay,
                endDate: inputData.endDay
              }}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={({ startDate, endDate }) => setInputData({...inputData, startDay: startDate, endDay: endDate})}
            />
          }
          filters={
            <>
              {excelData.length !== 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary">類型</span>
                  <ToggleGroup
                    size="small"
                    value={inputData.types}
                    onChange={(e, v) => setInputData({...inputData, types: v})}
                  >
                    <ToggleGroupItem value='SELLING'>店販</ToggleGroupItem>
                    <ToggleGroupItem value='PICKING'>自購</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}
              <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                <ProductListTreeView
                  onValueChange={v => setInputData({...inputData, productIds: v})}
                />
              </div>
            </>
          }
          actions={
            <Button
              variant='primary'
              className="w-[100px] shrink-0"
              onClick={handleSearch}
              disabled={productLeaderBoardV2Data.loading || !productLeaderBoardV2Data.data}
            >
              搜尋
            </Button>
          }
        />
        {productLeaderBoardV2Data.error ? (
          <QueryFailed onRetry={handleSearch} />
        ) : !productLeaderBoardV2Data.loading && productLeaderBoardV2Data.data ? (
          <Results report={reportForDisplay} />
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

export default ProductLeaderBoard
