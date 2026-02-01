/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
  Modal,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useRef } from 'react'
import { red, blue } from '@mui/material/colors'
import _ from 'lodash'
import AddIcon from '@mui/icons-material/Add'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 912,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    marginBottom: '5px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
  }),
  categorieClear: css({
    backgroundColor: red[500],
    color: 'white',
    '&:hover': {
      backgroundColor: red[700],
    },
  }),
  addBtn: css({
    backgroundColor: blue[500],
    color: 'white',
    '&:hover': {
      backgroundColor: blue[700],
    },
  }),
  confirmBtn: css({
    margin: '7px 0',
    float: 'right',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  closeAtTop: css({
    margin: '16px 24px !important',
  }),
  deductionTypeFormGroup: css({
    width: '6rem',
  }),
  formGroup: css({
    width: '7rem',
    marginLeft: theme.spacing(3),
  }),
  autocomplete: css({
    marginLeft: theme.spacing(2),
    width: '10rem',
  }),
  service: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  gap: css({
    marginLeft: theme.spacing(3),
  }),
  textField: css({
    marginLeft: theme.spacing(2),
    width: '5rem',
  }),
  icons: ({
    marginLeft: theme.spacing(3),
    cursor: 'pointer',
  }),
  saveAtBottom: css({
    margin: '16px 24px !important',
    float: 'right',
  }),
  checkboxSpan: css({
    width: '25%',
  }),
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
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
]

function AssistantSettingEditModal({
  openEditAssistantModal,
  merchantHelperItems,
  onClose,
  helperDeductionSetting,
  setHelperDeductionSetting,
  handleSubmitHelperDeductionSettingWarning,
}) {
  const inputLabel = useRef()

  //   useEffect(() => {
  //     setLabelWidth(inputLabel.current.offsetWidth)
  //   }, [])

  const handleAddAssistantContent = () => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.push({
      type: '',
      helperDeductionType: 'onSales',
      nameList: [],
      peopleCount: 0,
      point: 0,
      cash: 0,
      percent: 0,
      designatePoint: 0,
      designateCash: 0,
      designatePercent: 0,
      nonDesignatePoint: 0,
      nonDesignateCash: 0,
      nonDesignatePercent: 0,
      isDesignate: false,
      deductionWay: '',
      isSplitted: false,
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeleteAssistantContent = index => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.splice(index, 1)
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleClear = index => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting[index] = {
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
      isSplitted: false,
    }
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeductionTypeChange = (event, index) => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.helperDeductionType = event.target.value
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleHelperType = (event, index) => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)

    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.type = event.target.value
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleAssistantName = (event, index) => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.nameList = []
        for (let i = 1; i <= parseInt(event.target.value); i++) {
          data.nameList.push(String(i))
        }
        data.peopleCount = data.nameList.length
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeductionWayChange = (event, index) => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)

    newHelperDeductionSetting.forEach((data, index2) => {
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
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleCheckboxChange = index => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
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
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleIsSplittedChange = index => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        data.isSplitted = !data.isSplitted
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.designatePercent = parseInt(event.target.value)
            break
          case '固定金額':
            data.designateCash = parseInt(event.target.value)
            break
          case '點數':
            data.designatePoint = parseFloat(event.target.value)
            break
          default:
            break
        }
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleDeductionWayInput = (event, index, deductionWay) => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.percent = parseInt(event.target.value)
            break
          case '固定金額':
            data.cash = parseInt(event.target.value)
            break
          case '點數':
            data.point = parseFloat(event.target.value)
            break
          default:
            break
        }
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  const handleNonDesignateDeductionWayInput = (event, index, deductionWay) => {
    const newHelperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    newHelperDeductionSetting.forEach((data, index2) => {
      if (index === index2) {
        switch (deductionWay) {
          case '業績%數':
            data.nonDesignatePercent = parseInt(event.target.value)
            break
          case '固定金額':
            data.nonDesignateCash = parseInt(event.target.value)
            break
          case '點數':
            data.nonDesignatePoint = parseFloat(event.target.value)
            break
          default:
            break
        }
      }
    })
    setHelperDeductionSetting([...newHelperDeductionSetting])
  }

  return (
    <Modal open={openEditAssistantModal}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title="互助點數設定" />
          <Button
            color="primary"
            variant="contained"
            css={styles.closeAtTop}
            onClick={onClose}
          >
            關閉
          </Button>
        </div>

        <CardContent>
          {helperDeductionSetting.map((content, index) => (
            <div css={styles.service} key={index}>
              <FormControl variant="outlined" css={styles.deductionTypeFormGroup} fullWidth>
                <InputLabel ref={inputLabel}>扣項類別</InputLabel>
                <Select
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
              <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                <InputLabel>類別</InputLabel>
                <Select
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
              <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                <InputLabel ref={inputLabel} id="select-item-label">
                  協助人員人數
                </InputLabel>
                <Select label='協助人員人數' onChange={event => handleAssistantName(event, index)}>
                  {assistantNum.map((data, idx) => (
                    <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                      {data.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                <InputLabel>扣項方式</InputLabel>
                <Select
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
              {content.deductionWay !== '' && (
                <span css={styles.checkboxSpan}>
                  <FormControlLabel
                    css={styles.gap}
                    control={<Checkbox color="primary" />}
                    label="分指定/不指定"
                    checked={content.isDesignate}
                    onChange={() => handleCheckboxChange(index)}
                    disabled={content.isSplitted}
                  />
                  <FormControlLabel
                    css={styles.gap}
                    control={<Checkbox color="primary" />}
                    label="互助均分"
                    checked={content.isSplitted}
                    onChange={() => handleIsSplittedChange(index)}
                    disabled={content.isDesignate}
                  />
                </span>
              )}
              {content.designatePercent ||
                content.designateCash ||
                content.designatePoint ||
                content.designatePercent ||
                content.designateCash ||
                content.designatePoint > 0 ||
                content.isDesignate ? (
                <>
                  <TextField
                    css={styles.textField}
                    type="number"
                    name="designateInput"
                    variant="outlined"
                    label={
                      content.deductionWay
                        ? `指定${content.deductionWay}`
                        : content.designatePoint > 0
                          ? '指定點數'
                          : content.content.designateCash
                            ? '指定固定金額'
                            : '指定業績%數'
                    }
                    value={
                      content.designatePercent ||
                        content.designateCash ||
                        content.designatePoint > 0
                        ? content.designatePercent ||
                        content.designateCash ||
                        content.designatePoint
                        : 0
                    }
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
                    label={
                      content.deductionWay
                        ? `不指定${content.deductionWay}`
                        : content.nonDesignatePoint > 0
                          ? '不指定點數'
                          : content.nonDesignateCash
                            ? '不指定固定金額'
                            : '不指定業績%數'
                    }
                    value={
                      content.nonDesignatePercent ||
                        content.nonDesignateCash ||
                        content.nonDesignatePoint > 0
                        ? content.nonDesignatePercent ||
                        content.nonDesignateCash ||
                        content.nonDesignatePoint
                        : 0
                    }
                    onChange={event =>
                      handleNonDesignateDeductionWayInput(event, index, content.deductionWay)
                    }
                    onWheel={() => document.activeElement.blur()}
                  />
                </>
              ) : (
                content.deductionWay !== '' && (
                  <TextField
                    css={styles.textField}
                    type="number"
                    name="designateInput"
                    variant="outlined"
                    label={
                      content.deductionWay
                        ? content.deductionWay
                        : content.point > 0
                          ? '點數'
                          : content.cash > 0
                            ? '固定金額'
                            : '業績%數'
                    }
                    value={
                      content.percent || content.cash || content.point > 0
                        ? content.percent || content.cash || content.point
                        : 0
                    }
                    onChange={event => handleDeductionWayInput(event, index, content.deductionWay)}
                    onWheel={() => document.activeElement.blur()}
                  />
                )
              )}
              {content.deductionWay !== '' && (
                <BackspaceOutlinedIcon
                  css={styles.icons}
                  onClick={() => handleClear(index)}
                />
              )}
              {helperDeductionSetting.length > 1 && (
                <DeleteForeverIcon
                  css={styles.icons}
                  onClick={() => handleDeleteAssistantContent(index)}
                />
              )}
              {index === helperDeductionSetting.length - 1 && (
                <AddIcon css={styles.icons} onClick={handleAddAssistantContent} />
              )}
            </div>
          ))}
        </CardContent>
        <Button
          color="primary"
          variant="contained"
          css={styles.saveAtBottom}
          onClick={handleSubmitHelperDeductionSettingWarning}
          style={{ backgroundColor: 'red', color: 'white' }}
        >
          儲存
        </Button>
      </Card>
    </Modal>
  )
}

AssistantSettingEditModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AssistantSettingEditModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default AssistantSettingEditModal
