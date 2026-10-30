// 金額輸入框（標籤為科目名稱、onWheel 失焦）使用 ui/text-field TextField；科目名稱單行文字欄改 ui Input（列內不加可見標籤，原 label 改 aria-label）
import { TextField } from 'ui/text-field'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import cloneDeep from 'lodash/cloneDeep'
import { openSnackbar } from 'elements/snackbars'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Input } from 'ui/input'

export default function SalaryInems({
  salaryIncreaseItemsReformatted,
  setSalaryIncreaseItemsReformatted,
  salaryDecreaseItemsReformatted,
  setSalaryDecreaseItemsReformatted,
  increaseSecondContent,
  setIncreaseSecondContent,
  decreaseSecondContent,
  setDecreaseSecondContent,
  setUserFixedSalaryItem,
  designerId,
}) {
  const history = useHistory()
  const handleIncreaseInput = (e, index) => {
    const newSalaryIncreaseItemsReformatted = cloneDeep(salaryIncreaseItemsReformatted)
    switch (e.target.name) {
      case 'price':
        newSalaryIncreaseItemsReformatted.forEach((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setSalaryIncreaseItemsReformatted(newSalaryIncreaseItemsReformatted)
        break
      default:
        break
    }
  }

  const handleDecreaseInput = (e, index) => {
    const newSalaryDecreaseItemsReformatted = cloneDeep(salaryDecreaseItemsReformatted)
    switch (e.target.name) {
      case 'price':
        newSalaryDecreaseItemsReformatted.forEach((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setSalaryDecreaseItemsReformatted(newSalaryDecreaseItemsReformatted)
        break
      default:
        break
    }
  }

  const handleIncreaseSecondInput = (e, index) => {
    const newIncreaseSecondContent = cloneDeep(increaseSecondContent)
    switch (e.target.name) {
      case 'price':
        newIncreaseSecondContent.increaseItems.forEach((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setIncreaseSecondContent(newIncreaseSecondContent)
        break
      case 'itemName':
        newIncreaseSecondContent.increaseItems.forEach((data, index2) => {
          if (index === index2) {
            data.itemName = e.target.value
          }
        })
        setIncreaseSecondContent(newIncreaseSecondContent)
        break
      default:
        break
    }
  }

  const handleDecreaseSecondInput = (e, index) => {
    const newDecreaseSecondContent = cloneDeep(decreaseSecondContent)
    switch (e.target.name) {
      case 'price':
        newDecreaseSecondContent.decreaseItems.forEach((data, index2) => {
          if (index === index2) {
            if (e.target.value === '') {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setDecreaseSecondContent(newDecreaseSecondContent)
        break
      case 'itemName':
        newDecreaseSecondContent.decreaseItems.forEach((data, index2) => {
          if (index === index2) {
            data.itemName = e.target.value
          }
        })
        setDecreaseSecondContent(newDecreaseSecondContent)
        break
      default:
        break
    }
  }

  const handleAddItem = () => {
    const newIncreaseSecondContent = cloneDeep(increaseSecondContent)
    newIncreaseSecondContent.increaseItems.push({
      itemName: '',
      price: 0,
      type: 'INCREASE',
    })
    setIncreaseSecondContent(newIncreaseSecondContent)
  }

  const handleDeductIncreaseItem = index => {
    const newIncreaseSecondContent = cloneDeep(increaseSecondContent)
    newIncreaseSecondContent.increaseItems.splice(index, 1)
    setIncreaseSecondContent(newIncreaseSecondContent)
  }

  const handleAddDecreaseItem = () => {
    const newDecreaseSecondContent = cloneDeep(decreaseSecondContent)
    newDecreaseSecondContent.decreaseItems.push({
      itemName: '',
      price: 0,
      type: 'DECREASE',
    })
    setDecreaseSecondContent(newDecreaseSecondContent)
  }

  const handleDeductDecreaseItem = index => {
    const newDecreaseSecondContent = cloneDeep(decreaseSecondContent)
    newDecreaseSecondContent.decreaseItems.splice(index, 1)
    setDecreaseSecondContent(newDecreaseSecondContent)
  }

  const handleSave = () => {
    const filteredSalaryIncreaseItems = salaryIncreaseItemsReformatted.filter(d => d.price > 0)
    const filteredSalaryDecreaseItems = salaryDecreaseItemsReformatted.filter(d => d.price > 0)
    const filteredIncreaseSecondContent = increaseSecondContent.increaseItems.filter(d => d.itemName.length > 0 && d.price > 0)
    const filteredDecreaseSecondContent = decreaseSecondContent.decreaseItems.filter(d => d.itemName.length > 0 && d.price > 0)
    let userFixedSalaryItemInputData = [
      ...filteredSalaryIncreaseItems,
      ...filteredSalaryDecreaseItems,
      ...filteredIncreaseSecondContent,
      ...filteredDecreaseSecondContent,
    ]
    // 過濾掉sorting
    userFixedSalaryItemInputData = userFixedSalaryItemInputData.map(({ sorting, ...keep }) => keep)
    const inputData = {
      userId: designerId,
      userFixedSalaryItem: userFixedSalaryItemInputData,
    }
    setUserFixedSalaryItem({
      input: inputData,
    }).then(message => {
      if (message.data.setUserFixedSalaryItem) {
        openSnackbar({
          message: '薪資加扣項儲存成功',
          variant: 'success',
        })
        history.push('/management/employee')
      }
    })
  }
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="tabular-nums">
              {`薪資加項小計:${
                salaryIncreaseItemsReformatted.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) +
                  increaseSecondContent.increaseItems.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) || 0
              }`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {salaryIncreaseItemsReformatted
                .sort((a, b) => a.sorting - b.sorting)
                .map((data, index) => {
                  return (
                    <div key={`increase-${index}`} className="flex items-center gap-1">
                      <span className="w-[25px] shrink-0 text-center text-label tabular-nums text-text-secondary">{index + 1}</span>
                      <TextField
                        variant="outlined"
                        label={data.itemName}
                        type="number"
                        value={data.price || 0}
                        name="price"
                        fullWidth
                        onChange={e => handleIncreaseInput(e, index)}
                        onWheel={() => document.activeElement.blur()}
                      />
                    </div>
                  )
                })}
            </div>
          </CardContent>
          <div className="h-px bg-border" />
          <CardContent>
            <div className="flex flex-col gap-4">
              {increaseSecondContent.increaseItems.map((data, index) => (
                <div key={`increase-${index}`}>
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      type="text"
                      className="w-[150px]"
                      aria-label="薪資加項科目"
                      name="itemName"
                      value={data.itemName}
                      onChange={e => handleIncreaseSecondInput(e, index)}
                    />
                    <TextField
                      type="number"
                      variant="outlined"
                      className="w-[150px]"
                      label="加項金額"
                      name="price"
                      value={data.price || 0}
                      onChange={e => handleIncreaseSecondInput(e, index)}
                      onWheel={() => document.activeElement.blur()}
                    />
                    {increaseSecondContent.increaseItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-text-secondary"
                        aria-label="刪除此項"
                        onClick={() => handleDeductIncreaseItem(index)}
                      >
                        <DeleteForeverIcon />
                      </Button>
                    )}
                    {index === increaseSecondContent.increaseItems.length - 1 ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-text-secondary"
                        aria-label="新增一項"
                        onClick={() => handleAddItem()}
                      >
                        <AddIcon />
                      </Button>
                    ) : (
                      <span className="w-8 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="tabular-nums">
              {`薪資扣項小計:${
                salaryDecreaseItemsReformatted.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) +
                  decreaseSecondContent.decreaseItems.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) || 0
              }`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {salaryDecreaseItemsReformatted
                .sort((a, b) => a.sorting - b.sorting)
                .map((data, index) => {
                  return (
                    <div key={`increase-${index}`} className="flex items-center gap-1">
                      <span className="w-[25px] shrink-0 text-center text-label tabular-nums text-text-secondary">{index + 1}</span>
                      <TextField
                        variant="outlined"
                        label={data.itemName}
                        type="number"
                        value={data.price || 0}
                        name="price"
                        fullWidth
                        onChange={e => handleDecreaseInput(e, index)}
                        onWheel={() => document.activeElement.blur()}
                      />
                    </div>
                  )
                })}
            </div>
          </CardContent>
          <div className="h-px bg-border" />
          <CardContent>
            <div className="flex flex-col gap-4">
              {decreaseSecondContent.decreaseItems.map((data, index) => (
                <div key={`decrease-${index}`}>
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      type="text"
                      className="w-[150px]"
                      aria-label="薪資扣項科目"
                      name="itemName"
                      value={data.itemName}
                      onChange={e => handleDecreaseSecondInput(e, index)}
                    />
                    <TextField
                      type="number"
                      variant="outlined"
                      className="w-[150px]"
                      label="扣項金額"
                      name="price"
                      value={data.price}
                      onChange={e => handleDecreaseSecondInput(e, index)}
                      onWheel={() => document.activeElement.blur()}
                    />
                    {decreaseSecondContent.decreaseItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-text-secondary"
                        aria-label="刪除此項"
                        onClick={() => handleDeductDecreaseItem(index)}
                      >
                        <DeleteForeverIcon />
                      </Button>
                    )}
                    {index === decreaseSecondContent.decreaseItems.length - 1 ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-text-secondary"
                        aria-label="新增一項"
                        onClick={() => handleAddDecreaseItem()}
                      >
                        <AddIcon />
                      </Button>
                    ) : (
                      <span className="w-8 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-2">
        <div className="flex justify-between">
          <div>
            <span className="text-heading tabular-nums text-text">
              {`薪資加項小計:${
                salaryIncreaseItemsReformatted.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) +
                  increaseSecondContent.increaseItems.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) || 0
              }`}
            </span>
          </div>
          <div>
            <span className="text-heading tabular-nums text-text">
              {`薪資扣項小計:${
                salaryDecreaseItemsReformatted.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) +
                  decreaseSecondContent.decreaseItems.map(data => data.price).reduce((accu, curVal) => (accu += curVal), 0) || 0
              }`}
            </span>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <Button variant="primary" onClick={handleSave}>
          儲存並返回列表
        </Button>
      </div>
    </div>
  )
}
