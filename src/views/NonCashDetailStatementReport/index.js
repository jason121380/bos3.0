/** @jsxImportSource @emotion/react */
// 設計師多選（Autocomplete）保留 MUI；排序切換鈕改 ui/toggle-group（handler (event, value) 原樣、`state !== null` 守衛不變）
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import Page from 'components/Page'
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
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import { Autocomplete } from 'ui/combobox'

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
    <Page className="ui-root" title="非現金明細對帳單">
      <PageHeader
        title="非現金明細對帳單"
        actions={
          <Button asChild variant="secondary">
            <CSVLink
              data={excelData}
              filename="非現金明細對帳單.csv"
            >
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        }
      />
      <Toolbar className="items-end">
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
          />
        </div>
        <div className="w-full min-w-0 sm:w-auto sm:shrink-0">
          <div className="flex flex-col items-start gap-1.5">
            <div className="divText text-label text-text-secondary">排序依序</div>
            <ToggleGroup
              size="small"
              value={orderSubmit}
              onChange={handleToggleButtonChange}
              exclusive
            >
              {orderBy.map((data, idx) => (
                <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                  {data.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </Toolbar>

      {!userOrderableList.loading ? (
        <Fragment>
          <div className="flex w-full min-w-0 flex-wrap items-end gap-3 pb-4">
            <div className="w-full min-w-0 sm:w-auto sm:flex-1">
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
            </div>
            <div className="flex w-full items-center sm:w-auto">
              <Button variant="primary" className="shrink-0" onClick={handleSearchReport}>
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
            <Skeleton className="h-96" aria-busy="true" />
          )}
        </Fragment>
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}
