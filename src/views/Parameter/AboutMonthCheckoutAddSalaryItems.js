/** @jsxImportSource @emotion/react */
import { CheckboxField } from 'ui/checkbox'
import { Field } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
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
            <CheckboxField
              disabled={!inputEnable}
              css={styles.isUsing}
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
          <Field label='薪資條列印間距'>
            <NativeSelect
              disabled={!inputEnable}
              fullWidth={false}
              css={styles.field}
              value={checkoutAndSalaryItem.employeePayslipPrintStyle}
              onChange={e => setCheckoutAndSalaryItem({...checkoutAndSalaryItem, employeePayslipPrintStyle: e.target.value})}
            >
              <NativeSelectOption value='SMALL'>小</NativeSelectOption>
              <NativeSelectOption value='MEDIUM'>中</NativeSelectOption>
              <NativeSelectOption value='LARGE'>大</NativeSelectOption>
            </NativeSelect>
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutMonthCheckoutAddSalaryItems)
