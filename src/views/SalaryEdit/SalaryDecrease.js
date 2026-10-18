/** @jsxImportSource @emotion/react */
// 金額輸入框使用 inputRef / onFocus / onKeyDown 做連續輸入的焦點管理，沿用 MUI TextField
import { TextField } from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'
import { Fragment, useRef, useEffect  } from 'react'
import idx from 'idx'
import { css } from '@emotion/react'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

const styles = {
  content: css({}),
  secondContent: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  secondInput: css({
    width: '150px',
  }),
  icons: css({
    cursor: 'pointer',
  }),
}

export default function SalaryIncrease({
  decreaseSecondContent,
  decreaseCombined,
  setDecreaseCombined,
  salaryDecreaseItemsReformatted,
  setSalaryDecreaseItemsReformatted,
  setDecreaseSecondContent,
  isSalaryItemsLock,
  userSalary,
  focus,
  setFocus,
  tabIndex,
  setTabIndex,
}) {
  const handleAddItem = () => {
    const newDecreaseSecondContent = _.cloneDeep(decreaseSecondContent)
    newDecreaseSecondContent.decreaseItems.push({
      itemName: '',
      price: 0,
      type: 'DECREASE',
    })
    setDecreaseSecondContent(newDecreaseSecondContent)
    setFocus('decreaseItemName')
    setTabIndex(newDecreaseSecondContent.decreaseItems.length - 1)
  }

  const handleDeductItem = index => {
    const newDecreaseSecondContent = _.cloneDeep(decreaseSecondContent)
    newDecreaseSecondContent.decreaseItems.splice(index, 1)
    setDecreaseSecondContent(newDecreaseSecondContent)
  }

  const handleDecreaseInput = (e, index) => {
    if (decreaseCombined.length > 0) {
      const newDecreaseCombined = _.cloneDeep(decreaseCombined)
      switch (e.target.name) {
        case 'price':
          newDecreaseCombined.map((data, index2) => {
            if (index === index2) {
              if (e.target.value === '' || e.target.value === null || isNaN(e.target.value)) {
                data.price = 0
              } else {
                data.price = parseFloat(e.target.value)
              }
            }
          })
          setDecreaseCombined(newDecreaseCombined)
          break
        case 'itemName':
          newDecreaseCombined.map((data, index2) => {
            if (index === index2) {
              data.itemName = e.target.value
            }
          })
          setDecreaseCombined(newDecreaseCombined)
          break
        default:
          break
      }
    } else {
      const newSalaryDecreaseItemsReformatted = _.cloneDeep(salaryDecreaseItemsReformatted)
      switch (e.target.name) {
        case 'price':
          newSalaryDecreaseItemsReformatted.map((data, index2) => {
            if (index === index2) {
              if (e.target.value === '' || e.target.value === null || isNaN(e.target.value)) {
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
  }

  const handleDecreaseSecondInput = (e, index) => {
    const newDecreaseSecondContent = _.cloneDeep(decreaseSecondContent)
    switch (e.target.name) {
      case 'price':
        newDecreaseSecondContent.decreaseItems.map((data, index2) => {
          if (index === index2) {
            if (e.target.value === '' || e.target.value === null || isNaN(e.target.value)) {
              data.price = 0
            } else {
              data.price = parseFloat(e.target.value)
            }
          }
        })
        setDecreaseSecondContent(newDecreaseSecondContent)
        break
      case 'itemName':
        newDecreaseSecondContent.decreaseItems.map((data, index2) => {
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
  const designer = idx(userSalary, _ => _.data.user)

  const textFieldRef = useRef()
  useEffect(() => {
    if(textFieldRef.current !== undefined && focus.includes('decrease')) {
      textFieldRef.current.focus()
    }
  }, [focus, tabIndex])

  return (
    <Fragment>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="tabular-nums">{`${designer.name} ${
            designer.designerNo === '' ? '' : `(` + designer.designerNo + `)`
          } - 薪資扣項小計:${
            decreaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
              decreaseSecondContent.decreaseItems.reduce((accu, curVal) => accu + curVal.price, 0) || 0
          }`}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-12 gap-4">
            {decreaseCombined?.length > 0 &&
              decreaseCombined
                ?.sort((a, b) => a.sorting - b.sorting)
                .map((data, index) => {
                  if (data.source === 'parameter') {
                    return (
                      <div
                        key={`decrease-${index}`}
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
                          inputRef={(focus === 'decreaseCombined' && index === tabIndex) ? textFieldRef : ''}
                          onFocus={event => { 
                            event.target.select()
                            setTabIndex(index)
                            setFocus('decreaseCombined')
                          }}
                          onKeyDown={event => {
                            if(event.key === 'Enter') {
                              if(index < (decreaseCombined.length - 1)){
                                setTabIndex(index + 1)
                              } else {
                                setFocus('decreaseItemName')
                                setTabIndex(0)
                              }
                            }
                          }}
                          onChange={e => handleDecreaseInput(e, index)}
                          disabled={isSalaryItemsLock}
                        />
                      </div>
                    )
                  } else {
                    salaryDecreaseItemsReformatted !== undefined &&
                      salaryDecreaseItemsReformatted
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
                                // type="number"
                                value={data.price || 0}
                                name="price"
                                fullWidth
                                inputRef={(focus === 'decreaseCombined' && index === tabIndex) ? textFieldRef : ''}
                                onFocus={event => { 
                                  event.target.select()
                                  setTabIndex(index)
                                  setFocus('decreaseCombined')
                                }}
                                onKeyDown={event => {
                                  if(event.key === 'Enter') {
                                    if(index < (decreaseCombined.length - 1)){
                                      setTabIndex(index + 1)
                                    } else {
                                      setFocus('decreaseItemName')
                                      setTabIndex(0)
                                    }
                                  }
                                }}
                                onChange={e => handleDecreaseInput(e, index)}
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
            {decreaseSecondContent.decreaseItems.map((data, index) => (
              <div className="col-span-12" key={`decrease-${index}`}>
                <div className="flex items-center justify-between gap-2">
                  <TextField
                    type="text"
                    variant="outlined"
                    css={styles.secondInput}
                    label="薪資扣項科目"
                    name="itemName"
                    value={data.itemName}
                    inputRef={(focus === 'decreaseItemName' && index === tabIndex) ? textFieldRef : ''}
                    onFocus={event => {
                      event.target.select()
                      setTabIndex(index)
                      setFocus('decreaseItemName')
                    }}
                    onKeyDown={event => {
                      if(event.key === 'Enter') {
                        setFocus('decreasePrice')
                      }
                    }}
                    onChange={e => handleDecreaseSecondInput(e, index)}
                    disabled={isSalaryItemsLock}
                  />
                  <TextField
                    variant="outlined"
                    css={styles.secondInput}
                    label="扣項金額"
                    name="price"
                    value={data.price}
                    inputRef={(focus === 'decreasePrice' && index === tabIndex) ? textFieldRef : ''}
                    onFocus={event => {
                      event.target.select()
                      setTabIndex(index)
                      setFocus('decreasePrice')
                    }}
                    onKeyDown={event => {
                      if(event.key === 'Enter' && index < (decreaseSecondContent.decreaseItems.length - 1)) {
                        setTabIndex(index + 1)
                        setFocus('decreaseItemName')
                      }
                    }}
                    onChange={e => handleDecreaseSecondInput(e, index)}
                    disabled={isSalaryItemsLock}
                  />
                  {decreaseSecondContent.decreaseItems.length > 1 && !isSalaryItemsLock && (
                    <Button variant="ghost" size="icon" aria-label="刪除此項" onClick={() => handleDeductItem(index)}>
                      <DeleteForeverIcon />
                    </Button>
                  )}
                  {index === decreaseSecondContent.decreaseItems.length - 1 &&
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
          } - 薪資扣項小計:${
            decreaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
              decreaseSecondContent.decreaseItems.reduce((accu, curVal) => accu + curVal.price, 0) || 0
          }`}
        </span>
      </div>
    </Fragment>
  )
}
