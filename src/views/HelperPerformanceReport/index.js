/** @jsxImportSource @emotion/react */
import {
  Container, Typography, CircularProgress, Button, Grid, TextField,
  Checkbox, Autocomplete
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import PageTitle from 'components/PageTitle'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfMonth } from 'date-fns'
import { useFetchGetHelperPerformance } from 'hooks/useFetchGetHelperPerformance'
import idx from 'idx'
import React, { useEffect, useState } from 'react'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'
import { CSVLink } from "react-csv";

const styles = {
  root: css({
    padding: theme.spacing(3),
  }),
  exportBtn: css({
    display: 'flex',
    alignItems: 'center'
  }),
}

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
      const title = merchantJobTitlePoint.data.merchantJobTitlePoint
      const array = []
      title.forEach(el => {
        array.push(el.jobTitle)
      })
      setJobTitle(title)
    }
  }, [merchantJobTitlePoint.loading])

  useEffect(() => {
    const excelData = []
    if (
      !useFetchGetHelperPerformanceData.loading &&
      !isMemberShipCardActiveData.loading &&
      useFetchGetHelperPerformanceData.data.helperPerformanceReport.length > 1
    ) {
      const data = idx(useFetchGetHelperPerformanceData, _ => _.data.helperPerformanceReport)
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
      const attributeSwitch = []
      data.map(item => {
        const obj = {}
        obj['設計名稱'] = item.userName
        item.helperPerformance.map((item2, index) => {
          attributeSwitch[index] = true
          if (attributeSwitch[index]) {
            obj[`${item2.typeName}` + '人數'] = Math.round(item2.count)
            obj[`${item2.typeName}` + '抽成元'] = Math.round(item2.priceNoPoint)
            obj[`${item2.typeName}` + '指定'] = Math.round(item2.designateCount)
            obj[`${item2.typeName}` + '抽成點'] = Math.round(item2.point)
          }
        })
        excelData.push(obj)
      })
      setExcelData(excelData)
    }
  }, [useFetchGetHelperPerformanceData.loading, isMemberShipCardActiveData.loading])
  return (
    <Page title="互助業績報表" css={styles.root}>
      <Container style={{ padding: 0 }} maxWidth={false}>
        <PageTitle title='互助業績報表' subTitle='Helper Performance Report' />
        <Grid container style={{ justifyContent: 'space-between' }}>
          <DateSelector
            date={pageSetting}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setPageSetting(value)}
            margin
          />
          <Grid item css={styles.exportBtn}>
            <CSVLink
              data={excelData}
              filename="互助業績報表.csv"
              style={{ display: 'inline' }}
            >
              <Button variant="contained" color="primary">
                報表匯出
              </Button>
            </CSVLink>
          </Grid>
        </Grid>
        <Grid item className="noprint" style={{ marginBottom: '20px' }}>
          <Autocomplete
            multiple
            options={jobTitle}
            disableCloseOnSelect
            getOptionLabel={option => option.jobTitle}
            onChange={(event, value) => setSelectTitle(value.map(d => d.id))}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  style={{ color: '#202D50', marginRight: 8 }}
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
        </Grid>
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
              <Typography variant="h3" gutterBottom component="div">
                無資料
              </Typography>
            )
          )
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}
