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
  Grid,
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon, BackspaceOutlined as BackspaceOutlinedIcon } from 'ui/icons'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  tableBody: css({
    padding: theme.spacing(2),
  }),
  deductionTypeFormGroup: css({
    width: '6rem',
  }),
  formGroup: css({
    width: '7rem',
    marginLeft: theme.spacing(3),
  }),
  service: css({
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  icons: css({
    marginLeft: theme.spacing(3),
    cursor: 'pointer',
    marginTop: '30px',
  }),
  icons2: css({
    cursor: 'pointer',
    marginTop: '30px',
  }),
  textField: css({
    marginLeft: theme.spacing(2),
    width: '5rem',
  }),
  textField2: css({
    width: '5rem',
  }),
  textFieldDiv: css({
    marginLeft: theme.spacing(2),
  }),
  autocomplete: css({
    marginLeft: theme.spacing(2),
    width: '10rem',
  }),
  checkboxSpan: css({
    width: '25%',
  }),
  gap: css({
    '& span': {
      whiteSpace: 'nowrap'
    }
  })
}

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

const deductionWay2 = [
  { label: '依業績%數', value: '業績%數' },
  { label: '依固定金額', value: '固定金額' },
  { label: '依點數', value: '點數' },
]

const assistantNum = [
  { label: '0', value: '0' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
]

function AboutAssistantSetting({
  className,
  support,
  helperDeductionType,
  merchantHelperItems,
  onChange,
  ...rest
}) {
  const inputLabel = React.useRef()

  const handleAddAssistantContent = () => {
    const newSupport = _.cloneDeep(support)
    newSupport.push({
      helperDeductionType: 'onSales',
      type: '',
      nameList: [],
      peopleCount: 1,
      point: 0,
      cash: 0,
      percent: 0,
      isDesignate: false,
      designateCash: 0,
      nonDesignateCash: 0,
      designatePercent: 0,
      nonDesignatePercent: 0,
      designatePoint: 0,
      nonDesignatePoint: 0,
      deductionWay: '',
      isSplitted: false,
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }
  const handleDeleteAssistantContent = () => {
    const newSupport = _.cloneDeep(support)
    newSupport.pop({})
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleDeductionTypeChange = (event, index) => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.helperDeductionType = event.target.value
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleCheckboxChange = index => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.isDesignate = !data.isDesignate
        data.percent = 0
        data.cash = 0
        data.point = 0
        data.designatePercent = 0
        data.designateCash = 0
        data.designatePoint = 0
        data.nonDesignatePercent = 0
        data.nonDesignateCash = 0
        data.nonDesignatePoint = 0
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleIsSplittedChange = index => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.isSplitted = !data.isSplitted
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleAssistantName = (event, index) => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.nameList = []
        for (let i = 1; i <= parseInt(event.target.value); i++) {
          data.nameList.push(String(i))
        }
        data.peopleCount = data.nameList.length
      }
    })
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleDeductionWayChange = (event, index) => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.deductionWay = event.target.value
        data.percent = 0
        data.cash = 0
        data.point = 0
        data.designatePercent = 0
        data.designateCash = 0
        data.designatePoint = 0
        data.nonDesignatePercent = 0
        data.nonDesignateCash = 0
        data.nonDesignatePoint = 0
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.percent = event.target.value
            break
          case '固定金額':
            data.cash = event.target.value
            break
          case '點數':
            data.point = event.target.value
            break
          default:
            break
        }
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.designatePercent = event.target.value
            break
          case '固定金額':
            data.designateCash = event.target.value
            break
          case '點數':
            data.designatePoint = event.target.value
            break
          default:
            break
        }
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }
  const handleNonDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.nonDesignatePercent = event.target.value
            break
          case '固定金額':
            data.nonDesignateCash = event.target.value
            break
          case '點數':
            data.nonDesignatePoint = event.target.value
            break
          default:
            break
        }
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleHelperType = (event, index) => {
    const newSupport = _.cloneDeep(support)
    newSupport.forEach((data, index2) => {
      if (index === index2) {
        data.type = event.target.value
      }
    })
    support = newSupport
    onChange({ key: 'helperDeductionSetting', event: { target: { value: support } } })
  }

  const handleClear = index => {
    const newSupport = _.cloneDeep(support)
    newSupport[index] = {
      helperDeductionType: 'onSales',
      type: '',
      nameList: [],
      peopleCount: 0,
      point: 0,
      cash: 0,
      percent: 0,
      designateCash: 0,
      nonDesignateCash: 0,
      designatePercent: 0,
      nonDesignatePercent: 0,
      designatePoint: 0,
      nonDesignatePoint: 0,
      deductionWay: '',
    }
    onChange({ key: 'helperDeductionSetting', event: { target: { value: newSupport } } })
  }

  const handleReturnDeductionValue = (data, deductionWay, isDesignate) => {
    switch (deductionWay) {
      case '業績%數':
        return data[isDesignate ? 'designatePercent' : 'nonDesignatePercent']
      case '固定金額':
        return data[isDesignate ? 'designateCash' : 'nonDesignateCash']
      case '點數':
        return data[isDesignate ? 'designatePoint' : 'nonDesignatePoint']
      default:
        break
    }
  }

  const handleReturnValue = (data, deductionWay) => {
    switch (deductionWay) {
      case '業績%數':
        return data.percent
      case '固定金額':
        return data.cash
      case '點數':
        return data.point
      default:
        break
    }
  }

  return (
    <Card {...rest} css={className}>
      <CardHeader title="互助點數設定" />
      <CardContent>
        {support.map((content, index) => (
          <Grid container spacing={2} key={index} style={{ marginBottom: '10px' }}>
            <Grid item xs={12} sm={2}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  扣項類別
                </InputLabel>
                <Select
                  labelId="select-item-label"
                  id="select-item"
                  label='扣項類別'
                  onChange={event => handleDeductionTypeChange(event, index)}
                  value={content.helperDeductionType}
                >
                  {deductions.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.value}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  類別
                </InputLabel>
                <Select
                  labelId="select-item-label"
                  id="select-item"
                  label='類別'
                  value={content.type}
                  onChange={event => handleHelperType(event, index)}
                >
                  {merchantHelperItems?.map((data, idx) => (
                    <MenuItem value={data.type} key={`${data.type}-${idx}`}>
                      {data.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  協助人員人數
                </InputLabel>
                <Select
                  label='協助人員人數'
                  onChange={event => handleAssistantName(event, index)}
                  value={content.peopleCount}
                >
                  {assistantNum.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  扣項方式
                </InputLabel>
                <Select
                  labelId="select-item-label"
                  id="select-item"
                  label='扣項方式'
                  value={content.deductionWay}
                  onChange={event => handleDeductionWayChange(event, index)}
                >
                  {deductionWay2.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {content.isDesignate ? (
              <Grid item xs={12} sm='auto'>
                <div>
                  <TextField
                    css={styles.textField2}
                    type="number"
                    name="designateInput"
                    variant="outlined"
                    label={`指定${content.deductionWay}`}
                    value={handleReturnDeductionValue(content, content.deductionWay, true)}
                    onChange={event =>
                      handleDesignateDeductionWayInput(event, index, content.deductionWay)
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                  <TextField
                    css={styles.textField}
                    type="number"
                    name="NonDesignateInput"
                    variant="outlined"
                    label={`不指定${content.deductionWay}`}
                    value={handleReturnDeductionValue(content, content.deductionWay, false)}
                    onChange={event =>
                      handleNonDesignateDeductionWayInput(event, index, content.deductionWay)
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                </div>
                <div>
                  <span>
                    <div>
                      <FormControlLabel
                        css={styles.gap}
                        control={<Checkbox color="primary" />}
                        label="分指定/不指定"
                        checked={content.isDesignate}
                        onChange={() => handleCheckboxChange(index)}
                        disabled={content.isSplitted}
                      />
                    </div>
                    <div>
                      <FormControlLabel
                        css={styles.gap}
                        control={<Checkbox color="primary" />}
                        label="互助均分"
                        checked={content.isSplitted}
                        onChange={() => handleIsSplittedChange(index)}
                        disabled={content.isDesignate}
                      />
                    </div>
                  </span>
                </div>
              </Grid>
            ) : (
              content.deductionWay !== '' && (
                <Grid item xs={12} sm={2}>
                  <div>
                    <TextField
                      css={styles.textField2}
                      type="number"
                      variant="outlined"
                      label={content.deductionWay}
                      value={handleReturnValue(content, content.deductionWay)}
                      onChange={event =>
                        handleDeductionWayInput(event, index, content.deductionWay)
                      }
                      onWheel={() => document.activeElement.blur()}
                    />
                  </div>
                  <div>
                    <span>
                      <div>
                        <FormControlLabel
                          css={styles.gap}
                          control={<Checkbox color="primary" />}
                          label="分指定/不指定"
                          checked={content.isDesignate}
                          onChange={() => handleCheckboxChange(index)}
                          disabled={content.isSplitted}
                        />
                      </div>
                      <div>
                        <FormControlLabel
                          css={styles.gap}
                          control={<Checkbox color="primary" />}
                          label="互助均分"
                          checked={content.isSplitted}
                          onChange={() => handleIsSplittedChange(index)}
                          disabled={content.isDesignate}
                        />
                      </div>
                    </span>
                  </div>
                </Grid>
              )
            )}
            {content.deductionWay !== '' && (
              <BackspaceOutlinedIcon
                css={styles.icons}
                style={content.isDesignate ? { marginLeft: 'auto' } : {}}
                onClick={() => handleClear(index)}
                data-testid={`service-${index}-clear`}
              />
            )}
            {index !== 0 && index === support.length - 1 && (
              <DeleteForeverIcon
                css={styles.icons2}
                onClick={handleDeleteAssistantContent}
              />
            )}
            {index === support.length - 1 && (
              <AddIcon css={styles.icons2} onClick={handleAddAssistantContent} />
            )}
          </Grid>
        ))}
      </CardContent>
    </Card>
  )
}

AboutAssistantSetting.propTypes = {
  className: PropTypes.object,
}

export default AboutAssistantSetting
