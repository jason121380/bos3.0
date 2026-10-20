/** @jsxImportSource @emotion/react */
// 彈窗改 ui/dialog（窗內只有 TextField、Checkbox、ToggleGroup、Tabs，沒有彈出式選單；原 Modal 無 onClose，故不傳 onOpenChange）；
// 抽成級距表單原以 MUI Table 當排版容器（列內直接放標題、儲存格改 flex），改原生 div（儲存格保留 16px 內距，emotion css 原樣）；
// ToggleButton 為 ui/toggle-group（布林值原樣、handler 不讀參數）；Tabs 為 ui/tabs（value 為字串、activationMode="manual"，onValueChange 以 (null, value) 轉接原 handler）
import { FormControlLabel, Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import _ from 'lodash'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Button } from 'ui/button'
import { CardContent } from 'ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'ui/dialog'
import { Skeleton } from 'ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from 'ui/tabs'

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
    <Dialog open={openEditRakeSettingModal}>
      <DialogContent size="lg" hideClose aria-describedby={undefined} className="max-w-[912px]">
        {/* 內層為一般區塊（非 flex）：標題列「關閉」與底部「儲存」沿用原本的 float 排版 */}
        <div className="min-h-0 overflow-y-auto">
        {!getAttributionForRake.loading ? (
          <>
            <div css={styles.header}>
              <DialogHeader className="pb-4">
                <DialogTitle>編輯設計師抽成</DialogTitle>
              </DialogHeader>
              {!profitSharing.isSegmented && (
                <Tabs
                  value={tabValue}
                  onValueChange={value => handleTabsChange(null, value)}
                  activationMode="manual"
                >
                  <TabsList>
                    {attributions.map(tab => (
                      <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
              <Button
                variant="secondary"
                css={styles.closeAtTop}
                onClick={onClose}
              >
                關閉
              </Button>
            </div>

            <CardContent>
              <div>
                <div>
                  <Fragment>
                    <div>
                      <h4 className="my-4 text-heading text-text">
                        抽成模式
                      </h4>
                      <ToggleGroup
                        size="small"
                        css={styles.deductionWayMarginL}
                        value={profitSharing.isSegmented}
                        onChange={handleToggleButtonChange}
                        exclusive
                      >
                        {isSegmented.map((data, idx) => (
                          <ToggleGroupItem
                            key={`${data.label}-${idx}`}
                            value={data.value}
                            data-testid={`assign-designer-${data.value}`}
                          >
                            {data.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                      <FormControlLabel
                        css={styles.marginL}
                        control={<Checkbox color="primary" />}
                        label="分指定/不指定"
                        checked={profitSharing.designationUsage}
                        onClick={handleDesignateChange}
                      />
                    </div>
                    {!profitSharing.designationUsage ? (
                      !profitSharing.isSegmented ? (
                        profitSharing.nonSegmented[deductionIndex].rakeData.nonDistinguish.map(
                          (data, index) => (
                            <div key={`nonSegmented-${index}`} css={styles.flex}>
                              <div className="p-4" css={styles.verticleCenter}>
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
                              </div>
                              <div className="p-4" css={styles.verticleCenter}>
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
                              </div>
                              <div className="p-4" css={styles.verticleCenter}>
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
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        profitSharing.segmented[0].nonDistinguish.map((data, index) => (
                          <div key={`nonDistinguish-${index}`} css={styles.flex}>
                            <div className="p-4" css={styles.separateInputBottom}>
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
                            </div>
                            <div className="p-4" css={styles.separateInput}>
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
                            </div>
                            <div className="p-4" css={styles.separateInputRake}>
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
                            </div>
                            <div className="p-4" css={styles.verticleCenter}>
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
                            </div>
                          </div>
                        ))
                      )
                    ) : !profitSharing.isSegmented ? (
                      <Fragment>
                        <div>
                          <h4 className="my-4 text-heading text-text">
                            指定業績
                          </h4>
                        </div>
                        {profitSharing.nonSegmented[deductionIndex].rakeData.designate.map(
                          (data, index) => {
                            return (
                              <div key={`designate-${index}`} css={styles.flex}>
                                <div className="p-4" css={styles.verticleCenter}>
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
                                </div>
                                <div className="p-4" css={styles.verticleCenter}>
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
                                </div>
                                <div className="p-4" css={styles.verticleCenter}>
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
                                </div>
                              </div>
                            )
                          }
                        )}
                        <div>
                          <h4 className="my-4 text-heading text-text">
                            不指定業績
                          </h4>
                        </div>
                        {profitSharing.nonSegmented[deductionIndex].rakeData.nonDesignate.map(
                          (data, index) => {
                            return (
                              <div key={`nonDesignate-${index}`} css={styles.flex}>
                                <div className="p-4" css={styles.verticleCenter}>
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
                                </div>
                                <div className="p-4" css={styles.verticleCenter}>
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
                                </div>
                                <div className="p-4" css={styles.verticleCenter}>
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
                                </div>
                              </div>
                            )
                          }
                        )}
                      </Fragment>
                    ) : (
                      <Fragment>
                        <div>
                          <h4 className="my-4 text-heading text-text">
                            指定業績
                          </h4>
                        </div>
                        {profitSharing.segmented[0].designate.map((data, index) => {
                          return (
                            <div key={`designate-${index}`} css={styles.flex}>
                              <div className="p-4" css={styles.separateInputBottom}>
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
                              </div>
                              <div className="p-4" css={styles.separateInput}>
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
                              </div>
                              <div className="p-4" css={styles.separateInputRake}>
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
                              </div>
                              <div className="p-4" css={styles.verticleCenter}>
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
                              </div>
                            </div>
                          )
                        })}
                        <div>
                          <h4 className="my-4 text-heading text-text">
                            不指定業績
                          </h4>
                        </div>
                        {profitSharing.segmented[0].nonDesignate.map((data, index) => {
                          return (
                            <div key={`nonDesignate-${index}`} css={styles.flex}>
                              <div className="p-4" css={styles.separateInputBottom}>
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
                              </div>
                              <div className="p-4" css={styles.separateInput}>
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
                              </div>
                              <div className="p-4" css={styles.separateInputRake}>
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
                              </div>
                              <div className="p-4" css={styles.verticleCenter}>
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
                              </div>
                            </div>
                          )
                        })}
                      </Fragment>
                    )}
                  </Fragment>
                </div>
              </div>
            </CardContent>
            <Button
              variant="primary"
              css={styles.saveAtBottom}
              onClick={handleMultipleRakeSetting}
            >
              儲存
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-label="載入中">
            <DialogTitle className="sr-only">編輯設計師抽成</DialogTitle>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
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
