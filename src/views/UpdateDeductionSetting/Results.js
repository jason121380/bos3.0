import {
  Checkbox,
  FormControlLabel,

} from '@mui/material'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import { openSnackbar } from 'elements/snackbars'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'
import { Field, Input } from 'ui/input'

const isSegmented = [
  { label: '全段', value: false },
  { label: '分段', value: true },
]

function Results({ className, profitSharing, onChange, attributions, ...rest }) {
  const [tabValue, setTabValue] = useState('預設')
  const [deductionIndex, setDeductionIndex] = useState(0)

  const checkInput = (event, rakeType) => {
    if(event.target.value === '') {
      event.target.value = 0
    }
    switch (rakeType) {
      case 'thresholdLowerLimit':
        if (parseInt(event.target.value) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'thresholdUpperLimit':
        if (parseInt(event.target.value) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'threshold':
        if (parseInt(event.target.value) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'rake':
        if (parseInt(event.target.value) > 100 || parseInt(event.target.value) < 0) {
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
    const newProfitSharing = _.cloneDeep(profitSharing)
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
    const newProfitSharing = _.cloneDeep(profitSharing)
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
    const newProfitSharing = _.cloneDeep(profitSharing)
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
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleDeleteNonSegmentedDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleDeleteNonSegmentedNonDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }

  const handleAddSegmented = segmentedType => {
    const newProfitSharing = _.cloneDeep(profitSharing)
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
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDistinguish.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }
  const handleDeleteSegmentedDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].designate.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }
  const handleDeleteSegmentedNonDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDesignate.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }

  const handleNonSegmentedThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.forEach(
      (data, index2) => {
        if (index === index2) {
          data.threshold = parseInt(event.target.value)
        }
      }
    )
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleNonSegmentedDesignateThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.forEach((data, index2) => {
      if (index === index2) {
        data.threshold = parseInt(event.target.value)
      }
    })
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleNonSegmentedNonDesignateThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        data.threshold = parseInt(event.target.value)
      }
    })
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }

  const handleNonSegmentedRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
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
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.forEach((data, index2) => {
      if (index === index2) {
        data.rake = parseFloat(event.target.value)
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    })
  }
  const handleNonSegmentedNonDesignateRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        data.rake = parseFloat(event.target.value)
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    })
  }

  const handleSegmentedInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDistinguish.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value)
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
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].designate.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value)
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
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value)
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
    const newProfitSharing = _.cloneDeep(profitSharing)

    // 如果attribute是空字串的話改成'預設'
    newProfitSharing.nonSegmented.map((data, index) => {
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
      <Card {...rest}>
        <CardHeader>
          <CardTitle>抽成方式設定</CardTitle>
        </CardHeader>
        <div className="grid gap-4 px-5 pb-4 pt-4">
          <Field label="抽成設定編號">
            <Input
              type="text"
              value={profitSharing.deductionNo}
              onChange={event => onChange({ value: event.target.value, key: 'deductionNo' })
            }
            />
          </Field>
          <Field label="抽成設定名稱">
            <Input
              type="text"
              value={profitSharing.deductionName}
              onChange={event => onChange({ value: event.target.value, key: 'deductionName' })
            }
            />
          </Field>
        </div>
        {!profitSharing.isSegmented && (
          <Tabs
            value={tabValue}
            onValueChange={value => handleTabsChange(null, value)}
            activationMode="manual"
          >
            <TabsList className="px-3">
              {attributions.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[995px] pb-5">
            <div className="flex flex-wrap items-center">
              <h3 className="my-4 text-heading text-text">
                抽成模式
              </h3>
              <ToggleGroup
                size="small"
                className="!ml-5"
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
                className="!ml-1"
                control={<Checkbox color="primary" />}
                label="分指定/不指定"
                checked={profitSharing.designationUsage}
                onClick={handleDesignateChange}
              />
            </div>
            {!profitSharing.designationUsage ? (
              !profitSharing.isSegmented ? (
                profitSharing.nonSegmented.length > 0 
                && profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map(
                  (data, index) => (
                    <div className="mb-2.5 flex items-center" key={index}>
                      <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                        總業績從(含)
                      </span>
                      <Field label="輸入業績" className="ml-4 min-w-0">
                        <Input
                          min={0}
                          type="number"
                          value={data.threshold ? data.threshold : 0}
                          onChange={event =>
                            handleNonSegmentedThresholdInput(event, index, 'threshold')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                      </Field>
                      <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                        抽成調整為
                      </span>
                      <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                        <Input
                          min={0}
                          type="number"
                          value={data.rake ? data.rake : 0}
                          onChange={event => handleNonSegmentedRakeInput(event, index, 'rake')}
                        />
                      </Field>
                      <div className="ml-4 flex items-center gap-1">
                        {index !== 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-tertiary hover:text-danger"
                            aria-label="刪除此級距"
                            onClick={handleDeleteSetDeductionNum}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </Button>
                        )}
                        {index ===
                          profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish
                            .length -
                            1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-tertiary"
                            aria-label="新增級距"
                            onClick={() => handleAddSetDeductionNum('nonDistinguish')}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                )
              ) : (
                profitSharing.segmented[0].nonDistinguish.map((data, index) => (
                  <div key={index} className="flex flex-wrap">
                    <div className="mb-2.5 flex items-center">
                      <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                        總業績從(含)
                      </span>
                      <Field label="輸入業績" className="ml-4 min-w-0">
                        <Input
                          min={0}
                          type="number"
                          value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                          onChange={event =>
                            handleSegmentedInput(event, index, 'thresholdLowerLimit')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                      </Field>
                    </div>
                    <div className="mb-2.5 flex items-center">
                      <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                        至
                      </span>
                      <Field label="輸入業績" className="ml-4 min-w-0">
                        <Input
                          min={0}
                          type="number"
                          value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                          onChange={event =>
                            handleSegmentedInput(event, index, 'thresholdUpperLimit')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                      </Field>
                    </div>
                    <div className="mb-2.5 flex items-center">
                      <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                        抽成為
                      </span>
                      <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                        <Input
                          min={0}
                          type="number"
                          value={data.rake ? data.rake : 0}
                          onChange={event => handleSegmentedInput(event, index, 'rake')}
                          onWheel={() => document.activeElement.blur()}
                        />
                      </Field>
                    </div>
                    <div className="mb-2.5 flex items-center">
                      <div className="ml-4 flex items-center gap-1">
                        {index !== 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-tertiary hover:text-danger"
                            aria-label="刪除此級距"
                            onClick={() => handleDeleteSegmented(index)}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </Button>
                        )}
                        {index === profitSharing.segmented[0].nonDistinguish.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-text-tertiary"
                            aria-label="新增級距"
                            onClick={() => handleAddSegmented('nonDistinguish')}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : !profitSharing.isSegmented ? (
              <Fragment>
                <div>
                  <h3 className="my-4 text-heading text-text">
                    指定業績
                  </h3>
                </div>
                {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map(
                  (data, index) => {
                    return (
                      <div key={index} className="flex flex-wrap">
                        <div className="mb-2.5 flex items-center">
                          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                            總業績從(含)
                          </span>
                          <Field label="輸入業績" className="ml-4 min-w-0">
                            <Input
                              min={0}
                              type="number"
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
                          </Field>
                        </div>
                        <div className="mb-2.5 flex items-center">
                          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                            抽成調整為
                          </span>
                          <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                            <Input
                              min={0}
                              type="number"
                              value={data.rake ? data.rake : 0}
                              onChange={event =>
                                handleNonSegmentedDesignateRakeInput(event, index, 'rake')
                              }
                              onWheel={() => document.activeElement.blur()}
                            />
                          </Field>
                        </div>
                        <div className="mb-2.5 flex items-center">
                          <div className="ml-4 flex items-center gap-1">
                            {index !== 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-text-tertiary hover:text-danger"
                                aria-label="刪除此級距"
                                onClick={() => handleDeleteNonSegmentedDesignate(index)}
                              >
                                <DeleteForeverIcon fontSize="small" />
                              </Button>
                            )}
                            {index ===
                              profitSharing.nonSegmented[deductionIndex].rakeData.designate
                                .length -
                                1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-text-tertiary"
                                aria-label="新增級距"
                                onClick={() => handleAddSetDeductionNum('designate')}
                              >
                                <AddIcon fontSize="small" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                )}
                <div>
                  <h3 className="my-4 text-heading text-text">
                    不指定業績
                  </h3>
                </div>
                {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map(
                  (data, index) => {
                    return (
                      <div key={index} className="flex flex-wrap">
                        <div className="mb-2.5 flex items-center">
                          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                            總業績從(含)
                          </span>
                          <Field label="輸入業績" className="ml-4 min-w-0">
                            <Input
                              min={0}
                              type="number"
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
                          </Field>
                        </div>
                        <div className="mb-2.5 flex items-center">
                          <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                            抽成調整為
                          </span>
                          <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                            <Input
                              min={0}
                              type="number"
                              value={data.rake ? data.rake : 0}
                              onChange={event =>
                                handleNonSegmentedNonDesignateRakeInput(event, index, 'rake')
                              }
                              onWheel={() => document.activeElement.blur()}
                            />
                          </Field>
                        </div>
                        <div className="mb-2.5 flex items-center">
                          <div className="ml-4 flex items-center gap-1">
                            {index !== 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-text-tertiary hover:text-danger"
                                aria-label="刪除此級距"
                                onClick={() => handleDeleteNonSegmentedNonDesignate(index)}
                              >
                                <DeleteForeverIcon fontSize="small" />
                              </Button>
                            )}
                            {index ===
                              profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate
                                .length -
                                1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-text-tertiary"
                                aria-label="新增級距"
                                onClick={() => handleAddSetDeductionNum('nonDesignate')}
                              >
                                <AddIcon fontSize="small" />
                              </Button>
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
                  <h3 className="my-4 text-heading text-text">
                    指定業績
                  </h3>
                </div>
                {profitSharing.segmented[0].designate.map((data, index) => {
                  return (
                    <div key={index} className="flex flex-wrap">
                      <div className="mb-2.5 flex items-center">
                        <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                          指定業績從(含)
                        </span>
                        <Field label="輸入業績" className="ml-4 min-w-0">
                          <Input
                            min={0}
                            type="number"
                            value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                            onChange={event =>
                              handleDesignateSegmentedInput(event, index, 'thresholdLowerLimit')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </Field>
                      </div>
                      <div className="mb-2.5 flex items-center">
                        <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                          至
                        </span>
                        <Field label="輸入業績" className="ml-4 min-w-0">
                          <Input
                            min={0}
                            type="number"
                            value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                            onChange={event =>
                              handleDesignateSegmentedInput(event, index, 'thresholdUpperLimit')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </Field>
                      </div>
                      <div className="mb-2.5 flex items-center">
                        <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                          抽成為
                        </span>
                        <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                          <Input
                            min={0}
                            type="number"
                            value={data.rake ? data.rake : 0}
                            onChange={event =>
                              handleDesignateSegmentedInput(event, index, 'rake')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </Field>
                      </div>
                      <div className="mb-2.5 flex items-center">
                        <div className="ml-4 flex items-center gap-1">
                          {index !== 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-text-tertiary hover:text-danger"
                              aria-label="刪除此級距"
                              onClick={() => handleDeleteSegmentedDesignate(index)}
                            >
                              <DeleteForeverIcon fontSize="small" />
                            </Button>
                          )}
                          {index === profitSharing.segmented[0].designate.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-text-tertiary"
                              aria-label="新增級距"
                              onClick={() => handleAddSegmented('designate')}
                            >
                              <AddIcon fontSize="small" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div>
                  <h3 className="my-4 text-heading text-text">
                    不指定業績
                  </h3>
                </div>
                {profitSharing.segmented[0].nonDesignate.map((data, index) => {
                  return (
                    <div key={index} className="flex flex-wrap">
                      <div className="mb-2.5 flex items-center">
                        <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                          不指定業績從(含)
                        </span>
                        <Field label="輸入業績" className="ml-4 min-w-0">
                          <Input
                            min={0}
                            type="number"
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
                        </Field>
                      </div>
                      <div className="mb-2.5 flex items-center">
                        <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                          至
                        </span>
                        <Field label="輸入業績" className="ml-4 min-w-0">
                          <Input
                            min={0}
                            type="number"
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
                        </Field>
                      </div>
                      <div className="mb-2.5 flex items-center">
                        <span className="ml-5 whitespace-nowrap text-body text-text-secondary">
                          抽成為
                        </span>
                        <Field label="輸入抽成(%)" className="ml-4 min-w-0">
                          <Input
                            min={0}
                            type="number"
                            value={data.rake ? data.rake : 0}
                            onChange={event =>
                              handleNonDesignateSegmentedInput(event, index, 'rake')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </Field>
                      </div>
                      <div className="mb-2.5 flex items-center">
                        <div className="ml-4 flex items-center gap-1">
                          {index !== 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-text-tertiary hover:text-danger"
                              aria-label="刪除此級距"
                              onClick={() => handleDeleteSegmentedNonDesignate(index)}
                            >
                              <DeleteForeverIcon fontSize="small" />
                            </Button>
                          )}
                          {index === profitSharing.segmented[0].nonDesignate.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-text-tertiary"
                              aria-label="新增級距"
                              onClick={() => handleAddSegmented('nonDesignate')}
                            >
                              <AddIcon fontSize="small" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </Fragment>
            )}
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
