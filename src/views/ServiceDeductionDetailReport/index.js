/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, CircularProgress, Button, Grid, Select, InputLabel,
  FormControl, MenuItem, Typography
} from '@mui/material'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import ServicesIncludesTicketsAutoComplete from 'components/ServicesIncludesTicketsAutoComplete'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { endOfMonth } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchServiceDedcutionDetailMultiple from 'hooks/useFetchGetUserServiceDeductionDetialMultiple'
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
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '284px',
  }),
  topDiv: css({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    flexDirection: 'row !important',
    '& .MuiGrid-container': {
      width: 'unset !important'
    }
  }),
  field: css({
    minWidth: '180px !important'
  }),
}

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
    <Page css={styles.root} title="服務扣項明細表">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='服務扣項明細表' subTitle='AService Deduction Detail Report' />
        <Grid style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Grid item css={styles.topDiv}>
            <MerchantSearchBar
              values={inputData}
              onFilter={values => setInputData(values)}
              outside
              visible={['datePicker', 'employee']}
              lastInLeaderBoard={true}
            />
            <Grid css={styles.topDiv} item>
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
            </Grid>
          </Grid>
          <CSVLink
            data={excelData}
            filename="服務扣項明細表.csv"
          >
            <Button variant="contained" color="primary">
              報表匯出
            </Button>
          </CSVLink>
        </Grid>
        {!serviceDedcutionDetailData.loading ? (
          idx(serviceDedcutionDetailData, _ =>
            _.data.getUserServiceDeductionDetialMultiple !== null ? (
              _.data.getUserServiceDeductionDetialMultiple.length > 0 ? (
                <Results
                  userServiceDeductionDetial={_.data.getUserServiceDeductionDetialMultiple}
                  setExcelData={setExcelData}
                />
              ) : (
                <Typography variant="h3" gutterBottom component="div" style={{ marginTop: '10px', textAlign: 'center' }}>
                  無資料
                </Typography>
              )
            ) : (
              <Typography variant="h3" gutterBottom component="div" style={{ marginTop: '10px', textAlign: 'center' }}>
                請選擇日期與設計師
              </Typography>
            )
          )
        ) : (
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default ServiceDeductionDetailReport
