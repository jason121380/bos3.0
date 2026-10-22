// 下拉改為 NativeSelect（值可能為數字，以索引對應、回傳原始型別）；外框已換 ui/dialog（舊 Modal 無 onClose，點背景/Esc 不關閉）、MUI Checkbox 保留，欄位與按鈕為 src/ui
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { Delete, Plus, Trash2 } from 'lucide-react'
import useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import idx from 'idx'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
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

function AboutDeductionEditModal({
  openEditDeductionModal,
  ServiceDeductionItems,
  onClose,
  setServiceDeductionItems,
  handleSubmitDeductionSettingWarning,
}) {

  const merchantDeductionItems = useFetchMerchantDeductionItems()
  const deductionItems = idx(merchantDeductionItems, _ => _.data.merchantDeductionItems)

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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const handleDeleteDeductionContent = (type, index, deductionType) => {
    const newServiceDeductionItems = cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.splice(index, 1)
      }
    })
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const handleCheckboxChange = (type, index, deductionType) => {
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const menuItemGenerate = num => {
    const arr = [{ title: '依原業績', value: 0 }]
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
    // 舊版 Modal 未設 onClose（點背景／Esc 不關閉），故不傳 onOpenChange；hideClose 保留原「關閉」按鈕，寬度保留原 912px
    <Dialog open={openEditDeductionModal}>
      <DialogContent size="lg" className="max-w-[912px]" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>扣項項目設定</DialogTitle>
          <Button variant="secondary" onClick={onClose}>
            關閉
          </Button>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          {ServiceDeductionItems.map(data => (
            <Fragment key={`${data.type}`}>
              <div className="flex flex-col gap-4">
                <h3 className="text-heading text-text">{`項目扣項設定 - ${data.type}`}</h3>
                {data.itemSettings.map((content, index) => {
                  return (
                    <div className="flex flex-wrap items-end gap-3" key={index}>
                      <span className="w-6 text-center text-heading tabular-nums text-text-secondary">
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
                        <Field label="抽成方式" className="w-full sm:w-36">
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
                      {content.name && (
                        <FormControlLabel
                          className="whitespace-nowrap"
                          control={<Checkbox color="primary" />}
                          label="分指定/不指定"
                          checked={content.isSpecial}
                          onChange={() => handleCheckboxChange(data.type, index)}
                        />
                      )}

                      {content.isSpecial && content.name ? (
                        <>
                          <Field
                            className="w-28"
                            label={content.deductionWay === '扣固定金額' ? '指定金額' : '指定%'}
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
                            className="w-28"
                            label={content.deductionWay === '扣固定金額' ? '不指定金額' : '不指定%'}
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
                        </>
                      ) : (
                        content.name && (
                          <Field
                            className="w-28"
                            label={content.deductionWay === '扣固定金額' ? '固定金額' : '業績%數'}
                          >
                            <Input
                              type="number"
                              value={content.price}
                              onChange={event => handleDeductionNum(data.type, event, index, 'price')}
                              onWheel={() => document.activeElement.blur()}
                            />
                          </Field>
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
                        {index !== 0 && content.type === 'onSales' && (
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
                        {/* 只有最後一列可新增（比照新增頁），避免從中間列新增產生重複的順序編號 */}
                        {index === data.itemSettings.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-text-secondary"
                            aria-label="新增扣項"
                            onClick={() => handleAddDeductionContent(data.type, content.deductionOrder)}
                          >
                            <Plus strokeWidth={1.75} />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Fragment>
          ))}
        </DialogBody>
        <DialogFooter>
          {/* 批次儲存會覆蓋原先設定（送出前另有確認提示），以 danger 表示 */}
          <Button variant="danger" onClick={handleSubmitDeductionSettingWarning}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

AboutDeductionEditModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
}

AboutDeductionEditModal.defaultProps = {
  open: false,
}

export default AboutDeductionEditModal
