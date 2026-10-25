import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Input } from 'ui/input'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo, Fragment } from 'react'
import cloneDeep from 'lodash/cloneDeep'

function AboutSalaryAddAndDeduction({ className, service, onChange, inputEnable }) {
  const handleAddSetting = (...rest) => {
    const newService = cloneDeep(service)
    switch (rest[0]) {
      case 'salaryIncreaseItem':
        newService.salaryIncreaseItem.push({ itemSetting: '', sorting: rest[1] + 1 })
        onChange({ changedData: newService.salaryIncreaseItem, key: 'salaryIncreaseItem' })
        break
      case 'salaryDecreaseItem':
        newService.salaryDecreaseItem.push({ itemSetting: '', sorting: rest[1] + 1 })
        onChange({ changedData: newService.salaryDecreaseItem, key: 'salaryDecreaseItem' })
        break
    }
  }
  const handleDeleteSetting = (...rest) => {
    const newService = cloneDeep(service)
    switch (rest[0]) {
      case 'salaryIncreaseItem':
        newService.salaryIncreaseItem.splice(rest[1], 1)
        onChange({ changedData: newService.salaryIncreaseItem, key: 'salaryIncreaseItem' })
        break
      case 'salaryDecreaseItem':
        newService.salaryDecreaseItem.splice(rest[1], 1)
        onChange({ changedData: newService.salaryDecreaseItem, key: 'salaryDecreaseItem' })
        break
    }
  }

  const handleSalaryIncreaseName = (index, event) => {
    const newService = cloneDeep(service)
    newService.salaryIncreaseItem[index] = {
      ...newService.salaryIncreaseItem[index],
      itemSetting: event.target.value,
    }
    onChange({ changedData: newService.salaryIncreaseItem, key: 'salaryIncreaseItem' })
  }

  const handleSalaryDecreaseItemName = (index, event) => {
    const newService = cloneDeep(service)
    newService.salaryDecreaseItem[index] = {
      ...newService.salaryDecreaseItem[index],
      itemSetting: event.target.value,
    }
    onChange({ changedData: newService.salaryDecreaseItem, key: 'salaryDecreaseItem' })
  }
  return (
    <Fragment>
      <Card id="parameter-salary-increase" className="scroll-mt-6">
        <CardHeader>
          <CardTitle>薪資加項科目設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {service.salaryIncreaseItem.map((data, index) => (
              <div className="flex items-center mb-[24px] w-[190px]" key={index}>
                <span
                  className="inline-block shrink-0 text-heading tabular-nums text-text"
                  style={{ margin: '0 5px', width: '25px' }}
                >
                  {data.sorting}
                </span>
                <Input
                  className="min-w-0 flex-1"
                  disabled={!inputEnable}
                  type="text"
                  aria-label="薪資加項科目設定"
                  value={data.itemSetting}
                  onChange={event => handleSalaryIncreaseName(index, event)}
                />
                <div style={{ display: 'flex' }}>
                  {service.salaryIncreaseItem.length > 1 && (
                    <DeleteForeverIcon
                      onClick={() =>
                        inputEnable && handleDeleteSetting('salaryIncreaseItem', index)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  {index === service.salaryIncreaseItem.length - 1 && (
                    <AddIcon
                      onClick={() =>
                        inputEnable && handleAddSetting('salaryIncreaseItem', data.sorting)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card id="parameter-salary-decrease" className="scroll-mt-6">
        <CardHeader>
          <CardTitle>薪資扣項科目設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {service.salaryDecreaseItem.map((data, index) => (
              <div className="flex items-center mb-[24px] w-[190px]" key={index}>
                <span
                  className="inline-block shrink-0 text-heading tabular-nums text-text"
                  style={{ margin: '0 5px', width: '25px' }}
                >
                  {data.sorting}
                </span>
                <Input
                  className="min-w-0 flex-1"
                  disabled={!inputEnable}
                  type="text"
                  aria-label="薪資扣項科目設定"
                  value={data.itemSetting}
                  onChange={event => handleSalaryDecreaseItemName(index, event)}
                />
                <div style={{ display: 'flex' }}>
                  {service.salaryDecreaseItem.length > 1 && (
                    <DeleteForeverIcon
                      onClick={() =>
                        inputEnable && handleDeleteSetting('salaryDecreaseItem', index)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  {index === service.salaryDecreaseItem.length - 1 && (
                    <AddIcon
                      onClick={() =>
                        inputEnable && handleAddSetting('salaryDecreaseItem', data.sorting)
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(AboutSalaryAddAndDeduction)
