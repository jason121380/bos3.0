/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  FormControlLabel,
  Typography,
  Grid,
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon, BackspaceOutlined as BackspaceOutlinedIcon } from 'ui/icons'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { useRef, Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  tableBody: css({
    padding: theme.spacing(2),
  }),
  formGroup: css({
    width: '8rem',
    marginLeft: theme.spacing(3),
  }),
  RefFormGroup: css({
    width: '6rem',
    marginLeft: theme.spacing(3),
  }),
  service: css({
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  icons: css({
    marginLeft: theme.spacing(3),
    marginTop: '30px',
    cursor: 'pointer',
  }),
  gap: css({
    marginLeft: theme.spacing(3),
  }),
  textField: css({
    width: '5rem',
  }),
  nonDesignateTextField: css({
    width: '5rem',
    marginLeft: theme.spacing(3),
  }),
  orderNum: css({
    marginBottom: '0',
    marginRight: '15px',
  }),
  deductionTypeFormGroup: css({
    width: '6rem',
  }),
  headerTitle: css({
    '& span.MuiTypography-root': {
      color: 'red',
    }
  }),
}

const deductionWay2 = [
  { label: '依業績%數', value: '扣趴數' },
  { label: '依固定金額', value: '扣固定金額' },
]

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

function AboutDeduction({
  className,
  deductionItem,
  onChange,
  ServiceDeductionItems,
  truthPerformPredict,
  helperDeductionNums,
  helperPoint,
  ...rest
}) {
  const inputLabel = useRef()
  // const merchantDeductionItems = useFetchMerchantDeductionItems()
  // const deductionItems = idx(merchantDeductionItems, _ => _.data.merchantDeductionItems)
  const handleAddDeductionContent = (type, deductionOrder) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.push({
          isSpecial: false,
          name: '材料費',
          type: 'onSales',
          deductionWay: '',
          price: 0,
          designatePrice: 0,
          nonDesignatePrice: 0,
          deductionOrder: deductionOrder + 1,
          deductionReference: 0,
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeleteDeductionContent = (type, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.splice(index, 1)
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleCheckboxChange = (type, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            return (
              (data2.isSpecial = !data2.isSpecial),
              (data2.price = 0),
              (data2.designatePrice = 0),
              (data2.nonDesignatePrice = 0)
            )
          }
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  // const handleDeductionName = (type, event, index) => {
  //   const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
  //   newServiceDeductionItems.forEach(data => {
  //     if (data.type === type) {
  //       data.itemSettings.forEach((data2, index2) => {
  //         if (index === index2) {
  //           data2.name = event.target.value
  //         }
  //       })
  //     }
  //   })
  //   onChange({
  //     key: 'ServiceDeductionItems',
  //     event: { target: { value: newServiceDeductionItems } },
  //   })
  // }
  const handleDeductionTypeChange = (type, event, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.type = event.target.value
          }
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionNum = (type, event, index, moneyType) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            switch (moneyType) {
              case 'price':
                data2.price = parseInt(event.target.value)
                break
              case 'designatePrice':
                data2.designatePrice = parseInt(event.target.value)
                break
              case 'nonDesignatePrice':
                data2.nonDesignatePrice = parseInt(event.target.value)
                break
              default:
                break
            }
          }
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionReference = (type, event, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.deductionReference = parseInt(event.target.value)
          }
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleDeductionWay = (type, event, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.deductionWay = event.target.value
          }
        })
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }

  const handleClear = (type, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings[index] = {
          ...data.itemSettings[index],
          isSpecial: false,
          name: '材料費',
          type: 'onSales',
          deductionWay: '',
          price: 0,
          designatePrice: 0,
          nonDesignatePrice: 0,
        }
      }
    })
    onChange({
      key: 'ServiceDeductionItems',
      event: { target: { value: newServiceDeductionItems } },
    })
  }
  const menuItemGenerate = num => {
    const arr = [{ title: '依業績', value: 0 }]
    if (num === 1) {
      return arr
    } else {
      for (let i = 1; i < num; i++) {
        arr.push({
          title: i,
          value: i,
        })
      }
      return arr
    }
  }

  return (
    <Card {...rest} css={css([styles.root, className])}>
      {ServiceDeductionItems.map((data, idx) => (
        <Fragment key={`${data.type}`}>
          <CardHeader
            title={`項目扣項設定 - ${data.type}`}
            css={data.type === '系統預設' ? styles.headerTitle : {}}
          />
          <CardContent>
            {data.itemSettings.map((content, index) => {
              return (
                <Grid container spacing={2} css={styles.service} key={index}>
                  <Typography
                    variant="h5"
                    display="inline"
                    gutterBottom
                    css={styles.orderNum}
                  >
                    {content.deductionOrder}
                  </Typography>
                  <Grid item xs={12} sm={2}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel ref={inputLabel} id="select-item-label">
                        扣項類別
                      </InputLabel>
                      <Select
                        labelId="select-item-label"
                        id="select-item"
                        label='扣項類別'
                        onChange={event => handleDeductionTypeChange(data.type, event, index)}
                        value={content.type}
                      >
                        {deductions.map((data, idx) => (
                          <MenuItem value={data.value} key={`${data.value}-${idx}`}>
                            {data.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                    <InputLabel ref={inputLabel} id="select-item-label">
                      項目
                    </InputLabel>
                    <Select
                      labelId="select-item-label"
                      id="select-item"
                      label='項目'
                      onChange={event => handleDeductionName(data.type, event, index)}
                      value={content.name}
                    >
                      {deductionItems?.map((data, idx) => (
                        <MenuItem value={data.name} key={idx}>
                          {data.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl> */}
                  {content.name && (
                    <Grid item xs={12} sm={2}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel ref={inputLabel} id="select-item-label">
                          扣成方式
                        </InputLabel>
                        <Select
                          label='扣成方式'
                          labelId="select-item-label"
                          id="select-item"
                          onChange={event => handleDeductionWay(data.type, event, index)}
                          value={content.deductionWay}
                        >
                          {deductionWay2.map((data, idx) => (
                            <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                              {data.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {content.isSpecial && content.name ? (
                    <Grid item xs={12} sm={3}>
                      <div style={{ display: 'flex' }}>
                        <TextField
                          css={styles.textField}
                          type="number"
                          variant="outlined"
                          label={content.deductionWay === '扣固定金額' ? '指定金額' : '指定%'}
                          value={content.designatePrice}
                          onChange={event =>
                            handleDeductionNum(data.type, event, index, 'designatePrice')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                        <TextField
                          css={styles.nonDesignateTextField}
                          type="number"
                          variant="outlined"
                          label={content.deductionWay === '扣固定金額' ? '不指定金額' : '不指定%'}
                          value={content.nonDesignatePrice}
                          onChange={event =>
                            handleDeductionNum(data.type, event, index, 'nonDesignatePrice')
                          }
                          onWheel={() => document.activeElement.blur()}
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          control={<Checkbox color="primary" />}
                          label="分指定/不指定"
                          style={{ 'whiteSpace': 'nowrap' }}
                          checked={content.isSpecial}
                          onChange={() => handleCheckboxChange(data.type, index)}
                        />
                      </div>
                    </Grid>
                  ) : (
                    content.name && (
                      <Grid item xs={12} sm={2}>
                        <div>
                          <TextField
                            css={styles.textField}
                            type="number"
                            variant="outlined"
                            label={content.deductionWay === '扣固定金額' ? '固定金額' : '業績%數'}
                            value={content.price}
                            onChange={event => handleDeductionNum(data.type, event, index, 'price')}
                            onWheel={() => document.activeElement.blur()}
                          />
                        </div>
                        <div>
                          <FormControlLabel
                            control={<Checkbox color="primary" />}
                            label="分指定/不指定"
                            style={{ 'whiteSpace': 'nowrap' }}
                            checked={content.isSpecial}
                            onChange={() => handleCheckboxChange(data.type, index)}
                          />
                        </div>
                      </Grid>
                    )
                  )}
                  <Grid item xs={12} sm={2}>
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel ref={inputLabel} id="select-item-label">
                        扣項基準點
                      </InputLabel>
                      <Select
                        value={index === 0 ? 0 : content.deductionReference}
                        label='扣項基準點'
                        labelId="select-item-label"
                        id="select-item"
                        onChange={event => handleDeductionReference(data.type, event, index)}
                      >
                        {menuItemGenerate(content.deductionOrder).map((data, index) => (
                          <MenuItem value={data.value} key={index}>
                            {data.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {content.name !== '' && (
                    <BackspaceOutlinedIcon
                      css={styles.icons}
                      onClick={() => handleClear(data.type, index)}
                      data-testid={`service-${index}-clear`}
                    />
                  )}
                  {index !== 0 && (
                    <DeleteForeverIcon
                      css={styles.icons}
                      onClick={() => handleDeleteDeductionContent(data.type, index)}
                    />
                  )}
                  {index === data.itemSettings.length - 1 || 0 ? (
                    <AddIcon
                      css={styles.icons}
                      onClick={() => handleAddDeductionContent(data.type, content.deductionOrder)}
                    />
                  ) : (
                    ''
                  )}
                </Grid>
              )
            })}
            <div style={{ float: 'right' }}>
              <Typography variant="h6" style={{ color: 'red' }}>
                實業績(含扣項):{Math.round(truthPerformPredict[idx]) || 0}
              </Typography>
              <Typography variant="h6" style={{ color: 'red' }}>
                實業績(含扣項、扣互助)預估:
                {Math.round(truthPerformPredict[idx] - helperDeductionNums) || 0}{helperPoint ? helperPoint < 0 ? ` + ${helperPoint * -1}點` : ` - ${helperPoint}點` : null}
              </Typography>
            </div>
          </CardContent>
        </Fragment>
      ))}
    </Card>
  )
}

AboutDeduction.propTypes = {
  className: PropTypes.object,
}

export default AboutDeduction
