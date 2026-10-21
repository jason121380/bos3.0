// 欄位標籤放在上方（Field＋Input／NativeSelect）。協助人員人數的選項值是字串 '0'～'3'、state 存的是數字，
// NativeSelect 以字串比對（與 MUI Select 一致）且 event.target.value 回傳選項原值（字串），handleAssistantName 的 parseInt 原樣保留；
// 分指定／互助均分的 Checkbox 仍用 MUI
import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { Delete, Plus, Trash2 } from 'lucide-react'
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

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
  { label: '0', value: '0' },
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
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }
  const handleDeleteAssistantContent = () => {
    const newSupport = cloneDeep(support)
    newSupport.pop({})
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
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
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleIsSplittedChange = index => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.isSplitted = !data.isSplitted
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleAssistantName = (event, index) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.nameList = []
        for (let i = 1; i <= parseInt(event.target.value); i++) {
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
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.percent = event.target.value
            break
          case '固定金額':
            data.cash = event.target.value
            break
          case '點數':
            data.point = event.target.value
            break
          default:
            break
        }
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.designatePercent = event.target.value
            break
          case '固定金額':
            data.designateCash = event.target.value
            break
          case '點數':
            data.designatePoint = event.target.value
            break
          default:
            break
        }
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }
  const handleNonDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.nonDesignatePercent = event.target.value
            break
          case '固定金額':
            data.nonDesignateCash = event.target.value
            break
          case '點數':
            data.nonDesignatePoint = event.target.value
            break
          default:
            break
        }
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleHelperType = (event, index) => {
    const newSupport = cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.type = event.target.value
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
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

  return (
    <Card {...rest}>
      <CardHeader>
        <CardTitle>互助點數設定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {support.map((content, index) => (
          <div className="flex flex-wrap items-start gap-4" key={index}>
            <Field label="扣項類別" className="w-full sm:w-36">
              <NativeSelect
                onChange={event => handleDeductionTypeChange(event, index)}
                value={content.helperDeductionType}
              >
                {deductions.map((data, idx) => (
                  <NativeSelectOption value={data.value} key={`${data.value}-${idx}`}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="類別" className="w-full sm:w-36">
              <NativeSelect
                onChange={event => handleHelperType(event, index)}
                value={content.type}
              >
                {merchantHelperItems?.map((data, idx) => (
                  <NativeSelectOption value={data.type} key={`${data.type}-${idx}`}>
                    {data.type}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="協助人員人數" className="w-full sm:w-36">
              <NativeSelect
                onChange={event => handleAssistantName(event, index)}
                value={content.peopleCount}
              >
                {assistantNum.map((data, idx) => (
                  <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label="扣項方式" className="w-full sm:w-36">
              <NativeSelect
                onChange={event => handleDeductionWayChange(event, index)}
                value={content.deductionWay}
              >
                {deductionWay2.map((data, idx) => (
                  <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            {content.isDesignate ? (
              <div className="flex flex-col gap-1">
                <div className="flex gap-3">
                  <Field label={`指定${content.deductionWay}`} className="w-28">
                    <Input
                      type="number"
                      name="designateInput"
                      value={handleReturnDeductionValue(content, content.deductionWay, true)}
                      onChange={event =>
                        handleDesignateDeductionWayInput(event, index, content.deductionWay)
                      }
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                  <Field label={`不指定${content.deductionWay}`} className="w-28">
                    <Input
                      type="number"
                      name="NonDesignateInput"
                      value={handleReturnDeductionValue(content, content.deductionWay, false)}
                      onChange={event =>
                        handleNonDesignateDeductionWayInput(event, index, content.deductionWay)
                      }
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
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
                    <Field label={content.deductionWay} className="w-28">
                      <Input
                        type="number"
                        value={handleReturnValue(content, content.deductionWay)}
                        onChange={event =>
                          handleDeductionWayInput(event, index, content.deductionWay)
                        }
                        onWheel={() => document.activeElement.blur()}
                      />
                    </Field>
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
              {index !== 0 && index === support.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary hover:text-danger"
                  aria-label="刪除此互助設定"
                  onClick={handleDeleteAssistantContent}
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
