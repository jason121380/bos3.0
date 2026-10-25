import { Button } from 'ui/button'
import { Input } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { memo, Fragment } from 'react'
import cloneDeep from 'lodash/cloneDeep'

const optionsArray = [
  { "hairProperties": '髮質屬性' },
  { "scalpProperties": '頭皮屬性' },
  { "permAppliance": '燙髮用具' },
  { "permPotion": '燙髮藥水' },
  { "hairColorCategory": '染髮類別' },
  { "hairColor": '染髮色系' }
]

function AboutCustomerTracking({ className, inputEnable, hairCondition, setHairCondition }) {
  const handleAddOption = key => {
    const conditions = cloneDeep(hairCondition)
    conditions[key].push('')
    setHairCondition(conditions)
  }

  const handleDeleteOption = (key, index) => {
    const conditions = cloneDeep(hairCondition)
    conditions[key].splice(index, 1)
    setHairCondition(conditions)
  }

  const handleInputOnChange = (event, key, index) => {
    const value = event.target.value
    const conditions = cloneDeep(hairCondition)
    conditions[key][index] = value
    setHairCondition(conditions)
  }
  return (
    <Fragment>
      {optionsArray.map((d, i) => {
        const [[key, title]] = Object.entries(d)
        const options = hairCondition[key]
        return (
          <Card key={`${title}-${i}`} id={`parameter-tracking-${key}`} className="scroll-mt-6">
            <CardHeader>
              <CardTitle>{`${title}設定`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {options.length ? options.map((data, index) => (
                  <div className="flex flex-wrap items-center gap-2" key={index}>
                    <span className="inline-block w-7 shrink-0 text-body tabular-nums text-text-secondary">
                      {index + 1}
                    </span>
                    <Input
                      className="min-w-[10rem] flex-1"
                      disabled={!inputEnable}
                      type="text"
                      value={data}
                      onChange={event => handleInputOnChange(event, key, index)}
                    />
                    {options.length >= 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`刪除第 ${index + 1} 項`}
                      title={`刪除第 ${index + 1} 項`}
                      disabled={!inputEnable}
                      onClick={() => handleDeleteOption(key, index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                    )}
                    {index === options.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="新增一項"
                        title="新增一項"
                        disabled={!inputEnable}
                        onClick={() => handleAddOption(key)}
                      >
                        <Plus size={16} />
                      </Button>
                    )}
                  </div>
                )) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body text-text-secondary">
                      無資料
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="新增一項"
                      title="新增一項"
                      disabled={!inputEnable}
                      onClick={() => handleAddOption(key)}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </Fragment>
  )
}

export default memo(AboutCustomerTracking)
