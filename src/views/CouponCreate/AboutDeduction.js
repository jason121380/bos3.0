// 欄位標籤放在上方（Field＋Input／NativeSelect）。扣項基準點的選項值是數字，NativeSelect 的 event.target.value 回傳原始數字，
// 所以 handleDeductionReference 的 parseInt 等既有處理原樣保留；分指定／不指定的 Checkbox 仍用 MUI
import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { Delete, Plus, Trash2 } from 'lucide-react'
// import useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import cloneDeep from 'lodash/cloneDeep'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'

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

function AboutDeduction({ className, deductionItem, onChange, ServiceDeductionItems, ...rest }) {
  // const merchantDeductionItems = useFetchMerchantDeductionItems()
  // const deductionItems = idx(merchantDeductionItems, _ => _.data.merchantDeductionItems)

  const handleAddDeductionContent = (type, deductionOrder) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
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
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeleteDeductionContent = (type, index) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.splice(index, 1)
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleCheckboxChange = (type, index) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
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
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionName = (type, event, index) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
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
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }
  const handleDeductionTypeChange = (type, event, index) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
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
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionNum = (type, event, index, moneyType) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            switch (moneyType) {
              case 'price':
                data2.price = parseInt(event.target.value, 10)
                break
              case 'designatePrice':
                data2.designatePrice = parseInt(event.target.value, 10)
                break
              case 'nonDesignatePrice':
                data2.nonDesignatePrice = parseInt(event.target.value, 10)
                break
              default:
                break
            }
          }
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionReference = (type, event, index) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.deductionReference = parseInt(event.target.value, 10)
          }
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionWay = (type, event, index) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
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
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleClear = (type, index) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
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
      key: 'ServiceDeductionItems',
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
      {ServiceDeductionItems.map(data => (
        <div key={`${data.type}`} className="border-0 border-t border-solid border-border first:border-t-0">
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
                  <Field label="扣項類別" className="w-full sm:w-36">
                    <NativeSelect
                      onChange={event => handleDeductionTypeChange(data.type, event, index)}
                      value={content.type}
                    >
                      {deductions.map((data, idx) => (
                        <NativeSelectOption value={data.value} key={`${data.value}-${idx}`}>
                          {data.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                  {/* <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                    <InputLabel id="select-item-label">
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
                    <Field label="扣成方式" className="w-full sm:w-36">
                      <NativeSelect
                        onChange={event => handleDeductionWay(data.type, event, index)}
                        value={content.deductionWay}
                      >
                        {deductionWay2.map((data, idx) => (
                          <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                            {data.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </Field>
                  )}
                  {content.isSpecial && content.name ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-3">
                        <Field
                          label={content.deductionWay === '扣固定金額' ? '指定金額' : '指定%'}
                          className="w-24"
                        >
                          <Input
                            type="number"
                            value={content.designatePrice}
                            onChange={event =>
                              handleDeductionNum(data.type, event, index, 'designatePrice')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </Field>
                        <Field
                          label={content.deductionWay === '扣固定金額' ? '不指定金額' : '不指定%'}
                          className="w-24"
                        >
                          <Input
                            type="number"
                            value={content.nonDesignatePrice}
                            onChange={event =>
                              handleDeductionNum(data.type, event, index, 'nonDesignatePrice')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </Field>
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
                          <Field
                            label={content.deductionWay === '扣固定金額' ? '固定金額' : '業績%數'}
                            className="w-24"
                          >
                            <Input
                              type="number"
                              value={content.price}
                              onChange={event => handleDeductionNum(data.type, event, index, 'price')}
                              onWheel={() => document.activeElement.blur()}
                            />
                          </Field>
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
                  <Field label="扣項基準點" className="w-full sm:w-36">
                    <NativeSelect
                      value={index === 0 ? 0 : content.deductionReference}
                      onChange={event => handleDeductionReference(data.type, event, index)}
                    >
                      {menuItemGenerate(content.deductionOrder).map((data, index) => (
                        <NativeSelectOption value={data.value} key={index}>
                          {data.title}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-text-secondary"
                      aria-label="新增扣項"
                      onClick={() => handleAddDeductionContent(data.type, content.deductionOrder)}
                    >
                      <Plus strokeWidth={1.75} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </div>
      ))}
    </Card>
  )
}

AboutDeduction.propTypes = {
  className: PropTypes.object,
}

export default AboutDeduction
