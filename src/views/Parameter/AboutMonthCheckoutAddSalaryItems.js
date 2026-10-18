/** @jsxImportSource @emotion/react */
import {
  FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import { cloneDeep } from 'lodash'

import styles from './styles/OrderWithoutCustomerDefaultSetting'

const settingArr = [
  {label: '月結時自動結算加扣項設定', key: 'isSalaryItemAutoSetWhileMonthlyCheckout'},
  {label: '互助獲得自動帶入薪資加扣項', key: 'isHelperRetrieveAutoSetForMonthlyCheckout'},
  {label: '薪資條顯示虛業績及扣業績部分金額', key: 'isDisplayFakePerformanceInSalaryReport'},
  {label: '薪資維護頁扣項拆分借支欄位', key: 'isBorrowDisplayInSalaryOverview'},
  {label: '薪資條隱藏列印明細', key: 'isPrintDateHiddenForPayslip'},
  {label: '薪資條顯示表頭資訊', key: 'isPrintDetailDisplayOnSalaryReport'},
  {label: '薪資條顯示上班天數', key: 'isEPWDDisplay'},
  {label: '薪資條列印優化模式', key: 'isPayslipOptimizationPrintModeOn'},
  {label: '薪資表顯示出勤統計', key: 'isAttendanceStatisticsDisplayOnUserSalary'},
]

function AboutMonthCheckoutAddSalaryItems({
  className,
  inputEnable,
  checkoutAndSalaryItem,
  setCheckoutAndSalaryItem
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>薪資及月結設定</CardTitle>
      </CardHeader>
      <CardContent>
        {settingArr.map(d => (
          <div css={styles.serviceInputGroup} key={d.label}>
            <FormControlLabel
              disabled={!inputEnable}
              css={styles.isUsing}
              control={<Checkbox color="primary" />}
              label={d.label}
              checked={checkoutAndSalaryItem[d.key]}
              onChange={() => {
                const newData = cloneDeep(checkoutAndSalaryItem)
                newData[d.key] = !newData[d.key]
                setCheckoutAndSalaryItem(newData)
              }}
            />
          </div>
        ))}
        <div css={styles.serviceInputGroup}>
          <FormControl disabled={!inputEnable} variant="outlined" css={styles.field}>
            <InputLabel>薪資條列印間距</InputLabel>
            <Select
              label='薪資條列印間距'
              value={checkoutAndSalaryItem.employeePayslipPrintStyle}
              onChange={e => setCheckoutAndSalaryItem({...checkoutAndSalaryItem, employeePayslipPrintStyle: e.target.value})}
            >
              <MenuItem value='SMALL'>小</MenuItem>
              <MenuItem value='MEDIUM'>中</MenuItem>
              <MenuItem value='LARGE'>大</MenuItem>
            </Select>
          </FormControl>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutMonthCheckoutAddSalaryItems)
