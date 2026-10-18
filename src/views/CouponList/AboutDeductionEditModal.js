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
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useRef, Fragment } from 'react'
import { red, blue } from '@mui/material/colors'
import _ from 'lodash'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon, BackspaceOutlined as BackspaceOutlinedIcon } from 'ui/icons'
import useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import idx from 'idx'

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
    width: '6rem',
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
  icons: css({
    marginLeft: theme.spacing(3),
    cursor: 'pointer',
  }),
  saveAtBottom: css({
    margin: '16px 24px !important',
    float: 'right',
  }),
  subtitle: css({
    marginBottom: '30px',
  }),
  upperArrowIcon: css({
    cursor: 'pointer',
  }),
  orderNum: css({
    marginBottom: '0',
    marginRight: '15px !important',
  }),
  headerTitle: css({
    '& span': {
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

function AboutDeductionEditModal({
  openEditDeductionModal,
  ServiceDeductionItems,
  onClose,
  setServiceDeductionItems,
  handleSubmitDeductionSettingWarning,
}) {
  const inputLabel = useRef()

  const merchantDeductionItems = useFetchMerchantDeductionItems()
  const deductionItems = idx(merchantDeductionItems, _ => _.data.merchantDeductionItems)

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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const handleDeleteDeductionContent = (type, index, deductionType) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.splice(index, 1)
      }
    })
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const handleCheckboxChange = (type, index, deductionType) => {
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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const handleDeductionName = (type, event, index) => {
    const newServiceDeductionItems = _.cloneDeep(ServiceDeductionItems)
    newServiceDeductionItems.forEach(data => {
      if (data.type === type) {
        data.itemSettings.forEach((data2, index2) => {
          if (index === index2) {
            data2.name = event.target.value
          }
        })
      }
    })
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

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
    setServiceDeductionItems([...newServiceDeductionItems])
  }

  const menuItemGenerate = num => {
    const arr = [{ title: '依原業績', value: 0 }]
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
    <Modal open={openEditDeductionModal}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title="扣項項目設定" />
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
          {ServiceDeductionItems.map(data => (
            <Fragment key={`${data.type}`}>
              <CardHeader
                title={`項目扣項設定 - ${data.type}`}
                css={data.type === '系統預設' && styles.headerTitle}
              />
              <CardContent>
                {data.itemSettings.map((content, index) => {
                  return (
                    <div css={styles.service} key={index}>
                      <Typography
                        variant="h5"
                        display="inline"
                        gutterBottom
                        css={styles.orderNum}
                      >
                        {content.deductionOrder}
                      </Typography>
                      <FormControl
                        variant="outlined"
                        css={styles.deductionTypeFormGroup}
                        fullWidth
                      >
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
                        <FormControl variant="outlined" css={styles.formGroup} fullWidth>
                          <InputLabel ref={inputLabel} id="select-item-label">
                            抽成方式
                          </InputLabel>
                          <Select
                            labelId="select-item-label"
                            id="select-item"
                            label='抽成方式'
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
                      )}
                      {content.name && (
                        <FormControlLabel
                          css={styles.gap}
                          control={<Checkbox color="primary" />}
                          label="分指定/不指定"
                          checked={content.isSpecial}
                          onChange={() => handleCheckboxChange(data.type, index)}
                        />
                      )}

                      {content.isSpecial && content.name ? (
                        <>
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
                            css={styles.textField}
                            type="number"
                            variant="outlined"
                            label={content.deductionWay === '扣固定金額' ? '不指定金額' : '不指定%'}
                            value={content.nonDesignatePrice}
                            onChange={event =>
                              handleDeductionNum(data.type, event, index, 'nonDesignatePrice')
                            }
                            onWheel={() => document.activeElement.blur()}
                          />
                        </>
                      ) : (
                        content.name && (
                          <TextField
                            css={styles.textField}
                            type="number"
                            variant="outlined"
                            label={content.deductionWay === '扣固定金額' ? '固定金額' : '業績%數'}
                            value={content.price}
                            onChange={event => handleDeductionNum(data.type, event, index, 'price')}
                            onWheel={() => document.activeElement.blur()}
                          />
                        )
                      )}

                      <FormControl variant="outlined" css={styles.formGroup} fullWidth>
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
                      {content.name !== '' && (
                        <BackspaceOutlinedIcon
                          css={styles.icons}
                          onClick={() => handleClear(data.type, index)}
                          data-testid={`service-${index}-clear`}
                        />
                      )}
                      {index !== 0 && content.type === 'onSales' && (
                        <DeleteForeverIcon
                          css={styles.icons}
                          onClick={() => handleDeleteDeductionContent(data.type, index)}
                        />
                      )}
                      <AddIcon
                        css={styles.icons}
                        onClick={() => handleAddDeductionContent(data.type, content.deductionOrder)}
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Fragment>
          ))}
        </CardContent>
        <Button
          color="primary"
          variant="contained"
          css={styles.saveAtBottom}
          onClick={handleSubmitDeductionSettingWarning}
          style={{ backgroundColor: 'red', color: 'white' }}
        >
          儲存
        </Button>
      </Card>
    </Modal>
  )
}

AboutDeductionEditModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

AboutDeductionEditModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default AboutDeductionEditModal
