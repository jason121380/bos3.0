// 門檻／抽成欄位為 Field＋Input（min=0），抽成模式 ToggleButton 改 ui/toggle-group（布林值原樣、handler 不讀參數）；類別 Tabs 改 ui/tabs（value 為字串、activationMode="manual"，onValueChange 以 (null, value) 轉接原 handler）；外框、標題、圖示按鈕改為 src/ui
import { Checkbox, FormControlLabel } from 'ui/checkbox'
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import createRakeHandlers, { checkInputEmptyAsZero } from 'views/DeductionSettingShared/createRakeHandlers'
import { renderNonSegmentedDesignation, renderNonSegmentedNonDistinguish } from './renderNonSegmentedTiers'
import { renderSegmentedDesignation, renderSegmentedNonDistinguish } from './renderSegmentedTiers'

// 欄位 handler 搬到 views/DeductionSettingShared/createRakeHandlers（與編輯頁共用）；級距列搬到 renderNonSegmentedTiers／renderSegmentedTiers；
// state、handleTabsChange、effect 與外框仍在此檔，內容不變

const isSegmented = [
  { label: '全段', value: false },
  { label: '分段', value: true },
]

function Results({ className, profitSharing, onChange, attributions, ...rest }) {
  const [tabValue, setTabValue] = useState('預設')
  const [deductionIndex, setDeductionIndex] = useState(0)

  // 欄位 handler（與其他抽成設定畫面共用，內容不變）：每次 render 以目前的值重新建立，與原本寫在元件內相同
  const rakeHandlers = createRakeHandlers({
    profitSharing,
    onChange,
    deductionIndex,
    setTabValue,
    setDeductionIndex,
    checkInput: checkInputEmptyAsZero,
  })
  const { handleDesignateChange, handleToggleButtonChange } = rakeHandlers
  const tierProps = { profitSharing, deductionIndex, ...rakeHandlers }

  const handleTabsChange = (e, value) => {
    const newProfitSharing = cloneDeep(profitSharing)

    // 如果attribute是空字串的話改成'預設'
    newProfitSharing.nonSegmented.forEach((data, index) => {
      if (data.attribute === '') {
        newProfitSharing.nonSegmented[index].attribute = '預設'
      }
    })
    if (newProfitSharing.nonSegmented.filter(d => d.attribute === value).length === 0) {
      if (profitSharing.designationUsage && !profitSharing.isSegmented) {
        newProfitSharing.nonSegmented.push({
          attribute: value,
          rakeData: {
            designate: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
            nonDesignate: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
            nonDistinguish: [],
          },
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      } else {
        newProfitSharing.nonSegmented.push({
          attribute: value,
          rakeData: {
            designate: [],
            nonDesignate: [],
            nonDistinguish: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
          },
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    } else {
      newProfitSharing.nonSegmented.forEach((d, index) => {
        if (d.attribute === value && profitSharing.designationUsage) {
          if (newProfitSharing.nonSegmented[index].rakeData.nonDistinguish.length === 0) {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
          } else {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
            onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
          }
        } else if (d.attribute === value) {
          // 不分指定（上一個條件已處理分指定；原本此處多判斷一個拼錯、恆為 undefined 的 designationUsag，結果相同）
          if (newProfitSharing.nonSegmented[index].rakeData.designate.length === 0) {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
          } else {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
            onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
          }
        }
      })
    }
    setTabValue(value)
  }

  useEffect(() => {
    profitSharing.nonSegmented.forEach((d, index) => {
      if (d.attribute === tabValue) {
        setDeductionIndex(index)
      } else if (tabValue === '預設') {
        setDeductionIndex(0)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [tabValue] 變動時執行；profitSharing.nonSegmented 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [tabValue])
  return (
    <Fragment>
      <Card {...rest}>
        <CardHeader>
          <CardTitle>抽成方式設定</CardTitle>
        </CardHeader>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="抽成設定編號" htmlFor="deduction-no">
            <Input id="deduction-no" type="text" onChange={event => onChange({ value: event.target.value, key: 'deductionNo' })} />
          </Field>
          <Field label="抽成設定名稱" htmlFor="deduction-name">
            <Input id="deduction-name" type="text" onChange={event => onChange({ value: event.target.value, key: 'deductionName' })} />
          </Field>
        </div>
        {!profitSharing.isSegmented && (
          <Tabs value={tabValue} onValueChange={value => handleTabsChange(null, value)} activationMode="manual">
            <TabsList className="px-5">
              {attributions.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex min-w-[995px] flex-col gap-3 pb-5">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="text-heading text-text">抽成模式</h3>
                <ToggleGroup size="small" value={profitSharing.isSegmented} onChange={handleToggleButtonChange} exclusive>
                  {isSegmented.map((data, idx) => (
                    <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} data-testid={`assign-designer-${data.value}`}>
                      {data.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FormControlLabel
                  control={<Checkbox color="primary" />}
                  label="分指定/不指定"
                  checked={profitSharing.designationUsage}
                  onClick={handleDesignateChange}
                />
              </div>
              {!profitSharing.designationUsage
                ? !profitSharing.isSegmented
                  ? renderNonSegmentedNonDistinguish(tierProps)
                  : renderSegmentedNonDistinguish(tierProps)
                : !profitSharing.isSegmented
                  ? renderNonSegmentedDesignation(tierProps)
                  : renderSegmentedDesignation(tierProps)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Fragment>
  )
}

Results.propTypes = {
  className: PropTypes.object,
}

export default Results
