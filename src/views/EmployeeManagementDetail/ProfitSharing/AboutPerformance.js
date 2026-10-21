// 大型頁策略：抽成級距表單（TextField）保留 MUI、排版改 Tailwind flex；Tabs 改 ui/tabs（value 為字串、activationMode="manual"，onValueChange 以 (null, value) 轉接原 handler）
// 「分指定/不指定」的 handler 掛在 FormControlLabel 的 onClick（label 上），換成 CheckboxField 會改變點擊文字時的觸發次數，保留 MUI
import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import React, { Fragment, useEffect, useState } from 'react'
import { openSnackbar } from 'elements/snackbars'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

const isSegmented = [
  { label: '全段', value: false },
  { label: '分段', value: true },
]

function AboutPerformance({ className = '', profitSharing, onChange, attributions, ...rest }) {
  const [tabValue, setTabValue] = useState('預設')
  const [deductionIndex, setDeductionIndex] = useState(0)

  const checkInput = (event, rakeType) => {
    if (event.target.value === '') {
      event.target.value = 0
    }
    switch (rakeType) {
      case 'thresholdLowerLimit':
        if (parseInt(event.target.value, 10) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'thresholdUpperLimit':
        if (parseInt(event.target.value, 10) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'threshold':
        if (parseInt(event.target.value, 10) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'rake':
        if (parseInt(event.target.value, 10) > 100 || parseInt(event.target.value, 10) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0~100之間的數字',
            variant: 'warning',
          })
        }
        break
      default:
        break
    }
  }

  // 指定不指定狀態
  const handleDesignateChange = () => {
    const newProfitSharing = cloneDeep(profitSharing)
    onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
    if (newProfitSharing.isSegmented) {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.segmented[0].designate = []
        newProfitSharing.segmented[0].nonDesignate = []
        newProfitSharing.segmented[0].nonDistinguish = [
          {
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
            rake: 0,
          },
        ]
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
      } else {
        newProfitSharing.segmented[0].designate = [
          {
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
            rake: 0,
          },
        ]
        newProfitSharing.segmented[0].nonDesignate = [
          {
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
            rake: 0,
          },
        ]
        newProfitSharing.segmented[0].nonDistinguish = []
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
      }
    } else {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.nonSegmented[deductionIndex].rakeData.designate = []
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate = []
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish = [
          {
            threshold: 0,
            rake: 0,
          },
        ]
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      } else {
        newProfitSharing.nonSegmented[deductionIndex].rakeData.designate = [
          {
            threshold: 0,
            rake: 0,
          },
        ]
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate = [
          {
            threshold: 0,
            rake: 0,
          },
        ]
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish = []
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    }
  }
  // 全段分段
  const handleToggleButtonChange = () => {
    const newProfitSharing = cloneDeep(profitSharing)
    if (profitSharing.isSegmented) {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.segmented = []
        newProfitSharing.nonSegmented = [
          {
            attribute: '預設',
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
          },
        ]
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        setTabValue('預設')
        setDeductionIndex(0)
      } else {
        newProfitSharing.segmented = []
        newProfitSharing.nonSegmented = [
          {
            attribute: '預設',
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
          },
        ]
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
      }
    } else {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.segmented = [
          {
            designate: [
              {
                thresholdLowerLimit: 0,
                thresholdUpperLimit: 0,
                rake: 0,
              },
            ],
            nonDesignate: [
              {
                thresholdLowerLimit: 0,
                thresholdUpperLimit: 0,
                rake: 0,
              },
            ],
            nonDistinguish: [],
          },
        ]
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        newProfitSharing.nonSegmented = []
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      } else {
        newProfitSharing.segmented = [
          {
            designate: [],
            nonDesignate: [],
            nonDistinguish: [
              {
                thresholdLowerLimit: 0,
                thresholdUpperLimit: 0,
                rake: 0,
              },
            ],
          },
        ]
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        newProfitSharing.nonSegmented = []
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        setTabValue('預設')
        setDeductionIndex(0)
      }
    }

    onChange({ value: !newProfitSharing.isSegmented, key: 'isSegmented' })
  }
  // 抽成數字輸入
  const handleAddSetDeductionNum = nonSegmentedType => {
    const newProfitSharing = cloneDeep(profitSharing)
    switch (nonSegmentedType) {
      case 'nonDistinguish':
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.push({
          threshold: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        break
      case 'designate':
        newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.push({
          threshold: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        break
      case 'nonDesignate':
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.push({
          threshold: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        break
      default:
        break
    }
  }

  const handleDeleteSetDeductionNum = index => {
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleDeleteNonSegmentedDesignate = index => {
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleDeleteNonSegmentedNonDesignate = index => {
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }

  const handleAddSegmented = segmentedType => {
    const newProfitSharing = cloneDeep(profitSharing)
    switch (segmentedType) {
      case 'nonDistinguish':
        newProfitSharing.segmented[0].nonDistinguish.push({
          thresholdLowerLimit: 0,
          thresholdUpperLimit: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        break
      case 'designate':
        newProfitSharing.segmented[0].designate.push({
          thresholdLowerLimit: 0,
          thresholdUpperLimit: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        break
      case 'nonDesignate':
        newProfitSharing.segmented[0].nonDesignate.push({
          thresholdLowerLimit: 0,
          thresholdUpperLimit: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        break
      default:
        break
    }
  }

  const handleDeleteSegmented = index => {
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDistinguish.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }
  const handleDeleteSegmentedDesignate = index => {
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.segmented[0].designate.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }
  const handleDeleteSegmentedNonDesignate = index => {
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDesignate.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }

  const handleNonSegmentedThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.forEach(
      (data, index2) => {
        if (index === index2) {
          data.threshold = parseInt(event.target.value, 10)
        }
      }
    )
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleNonSegmentedDesignateThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.forEach((data, index2) => {
      if (index === index2) {
        data.threshold = parseInt(event.target.value, 10)
      }
    })
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleNonSegmentedNonDesignateThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        data.threshold = parseInt(event.target.value, 10)
      }
    })
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }

  const handleNonSegmentedRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.forEach(
      (data, index2) => {
        if (index === index2) {
          data.rake = parseFloat(event.target.value)
          onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        }
      }
    )
  }
  const handleNonSegmentedDesignateRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.forEach((data, index2) => {
      if (index === index2) {
        data.rake = parseFloat(event.target.value)
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    })
  }
  const handleNonSegmentedNonDesignateRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        data.rake = parseFloat(event.target.value)
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    })
  }

  const handleSegmentedInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDistinguish.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value, 10)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value, 10)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'rake':
            data.rake = parseFloat(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          default:
            break
        }
      }
    })
  }

  const handleDesignateSegmentedInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.segmented[0].designate.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value, 10)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value, 10)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'rake':
            data.rake = parseFloat(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          default:
            break
        }
      }
    })
  }
  const handleNonDesignateSegmentedInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value, 10)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value, 10)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'rake':
            data.rake = parseFloat(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          default:
            break
        }
      }
    })
  }
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
        } else if (d.attribute === value && !profitSharing.designationUsag) {
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
          <Tabs
            value={tabValue}
            onValueChange={value => handleTabsChange(null, value)}
            activationMode="manual"
          >
            <TabsList>
              {attributions.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        <CardContent>
          <PerfectScrollbar>
            <div className="min-w-[995px] pb-[20px]">
              <div>
                <h4 className="my-4 text-heading text-text">
                  抽成模式
                </h4>
                <ToggleGroup
                  size="small"
                  className="ml-[20px]"
                  value={profitSharing.isSegmented}
                  onChange={handleToggleButtonChange}
                  exclusive
                >
                  {isSegmented.map((data, idx) => (
                    <ToggleGroupItem
                      key={`${data.label}-${idx}`}
                      value={data.value}
                      data-testid={`assign-designer-${data.value}`}
                    >
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
              {!profitSharing.designationUsage ? (
                !profitSharing.isSegmented ? (
                  profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map(
                    (data, index) => (
                      <div className="flex mb-[10px]" key={index}>
                        <span className="ml-[20px]">
                          總業績從(含)
                        </span>
                        <TextField
                          InputProps={{ inputProps: { min: 0 } }}
                          type="number"
                          className="flex items-center [border-bottom:0px] ml-[16px]"
                          variant="outlined"
                          label="輸入業績"
                          value={data.threshold ? data.threshold : 0}
                          onChange={event =>
                            handleNonSegmentedThresholdInput(event, index, 'threshold')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                        <span className="ml-[20px]">
                          抽成調整為
                        </span>
                        <TextField
                          InputProps={{ inputProps: { min: 0 } }}
                          type="number"
                          className="flex items-center [border-bottom:0px] ml-[16px]"
                          variant="outlined"
                          label="輸入抽成(%)"
                          value={data.rake ? data.rake : 0}
                          onChange={event => handleNonSegmentedRakeInput(event, index, 'rake')}
                          onWheel={() => document.activeElement.blur()}
                        />
                        <div className="flex items-center [border-bottom:0px] ml-[16px]">
                          {index !== 0 && (
                            <DeleteForeverIcon
                              className="ml-[20px] cursor-pointer"
                              onClick={handleDeleteSetDeductionNum}
                            />
                          )}
                          {index ===
                            profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish
                              .length -
                            1 && (
                              <AddIcon
                                className="ml-[20px] cursor-pointer"
                                onClick={() => handleAddSetDeductionNum('nonDistinguish')}
                              />
                            )}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  profitSharing.segmented[0].nonDistinguish.map((data, index) => (
                    <div key={index} className="flex w-full flex-wrap">
                      <div className="flex mb-[10px]">
                        <span className="ml-[20px]">
                          總業績從(含)
                        </span>
                        <TextField
                          className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                          InputProps={{ inputProps: { min: 0 } }}
                          type="number"
                          variant="outlined"
                          label="輸入業績"
                          value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                          onChange={event =>
                            handleSegmentedInput(event, index, 'thresholdLowerLimit')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                      </div>
                      <div className="flex mb-[10px]">
                        <span className="ml-[20px]">
                          至
                        </span>
                        <TextField
                          className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap"
                          InputProps={{ inputProps: { min: 0 } }}
                          type="number"
                          variant="outlined"
                          label="輸入業績"
                          value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                          onChange={event =>
                            handleSegmentedInput(event, index, 'thresholdUpperLimit')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                      </div>
                      <div className="flex mb-[10px]">
                        <span className="ml-[20px]">
                          抽成為
                        </span>
                        <TextField
                          className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                          InputProps={{ inputProps: { min: 0 } }}
                          type="number"
                          variant="outlined"
                          label="輸入抽成(%)"
                          value={data.rake ? data.rake : 0}
                          onChange={event => handleSegmentedInput(event, index, 'rake')}
                          onWheel={() => document.activeElement.blur()}
                        />
                      </div>
                      <div className="flex mb-[10px]">
                        <div className="flex items-center [border-bottom:0px] ml-[16px]">
                          {index !== 0 && (
                            <DeleteForeverIcon
                              className="ml-[20px] cursor-pointer"
                              onClick={() => handleDeleteSegmented(index)}
                            />
                          )}
                          {index === profitSharing.segmented[0].nonDistinguish.length - 1 && (
                            <AddIcon
                              className="ml-[20px] cursor-pointer"
                              onClick={() => handleAddSegmented('nonDistinguish')}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : !profitSharing.isSegmented ? (
                <Fragment>
                  <div>
                    <h4 className="my-4 text-heading text-text">
                      指定業績
                    </h4>
                  </div>
                  {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map(
                    (data, index) => {
                      return (
                        <div key={index} className="flex w-full flex-wrap">
                          <div className="flex mb-[10px]">
                            <span className="ml-[20px]">
                              總業績從(含)
                            </span>
                            <TextField
                              InputProps={{ inputProps: { min: 0 } }}
                              type="number"
                              className="flex items-center [border-bottom:0px] ml-[16px]"
                              variant="outlined"
                              label="輸入業績"
                              value={data.threshold ? data.threshold : 0}
                              onChange={event =>
                                handleNonSegmentedDesignateThresholdInput(
                                  event,
                                  index,
                                  'threshold'
                                )
                              }
                              onWheel={() => document.activeElement.blur()}
                            />
                          </div>
                          <div className="flex mb-[10px]">
                            <span className="ml-[20px]">
                              抽成調整為
                            </span>
                            <TextField
                              InputProps={{ inputProps: { min: 0 } }}
                              type="number"
                              className="flex items-center [border-bottom:0px] ml-[16px]"
                              variant="outlined"
                              label="輸入抽成(%)"
                              value={data.rake ? data.rake : 0}
                              onChange={event =>
                                handleNonSegmentedDesignateRakeInput(event, index, 'rake')
                              }
                              onWheel={() => document.activeElement.blur()}
                            />
                          </div>
                          <div className="flex mb-[10px]">
                            <div className="flex items-center [border-bottom:0px] ml-[16px]">
                              {index !== 0 && (
                                <DeleteForeverIcon
                                  className="ml-[20px] cursor-pointer"
                                  onClick={() => handleDeleteNonSegmentedDesignate(index)}
                                />
                              )}
                              {index ===
                                profitSharing.nonSegmented[deductionIndex].rakeData.designate
                                  .length -
                                1 && (
                                  <AddIcon
                                    className="ml-[20px] cursor-pointer"
                                    onClick={() => handleAddSetDeductionNum('designate')}
                                  />
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )}
                  <div>
                    <h4 className="my-4 text-heading text-text">
                      不指定業績
                    </h4>
                  </div>
                  {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map(
                    (data, index) => {
                      return (
                        <div key={index} className="flex w-full flex-wrap">
                          <div className="flex mb-[10px]">
                            <span className="ml-[20px]">
                              總業績從(含)
                            </span>
                            <TextField
                              InputProps={{ inputProps: { min: 0 } }}
                              type="number"
                              className="flex items-center [border-bottom:0px] ml-[16px]"
                              variant="outlined"
                              label="輸入業績"
                              value={data.threshold ? data.threshold : 0}
                              onChange={event =>
                                handleNonSegmentedNonDesignateThresholdInput(
                                  event,
                                  index,
                                  'threshold'
                                )
                              }
                              onWheel={() => document.activeElement.blur()}
                            />
                          </div>
                          <div className="flex mb-[10px]">
                            <span className="ml-[20px]">
                              抽成調整為
                            </span>
                            <TextField
                              InputProps={{ inputProps: { min: 0 } }}
                              type="number"
                              className="flex items-center [border-bottom:0px] ml-[16px]"
                              variant="outlined"
                              label="輸入抽成(%)"
                              value={data.rake ? data.rake : 0}
                              onChange={event =>
                                handleNonSegmentedNonDesignateRakeInput(event, index, 'rake')
                              }
                              onWheel={() => document.activeElement.blur()}
                            />
                          </div>
                          <div className="flex mb-[10px]">
                            <div className="flex items-center [border-bottom:0px] ml-[16px]">
                              {index !== 0 && (
                                <DeleteForeverIcon
                                  className="ml-[20px] cursor-pointer"
                                  onClick={() => handleDeleteNonSegmentedNonDesignate(index)}
                                />
                              )}
                              {index ===
                                profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate
                                  .length -
                                1 && (
                                  <AddIcon
                                    className="ml-[20px] cursor-pointer"
                                    onClick={() => handleAddSetDeductionNum('nonDesignate')}
                                  />
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  <div>
                    <h4 className="my-4 text-heading text-text">
                      指定業績
                    </h4>
                  </div>
                  {profitSharing.segmented[0].designate.map((data, index) => {
                    return (
                      <div key={index} className="flex w-full flex-wrap">
                        <div className="flex mb-[10px]">
                          <span className="ml-[20px]">
                            指定業績從(含)
                          </span>
                          <TextField
                            InputProps={{ inputProps: { min: 0 } }}
                            type="number"
                            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                            variant="outlined"
                            label="輸入業績"
                            value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                            onChange={event =>
                              handleDesignateSegmentedInput(event, index, 'thresholdLowerLimit')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div className="flex mb-[10px]">
                          <span className="ml-[20px]" >
                            至
                          </span>
                          <TextField
                            InputProps={{ inputProps: { min: 0 } }}
                            type="number"
                            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap"
                            variant="outlined"
                            label="輸入業績"
                            value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                            onChange={event =>
                              handleDesignateSegmentedInput(event, index, 'thresholdUpperLimit')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div className="flex mb-[10px]">
                          <span className="ml-[20px]">
                            抽成為
                          </span>
                          <TextField
                            InputProps={{ inputProps: { min: 0 } }}
                            type="number"

                            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                            variant="outlined"
                            label="輸入抽成(%)"
                            value={data.rake ? data.rake : 0}
                            onChange={event =>
                              handleDesignateSegmentedInput(event, index, 'rake')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div className="flex mb-[10px]">
                          <div className="flex items-center [border-bottom:0px] ml-[16px]">
                            {index !== 0 && (
                              <DeleteForeverIcon
                                className="ml-[20px] cursor-pointer"
                                onClick={() => handleDeleteSegmentedDesignate(index)}
                              />
                            )}
                            {index === profitSharing.segmented[0].designate.length - 1 && (
                              <AddIcon
                                className="ml-[20px] cursor-pointer"
                                onClick={() => handleAddSegmented('designate')}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div>
                    <h4 className="my-4 text-heading text-text">
                      不指定業績
                    </h4>
                  </div>
                  {profitSharing.segmented[0].nonDesignate.map((data, index) => {
                    return (
                      <div key={index} className="flex w-full flex-wrap">
                        <div className="flex mb-[10px]">
                          <span className="ml-[20px]">
                            不指定業績從(含)
                          </span>
                          <TextField
                            InputProps={{ inputProps: { min: 0 } }}
                            type="number"
                            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                            variant="outlined"
                            label="輸入業績"
                            value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                            onChange={event =>
                              handleNonDesignateSegmentedInput(
                                event,
                                index,
                                'thresholdLowerLimit'
                              )
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div className="flex mb-[10px]">
                          <span className="ml-[20px]">
                            至
                          </span>
                          <TextField
                            InputProps={{ inputProps: { min: 0 } }}
                            type="number"
                            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap"
                            variant="outlined"
                            label="輸入業績"
                            value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                            onChange={event =>
                              handleNonDesignateSegmentedInput(
                                event,
                                index,
                                'thresholdUpperLimit'
                              )
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div className="flex mb-[10px]">
                          <span className="ml-[20px]">
                            抽成為
                          </span>
                          <TextField
                            InputProps={{ inputProps: { min: 0 } }}
                            type="number"
                            className="ml-[16px] flex items-center [border-bottom:0px] whitespace-nowrap p-0"
                            variant="outlined"
                            label="輸入抽成(%)"
                            value={data.rake ? data.rake : 0}
                            onChange={event =>
                              handleNonDesignateSegmentedInput(event, index, 'rake')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div className="flex mb-[10px]">
                          <div className="flex items-center [border-bottom:0px] ml-[16px]">
                            {index !== 0 && (
                              <DeleteForeverIcon
                                className="ml-[20px] cursor-pointer"
                                onClick={() => handleDeleteSegmentedNonDesignate(index)}
                              />
                            )}
                            {index === profitSharing.segmented[0].nonDesignate.length - 1 && (
                              <AddIcon
                                className="ml-[20px] cursor-pointer"
                                onClick={() => handleAddSegmented('nonDesignate')}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </Fragment>
              )}
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
