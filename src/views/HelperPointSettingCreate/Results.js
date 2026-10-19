/** @jsxImportSource @emotion/react */
// 勾選（FormControlLabel，handler 使用 (e, v)）與獲得方式切換鈕保留 MUI
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'

const styles = {
  marginTop: css({
    marginTop: '30px'
  }),
  marginTop2: css({
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '20px'
  }),
  marginBottom: css({
    marginBottom: '12px'
  }),
  marginRight: css({
    marginRight: '20px'
  }),
  inputWidth: css({
    width: '200px'
  }),
  inputWrap: css({
    display: 'flex',
    gap: '10px 20px',
    flexWrap: 'wrap',
  }),
  iconWrap: css({
    display: 'flex',
    width: '100px',
  }),
}

const statusEnum = [
  { label: '固定金額', value: 'FIXED' },
  { label: '全段', value: 'NONSEGMENTED' },
  { label: '分段', value: 'SEGMENTED' },
]

function Results({ className, status, submitData, setSubmitData, ...rest }) {
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
    // 設定頁樣板（STYLE §12）：單一表單頁不造假選單，依既有三區塊切分段卡片；欄位、ToggleGroup、增刪與存值 handler 原樣
    <div {...rest} css={css([styles.root, className])} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>基本設定</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="互助點數設定名稱" htmlFor="helperPointSettingName">
            <Input
              id="helperPointSettingName"
              value={submitData.name}
              onFocus={e => e.target.select()}
              onChange={e => setSubmitData({ ...submitData, name: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>點數使用成本設定</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <FormControlLabel
            checked={submitData.isAccordingToHelper}
            onChange={(e, v) => setSubmitData({ ...submitData, isAccordingToHelper: v })}
            control={<Checkbox color="primary" />}
            label="依互助人固定金額"
          />
          <Field label="換算金額" htmlFor="helperPointPaidFixed">
            <Input
              id="helperPointPaidFixed"
              value={submitData.paidFixed}
              type='number'
              className="tabular-nums"
              onFocus={e => e.target.select()}
              onChange={e => setSubmitData({ ...submitData, paidFixed: parseInt(Math.abs(e.target.value)) })}
              min={0}
              onWheel={() => document.activeElement.blur()}
            />
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>點數獲得設定</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ToggleGroup
            size="small"
            value={submitData.retrievePointWay}
            onChange={(e, value) => value && setSubmitData({ ...submitData, retrievePointWay: value })}
            exclusive
          >
            {statusEnum.map((data, idx) => (
              <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                {data.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="mt-2 flex flex-col gap-5">
            {status === 'FIXED' ?
              (<Field label="換算金額" htmlFor="helperPointRetrieveFixed" className="w-[200px]">
                <Input
                  id="helperPointRetrieveFixed"
                  type='number'
                  className="tabular-nums"
                  value={submitData.retrieveFixed}
                  onFocus={e => e.target.select()}
                  onChange={e => setSubmitData({ ...submitData, retrieveFixed: parseInt(Math.abs(e.target.value)) })}
                  onWheel={() => document.activeElement.blur()}
                />
              </Field>) :
              submitData[status].map((d, index) => (
                <div className="flex flex-wrap items-end gap-x-5 gap-y-2.5" key={index}>
                  <Field label="點數門檻" htmlFor={`helperPointThreshold-${index}`} className="w-[200px]">
                    <Input
                      id={`helperPointThreshold-${index}`}
                      type='number'
                      className="tabular-nums"
                      value={d.threshold}
                      onChange={e => handleEditRow(index, parseInt(Math.abs(e.target.value)), 'threshold')}
                      onFocus={e => e.target.select()}
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                  <Field label="換算金額" htmlFor={`helperPointPrice-${index}`} className="w-[200px]">
                    <Input
                      id={`helperPointPrice-${index}`}
                      type='number'
                      className="tabular-nums"
                      value={d.price}
                      onChange={e => handleEditRow(index, parseInt(Math.abs(e.target.value)), 'price')}
                      onFocus={e => e.target.select()}
                      onWheel={() => document.activeElement.blur()}
                    />
                  </Field>
                  <div className="flex gap-1">
                    {index > 0 &&
                      <Button variant="ghost" size="icon" aria-label="刪除此段" className="text-danger" onClick={() => handleDeleteRow(index)}>
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
        </CardContent>
      </Card>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
}

export default Results
