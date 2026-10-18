/** @jsxImportSource @emotion/react */
import {
  Card, CardHeader, CardContent, Modal, Button, TextField,
  Typography, FormControlLabel, Tab, Tabs, Checkbox,
  Table, TableBody, TableCell, TableRow, CircularProgress,
  ToggleButton, ToggleButtonGroup
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import _ from 'lodash'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import idx from 'idx'
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
  header: css({
    // display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  closeAtTop: css({
    margin: '16px 24px',
    float: 'right',
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
    margin: '16px 24px',
    float: 'right',
  }),
  checkboxSpan: css({
    width: '25%',
  }),
  alert: css({
    marginBottom: theme.spacing(3),
  }),
  formGroup: css({
    marginBottom: theme.spacing(3),
  }),
  subtitle: css({
    margin: '1rem 0',
  }),
  sharing: css({
    margin: '0 3rem',
  }),
  width: css({
    width: '100%',
  }),
  marginL: css({
    marginLeft: '5px',
  }),
  deductionWayMarginL: css({
    marginLeft: '20px',
  }),
  icons: css({
    marginLeft: '20px',
    cursor: 'pointer',
  }),
  verticleCenter: css({
    display: 'flex',
    alignItems: 'center',
    borderBottom: '0px',
  }),
  flex: css({
    display: 'flex',
  }),
  removeBottomLine: css({
    borderBottom: '0px',
  }),
  separateInput: css({
    width: '250px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '0px',
    whiteSpace: 'nowrap',
  }),
  isDesignateInput: css({
    marginLeft: '5px',
  }),
  isDesignate: css({
    display: 'flex',
    justifyContent: 'space-evenly',
  }),
}

const isSegmented = [
  { label: '全段', value: false },
  { label: '分段', value: true },
]

function EditMultipleDesignersRakeSettingModal({
  openEditRakeSettingModal,
  onClose,
  onChange,
  profitSharing,
  handleMultipleRakeSetting,
}) {
  const [attributions, setAttributions] = useState([])
  const getAttributionForRake = useFetchGetAttributionForRake()

  const checkInput = (event, rakeType) => {
    switch (rakeType) {
      case 'thresholdLowerLimit':
        if (parseInt(event.target.value) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'thresholdUpperLimit':
        if (parseInt(event.target.value) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'threshold':
        if (parseInt(event.target.value) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0以上的數字',
            variant: 'warning',
          })
        }
        break
      case 'rake':
        if (parseInt(event.target.value) > 100 || parseInt(event.target.value) < 0) {
          event.target.value = 0
          openSnackbar({
            message: '請輸入0~100之間的數字',
            variant: 'warning',
          })
        }
        break
      default:
        break
    }
  }
  const [tabValue, setTabValue] = useState('預設')
  const [deductionIndex, setDeductionIndex] = useState(0)
  const handleDesignateChange = () => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
    if (newProfitSharing.isSegmented) {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.segmented[0].designate = []
        newProfitSharing.segmented[0].nonDesignate = []
        newProfitSharing.segmented[0].nonDistinguish = [
          {
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
            rake: 0,
          },
        ]
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
      } else {
        newProfitSharing.segmented[0].designate = [
          {
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
            rake: 0,
          },
        ]
        newProfitSharing.segmented[0].nonDesignate = [
          {
            thresholdLowerLimit: 0,
            thresholdUpperLimit: 0,
            rake: 0,
          },
        ]
        newProfitSharing.segmented[0].nonDistinguish = []
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
      }
    } else {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.nonSegmented[deductionIndex].rakeData.designate = []
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate = []
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish = [
          {
            threshold: 0,
            rake: 0,
          },
        ]
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      } else {
        newProfitSharing.nonSegmented[deductionIndex].rakeData.designate = [
          {
            threshold: 0,
            rake: 0,
          },
        ]
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate = [
          {
            threshold: 0,
            rake: 0,
          },
        ]
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish = []
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    }
  }

  const handleToggleButtonChange = () => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    if (profitSharing.isSegmented) {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.segmented = []
        newProfitSharing.nonSegmented = [
          {
            attribute: '預設',
            rakeData: {
              designate: [
                {
                  threshold: 0,
                  rake: 0,
                },
              ],
              nonDesignate: [
                {
                  threshold: 0,
                  rake: 0,
                },
              ],
              nonDistinguish: [],
            },
          },
        ]
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        setTabValue('預設')
        setDeductionIndex(0)
      } else {
        newProfitSharing.segmented = []
        newProfitSharing.nonSegmented = [
          {
            attribute: '預設',
            rakeData: {
              designate: [],
              nonDesignate: [],
              nonDistinguish: [
                {
                  threshold: 0,
                  rake: 0,
                },
              ],
            },
          },
        ]
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
      }
    } else {
      if (newProfitSharing.designationUsage) {
        newProfitSharing.segmented = [
          {
            designate: [
              {
                thresholdLowerLimit: 0,
                thresholdUpperLimit: 0,
                rake: 0,
              },
            ],
            nonDesignate: [
              {
                thresholdLowerLimit: 0,
                thresholdUpperLimit: 0,
                rake: 0,
              },
            ],
            nonDistinguish: [],
          },
        ]
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        newProfitSharing.nonSegmented = []
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      } else {
        newProfitSharing.segmented = [
          {
            designate: [],
            nonDesignate: [],
            nonDistinguish: [
              {
                thresholdLowerLimit: 0,
                thresholdUpperLimit: 0,
                rake: 0,
              },
            ],
          },
        ]
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        newProfitSharing.nonSegmented = []
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        setTabValue('預設')
        setDeductionIndex(0)
      }
    }
    onChange({ value: !newProfitSharing.isSegmented, key: 'isSegmented' })
  }

  const handleAddSetDeductionNum = nonSegmentedType => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    switch (nonSegmentedType) {
      case 'nonDistinguish':
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.push({
          threshold: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        break
      case 'designate':
        newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.push({
          threshold: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        break
      case 'nonDesignate':
        newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.push({
          threshold: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        break
      default:
        console.log('handleAddSetDeductionNum default')
        break
    }
  }

  const handleDeleteSetDeductionNum = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleDeleteNonSegmentedDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleDeleteNonSegmentedNonDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.splice(index, 1)
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }

  const handleAddSegmented = segmentedType => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    switch (segmentedType) {
      case 'nonDistinguish':
        newProfitSharing.segmented[0].nonDistinguish.push({
          thresholdLowerLimit: 0,
          thresholdUpperLimit: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        break
      case 'designate':
        newProfitSharing.segmented[0].designate.push({
          thresholdLowerLimit: 0,
          thresholdUpperLimit: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        break
      case 'nonDesignate':
        newProfitSharing.segmented[0].nonDesignate.push({
          thresholdLowerLimit: 0,
          thresholdUpperLimit: 0,
          rake: 0,
        })
        onChange({ value: newProfitSharing.segmented, key: 'segmented' })
        break
      default:
        console.log('handleAddSegmented default')
        break
    }
  }

  const handleDeleteSegmented = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDistinguish.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }
  const handleDeleteSegmentedDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].designate.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }
  const handleDeleteSegmentedNonDesignate = index => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDesignate.splice(index, 1)
    onChange({ value: newProfitSharing.segmented, key: 'segmented' })
  }

  const handleNonSegmentedThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.forEach(
      (data, index2) => {
        if (index === index2) {
          data.threshold = parseInt(event.target.value)
        }
      }
    )
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleNonSegmentedDesignateThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.forEach((data, index2) => {
      if (index === index2) {
        data.threshold = parseInt(event.target.value)
      }
    })
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }
  const handleNonSegmentedNonDesignateThresholdInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        data.threshold = parseInt(event.target.value)
      }
    })
    onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
  }

  const handleNonSegmentedRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.forEach(
      (data, index2) => {
        if (index === index2) {
          data.rake = parseFloat(event.target.value)
          onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
        }
      }
    )
  }
  const handleNonSegmentedDesignateRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.designate.forEach((data, index2) => {
      if (index === index2) {
        data.rake = parseFloat(event.target.value)
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    })
  }
  const handleNonSegmentedNonDesignateRakeInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        data.rake = parseFloat(event.target.value)
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    })
  }

  const handleSegmentedInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDistinguish.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'rake':
            data.rake = parseFloat(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          default:
            console.log('handleSegmentedInput')
            break
        }
      }
    })
  }

  const handleDesignateSegmentedInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].designate.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'rake':
            data.rake = parseFloat(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          default:
            console.log('handleSegmentedInput')
            break
        }
      }
    })
  }
  const handleNonDesignateSegmentedInput = (event, index, rakeType) => {
    checkInput(event, rakeType)
    const newProfitSharing = _.cloneDeep(profitSharing)
    newProfitSharing.segmented[0].nonDesignate.forEach((data, index2) => {
      if (index === index2) {
        switch (rakeType) {
          case 'thresholdLowerLimit':
            data.thresholdLowerLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'thresholdUpperLimit':
            data.thresholdUpperLimit = parseInt(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          case 'rake':
            data.rake = parseFloat(event.target.value)
            onChange({ value: newProfitSharing.segmented, key: 'segmented' })
            break
          default:
            console.log('handleSegmentedInput')
            break
        }
      }
    })
  }
  const handleTabsChange = (e, value) => {
    const newProfitSharing = _.cloneDeep(profitSharing)
    if (newProfitSharing.nonSegmented.filter(d => d.attribute === value).length === 0) {
      if (profitSharing.designationUsage && !profitSharing.isSegmented) {
        newProfitSharing.nonSegmented.push({
          attribute: value,
          rakeData: {
            designate: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
            nonDesignate: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
            nonDistinguish: [],
          },
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      } else {
        newProfitSharing.nonSegmented.push({
          attribute: value,
          rakeData: {
            designate: [],
            nonDesignate: [],
            nonDistinguish: [
              {
                threshold: 0,
                rake: 0,
              },
            ],
          },
        })
        onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
      }
    } else {
      newProfitSharing.nonSegmented.forEach((d, index) => {
        if (d.attribute === value && profitSharing.designationUsage) {
          if (newProfitSharing.nonSegmented[index].rakeData.nonDistinguish.length === 0) {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
          } else {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
            onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
          }
        } else if (d.attribute === value && !profitSharing.designationUsag) {
          if (newProfitSharing.nonSegmented[index].rakeData.designate.length === 0) {
            console.log('3d', d)

            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
          } else {
            newProfitSharing.nonSegmented[index] = {
              ...d,
            }
            onChange({ value: newProfitSharing.nonSegmented, key: 'nonSegmented' })
            onChange({ value: !newProfitSharing.designationUsage, key: 'designationUsage' })
          }
        }
      })
    }
    setTabValue(value)
  }

  useEffect(() => {
    profitSharing.nonSegmented.forEach((d, index) => {
      if (d.attribute === tabValue) {
        setDeductionIndex(index)
      } else if (tabValue === '預設') {
        setDeductionIndex(0)
      }
    })
  }, [tabValue])

  useEffect(() => {
    if (!getAttributionForRake.loading) {
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake)
      setAttributions(data)
    }
  }, [getAttributionForRake.loading])

  return (
    <Modal open={openEditRakeSettingModal}>
      <Card css={styles.root}>
        {!getAttributionForRake.loading ? (
          <>
            <div css={styles.header}>
              <CardHeader title="編輯設計師抽成" />
              {!profitSharing.isSegmented && (
                <Tabs
                  value={tabValue}
                  scrollButtons="auto"
                  variant="scrollable"
                  onChange={handleTabsChange}
                >
                  {attributions.map(tab => (
                    <Tab key={tab.value} label={tab.label} value={tab.value} />
                  ))}
                </Tabs>
              )}
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
              <Table>
                <TableBody>
                  <Fragment>
                    <TableRow>
                      <Typography variant="h5" css={styles.subtitle}>
                        抽成模式
                      </Typography>
                      <ToggleButtonGroup
                        size="small"
                        css={styles.deductionWayMarginL}
                        value={profitSharing.isSegmented}
                        onChange={handleToggleButtonChange}
                        exclusive
                      >
                        {isSegmented.map((data, idx) => (
                          <ToggleButton
                            key={`${data.label}-${idx}`}
                            value={data.value}
                            data-testid={`assign-designer-${data.value}`}
                          >
                            {data.label}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                      <FormControlLabel
                        css={styles.marginL}
                        control={<Checkbox color="primary" />}
                        label="分指定/不指定"
                        checked={profitSharing.designationUsage}
                        onClick={handleDesignateChange}
                      />
                    </TableRow>
                    {!profitSharing.designationUsage ? (
                      !profitSharing.isSegmented ? (
                        profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map(
                          (data, index) => (
                            <TableRow key={`nonSegmented-${index}`} css={styles.flex}>
                              <TableCell css={styles.verticleCenter}>
                                總業績從(含)
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入業績"
                                  value={data.threshold ? data.threshold : 0}
                                  onChange={event =>
                                    handleNonSegmentedThresholdInput(event, index, 'threshold')
                                  }
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.verticleCenter}>
                                抽成調整為
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入抽成(%)"
                                  value={data.rake ? data.rake : 0}
                                  onChange={event => handleNonSegmentedRakeInput(event, index, 'rake')}
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.verticleCenter}>
                                {index !== 0 && (
                                  <DeleteForeverIcon
                                    css={styles.icons}
                                    onClick={handleDeleteSetDeductionNum}
                                  />
                                )}
                                {index ===
                                  profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish
                                    .length -
                                  1 && (
                                    <AddIcon
                                      css={styles.icons}
                                      onClick={() => handleAddSetDeductionNum('nonDistinguish')}
                                    />
                                  )}
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        profitSharing.segmented[0].nonDistinguish.map((data, index) => (
                          <TableRow key={`nonDistinguish-${index}`} css={styles.flex}>
                            <TableCell css={styles.separateInputBottom}>
                              總業績從(含)
                              <TextField
                                InputProps={{ inputProps: { min: 0 } }}
                                type="number"
                                css={styles.deductionWayMarginL}
                                variant="outlined"
                                label="輸入業績"
                                value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                                onChange={event =>
                                  handleSegmentedInput(event, index, 'thresholdLowerLimit')
                                }
                                onWheel={() => document.activeElement.blur()}
                              />
                            </TableCell>
                            <TableCell css={styles.separateInput}>
                              至
                              <TextField
                                InputProps={{ inputProps: { min: 0 } }}
                                type="number"
                                css={styles.deductionWayMarginL}
                                variant="outlined"
                                label="輸入業績"
                                value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                                onChange={event =>
                                  handleSegmentedInput(event, index, 'thresholdUpperLimit')
                                }
                                onWheel={() => document.activeElement.blur()}
                              />
                            </TableCell>
                            <TableCell css={styles.separateInputRake}>
                              抽成為
                              <TextField
                                InputProps={{ inputProps: { min: 0 } }}
                                type="number"
                                css={styles.deductionWayMarginL}
                                variant="outlined"
                                label="輸入抽成(%)"
                                value={data.rake ? data.rake : 0}
                                onChange={event => handleSegmentedInput(event, index, 'rake')}
                                onWheel={() => document.activeElement.blur()}
                              />
                            </TableCell>
                            <TableCell css={styles.verticleCenter}>
                              {index !== 0 && (
                                <DeleteForeverIcon
                                  css={styles.icons}
                                  onClick={() => handleDeleteSegmented(index)}
                                />
                              )}
                              {index === profitSharing.segmented[0].nonDistinguish.length - 1 && (
                                <AddIcon
                                  css={styles.icons}
                                  onClick={() => handleAddSegmented('nonDistinguish')}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )
                    ) : !profitSharing.isSegmented ? (
                      <Fragment>
                        <TableRow>
                          <Typography variant="h5" css={styles.subtitle}>
                            指定業績
                          </Typography>
                        </TableRow>
                        {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map(
                          (data, index) => {
                            return (
                              <TableRow key={`designate-${index}`} css={styles.flex}>
                                <TableCell css={styles.verticleCenter}>
                                  總業績從(含)
                                  <TextField
                                    InputProps={{ inputProps: { min: 0 } }}
                                    type="number"
                                    css={styles.deductionWayMarginL}
                                    variant="outlined"
                                    label="輸入業績"
                                    value={data.threshold ? data.threshold : 0}
                                    onChange={event =>
                                      handleNonSegmentedDesignateThresholdInput(
                                        event,
                                        index,
                                        'threshold'
                                      )
                                    }
                                    onWheel={() => document.activeElement.blur()}
                                  />
                                </TableCell>
                                <TableCell css={styles.verticleCenter}>
                                  抽成調整為
                                  <TextField
                                    InputProps={{ inputProps: { min: 0 } }}
                                    type="number"
                                    css={styles.deductionWayMarginL}
                                    variant="outlined"
                                    label="輸入抽成(%)"
                                    value={data.rake ? data.rake : 0}
                                    onChange={event =>
                                      handleNonSegmentedDesignateRakeInput(event, index, 'rake')
                                    }
                                    onWheel={() => document.activeElement.blur()}
                                  />
                                </TableCell>
                                <TableCell css={styles.verticleCenter}>
                                  {index !== 0 && (
                                    <DeleteForeverIcon
                                      css={styles.icons}
                                      onClick={() => handleDeleteNonSegmentedDesignate(index)}
                                    />
                                  )}
                                  {index ===
                                    profitSharing.nonSegmented[deductionIndex].rakeData.designate
                                      .length -
                                    1 && (
                                      <AddIcon
                                        css={styles.icons}
                                        onClick={() => handleAddSetDeductionNum('designate')}
                                      />
                                    )}
                                </TableCell>
                              </TableRow>
                            )
                          }
                        )}
                        <TableRow>
                          <Typography variant="h5" css={styles.subtitle}>
                            不指定業績
                          </Typography>
                        </TableRow>
                        {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map(
                          (data, index) => {
                            return (
                              <TableRow key={`nonDesignate-${index}`} css={styles.flex}>
                                <TableCell css={styles.verticleCenter}>
                                  總業績從(含)
                                  <TextField
                                    InputProps={{ inputProps: { min: 0 } }}
                                    type="number"
                                    css={styles.deductionWayMarginL}
                                    variant="outlined"
                                    label="輸入業績"
                                    value={data.threshold ? data.threshold : 0}
                                    onChange={event =>
                                      handleNonSegmentedNonDesignateThresholdInput(
                                        event,
                                        index,
                                        'threshold'
                                      )
                                    }
                                    onWheel={() => document.activeElement.blur()}
                                  />
                                </TableCell>
                                <TableCell css={styles.verticleCenter}>
                                  抽成調整為
                                  <TextField
                                    InputProps={{ inputProps: { min: 0 } }}
                                    type="number"
                                    css={styles.deductionWayMarginL}
                                    variant="outlined"
                                    label="輸入抽成(%)"
                                    value={data.rake ? data.rake : 0}
                                    onChange={event =>
                                      handleNonSegmentedNonDesignateRakeInput(event, index, 'rake')
                                    }
                                    onWheel={() => document.activeElement.blur()}
                                  />
                                </TableCell>
                                <TableCell css={styles.verticleCenter}>
                                  {index !== 0 && (
                                    <DeleteForeverIcon
                                      css={styles.icons}
                                      onClick={() => handleDeleteNonSegmentedNonDesignate(index)}
                                    />
                                  )}
                                  {index ===
                                    profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate
                                      .length -
                                    1 && (
                                      <AddIcon
                                        css={styles.icons}
                                        onClick={() => handleAddSetDeductionNum('nonDesignate')}
                                      />
                                    )}
                                </TableCell>
                              </TableRow>
                            )
                          }
                        )}
                      </Fragment>
                    ) : (
                      <Fragment>
                        <TableRow>
                          <Typography variant="h5" css={styles.subtitle}>
                            指定業績
                          </Typography>
                        </TableRow>
                        {profitSharing.segmented[0].designate.map((data, index) => {
                          return (
                            <TableRow key={`designate-${index}`} css={styles.flex}>
                              <TableCell css={styles.separateInputBottom}>
                                指定業績從(含)
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入業績"
                                  value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                                  onChange={event =>
                                    handleDesignateSegmentedInput(event, index, 'thresholdLowerLimit')
                                  }
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.separateInput}>
                                至
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入業績"
                                  value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                                  onChange={event =>
                                    handleDesignateSegmentedInput(event, index, 'thresholdUpperLimit')
                                  }
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.separateInputRake}>
                                抽成為
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入抽成(%)"
                                  value={data.rake ? data.rake : 0}
                                  onChange={event =>
                                    handleDesignateSegmentedInput(event, index, 'rake')
                                  }
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.verticleCenter}>
                                {index !== 0 && (
                                  <DeleteForeverIcon
                                    css={styles.icons}
                                    onClick={() => handleDeleteSegmentedDesignate(index)}
                                  />
                                )}
                                {index === profitSharing.segmented[0].designate.length - 1 && (
                                  <AddIcon
                                    css={styles.icons}
                                    onClick={() => handleAddSegmented('designate')}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow>
                          <Typography variant="h5" css={styles.subtitle}>
                            不指定業績
                          </Typography>
                        </TableRow>
                        {profitSharing.segmented[0].nonDesignate.map((data, index) => {
                          return (
                            <TableRow key={`nonDesignate-${index}`} css={styles.flex}>
                              <TableCell css={styles.separateInputBottom}>
                                不指定業績從(含)
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  // css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入業績"
                                  value={data.thresholdLowerLimit ? data.thresholdLowerLimit : 0}
                                  onChange={event =>
                                    handleNonDesignateSegmentedInput(
                                      event,
                                      index,
                                      'thresholdLowerLimit'
                                    )
                                  }
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.separateInput}>
                                至
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入業績"
                                  value={data.thresholdUpperLimit ? data.thresholdUpperLimit : 0}
                                  onChange={event =>
                                    handleNonDesignateSegmentedInput(
                                      event,
                                      index,
                                      'thresholdUpperLimit'
                                    )
                                  }
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.separateInputRake}>
                                抽成為
                                <TextField
                                  InputProps={{ inputProps: { min: 0 } }}
                                  type="number"
                                  css={styles.deductionWayMarginL}
                                  variant="outlined"
                                  label="輸入抽成(%)"
                                  value={data.rake ? data.rake : 0}
                                  onChange={event =>
                                    handleNonDesignateSegmentedInput(event, index, 'rake')
                                  }
                                  onWheel={() => document.activeElement.blur()}
                                />
                              </TableCell>
                              <TableCell css={styles.verticleCenter}>
                                {index !== 0 && (
                                  <DeleteForeverIcon
                                    css={styles.icons}
                                    onClick={() => handleDeleteSegmentedNonDesignate(index)}
                                  />
                                )}
                                {index === profitSharing.segmented[0].nonDesignate.length - 1 && (
                                  <AddIcon
                                    css={styles.icons}
                                    onClick={() => handleAddSegmented('nonDesignate')}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </Fragment>
                    )}
                  </Fragment>
                </TableBody>
              </Table>
            </CardContent>
            <Button
              color="primary"
              variant="contained"
              css={styles.saveAtBottom}
              onClick={handleMultipleRakeSetting}
            >
              儲存
            </Button>
          </>
        ) : <div style={{ textAlign: 'center', margin: '190px 0px' }}><CircularProgress /></div>}
      </Card>
    </Modal>
  )
}

EditMultipleDesignersRakeSettingModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

EditMultipleDesignersRakeSettingModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default EditMultipleDesignersRakeSettingModal
