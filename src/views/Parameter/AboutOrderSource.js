import { Input } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo } from 'react'
import cloneDeep from 'lodash/cloneDeep'

function AboutOrderSource({ className, reference, setReference, inputEnable }) {
  const handleAddOption = () => {
    const data = cloneDeep(reference)
    data.push('')
    setReference(data)
  }

  const handleDeleteOption = index => {
    const data = cloneDeep(reference)
    data.splice(index, 1)
    setReference(data)
  }

  const handleInputOnChange = (event, index) => {
    const value = event.target.value
    const data = cloneDeep(reference)
    data[index] = value
    setReference(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>訂單來源</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {reference.map((label, index) => (
            <div className="flex items-center" key={index}>
              <span
                className="inline-block shrink-0 text-heading tabular-nums text-text"
                style={{ margin: '0 5px', width: '25px' }}
              >
                {index + 1}
              </span>
              <Input
                className="w-[214px] shrink-0"
                disabled={!inputEnable}
                type="text"
                value={label}
                onChange={event => handleInputOnChange(event, index)}
              />
              <div style={{ display: 'flex' }}>
                {reference.length >= 1 && (
                  <DeleteForeverIcon
                    disabled={!inputEnable}
                    onClick={() => handleDeleteOption(index)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
                {index === reference.length - 1 && (
                  <AddIcon
                    disabled={!inputEnable}
                    onClick={() => handleAddOption(index)}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutOrderSource)