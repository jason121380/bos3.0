// 下拉改為 NativeSelect（值可能為空字串，以索引對應、回傳原始型別）；外框已換 ui/dialog（舊 Modal 無 onClose，點背景/Esc 不關閉）、MUI Checkbox 保留，欄位與按鈕為 src/ui
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import PropTypes from 'prop-types'
import { useState } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { Delete, Plus, Trash2 } from 'lucide-react'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
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
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
]

function AssistantSettingEditModal({
  openEditAssistantModal,
  merchantHelperItems,
  onClose,
  helperDeductionSetting,
  setHelperDeductionSetting,
  handleSubmitHelperDeductionSettingWarning,
}) {
  const handleAddAssistantContent = () => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.push({
      type: '',
      helperDeductionType: 'onSales',
      nameList: [],
      peopleCount: 0,
      point: 0,
      cash: 0,
      percent: 0,
      designatePoint: 0,
      designateCash: 0,
      designatePercent: 0,
      nonDesignatePoint: 0,
      nonDesignateCash: 0,
      nonDesignatePercent: 0,
      isDesignate: false,
      deductionWay: '',
      isSplitted: false,
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeleteAssistantContent = index => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.splice(index, 1)
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleClear = index => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting[index] = {
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
    }
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeductionTypeChange = (event, index) => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.helperDeductionType = event.target.value
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleHelperType = (event, index) => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)

    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.type = event.target.value
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleAssistantName = (event, index) => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.nameList = []
        for (let i = 1; i <= parseInt(event.target.value, 10); i++) {
          data.nameList.push(String(i))
        }
        data.peopleCount = data.nameList.length
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeductionWayChange = (event, index) => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)

    newHelperDeductionSetting.forEach((data, index2) => {
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
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleCheckboxChange = index => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
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
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleIsSplittedChange = index => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.isSplitted = !data.isSplitted
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.designatePercent = parseInt(event.target.value, 10)
            break
          case '固定金額':
            data.designateCash = parseInt(event.target.value, 10)
            break
          case '點數':
            data.designatePoint = parseFloat(event.target.value)
            break
          default:
            break
        }
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeductionWayInput = (event, index, deductionWay) => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.percent = parseInt(event.target.value, 10)
            break
          case '固定金額':
            data.cash = parseInt(event.target.value, 10)
            break
          case '點數':
            data.point = parseFloat(event.target.value)
            break
          default:
            break
        }
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleNonDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newHelperDeductionSetting = cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.nonDesignatePercent = parseInt(event.target.value, 10)
            break
          case '固定金額':
            data.nonDesignateCash = parseInt(event.target.value, 10)
            break
          case '點數':
            data.nonDesignatePoint = parseFloat(event.target.value)
            break
          default:
            break
        }
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  return (
    // 舊版 Modal 未設 onClose（點背景／Esc 不關閉），故不傳 onOpenChange；hideClose 保留原「關閉」按鈕，寬度保留原 912px
    <Dialog open={openEditAssistantModal}>
      <DialogContent size="lg" className="max-w-[912px]" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>互助點數設定</DialogTitle>
          <Button variant="secondary" onClick={onClose}>
            關閉
          </Button>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          {helperDeductionSetting.map((content, index) => (
            <div className="flex flex-wrap items-end gap-3" key={index}>
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
                <NativeSelect value={content.type} onChange={event => handleHelperType(event, index)}>
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
                  value={content.deductionWay}
                  onChange={event => handleDeductionWayChange(event, index)}
                >
                  {deductionWay2.map((data, idx) => (
                    <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              {content.deductionWay !== '' && (
                <span className="flex flex-col whitespace-nowrap">
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
                </span>
              )}
              {content.designatePercent ||
                content.designateCash ||
                content.designatePoint ||
                content.designatePercent ||
                content.designateCash ||
                content.designatePoint > 0 ||
                content.isDesignate ? (
                <>
                  <Field
                    className="w-28"
                    label={
                      content.deductionWay
                        ? `指定${content.deductionWay}`
                        : content.designatePoint > 0
                          ? '指定點數'
                          : content.content.designateCash
                            ? '指定固定金額'
                            : '指定業績%數'
                    }
                  >
                    <Input
                      type="number"
                      name="designateInput"
                      value={
                        content.designatePercent ||
                          content.designateCash ||
                          content.designatePoint > 0
                          ? content.designatePercent ||
                          content.designateCash ||
                          content.designatePoint
                          : 0
                      }
                      onChange={event =>
                        handleDesignateDeductionWayInput(event, index, content.deductionWay)
                      }
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                  <Field
                    className="w-28"
                    label={
                      content.deductionWay
                        ? `不指定${content.deductionWay}`
                        : content.nonDesignatePoint > 0
                          ? '不指定點數'
                          : content.nonDesignateCash
                            ? '不指定固定金額'
                            : '不指定業績%數'
                    }
                  >
                    <Input
                      type="number"
                      name="NonDesignateInput"
                      value={
                        content.nonDesignatePercent ||
                          content.nonDesignateCash ||
                          content.nonDesignatePoint > 0
                          ? content.nonDesignatePercent ||
                          content.nonDesignateCash ||
                          content.nonDesignatePoint
                          : 0
                      }
                      onChange={event =>
                        handleNonDesignateDeductionWayInput(event, index, content.deductionWay)
                      }
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                </>
              ) : (
                content.deductionWay !== '' && (
                  <Field
                    className="w-28"
                    label={
                      content.deductionWay
                        ? content.deductionWay
                        : content.point > 0
                          ? '點數'
                          : content.cash > 0
                            ? '固定金額'
                            : '業績%數'
                    }
                  >
                    <Input
                      type="number"
                      name="designateInput"
                      value={
                        content.percent || content.cash || content.point > 0
                          ? content.percent || content.cash || content.point
                          : 0
                      }
                      onChange={event => handleDeductionWayInput(event, index, content.deductionWay)}
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
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
                  >
                    <Delete strokeWidth={1.75} />
                  </Button>
                )}
                {helperDeductionSetting.length > 1 && (
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
                {index === helperDeductionSetting.length - 1 && (
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
        </DialogBody>
        <DialogFooter>
          {/* 批次儲存會覆蓋原先設定（送出前另有確認提示），以 danger 表示 */}
          <Button variant="danger" onClick={handleSubmitHelperDeductionSettingWarning}>
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

AssistantSettingEditModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AssistantSettingEditModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default AssistantSettingEditModal
