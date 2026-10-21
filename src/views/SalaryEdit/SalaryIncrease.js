// 金額輸入框使用 inputRef / onFocus / onKeyDown 做連續輸入的焦點管理，沿用 MUI TextField
import { TextField } from 'ui/text-field'
import { Fragment, useRef, useEffect } from 'react'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import cloneDeep from 'lodash/cloneDeep'
import idx from 'idx'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'


export default function SalaryIncrease({
  increaseSecondContent,
  increaseCombined,
  setIncreaseCombined,
  salaryIncreaseItemsReformatted,
  setSalaryIncreaseItemsReformatted,
  setIncreaseSecondContent,
  isSalaryItemsLock,
  userSalary,
  focus,
  setFocus,
  tabIndex,
  setTabIndex,
}) {
  const handleAddItem = () => {
    const newIncreaseSecondContent = cloneDeep(increaseSecondContent)
    newIncreaseSecondContent.increaseItems.push({
      itemName: '',
      price: 0,
      type: 'INCREASE',
    })
    setIncreaseSecondContent(newIncreaseSecondContent)
    setFocus('increaseItemName')
    setTabIndex(newIncreaseSecondContent.increaseItems.length - 1)
  }

  const handleDeductItem = index => {
    const newIncreaseSecondContent = cloneDeep(increaseSecondContent)
    newIncreaseSecondContent.increaseItems.splice(index, 1)
    setIncreaseSecondContent(newIncreaseSecondContent)
  }

  const handleIncreaseInput = (e, index) => {
    if (increaseCombined.length > 0) {
      const newIncreaseCombined = cloneDeep(increaseCombined)
      switch (e.target.name) {
        case 'price':
          newIncreaseCombined.map((data, index2) => {
            if (index === index2) {
              if (e.target.value === '' || e.target.value === null || isNaN(e.target.value)) {
                data.price = 0
              } else {
                data.price = parseFloat(e.target.value)
              }
            }
          })
          setIncreaseCombined(newIncreaseCombined)
          break
        case 'itemName':
          newIncreaseCombined.map((data, index2) => {
            if (index === index2) {
              data.itemName = e.target.value
            }
          })
          setIncreaseCombined(newIncreaseCombined)
          break
        default:
          break
      }
    } else {
      const newSalaryIncreaseItemsReformatted = cloneDeep(salaryIncreaseItemsReformatted)
      switch (e.target.name) {
        case 'price':
          newSalaryIncreaseItemsReformatted.map((data, index2) => {
            if (index === index2) {
              if (e.target.value === '' || e.target.value === null || isNaN(e.target.value)) {
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
  }

  const handleIncreaseSecondInput = (e, index) => {
    const newIncreaseSecondContent = cloneDeep(increaseSecondContent)
    switch (e.target.name) {
      case 'price':
        newIncreaseSecondContent.increaseItems.map((data, index2) => {
          if (index === index2) {
            if (e.target.value === '' || e.target.value === null || isNaN(e.target.value)) {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setIncreaseSecondContent(newIncreaseSecondContent)
        break
      case 'itemName':
        newIncreaseSecondContent.increaseItems.map((data, index2) => {
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
  const designer = idx(userSalary, _ => _.data.user)

  const textFieldRef = useRef()
  useEffect(() => {
    if(textFieldRef.current !== undefined && focus.includes('increase')) {
      textFieldRef.current.focus()
    }
  }, [focus, tabIndex])

  return (
    <Fragment>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="tabular-nums">{`${designer.name} ${
            designer.designerNo === '' ? '' : `(` + designer.designerNo + `)`
          } - 薪資加項小計:${
            increaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
              increaseSecondContent.increaseItems.reduce((accu, curVal) => accu + curVal.price, 0) || 0
          }`}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-12 gap-4">
            {increaseCombined?.length > 0 &&
              increaseCombined
                ?.sort((a, b) => a.sorting - b.sorting)
                .map((data, index) => {
                  if (data.source === 'parameter') {
                    return (
                      <div
                        key={`increase-${index}`}
                        className="col-span-12 flex items-center sm:col-span-6 md:col-span-4 lg:col-span-3"
                      >
                        <span className="mx-1 w-[25px] shrink-0 text-heading tabular-nums text-text-secondary">
                          {index + 1}
                        </span>
                        <TextField
                          variant="outlined"
                          label={data.itemName}
                          value={data.price || 0}
                          name="price"
                          fullWidth
                          inputRef={(focus === 'increaseCombined' && index === tabIndex) ? textFieldRef : ''}
                          onFocus={event => { 
                            event.target.select()
                            setTabIndex(index)
                            setFocus('increaseCombined')
                          }}
                          onKeyDown={event => {
                            if(event.key === 'Enter') {
                              if(index < (salaryIncreaseItemsReformatted.length - 1)){
                                setTabIndex(index + 1)
                              } else {
                                setFocus('increaseItemName')
                                setTabIndex(0)
                              }
                            }
                          }}
                          onChange={e => handleIncreaseInput(e, index)}
                          disabled={isSalaryItemsLock}
                        />
                      </div>
                    )
                  } else {
                    salaryIncreaseItemsReformatted !== undefined &&
                      salaryIncreaseItemsReformatted
                        .sort((a, b) => a.sorting - b.sorting)
                        .map((data, index) => {
                          return (
                            <div
                              key={`increase-${index}`}
                              className="col-span-12 flex items-center"
                            >
                              <span className="mx-1 w-[25px] shrink-0 text-heading tabular-nums text-text-secondary">
                                {data.sorting}
                              </span>
                              <TextField
                                variant="outlined"
                                label={data.itemName}
                                value={data.price || 0}
                                name="price"
                                fullWidth
                                inputRef={(focus === 'increaseCombined' && index === tabIndex) ? textFieldRef : ''}
                                onFocus={event => { 
                                  event.target.select()
                                  setTabIndex(index)
                                  setFocus('increaseCombined')
                                }}
                                onKeyDown={event => {
                                  if(event.key === 'Enter') {
                                    if(index < (salaryIncreaseItemsReformatted.length - 1)){
                                      setTabIndex(index + 1)
                                    } else {
                                      setFocus('increaseItemName')
                                      setTabIndex(0)
                                    }
                                  }
                                }}
                                onChange={e => handleIncreaseInput(e, index)}
                                disabled={isSalaryItemsLock}
                              />
                            </div>
                          )
                        })
                  }
                })}
          </div>
        </CardContent>
        <CardContent className="border-0 border-t border-solid border-border">
          <div className="grid grid-cols-12 gap-4">
            {increaseSecondContent.increaseItems.map((data, index) => (
              <div className="col-span-12" key={`increase-${index}`}>
                <div className="flex items-center justify-between gap-2">
                  <TextField
                    type="text"
                    variant="outlined"
                    className="w-[150px]"
                    label="薪資加項科目"
                    name="itemName"
                    value={data.itemName}
                    inputRef={(focus === 'increaseItemName' && index === tabIndex) ? textFieldRef : ''}
                    onFocus={event => {
                      event.target.select()
                      setTabIndex(index)
                      setFocus('increaseItemName')
                    }}
                    onKeyDown={event => {
                      if(event.key === 'Enter') {
                        setFocus('increasePrice')
                      }
                    }}
                    onChange={e => handleIncreaseSecondInput(e, index)}
                    disabled={isSalaryItemsLock}
                  />
                  <TextField
                    type="number"
                    variant="outlined"
                    className="w-[150px]"
                    label="加項金額"
                    name="price"
                    value={data.price || 0}
                    inputRef={(focus === 'increasePrice' && index === tabIndex) ? textFieldRef : ''}
                    onFocus={event => {
                      event.target.select()
                      setTabIndex(index)
                      setFocus('increasePrice')
                    }}
                    onKeyDown={event => {
                      if(event.key === 'Enter') {
                        if(index < (increaseSecondContent.increaseItems.length - 1)){
                          setTabIndex(index + 1)
                          setFocus('increaseItemName')
                        } else {
                          setTabIndex(0)
                          setFocus('decreaseCombined')
                        }
                      }
                    }}
                    onChange={e => handleIncreaseSecondInput(e, index)}
                    disabled={isSalaryItemsLock}
                    onWheel={() => document.activeElement.blur()}              
                  />
                  {increaseSecondContent.increaseItems.length > 1 && !isSalaryItemsLock && (
                    <Button variant="ghost" size="icon" aria-label="刪除此項" onClick={() => handleDeductItem(index)}>
                      <DeleteForeverIcon />
                    </Button>
                  )}
                  {index === increaseSecondContent.increaseItems.length - 1 &&
                  !isSalaryItemsLock ? (
                    <Button variant="ghost" size="icon" aria-label="新增一項" onClick={handleAddItem}><AddIcon /></Button>
                  ) : (
                    <span className="w-9 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="mt-3">
        <span className="text-heading tabular-nums text-text">
          {`${designer.name} ${
            designer.designerNo === '' ? '' : `(` + designer.designerNo + `)`
          } - 薪資加項小計:${
            increaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
              increaseSecondContent.increaseItems.reduce((accu, curVal) => accu + curVal.price, 0) || 0
          }`}
        </span>
      </div>
    </Fragment>
  )
}
