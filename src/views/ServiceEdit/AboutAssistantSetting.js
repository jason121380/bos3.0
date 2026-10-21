// 選項值可能為空字串或數字（協助人員人數），保留 MUI Select；同列的數字欄位也保留 MUI TextField 以維持標籤樣式一致
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { Delete, Plus, Trash2 } from 'lucide-react'
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import { useRef } from 'react'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

const deductions = [
  {
    label: '扣業績',
    value: 'onSales',
  },
  {
    label: '扣薪水',
    value: 'onSalary',
  },
  {
    label: '無扣項',
    value: 'none',
  },
]

const deductionWay2 = [
  { label: '依業績%數', value: '業績%數' },
  { label: '依固定金額', value: '固定金額' },
  { label: '依點數', value: '點數' },
]

const assistantNum = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
]
function AboutAssistantSetting({
  className,
  support,
  helperDeductionType,
  onChange,
  merchantHelperItems,
  ...rest
}) {
  const inputLabel = useRef()

  const handleAddAssistantContent = () => {
    const newSupport = cloneDeep(support)
    newSupport.push({
      helperDeductionType: 'onSales',
      type: '',
      nameList: [],
      peopleCount: 0,
      point: 0,
      cash: 0,
      percent: 0,
      designateCash: 0,
      nonDesignateCash: 0,
      designatePercent: 0,
      nonDesignatePercent: 0,
      designatePoint: 0,
      nonDesignatePoint: 0,
      deductionWay: '',
      isSplitted: false,
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }
  const handleDeleteAssistantContent = index => {
    const newSupport = cloneDeep(support)
    newSupport.splice(index, 1)
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }
  const handleDeductionTypeChange = (event, index) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.helperDeductionType = event.target.value
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }
  const handleCheckboxChange = index => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.isDesignate = !data.isDesignate
        data.percent = 0
        data.cash = 0
        data.point = 0
        data.designatePercent = 0
        data.designateCash = 0
        data.designatePoint = 0
        data.nonDesignatePercent = 0
        data.nonDesignateCash = 0
        data.nonDesignatePoint = 0
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }
  const handleIsSplittedChange = index => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.isSplitted = !data.isSplitted
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleAssistantName = (event, index) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.nameList = []
        for (let i = 1; i <= parseInt(event.target.value, 10); i++) {
          data.nameList.push(String(i))
        }
        data.peopleCount = data.nameList.length
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleDeductionWayChange = (event, index) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.deductionWay = event.target.value
        data.percent = 0
        data.cash = 0
        data.point = 0
        data.designatePercent = 0
        data.designateCash = 0
        data.designatePoint = 0
        data.nonDesignatePercent = 0
        data.nonDesignateCash = 0
        data.nonDesignatePoint = 0
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = cloneDeep(support)
    switch (deductionWay) {
      case '業績%數':
        newSupport[index].percent = event.target.value
        break
      case '固定金額':
        newSupport[index].cash = event.target.value
        break
      case '點數':
        newSupport[index].point = event.target.value
        break
      default:
        break
    }
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = cloneDeep(support)
    switch (deductionWay) {
      case '業績%數':
        newSupport[index].designatePercent = event.target.value
        break
      case '固定金額':
        newSupport[index].designateCash = event.target.value
        break
      case '點數':
        newSupport[index].designatePoint = event.target.value
        break
      default:
        break
    }
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }
  const handleNonDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = cloneDeep(support)
    switch (deductionWay) {
      case '業績%數':
        newSupport[index].nonDesignatePercent = event.target.value
        break
      case '固定金額':
        newSupport[index].nonDesignateCash = event.target.value
        break
      case '點數':
        newSupport[index].nonDesignatePoint = event.target.value
        break
      default:
        break
    }
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleReturnDeductionValue = (data, deductionWay, isDesignate) => {
    switch (deductionWay) {
      case '業績%數':
        return data[isDesignate ? 'designatePercent' : 'nonDesignatePercent']
      case '固定金額':
        return data[isDesignate ? 'designateCash' : 'nonDesignateCash']
      case '點數':
        return data[isDesignate ? 'designatePoint' : 'nonDesignatePoint']
      default:
        break
    }
  }

  const handleReturnValue = (data, deductionWay) => {
    switch (deductionWay) {
      case '業績%數':
        return data.percent
      case '固定金額':
        return data.cash
      case '點數':
        return data.point
      default:
        break
    }
  }

  const handleHelperType = (event, index) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.type = event.target.value
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleClear = index => {
    const newSupport = cloneDeep(support)
    newSupport[index] = {
      helperDeductionType: 'onSales',
      type: '',
      nameList: [],
      peopleCount: 0,
      point: 0,
      cash: 0,
      percent: 0,
      designateCash: 0,
      nonDesignateCash: 0,
      designatePercent: 0,
      nonDesignatePercent: 0,
      designatePoint: 0,
      nonDesignatePoint: 0,
      deductionWay: '',
    }
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }
  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>互助點數設定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {support.map((content, index) => (
          <div className="flex flex-wrap items-start gap-4" key={index}>
            <div className="w-full sm:w-36">
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  扣項類別
                </InputLabel>
                <Select
                  labelId="select-item-label"
                  id="select-item"
                  label='扣項類別'
                  onChange={event => handleDeductionTypeChange(event, index)}
                  value={content.helperDeductionType}
                >
                  {deductions.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.value}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="w-full sm:w-36">
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  類別
                </InputLabel>
                <Select
                  labelId="select-item-label"
                  id="select-item"
                  label='類別'
                  onChange={event => handleHelperType(event, index)}
                  value={content.type}
                >
                  {merchantHelperItems?.map((data, idx) => (
                    <MenuItem value={data.type} key={`${data.type}-${idx}`}>
                      {data.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="w-full sm:w-36">
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  協助人員人數
                </InputLabel>
                <Select
                  label='協助人員人數'
                  onChange={event => handleAssistantName(event, index)}
                  value={content.nameList.length}
                >
                  {assistantNum.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="w-full sm:w-36">
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  扣項方式
                </InputLabel>
                <Select
                  labelId="select-item-label"
                  id="select-item"
                  label='扣項方式'
                  onChange={event => handleDeductionWayChange(event, index)}
                  value={content.deductionWay}
                >
                  {deductionWay2.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            {content.isDesignate ? (
              <div className="flex flex-col gap-1">
                <div className="flex gap-3">
                  <TextField
                    style={{ width: '5rem' }}
                    type="number"
                    name="designateInput"
                    variant="outlined"
                    label={`指定${content.deductionWay}`}
                    value={handleReturnDeductionValue(content, content.deductionWay, true)}
                    onChange={event =>
                      handleDesignateDeductionWayInput(event, index, content.deductionWay)
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                  <TextField
                    style={{ width: '5rem' }}
                    type="number"
                    name="NonDesignateInput"
                    variant="outlined"
                    label={`不指定${content.deductionWay}`}
                    value={handleReturnDeductionValue(content, content.deductionWay, false)}
                    onChange={event =>
                      handleNonDesignateDeductionWayInput(event, index, content.deductionWay)
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <FormControlLabel
                    control={<Checkbox color="primary" />}
                    label="分指定/不指定"
                    checked={content.isDesignate}
                    onChange={() => handleCheckboxChange(index)}
                    disabled={content.isSplitted}
                  />
                  <FormControlLabel
                    control={<Checkbox color="primary" />}
                    label="互助均分"
                    checked={content.isSplitted}
                    onChange={() => handleIsSplittedChange(index)}
                    disabled={content.isDesignate}
                  />
                </div>
              </div>
            ) : (
              content.deductionWay !== '' && (
                <div className="flex flex-col gap-1">
                  <div>
                    <TextField
                      style={{ width: '5rem' }}
                      type="number"
                      variant="outlined"
                      label={content.deductionWay}
                      value={handleReturnValue(content, content.deductionWay, content.isDesignate)}
                      onChange={event =>
                        handleDeductionWayInput(event, index, content.deductionWay)
                      }
                      onWheel={() => document.activeElement.blur()}
                    />
                  </div>
                  <div className="flex flex-col whitespace-nowrap">
                    <FormControlLabel
                      control={<Checkbox color="primary" />}
                      label="分指定/不指定"
                      checked={content.isDesignate}
                      onChange={() => handleCheckboxChange(index)}
                      disabled={content.isSplitted}
                    />
                    <FormControlLabel
                      control={<Checkbox color="primary" />}
                      label="互助均分"
                      checked={content.isSplitted}
                      onChange={() => handleIsSplittedChange(index)}
                      disabled={content.isDesignate}
                    />
                  </div>
                </div>
              )
            )}
            <div className="flex items-center gap-1">
              {content.deductionWay !== '' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary"
                  aria-label="清除此互助設定"
                  onClick={() => handleClear(index)}
                  data-testid={`service-${index}-clear`}
                >
                  <Delete strokeWidth={1.75} />
                </Button>
              )}
              {support.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary hover:text-danger"
                  aria-label="刪除此互助設定"
                  onClick={() => handleDeleteAssistantContent(index)}
                >
                  <Trash2 strokeWidth={1.75} />
                </Button>
              )}
              {index === support.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary"
                  aria-label="新增互助設定"
                  onClick={handleAddAssistantContent}
                >
                  <Plus strokeWidth={1.75} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

AboutAssistantSetting.propTypes = {
  className: PropTypes.object,
}

export default AboutAssistantSetting
