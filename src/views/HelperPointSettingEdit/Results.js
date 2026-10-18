// FormControlLabel＋Checkbox、ToggleButtonGroup 保留 MUI（橋接主題已套新外觀）
import {
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { Plus, Trash2 } from 'lucide-react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import { cn } from 'ui/utils'

const statusEnum = [
  { label: '固定金額', value: 'FIXED' },
  { label: '全段', value: 'NONSEGMENTED' },
  { label: '分段', value: 'SEGMENTED' },
]

function Results({ className, status, submitData, setSubmitData, isLoading, ...rest }) {
  const handleAddRow = () => {
    const newSubmitData = _.cloneDeep(submitData)
    newSubmitData[status].push({ threshold: 0, price: 0 })
    setSubmitData(newSubmitData)
  }
  const handleDeleteRow = index => {
    const newSubmitData = _.cloneDeep(submitData)
    newSubmitData[status].splice(index, 1)
    setSubmitData(newSubmitData)
  }
  const handleEditRow = (index, value, key) => {
    const newSubmitData = _.cloneDeep(submitData)
    newSubmitData[status][index][key] = value
    setSubmitData(newSubmitData)
  }
  return (
    <Card {...rest} className={cn('max-w-3xl', className)}>
      <CardHeader>
        <CardTitle>互助點數設定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        <Field label="互助點數設定名稱" htmlFor="helperPointSettingName">
          <Input
            id="helperPointSettingName"
            value={submitData.name}
            onFocus={e => e.target.select()}
            onChange={e => setSubmitData({ ...submitData, name: e.target.value })}
          />
        </Field>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center text-heading text-text">點數使用成本設定</div>
            <FormControlLabel
              checked={submitData.isAccordingToHelper}
              onChange={(e, v) => setSubmitData({ ...submitData, isAccordingToHelper: v })}
              control={<Checkbox color="primary" />}
              label="依互助人固定金額"
            />
          </div>
          <Field label="換算金額" htmlFor="helperPointPaidFixed">
            <Input
              id="helperPointPaidFixed"
              value={submitData.paidFixed}
              type='number'
              min={0}
              onFocus={e => e.target.select()}
              onChange={e => setSubmitData({ ...submitData, paidFixed: parseInt(Math.abs(e.target.value)) })}
              onWheel={() => document.activeElement.blur()}
            />
          </Field>
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-heading text-text">點數獲得設定</div>
          <ToggleButtonGroup
            size="small"
            value={submitData.retrievePointWay}
            onChange={(e, value) => value && setSubmitData({ ...submitData, retrievePointWay: value })}
            exclusive
          >
            {statusEnum.map((data, idx) => (
              <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                {data.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <div className="mt-2 flex flex-col gap-5">
            {status === 'FIXED' ?
              (<Field label="換算金額" className="w-[200px]">
                <Input
                  type='number'
                  aria-label="換算金額"
                  value={submitData.retrieveFixed}
                  onFocus={e => e.target.select()}
                  onChange={e => setSubmitData({ ...submitData, retrieveFixed: parseInt(Math.abs(e.target.value)) })}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>) :
              submitData[status].map((d, index) => (
                <div className="flex flex-wrap items-end gap-x-5 gap-y-2.5" key={index}>
                  <Field label="點數門檻" className="w-[200px]">
                    <Input
                      type='number'
                      aria-label="點數門檻"
                      value={d.threshold}
                      onChange={e => handleEditRow(index, parseInt(Math.abs(e.target.value)), 'threshold')}
                      onFocus={e => e.target.select()}
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                  <Field label="換算金額" className="w-[200px]">
                    <Input
                      type='number'
                      aria-label="換算金額"
                      value={d.price}
                      onChange={e => handleEditRow(index, parseInt(Math.abs(e.target.value)), 'price')}
                      onFocus={e => e.target.select()}
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                  <div className="flex">
                    {index > 0 &&
                      <Button variant="ghost" size="icon" aria-label="刪除此段" className="text-text-secondary hover:text-danger" onClick={() => handleDeleteRow(index)}>
                        <Trash2 strokeWidth={1.75} />
                      </Button>}
                    {index === submitData[status].length - 1 &&
                      <Button variant="ghost" size="icon" aria-label="新增一段" onClick={() => handleAddRow(index)}>
                        <Plus strokeWidth={1.75} />
                      </Button>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

Results.propTypes = {
  className: PropTypes.object,
}

export default Results
