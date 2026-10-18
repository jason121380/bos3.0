// 彈窗內有 MUI Select（值可能為數字），依遷移指南保留 MUI Modal；外框、標題、按鈕改為 src/ui
import {
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useRef, Fragment } from 'react'
import _ from 'lodash'
import { Delete, Plus, Trash2 } from 'lucide-react'
import useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'

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
  const inputLabel = useRef()
  const merchantDeductionItems = useFetchMerchantDeductionItems()

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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const handleDeleteDeductionContent = (type, index, deductionType) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.splice(index, 1)
      }
    })
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const handleDeductionWay = (type, event, index) => {
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    <Modal open={openEditDeductionModal}>
      <Card className="ui-root absolute left-1/2 top-1/2 flex max-h-full w-[912px] max-w-full -translate-x-1/2 -translate-y-1/2 flex-col shadow-float outline-none">
        <CardHeader
          className="items-center pb-4"
          action={
            <Button variant="secondary" onClick={onClose}>
              關閉
            </Button>
          }
        >
          <CardTitle>扣項項目設定</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 overflow-y-auto pt-0">
          {ServiceDeductionItems.map(data => (
            <Fragment key={`${data.type}`}>
              <div className="flex flex-col gap-4">
                <h3 className="text-heading text-text">{`項目扣項設定 - ${data.type}`}</h3>
                {data.itemSettings.map((content, index) => {
                  return (
                    <div className="flex flex-wrap items-center gap-3" key={index}>
                      <span className="w-6 text-center text-heading tabular-nums text-text-secondary">
                        {content.deductionOrder}
                      </span>
                      <FormControl
                        variant="outlined"
                        style={{ width: '6rem' }}
                        fullWidth
                      >
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
                      {content.name && (
                        <FormControl variant="outlined" style={{ width: '6rem' }} fullWidth>
                          <InputLabel ref={inputLabel} id="select-item-label">
                            抽成方式
                          </InputLabel>
                          <Select
                            labelId="select-item-label"
                            id="select-item"
                            label='抽成方式'
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
                        </>
                      ) : (
                        content.name && (
                          <TextField
                            style={{ width: '5rem' }}
                            type="number"
                            variant="outlined"
                            label={content.deductionWay === '扣固定金額' ? '固定金額' : '業績%數'}
                            value={content.price}
                            onChange={event => handleDeductionNum(data.type, event, index, 'price')}
                            onWheel={() => document.activeElement.blur()}
                          />
                        )
                      )}

                      <FormControl variant="outlined" style={{ width: '6rem' }} fullWidth>
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
              </div>
            </Fragment>
          ))}
        </CardContent>
        <CardFooter>
          {/* 批次儲存會覆蓋原先設定（送出前另有確認提示），以 danger 表示 */}
          <Button variant="danger" onClick={handleSubmitDeductionSettingWarning}>
            儲存
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  )
}

AboutDeductionEditModal.propTypes = {
  css: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AboutDeductionEditModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default AboutDeductionEditModal
