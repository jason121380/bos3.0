/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Button, Grid, CircularProgress, ToggleButtonGroup,ToggleButton
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import { endOfDay, startOfMonth } from 'date-fns'
import { CSVLink } from "react-csv";
import useFetchGetProductLeaderBoardV2 from 'hooks/useFetchGetProductLeaderBoardV2'
import DateSelector from 'components/DateSelector'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import ProductListTreeView from 'components/ProductListTreeView'

import Results from './Results'

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
  exportBtn: css({
    margin: '10px 0',
  }),
}

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
    <Page css={styles.root} title="商品銷售排行榜">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='商品銷售排行榜' />
        <Grid container justifyContent="space-between" alignItems="center">
          <DateSelector
            date={{
              startDate: inputData.startDay,
              endDate: inputData.endDay
            }}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={({ startDate, endDate }) => setInputData({...inputData, startDay: startDate, endDay: endDate})}
            margin
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {excelData.length !== 0 && (
              <>
                <ToggleButtonGroup
                  style={{ height: 'fit-content' }}
                  size="small"
                  value={inputData.types}
                  onChange={(e, v) => setInputData({...inputData, types: v})}
                >
                  <ToggleButton value='SELLING'>店販</ToggleButton>
                  <ToggleButton value='PICKING'>自購</ToggleButton>
                </ToggleButtonGroup>
                <CSVLink
                  data={excelData}
                  filename="商品銷售排行榜.csv"
                >
                  <Button variant="contained" color="primary" css={styles.exportBtn}>
                    報表匯出
                  </Button>
                </CSVLink>
              </>
            )}
          </div>
        </Grid>
        <div style={{ margin: '10px 0 ', display: 'flex', gap: 10, alignItems: 'center' }}>
          <ProductListTreeView
            onValueChange={v => setInputData({...inputData, productIds: v})}
          />
          <Button
            variant='contained'
            color='primary'
            style={{ height: 'fit-content', width: 100 }}
            onClick={handleSearch}
            disabled={productLeaderBoardV2Data.loading || !productLeaderBoardV2Data.data}
          >
            搜尋
          </Button>
        </div>
        {!productLeaderBoardV2Data.loading && productLeaderBoardV2Data.data ? (
          <Results report={reportForDisplay} />
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default ProductLeaderBoard
