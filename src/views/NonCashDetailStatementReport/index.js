/** @jsxImportSource @emotion/react */
import {
  Container, TextField, Button, Checkbox, CircularProgress, Grid,
  ToggleButton, ToggleButtonGroup, Autocomplete
} from '@mui/material'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
import React, { useState, useEffect, Fragment } from 'react'
import DateSelector from 'components/DateSelector'
import { startOfDay, endOfDay, format } from 'date-fns'
import useFetchNonCashDetailStatement from 'hooks/useFetchNonCashDetailStatement'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import useFetchGetIsCustomerBonusActive from 'hooks/useFetchGetIsCustomerBonusActive'
import { CSVLink } from "react-csv";
import Results from './Results'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  disable: css({
    display: 'none',
  }),
  enable: css({
    display: 'flex',
  }),
}

const orderBy = [
  {
    value: 'DATE',
    label: '日期',
  },
  { value: 'DESIGNER', label: '設計師' },
]

export default function Employees() {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const [submitValue, setSubmitValue] = React.useState([])
  const [valueSelect, setValue] = useState([])
  const [selectDesignerDisplay, setSelectDesignerDisplay] = useState([])
  const [orderSubmit, setOrderSubmit] = useState('DATE')
  const [excelData, setExcelData] = useState([])
  const [total, setTotal] = useState()
  const [bonusDisplay, setBonusDisplay] = useState(false)
  const userOrderableList = useFetchUsersOrderableList()
  const designerAll = idx(userOrderableList, _ => _.data.getUserOrderableList)
  const customerBonusActive = useFetchGetIsCustomerBonusActive()
  const [date, setDate] = useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const nonCashDetailStatement = useFetchNonCashDetailStatement({
    input: {
      dateRange: {
        startDate: date.startDate,
        endDate: date.endDate,
      },
      orderBy: orderSubmit,
      designerId: submitValue,
    },
  })

  // 篩選設計師的data
  useEffect(() => {
    if (designerAll) {
      const designer = designerAll.map(user => ({ label: user.userName, value: user.userId }))
      setSelectDesignerDisplay(designer)
    }
  }, [designerAll])

  // excelData
  useEffect(() => {
    const excelData = []
    if (!nonCashDetailStatement.loading && !customerBonusActive.loading) {
      let otherPaySummary = []
      let thirdPartySummary = []
      const objOrderPay = {}
      const objThirdParty = {}
      let total = {}
      const summaryBonus = nonCashDetailStatement.data.nonCashDetailStatement.summary.bonusDecount
      const report = idx(nonCashDetailStatement, _ => _.data.nonCashDetailStatement)
      const bonusActive = summaryBonus !== 0 || customerBonusActive.data.getIsCustomerBonusActive
      setBonusDisplay(bonusActive)
      report.nonCashDetailStatement.map(d => {
        const obj = {}
        obj['帳單日期'] = format(d.date, 'yyyy/MM/dd')
        obj['序號'] = d.serialNumber
        obj['帳單編號'] = d.orderNo
        obj['客戶姓名'] = d.customerName
        obj['設計師代號'] = d.designerNo
        obj['設計師姓名'] = d.designerName
        d.otherPay.map(item => {
          obj[`${item.name}金額/手續費`] = item.price + '/' + Math.round(item.handlingFee)
          otherPaySummary.push({
            name: item.name,
            price: item.price,
            handlingFee: item.handlingFee,
          })
        })
        d.thirdPartTicket.map(item => {
          obj[`第三方卡券${item.name}金額/手續費`] = item.price + '/' + Math.round(item.handlingFee)
          thirdPartySummary.push({
            name: item.name,
            price: item.price,
            handlingFee: item.handlingFee,
          })
        })
        obj['入金使用金額'] = d.walletUsed
        if (bonusActive) obj['點數折抵金額'] = d.bonusDecount
        excelData.push(obj)
      })

      otherPaySummary = otherPaySummary.reduce(function (r, o) {
        const key = o.name
        if (!objOrderPay[key]) {
          objOrderPay[key] = Object.assign({}, o) // create a copy of o
          r.push(objOrderPay[key])
        } else {
          objOrderPay[key].price += o.price
          objOrderPay[key].handlingFee += o.handlingFee
        }
        return r
      }, [])

      thirdPartySummary = thirdPartySummary.reduce(function (r, o) {
        const key = o.name
        if (!objThirdParty[key]) {
          objThirdParty[key] = Object.assign({}, o) // create a copy of o
          r.push(objThirdParty[key])
        } else {
          objThirdParty[key].price += o.price
          objThirdParty[key].handlingFee += o.handlingFee
        }
        return r
      }, [])
      total = {
        otherPay: otherPaySummary,
        thirdParty: thirdPartySummary,
      }
      setTotal(total)
      const obj3 = {}
      obj3['帳單日期'] = '合計'
      total.otherPay.map(item => {
        obj3[`${item.name}金額/手續費`] = item.price + '/' + Math.round(item.handlingFee)
      })
      total.thirdParty.map(item => {
        obj3[`第三方卡券${item.name}金額/手續費`] = item.price + '/' + Math.round(item.handlingFee)
      })
      obj3['入金使用金額'] = report.summary.walletUsed
      if (bonusActive) obj3['點數折抵金額'] = report.summary.bonusDecount
      excelData.push(obj3)
      setExcelData(excelData)
    }
  }, [nonCashDetailStatement.loading, customerBonusActive.loading])

  // 選色設計師
  const handleChecked = value => {
    if (value.length > 0) {
      setValue(value)
    } else if (value.length === 0) {
      setValue([])
    }
  }

  // 按搜尋
  const handleSearchReport = () => {
    if (valueSelect.length > 0) {
      setSubmitValue(valueSelect.map(item => item.value))
    } else {
      setSubmitValue([])
    }
  }

  // 選擇排序方式
  const handleToggleButtonChange = (_event, state) => {
    state !== null && setOrderSubmit(state)
  }
  return (
    <Page css={styles.root} title="非現金明細對帳單">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='非現金明細對帳單' />
        <Grid container style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Grid item>
            <DateSelector
              date={date}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => setDate(value)}
              margin
            />
          </Grid>
          <Grid item style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ marginTop: -23 }}>
              <div className="divText">排序依序</div>
              <ToggleButtonGroup
                size="small"
                value={orderSubmit}
                onChange={handleToggleButtonChange}
                exclusive
              >
                {orderBy.map((data, idx) => (
                  <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                    {data.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          </Grid>
          <Grid item style={{ margin: 'auto 0px' }}>
            <CSVLink
              data={excelData}
              filename="非現金明細對帳單.csv"
            >
              <Button variant="contained" color="primary">
                報表匯出
              </Button>
            </CSVLink>
          </Grid>
        </Grid>

        {!userOrderableList.loading ? (
          <Fragment>
            <div style={{ display: 'flex', margin: '10px 0' }}>
              <Autocomplete
                multiple
                fullWidth
                options={selectDesignerDisplay}
                disableCloseOnSelect
                getOptionLabel={option => option.label}
                onChange={(event, value) => handleChecked(value)}
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
                  <TextField
                    {...params}
                    variant="outlined"
                    label="設計師名稱"
                    placeholder="設計師"
                  />
                )}
              />
              <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                <Button variant="contained" color="primary" onClick={handleSearchReport}>
                  搜尋
                </Button>
              </div>
            </div>

            {!nonCashDetailStatement.loading ? (
              nonCashDetailStatement !== undefined && (
                <Results
                  data={idx(nonCashDetailStatement, _ => _.data)}
                  bonusDisplay={bonusDisplay}
                  total={total}
                />
              )
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CircularProgress color="inherit" />
              </div>
            )}
          </Fragment>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" />
          </div>
        )}
      </Container>
    </Page>
  )
}
