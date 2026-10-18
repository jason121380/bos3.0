/** @jsxImportSource @emotion/react */
import { CheckboxField } from 'ui/checkbox'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import { cloneDeep } from 'lodash'

import styles from './styles/OrderWithoutCustomerDefaultSetting'

const designerNameForReportTypeArr = [
  {label: '名字', value: 'NAME'},
  {label: '暱稱', value: 'NICKNAME'},
  {label: '代號', value: 'NO'},
]

const settingArr = [
  {label: '日報表顯示「金額」欄位 ', key: 'isPriceDisplayOnDailyReport'},
  {label: '日報表使用最佳化列印模式', key: 'isOptimizationPrintModeOn'},
  {label: '日報表項目名稱改以其類別顯示', key: 'isServiceNameDisplayByCategory'},
  {label: '設計師日報表顯示互助獲得金額部分', key: 'isDisplayHelperRetrieveInDailyReport'},
  {label: '日報表當日與累積金額皆為0則該欄位不出現(店販特殊抽互助使用除外)', key: 'isZeroValueHiddenOnDailyReport'},
  {label: '顯示日報表點數換算金額', key: 'isHelperPointPriceDisplay'},
  {label: '設計師日報表業績點數四捨五入', key: 'isUsingMathRoundInDesignerDailyReport'},
  {label: '店家日報表非現金入金合併顯示', key: 'isNoCashWalletGroupedInMDR'}
]

function AboutPriceDisplayOnDailyReport({
  className,
  aboutReport,
  setAboutReport,
  inputEnable,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>日報表設定</CardTitle>
      </CardHeader>
      <CardContent>
        {settingArr.map(d => (
          <div css={styles.serviceInputGroup} key={d.label}>
            <CheckboxField
              disabled={!inputEnable}
              css={styles.isUsing}
              label={d.label}
              checked={aboutReport[d.key]}
              onChange={() => {
                const newData = cloneDeep(aboutReport)
                newData[d.key] = !newData[d.key]
                setAboutReport(newData)
              }}
            />
          </div>
        ))}
        <div css={styles.serviceInputGroup}>
          <NativeSelect
            disabled={!inputEnable}
            fullWidth={false}
            css={styles.field}
            label='日報表設計師名稱顯示'
            value={aboutReport.designerNameForReportType}
            onChange={e => setAboutReport({...aboutReport, designerNameForReportType: e.target.value})}
          >
            {designerNameForReportTypeArr.map((data, idx) => (
              <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                {data.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutPriceDisplayOnDailyReport)
