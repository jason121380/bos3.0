import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import { Field, Input } from 'ui/input'
import createRakeHandlers, { checkInputEmptyAsZero } from 'views/DeductionSettingShared/createRakeHandlers'
import { renderNonSegmentedDesignation, renderNonSegmentedNonDistinguish } from './renderNonSegmentedTiers'
import { renderSegmentedDesignation, renderSegmentedNonDistinguish } from './renderSegmentedTiers'

// 欄位 handler 搬到 views/DeductionSettingShared/createRakeHandlers（與新增頁共用）；級距列搬到 renderNonSegmentedTiers／renderSegmentedTiers；
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
      if (data.attribute === '' || data.attribute === undefined) {
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
      }
    })
  }, [tabValue, profitSharing])
  return (
    <Fragment>
      <Card {...rest}>
        <CardHeader>
          <CardTitle>抽成方式設定</CardTitle>
        </CardHeader>
        <div className="grid gap-4 px-5 pb-4 pt-4">
          <Field label="抽成設定編號">
            <Input type="text" value={profitSharing.deductionNo} onChange={event => onChange({ value: event.target.value, key: 'deductionNo' })} />
          </Field>
          <Field label="抽成設定名稱">
            <Input
              type="text"
              value={profitSharing.deductionName}
              onChange={event => onChange({ value: event.target.value, key: 'deductionName' })}
            />
          </Field>
        </div>
        {!profitSharing.isSegmented && (
          <Tabs value={tabValue} onValueChange={value => handleTabsChange(null, value)} activationMode="manual">
            <TabsList className="px-3">
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
            <div className="min-w-[995px] pb-5">
              <div className="flex flex-wrap items-center">
                <h3 className="my-4 text-heading text-text">抽成模式</h3>
                <ToggleGroup size="small" className="!ml-5" value={profitSharing.isSegmented} onChange={handleToggleButtonChange} exclusive>
                  {isSegmented.map((data, idx) => (
                    <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} data-testid={`assign-designer-${data.value}`}>
                      {data.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FormControlLabel
                  className="!ml-1"
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
