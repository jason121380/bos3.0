// 扣項欄位的值可能為空字串或數字（扣項基準點），保留 MUI Select；同列的數字欄位也保留 MUI TextField 以維持標籤樣式一致
import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { FormControl, InputLabel, MenuItem, Select } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import { Delete, Plus, Trash2 } from 'lucide-react'
import useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import idx from 'idx'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { useRef, Fragment } from 'react'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'

const deductionWay2 = [
  { label: '依業績%數', value: '扣趴數' },
  { label: '依固定金額', value: '扣固定金額' },
]

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

function AboutDeduction({
  className,
  deductionItem,
  onChange,
  ServiceDeductionItems,
  truthPerformPredict,
  helperDeductionNums,
  helperPoint,
  ...rest
}) {
  const inputLabel = useRef()
  const merchantDeductionItems = useFetchMerchantDeductionItems()
  const deductionItems = idx(merchantDeductionItems, _ => _.data.merchantDeductionItems)

  const handleAddDeductionContent = (type, deductionOrder) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.push({
          isSpecial: false,
          name: '材料費',
          type: 'onSales',
          deductionWay: '',
          price: 0,
          designatePrice: 0,
          nonDesignatePrice: 0,
          deductionOrder: deductionOrder + 1,
          deductionReference: 0,
        })
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeleteDeductionContent = (type, index, deductionType) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.splice(index, 1)
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleCheckboxChange = (type, index, deductionType) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            return (
              (data2.isSpecial = !data2.isSpecial),
              (data2.price = 0),
              (data2.designatePrice = 0),
              (data2.nonDesignatePrice = 0)
            )
          }
        })
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionName = (type, event, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.name = event.target.value
          }
        })
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionNum = (type, event, index, moneyType) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            switch (moneyType) {
              case 'price':
                data2.price = parseInt(event.target.value)
                break
              case 'designatePrice':
                data2.designatePrice = parseInt(event.target.value)
                break
              case 'nonDesignatePrice':
                data2.nonDesignatePrice = parseInt(event.target.value)
                break
              default:
                break
            }
          }
        })
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionReference = (type, event, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.deductionReference = parseInt(event.target.value)
          }
        })
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionWay = (type, event, index, deductionType) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.deductionWay = event.target.value
          }
        })
      }
    })

    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleClear = (type, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings[index] = {
          ...data.itemSettings[index],
          isSpecial: false,
          name: '材料費',
          type: 'onSales',
          deductionWay: '',
          price: 0,
          designatePrice: 0,
          nonDesignatePrice: 0,
        }
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionTypeChange = (type, event, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.type = event.target.value
          }
        })
      }
    })
    onChange({
      key: 'serviceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const menuItemGenerate = num => {
    const arr = [{ title: '依業績', value: 0 }]
    if (num === 1) {
      return arr
    } else {
      for (let i = 1; i < num; i++) {
        arr.push({
          title: i,
          value: i,
        })
      }
      return arr
    }
  }

  return (
    <Card {...rest}>
      {ServiceDeductionItems.map((data, idx) => (
        <Fragment key={`${data.type}`}>
          {idx > 0 && <div className="h-px bg-border" />}
          <CardHeader>
            <CardTitle>{`項目扣項設定 - ${data.type}`}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.itemSettings.map((content, index) => {
              return (
                <div className="flex flex-wrap items-start gap-4" key={index}>
                  <span className="flex h-9 w-6 items-center justify-center text-heading tabular-nums text-text-secondary">
                    {content.deductionOrder}
                  </span>
                  <div className="w-full sm:w-36">
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel ref={inputLabel} id="select-item-label">
                        扣項類別
                      </InputLabel>
                      <Select
                        labelId="select-item-label"
                        id="select-item"
                        label='扣項類別'
                        onChange={event => handleDeductionTypeChange(data.type, event, index)}
                        value={content.type}
                      >
                        {deductions.map((data, idx) => (
                          <MenuItem value={data.value} key={`${data.value}-${idx}`}>
                            {data.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  {/* <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                    <InputLabel ref={inputLabel} id="select-item-label">
                      項目
                    </InputLabel>
                    <Select
                      labelId="select-item-label"
                      id="select-item"
                      label='項目'
                      onChange={event => handleDeductionName(data.type, event, index)}
                      value={content.name}
                    >
                      {deductionItems?.map((data, idx) => (
                        <MenuItem value={data.name} key={idx}>
                          {data.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl> */}
                  {content.name && (
                    <div className="w-full sm:w-36">
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel ref={inputLabel} id="select-item-label">
                          扣成方式
                        </InputLabel>
                        <Select
                          label='扣成方式'
                          labelId="select-item-label"
                          id="select-item"
                          onChange={event => handleDeductionWay(data.type, event, index)}
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
                  )}
                  {content.isSpecial && content.name ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-3">
                        <TextField
                          style={{ width: '5rem' }}
                          type="number"
                          variant="outlined"
                          label={content.deductionWay === '扣固定金額' ? '指定金額' : '指定%'}
                          value={content.designatePrice}
                          onChange={event =>
                            handleDeductionNum(data.type, event, index, 'designatePrice')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                        <TextField
                          style={{ width: '5rem' }}
                          type="number"
                          variant="outlined"
                          label={content.deductionWay === '扣固定金額' ? '不指定金額' : '不指定%'}
                          value={content.nonDesignatePrice}
                          onChange={event =>
                            handleDeductionNum(data.type, event, index, 'nonDesignatePrice')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={<Checkbox color="primary" />}
                          label="分指定/不指定"
                          style={{ 'whiteSpace': 'nowrap' }}
                          checked={content.isSpecial}
                          onChange={() => handleCheckboxChange(data.type, index)}
                        />
                      </div>
                    </div>
                  ) : (
                    content.name && (
                      <div className="flex flex-col gap-1">
                        <div>
                          <TextField
                            style={{ width: '5rem' }}
                            type="number"
                            variant="outlined"
                            label={content.deductionWay === '扣固定金額' ? '固定金額' : '業績%數'}
                            value={content.price}
                            onChange={event => handleDeductionNum(data.type, event, index, 'price')}
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div>
                          <FormControlLabel
                            control={<Checkbox color="primary" />}
                            label="分指定/不指定"
                            style={{ 'whiteSpace': 'nowrap' }}
                            checked={content.isSpecial}
                            onChange={() => handleCheckboxChange(data.type, index)}
                          />
                        </div>
                      </div>
                    )
                  )}
                  <div className="w-full sm:w-36">
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel ref={inputLabel} id="select-item-label">
                        扣項基準點
                      </InputLabel>
                      <Select
                        value={index === 0 ? 0 : content.deductionReference}
                        label='扣項基準點'
                        labelId="select-item-label"
                        id="select-item"
                        onChange={event => handleDeductionReference(data.type, event, index)}
                      >
                        {menuItemGenerate(content.deductionOrder).map((data, index) => (
                          <MenuItem value={data.value} key={index}>
                            {data.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="flex items-center gap-1">
                    {content.name !== '' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-text-secondary"
                        aria-label="清除此扣項"
                        onClick={() => handleClear(data.type, index)}
                        data-testid={`service-${index}-clear`}
                      >
                        <Delete strokeWidth={1.75} />
                      </Button>
                    )}
                    {index !== 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-text-secondary hover:text-danger"
                        aria-label="刪除此扣項"
                        onClick={() => handleDeleteDeductionContent(data.type, index)}
                      >
                        <Trash2 strokeWidth={1.75} />
                      </Button>
                    )}
                    {index === data.itemSettings.length - 1 || 0 ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-text-secondary"
                        aria-label="新增扣項"
                        onClick={() => handleAddDeductionContent(data.type, content.deductionOrder)}
                      >
                        <Plus strokeWidth={1.75} />
                      </Button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              )
            })}
            <div className="flex flex-col items-end gap-1 text-body font-medium tabular-nums text-text">
              <p>
                實業績(含扣項):{formatNumber(Math.round(truthPerformPredict[idx]) || 0)}
              </p>
              <p>
                實業績(含扣項、扣互助)預估:
                {formatNumber(Math.round(truthPerformPredict[idx] - helperDeductionNums) || 0)}{helperPoint ? helperPoint < 0 ? ` + ${helperPoint * -1}點` : ` - ${helperPoint}點` : null}
              </p>
            </div>
          </CardContent>
        </Fragment>
      ))}
    </Card>
  )
}

AboutDeduction.propTypes = {
  className: PropTypes.object,
}

export default AboutDeduction
