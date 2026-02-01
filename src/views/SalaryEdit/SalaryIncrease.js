/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { Fragment, useRef, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import _ from 'lodash'
import idx from 'idx'
import { css } from '@emotion/react'

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
    const newIncreaseSecondContent = _.cloneDeep(increaseSecondContent)
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
    const newIncreaseSecondContent = _.cloneDeep(increaseSecondContent)
    newIncreaseSecondContent.increaseItems.splice(index, 1)
    setIncreaseSecondContent(newIncreaseSecondContent)
  }

  const handleIncreaseInput = (e, index) => {
    if (increaseCombined.length > 0) {
      const newIncreaseCombined = _.cloneDeep(increaseCombined)
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
      const newSalaryIncreaseItemsReformatted = _.cloneDeep(salaryIncreaseItemsReformatted)
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
    const newIncreaseSecondContent = _.cloneDeep(increaseSecondContent)
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
        <CardHeader
          title={`${designer.name} ${
            designer.designerNo === '' ? '' : `(` + designer.designerNo + `)`
          } - 薪資加項小計:${
            increaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
              increaseSecondContent.increaseItems.reduce((accu, curVal) => accu + curVal.price, 0) || 0
          }`}
        />
        <Divider />
        <CardContent css={styles.content}>
          <Grid container spacing={4}>
            {increaseCombined?.length > 0 &&
              increaseCombined
                ?.sort((a, b) => a.sorting - b.sorting)
                .map((data, index) => {
                  if (data.source === 'parameter') {
                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        key={`increase-${index}`}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Typography
                          variant="h5"
                          display="inline"
                          gutterBottom
                          style={{ margin: '0 5px', width: '25px' }}
                        >
                          {index + 1}
                        </Typography>
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
                      </Grid>
                    )
                  } else {
                    salaryIncreaseItemsReformatted !== undefined &&
                      salaryIncreaseItemsReformatted
                        .sort((a, b) => a.sorting - b.sorting)
                        .map((data, index) => {
                          return (
                            <Grid
                              item
                              xs={12}
                              key={`increase-${index}`}
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <Typography
                                variant="h5"
                                display="inline"
                                gutterBottom
                                style={{ margin: '0 5px', width: '25px' }}
                              >
                                {data.sorting}
                              </Typography>
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
                            </Grid>
                          )
                        })
                  }
                })}
          </Grid>
        </CardContent>
        <Divider />
        <CardContent css={styles.content}>
          <Grid container spacing={4}>
            {increaseSecondContent.increaseItems.map((data, index) => (
              <Grid item xs={12} key={`increase-${index}`}>
                <div css={styles.secondContent}>
                  <TextField
                    type="text"
                    variant="outlined"
                    css={styles.secondInput}
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
                    css={styles.secondInput}
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
                    <DeleteForeverIcon
                      css={styles.icons}
                      onClick={() => handleDeductItem(index)}
                    />
                  )}
                  {index === increaseSecondContent.increaseItems.length - 1 &&
                  !isSalaryItemsLock ? (
                    <AddIcon css={styles.icons} onClick={handleAddItem} />
                  ) : (
                    <span style={{ width: '25px' }} />
                  )}
                </div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      <div style={{ marginTop: '12px' }}>
        <Typography variant="h5" display="inline" gutterBottom>
          {`${designer.name} ${
            designer.designerNo === '' ? '' : `(` + designer.designerNo + `)`
          } - 薪資加項小計:${
            increaseCombined.reduce((accu, curVal) => accu + curVal.price, 0) +
              increaseSecondContent.increaseItems.reduce((accu, curVal) => accu + curVal.price, 0) || 0
          }`}
        </Typography>
      </div>
    </Fragment>
  )
}
