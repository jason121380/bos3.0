/** @jsxImportSource @emotion/react */
import { 
  Card, CardContent, CardHeader, Divider, TextField, Button, 
  RadioGroup, FormControlLabel, Radio, FormControl, CircularProgress,
  Select, InputLabel, MenuItem, IconButton
} from '@mui/material'
import { Fragment, useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import _ from 'lodash'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import useFetchSettingJobTitlePoint from 'hooks/useFetchSettingJobTitlePoint'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchSettingHelperCategory from 'hooks/useFetchSettingHelperCategory'
import { openSnackbar } from 'elements/snackbars'

import produce from 'immer'
import idx from 'idx'
import styles from './styles/AboutDesignerSalary'

export default function AboutDesignerSalary({ className, 
  deduction, 
  merchantCommissionWay, 
  merchantPointValueSettingsForSelect,
  setIsSubmitForCommission,
  setIsSubmitForPoint,
  setIsSubmitForType,
  isSubmitForType,
  isSubmitForPoint,
  isSubmitForCommission
}) {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const [service, setService] = useState({
    point: [{ 
      jobTitle: '',
      pointValue: 0,
      deductionId: 'unset',
      commissionWayId: 'unset',
      merchantPointValueSettingId: 'unset',
      isDefaultValue: false,
      usingPeopleCount: 0
    }],
    commission: [{ 
      id: '',      
      name: '', 
      basisForDeduction: ''
    }],
  })
  const [serviceForType, setServiceForType] = useState({
    helperTypeName: [{ type: '' }],
  })

  const { setJobTitlePoint } = useFetchSettingJobTitlePoint()
  const { setHelperCategory } = useFetchSettingHelperCategory()

  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()
  const merchantHelperItems = useFetchMerchantHelperItems({ merchantId })
  const [deductionData, setDeductionData] = useState([])
  const [merchantPointValueData, setMerchantPointValueData] = useState([])
  useEffect(() => {
    if(!deduction.loading && !merchantPointValueSettingsForSelect.loading) {
      setDeductionData(idx(deduction, _ => _.data.getDeductionSettings))
      setMerchantPointValueData(idx(merchantPointValueSettingsForSelect.data, _ => _.getMerchantPointValueSettings))
    }
  }, [deduction.loading, merchantPointValueSettingsForSelect.loading])

  useEffect(() => {
    if (!merchantJobTitlePoint.loading && !merchantHelperItems.loading && !merchantCommissionWay.loading) {
      const point = idx(merchantJobTitlePoint.data, _ =>
        _.merchantJobTitlePoint.length > 0
          ? _.merchantJobTitlePoint.map((d, index) => ({
              index: index,
              jobTitle: d.jobTitle,
              pointValue: d.pointValue,
              deductionId: d.DeductionSettingId !== null ? d.DeductionSettingId : "unset",
              commissionWayId: d.MerchantCommissionWayId !== null ? d.MerchantCommissionWayId : "unset",
              merchantPointValueSettingId: d.merchantPointValueSettingId !== null ? d.merchantPointValueSettingId : "unset",
              isDefaultValue: d.isDefaultValue,
              usingPeopleCount: d.usingPeopleCount
            }))
          : [{ 
              jobTitle: '', 
              pointValue: 0,
              deductionId: 'unset',
              commissionWayId: 'unset',
              merchantPointValueSettingId: 'unset',
              isDefaultValue: false,
              usingPeopleCount: 0
            }]
      )
      const helperTypeName = idx(merchantHelperItems.data, _ =>
        _.merchantHelperItems.length > 0
          ? _.merchantHelperItems.map(d => ({ type: d.type }))
          : [{ type: '' }]
      )
      const commission = idx(merchantCommissionWay.data, _ =>
        _.merchantCommissionWay.length > 0
          ? _.merchantCommissionWay.map(d => ({
              id: d.id,
              name: d.name,
              basisForDeduction: d.basisForDeduction,
            }))
          : [{ 
              id: '',
              name: '', 
              basisForDeduction: '' }]
      )
      setService({point, commission})
      setServiceForType({helperTypeName})
    }
  }, [merchantJobTitlePoint.loading, merchantHelperItems.loading, merchantCommissionWay.loading])
  const handleServiceChange = ({ changedData, key }) => {
    setService(
      produce(draft => {
        draft[key] = changedData
      })
    )
  }
  const handleServiceForTypeChange = ({ changedData, key }) => {
    setServiceForType(
      produce(draft => {
        draft[key] = changedData
      })
    )
  }
  const handleSubmit = async () => {
    let checkArray = []
    let variable = []
    const inputValue = service.point.filter(d => d.jobTitle === null).length
    const isDefaultValueCount = service.point.filter(d => d.isDefaultValue === true).length
    service.point.map(d => {
      if (checkArray.indexOf(d.jobTitle) === -1) {
        checkArray.push(d.jobTitle)
      }
      variable.push({
        jobTitle: d.jobTitle,
        pointValue: d.pointValue,
        deductionId: d.deductionId === 'unset' ? null : d.deductionId,
        commissionWayId: d.commissionWayId === 'unset' ? null : d.commissionWayId,
        merchantPointValueSettingId: d.merchantPointValueSettingId === 'unset' ? null : d.merchantPointValueSettingId,
        isDefaultValue: d.isDefaultValue,
      })
    })

    if (isDefaultValueCount === 0) {
      openSnackbar({
        message: "請選擇預設的人員類別",
        variant: 'error',
      })
    } else {
      if (inputValue > 0) {
        openSnackbar({
          message: "請填寫人員設定的名稱",
          variant: 'error',
        })
      } else {
        if (checkArray.length < service.point.length) {
          openSnackbar({
            message: "人員類別設定的名稱已被重複",
            variant: 'error',
          })
        } else {
          setJobTitlePoint({
            input: variable,
          }).then(res => {
            if(res.data.settingJobTitlePoint){
              openSnackbar({
                message: "編輯成功",
                variant: 'success',
              })
              merchantJobTitlePoint.refetch()
            } else {
              openSnackbar({
                message: "編輯失敗",
                variant: 'warning',
              })
            }
            setIsSubmitForCommission(false)
            setIsSubmitForPoint(false)
            setIsSubmitForType(false)
          }).catch(error => {
            openSnackbar({
              message: error.message,
              variant: 'error',
            })
            setIsSubmitForCommission(false)
            setIsSubmitForPoint(false)
            setIsSubmitForType(false)
          })
        }
      }
    }
  }
  const handleSubmitForType = async () => {
    setHelperCategory({ 
      input: serviceForType.helperTypeName
    }).then(res => {
      if(res.data.setHelperCategory){
        openSnackbar({
          message: "編輯成功",
          variant: 'success',
        })
        merchantHelperItems.refetch()
      } else {
        openSnackbar({
          message: "編輯失敗",
          variant: 'warning',
        })
      }
        setIsSubmitForCommission(false)
        setIsSubmitForPoint(false)
        setIsSubmitForType(false)
    }).catch(error => {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      setIsSubmitForCommission(false)
      setIsSubmitForPoint(false)
      setIsSubmitForType(false)
    })
  }
  const handleAddSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    const newServiceForType = _.cloneDeep(serviceForType)
    switch (rest[0]) {
      case 'point':
        newService.point.push({ 
          index: newService.point.length,
          jobTitle: '', 
          pointValue: 0,
          deductionId: 'unset',
          commissionWayId: 'unset',
          merchantPointValueSettingId: 'unset',
          isDefaultValue: false,
          usingPeopleCount: 0
        })
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'helperTypeName':
        newServiceForType.helperTypeName.push({})
        handleServiceForTypeChange({ changedData: newServiceForType.helperTypeName, key: 'helperTypeName' })
        break
      default:
        break
    }
  }

  const handleDeleteSetting = (...rest) => {
    const newService = _.cloneDeep(service)
    const newServiceForType = _.cloneDeep(serviceForType)
    switch (rest[0]) {
      case 'point':
        newService.point.splice(rest[1], 1)
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'helperTypeName':
        newServiceForType.helperTypeName.splice(rest[1], 1)
        handleServiceForTypeChange({ changedData: newServiceForType.helperTypeName, key: 'helperTypeName' })
        break
      default:
        break
    }
  }

  const handlePointSetting = (event, index) => {
    const newService = _.cloneDeep(service)
    switch (event.target.name) {
      case 'jobTitle':
        newService.point[index].jobTitle = event.target.value
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'pointValue':
        newService.point[index].pointValue = parseInt(event.target.value)
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'deductionId':
        newService.point[index].deductionId = event.target.value
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'commissionWayId':
        newService.point[index].commissionWayId = event.target.value
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'merchantPointValueSettingId':
        newService.point[index].merchantPointValueSettingId = event.target.value
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'isDefaultValue':
        newService.point.forEach((d, i) => {
          if (i == index) {
            newService.point[i].isDefaultValue = true
          } else {
            newService.point[i].isDefaultValue = false
          }
        })
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      default:
        break
    }
  }

  const handleHelperTypeName = (event, index) => {
    const newService = _.cloneDeep(serviceForType)
    newService.helperTypeName[index].type = event.target.value
    handleServiceForTypeChange({ changedData: newService.helperTypeName, key: 'helperTypeName' })
  }

  const handleEdit = () => {
    setIsSubmitForPoint(true)
    setIsSubmitForType(false)
    setIsSubmitForCommission(false)
  }  
  const handleEditForType = () => {
    setIsSubmitForType(true)
    setIsSubmitForPoint(false)
    setIsSubmitForCommission(false)
  }  
return (
    <Fragment>
      <Card css={className}>
        <CardHeader 
          title="人員身分類別設定" 
          action={
            isSubmitForPoint ? (
              <Button
                css={styles.saveButton}
                variant="contained"
                onClick={handleSubmit}
                data-testid="parameter"
              >
                儲存
              </Button>
            ) : (
              <Button
                color="primary"
                variant="contained"
                onClick={handleEdit}
                data-testid="parameter"
                disabled={(merchantCommissionWay.loading && merchantJobTitlePoint.loading) || isSubmitForCommission || isSubmitForType}
              >
                編輯
              </Button>
            )
          }/>
        <Divider />
        <CardContent>
          {(!merchantJobTitlePoint.loading && !merchantCommissionWay.loading && !deduction.loading && !merchantPointValueSettingsForSelect.loading) ? (
            service.point.map((data, index) => (
              <div css={styles.service} key={index}>
                <TextField
                  type="text"
                  variant="outlined"
                  label="人員類別"
                  name="jobTitle"
                  value={data.jobTitle}
                  disabled={!isSubmitForPoint}
                  onChange={event => handlePointSetting(event, index)}
                />
                <FormControl disabled={!isSubmitForPoint} variant="outlined" css={styles.field}>
                  <InputLabel>服務扣項依據方式</InputLabel>
                  <Select
                    label='服務扣項依據方式'
                    value={data.commissionWayId}
                    name="commissionWayId"
                    onChange={event => handlePointSetting(event, index)}
                    >
                    <MenuItem value="unset" key="unset">
                      無扣項
                    </MenuItem>
                    {service.commission.map((data, idx) => (
                      <MenuItem value={data.id} key={`${data.label}-${idx}`} disabled={!isSubmitForPoint}>
                        {data.name}
                      </MenuItem>
                    ))}
                  </Select> 
                </FormControl>
                <FormControl disabled={!isSubmitForPoint} variant="outlined" css={styles.field}>
                  <InputLabel>抽成方式設定</InputLabel>
                  <Select
                    label='抽成方式設定'
                    value={data.deductionId}
                    name="deductionId"
                    onChange={event => handlePointSetting(event, index)}
                    >
                    <MenuItem value="unset"  key="unset">
                        無抽成
                    </MenuItem>
                    {deductionData.map((data, idx) => (
                      <MenuItem value={data.id} key={data.id}>
                        {data.name}
                      </MenuItem>
                    ))}
                  </Select> 
                </FormControl>
                <FormControl disabled={!isSubmitForPoint} variant="outlined" css={styles.field}>
                  <InputLabel>互助方式設定</InputLabel>
                  <Select
                    label='互助方式設定'
                    value={data.merchantPointValueSettingId}
                    name="merchantPointValueSettingId"
                    onChange={event => handlePointSetting(event, index)}
                    >
                    <MenuItem value="unset"  key="unset">
                        無互助
                    </MenuItem>
                    {merchantPointValueData.map((data, idx) => (
                      <MenuItem value={data.id} key={data.id}>
                        {data.name}
                      </MenuItem>
                    ))}
                  </Select> 
                </FormControl>
                {service.point.length > 1 && (
                  data.usingPeopleCount === 0 ? ( 
                  <IconButton
                    disabled={!isSubmitForPoint} 
                    css={service.point.filter(d => d.usingPeopleCount === 0 ).length !== service.point.length ? styles.deleteButton : styles.deleteButtonWithCount} 
                    onClick={() => handleDeleteSetting('point', index)}
                  >
                    <DeleteForeverIcon/>
                  </IconButton>) : (
                  <div style={{display: 'grid', justifyItems: 'center', marginLeft:10}}>
                    <span>人數: {data.usingPeopleCount}人</span>
                    <span>使用中無法刪除</span>
                  </div>
                  )
                )}
                <FormControl >
                  <RadioGroup 
                    value={data.isDefaultValue.toString()} 
                    name="isDefaultValue" 
                    onChange={event => {
                      handlePointSetting(event, index)
                    }} 
                    disabled={!isSubmitForPoint}
                  >
                    <FormControlLabel style={{marginLeft: 10}} value='true' control={<Radio />} label="預設" disabled={!isSubmitForPoint}/>
                  </RadioGroup>
                </FormControl>
                {index === service.point.length - 1 && (
                <IconButton 
                  css={styles.action}
                  disabled={!isSubmitForPoint}
                  onClick={() => handleAddSetting('point')}
                >
                  <AddIcon/>
                </IconButton>
              )}
              </div>
            ))
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </div>
          )}
        </CardContent>
      </Card>
      <Card css={className}>
        <CardHeader 
          title="互助類別名稱設定" 
          action={
            isSubmitForType ? (
              <Button
                css={styles.saveButton}
                variant="contained"
                onClick={handleSubmitForType}
                data-testid="parameter"
              >
                儲存
              </Button>
            ) : (
              <Button
                color="primary"
                variant="contained"
                onClick={handleEditForType}
                data-testid="parameter"
                disabled={merchantHelperItems.loading || isSubmitForCommission || isSubmitForPoint}
              >
                編輯
              </Button>
            )
          }
        />
        <Divider />
        <CardContent>
          {!merchantHelperItems.loading ? (
            serviceForType.helperTypeName.map((data, index) => 
            <div css={styles.service} key={index}>
              <TextField
                type="text"
                variant="outlined"
                label="互助類別"
                value={data.type}
                disabled={!isSubmitForType}
                onChange={event => handleHelperTypeName(event, index)}
              />
              {serviceForType.helperTypeName.length > 1 && (
              <IconButton 
                css={styles.action}
                disabled={!isSubmitForType}
                onClick={() => handleDeleteSetting('helperTypeName', index)}
              >
                <DeleteForeverIcon/>
              </IconButton>
              )}
              {index === serviceForType.helperTypeName.length - 1 && (
                <IconButton
                  css={styles.action}
                  disabled={!isSubmitForType}
                  onClick={() => handleAddSetting('helperTypeName')}
                >
                  <AddIcon/>
                </IconButton>
              )}
            </div>
          )) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </div>
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}
