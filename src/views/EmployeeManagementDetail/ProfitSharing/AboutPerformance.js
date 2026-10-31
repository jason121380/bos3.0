// 大型頁策略：抽成級距表單（TextField）使用正式 ui 元件、排版改 Tailwind flex；Tabs 改 ui/tabs（value 為字串、activationMode="manual"，onValueChange 以 (null, value) 轉接原 handler）
// 「分指定/不指定」的 handler 掛在 FormControlLabel 的 onClick（label 上），換成 CheckboxField 會改變點擊文字時的觸發次數，使用正式 ui 元件
import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import React, { Fragment, useEffect, useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import createRakeHandlers, { checkInputEmptyAsZero } from 'views/DeductionSettingShared/createRakeHandlers'
import { renderNonSegmentedDesignation, renderNonSegmentedNonDistinguish } from './renderNonSegmentedTiers'
import { renderSegmentedDesignation, renderSegmentedNonDistinguish } from './renderSegmentedTiers'

// checkInput 與欄位 handler 搬到 views/DeductionSettingShared/createRakeHandlers（與抽成設定頁、編輯設計師抽成彈窗共用，內容不變）；
// 級距列搬到 renderNonSegmentedTiers／renderSegmentedTiers；state、handleTabsChange、effect 與外框仍在此檔

const isSegmented = [
  { label: '全段', value: false },
  { label: '分段', value: true },
]

function AboutPerformance({ className = '', profitSharing, onChange, attributions, ...rest }) {
  const [tabValue, setTabValue] = useState('預設')
  const [deductionIndex, setDeductionIndex] = useState(0)

  // 欄位 handler（與抽成設定頁共用，內容不變）：每次 render 以目前的值重新建立，與原本寫在元件內相同
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
          // 不分指定（上一個條件已處理分指定；原本此處多判斷一個拼錯、恆為 undefined 的 designationUsag，結果相同，與新增／編輯抽成設定一致）
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
      <Card {...rest} className={className}>
        <CardHeader className="pb-4">
          <CardTitle>抽成方式設定</CardTitle>
        </CardHeader>
        {!profitSharing.isSegmented && (
          <Tabs value={tabValue} onValueChange={value => handleTabsChange(null, value)} activationMode="manual">
            <TabsList>
              {attributions.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        <CardContent>
          <PerfectScrollbar>
            <div className="min-w-[995px] pb-[20px]">
              <div>
                <h4 className="my-4 text-heading text-text">抽成模式</h4>
                <ToggleGroup size="small" className="ml-[20px]" value={profitSharing.isSegmented} onChange={handleToggleButtonChange} exclusive>
                  {isSegmented.map((data, idx) => (
                    <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} data-testid={`assign-designer-${data.value}`}>
                      {data.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FormControlLabel
                  className="ml-[5px]"
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
          </PerfectScrollbar>
        </CardContent>
      </Card>
    </Fragment>
  )
}

AboutPerformance.propTypes = {
  className: PropTypes.string,
}

export default AboutPerformance
