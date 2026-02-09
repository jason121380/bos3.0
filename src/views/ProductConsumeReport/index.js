/** @jsxImportSource @emotion/react */
import {
  Container,
  Grid,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Button,
  CircularProgress,
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
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
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
    <Page css={styles.root} title="商品消耗明細">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='商品消耗明細' />
        <Grid container style={{ gap: 10 }} alignItems="baseline" justifyContent="space-between">
          <Grid item>
            <Grid container alignItems="center" style={{ gap: 10 }}>
              <Grid item>
                <MerchantSearchBar
                  values={date}
                  onFilter={values => setDate(values)}
                  outside
                  visible={['datePicker', 'employee']}
                  lastInLeaderBoard={true}
                />
              </Grid>
              <Grid item>
                <FormControl variant="outlined" css={styles.formControl}>
                  <InputLabel>用途</InputLabel>
                  <Select label='用途' disabled={purpose.length === 0} onChange={event => onChange({ event, key: 'purpose' })}>
                    <MenuItem value=''>全部</MenuItem>
                    {purpose.map(data => (
                      <MenuItem key={data} value={data}>{data}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ marginBottom: 10 }}>
            <CSVLink data={excelData} filename="商品消耗明細.csv">
              <Button variant="contained" color="primary">
                報表匯出
              </Button>
            </CSVLink>
          </Grid>
        </Grid>
        {!productConsumeListData.loading ? (
          <Results
            className={styles.results}
            value={value != null ? value : ''}
            productConsumeListReport={idx(productConsumeListData, _ => _.data.productConsumeList)}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" />
          </div>
        )}
      </Container>
    </Page>
  )
}
