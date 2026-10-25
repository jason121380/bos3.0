import { RadioField } from 'ui/radio'
import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { Fragment, useState, useEffect } from 'react'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import cloneDeep from 'lodash/cloneDeep'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import useFetchSettingJobTitlePoint from 'hooks/useFetchSettingJobTitlePoint'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchSettingHelperCategory from 'hooks/useFetchSettingHelperCategory'
import { openSnackbar } from 'elements/snackbars'

import produce from 'immer'
import idx from 'idx'

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
  })
  const [serviceForType, setServiceForType] = useState({
    helperTypeName: [{ type: '' }],
  })

  const { setJobTitlePoint } = useFetchSettingJobTitlePoint()
  const { setHelperCategory } = useFetchSettingHelperCategory()

  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()
  // 店家 id 由 hook 自行讀取（hook 不吃參數；原本傳入的 merchantId 沒有作用，2026/10/22 移除）
  const merchantHelperItems = useFetchMerchantHelperItems()
  // 下拉選項直接讀查詢結果：其他分頁新增／刪除扣項方式、抽成方式、互助點數後會 refetch（loading 不變），選項要跟著更新；
  // 查詢失敗時當成沒有選項
  const deductionData = idx(deduction, _ => _.data.getDeductionSettings) || []
  const merchantPointValueData = idx(merchantPointValueSettingsForSelect.data, _ => _.getMerchantPointValueSettings) || []
  const commissionWays = idx(merchantCommissionWay.data, _ => _.merchantCommissionWay)
  const commissionOptions = Array.isArray(commissionWays) ? commissionWays : []

  useEffect(() => {
    if (!merchantJobTitlePoint.loading && !merchantHelperItems.loading && merchantJobTitlePoint.data && merchantHelperItems.data) {
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
      setService({point})
      setServiceForType({helperTypeName})
    }
  }, [merchantJobTitlePoint.loading, merchantHelperItems.loading])
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
    // 名稱空白（含只有空白字元）視為未填：新增的列預設是空字串，原本只檢查 null 時空白名稱會被存入
    const inputValue = service.point.filter(d => !(d.jobTitle || '').trim()).length
    const isDefaultValueCount = service.point.filter(d => d.isDefaultValue === true).length
    service.point.forEach(d => {
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
    const newService = cloneDeep(service)
    const newServiceForType = cloneDeep(serviceForType)
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
        newServiceForType.helperTypeName.push({ type: '' })
        handleServiceForTypeChange({ changedData: newServiceForType.helperTypeName, key: 'helperTypeName' })
        break
      // no default
    }
  }

  const handleDeleteSetting = (...rest) => {
    const newService = cloneDeep(service)
    const newServiceForType = cloneDeep(serviceForType)
    switch (rest[0]) {
      case 'point':
        newService.point.splice(rest[1], 1)
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      case 'helperTypeName':
        newServiceForType.helperTypeName.splice(rest[1], 1)
        handleServiceForTypeChange({ changedData: newServiceForType.helperTypeName, key: 'helperTypeName' })
        break
      // no default
    }
  }

  // 畫面上沒有點數欄位（pointValue 原樣送回），只處理實際存在的欄位
  const handlePointSetting = (event, index) => {
    const newService = cloneDeep(service)
    switch (event.target.name) {
      case 'jobTitle':
        newService.point[index].jobTitle = event.target.value
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
          if (i === index) {
            newService.point[i].isDefaultValue = true
          } else {
            newService.point[i].isDefaultValue = false
          }
        })
        handleServiceChange({ changedData: newService.point, key: 'point' })
        break
      // no default
    }
  }

  const handleHelperTypeName = (event, index) => {
    const newService = cloneDeep(serviceForType)
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
      <Card id="deduction-job-title" className="scroll-mt-6">
        <CardHeader
          action={
            isSubmitForPoint ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                data-testid="parameter"
              >
                儲存
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEdit}
                data-testid="parameter"
                // 讀不到人員類別（讀取中或查詢失敗）時不能編輯：存檔會以畫面上的列整批取代後端資料
                disabled={!merchantJobTitlePoint.data || isSubmitForCommission || isSubmitForType}
              >
                編輯
              </Button>
            )
          }>
          <CardTitle>人員身分類別設定</CardTitle>
        </CardHeader>
        <CardContent>
          {(!merchantJobTitlePoint.loading && !merchantCommissionWay.loading && !deduction.loading && !merchantPointValueSettingsForSelect.loading) ? (
            service.point.map((data, index) => (
              <div className="flex items-center mb-[12px] flex-wrap gap-y-[10px]" key={index}>
                <Field label="人員類別" className="w-44">
                  <Input
                    type="text"
                    name="jobTitle"
                    value={data.jobTitle}
                    disabled={!isSubmitForPoint}
                    onChange={event => handlePointSetting(event, index)}
                  />
                </Field>
                <Field label="服務扣項依據方式" className="ml-3 w-[150px]">
                  <NativeSelect
                    value={data.commissionWayId}
                    name="commissionWayId"
                    disabled={!isSubmitForPoint}
                    onChange={event => handlePointSetting(event, index)}
                  >
                    <NativeSelectOption value="unset" key="unset">
                      無扣項
                    </NativeSelectOption>
                    {commissionOptions.map((data, idx) => (
                      <NativeSelectOption value={data.id} key={`${data.label}-${idx}`}>
                        {data.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="抽成方式設定" className="ml-3 w-[150px]">
                  <NativeSelect
                    value={data.deductionId}
                    name="deductionId"
                    disabled={!isSubmitForPoint}
                    onChange={event => handlePointSetting(event, index)}
                  >
                    <NativeSelectOption value="unset" key="unset">
                      無抽成
                    </NativeSelectOption>
                    {deductionData.map((data, idx) => (
                      <NativeSelectOption value={data.id} key={data.id}>
                        {data.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="互助方式設定" className="ml-3 w-[150px]">
                  <NativeSelect
                    value={data.merchantPointValueSettingId}
                    name="merchantPointValueSettingId"
                    disabled={!isSubmitForPoint}
                    onChange={event => handlePointSetting(event, index)}
                  >
                    <NativeSelectOption value="unset" key="unset">
                      無互助
                    </NativeSelectOption>
                    {merchantPointValueData.map((data, idx) => (
                      <NativeSelectOption value={data.id} key={data.id}>
                        {data.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                {service.point.length > 1 && (
                  data.usingPeopleCount === 0 ? ( 
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="刪除"
                    disabled={!isSubmitForPoint} 
                    className={service.point.filter(d => d.usingPeopleCount === 0 ).length !== service.point.length ? 'ml-[10px] w-[112px] max-sm:w-[112px]' : 'ml-[10px]'} 
                    onClick={() => handleDeleteSetting('point', index)}
                  >
                    <DeleteForeverIcon/>
                  </Button>) : (
                  <div style={{display: 'grid', justifyItems: 'center', marginLeft:10}}>
                    <span>人數: {data.usingPeopleCount}人</span>
                    <span>使用中無法刪除</span>
                  </div>
                  )
                )}
                <RadioField className="ml-2.5 mr-4" name="isDefaultValue" value="true" checked={data.isDefaultValue.toString() === 'true'} onChange={event => { handlePointSetting(event, index) }} label="預設" disabled={!isSubmitForPoint} />
                {index === service.point.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="新增"
                  className="p-0 w-[50px] max-sm:w-[50px] flex ml-[12px] cursor-pointer last:mr-0"
                  disabled={!isSubmitForPoint}
                  onClick={() => handleAddSetting('point')}
                >
                  <AddIcon/>
                </Button>
              )}
              </div>
            ))
          ) : (
            <Skeleton className="h-24 w-full" />
          )}
        </CardContent>
      </Card>
      <Card id="deduction-helper-category" className="scroll-mt-6">
        <CardHeader
          action={
            isSubmitForType ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitForType}
                data-testid="parameter"
              >
                儲存
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditForType}
                data-testid="parameter"
                disabled={!merchantHelperItems.data || isSubmitForCommission || isSubmitForPoint}
              >
                編輯
              </Button>
            )
          }
        >
          <CardTitle>互助類別名稱設定</CardTitle>
        </CardHeader>
        <CardContent>
          {!merchantHelperItems.loading ? (
            serviceForType.helperTypeName.map((data, index) => 
            <div className="flex items-center mb-[12px] flex-wrap gap-y-[10px]" key={index}>
              <Field label="互助類別" className="w-44">
                <Input
                  type="text"
                  value={data.type}
                  disabled={!isSubmitForType}
                  onChange={event => handleHelperTypeName(event, index)}
                />
              </Field>
              {serviceForType.helperTypeName.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="刪除"
                className="p-0 w-[50px] max-sm:w-[50px] flex ml-[12px] cursor-pointer last:mr-0"
                disabled={!isSubmitForType}
                onClick={() => handleDeleteSetting('helperTypeName', index)}
              >
                <DeleteForeverIcon/>
              </Button>
              )}
              {index === serviceForType.helperTypeName.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="新增"
                  className="p-0 w-[50px] max-sm:w-[50px] flex ml-[12px] cursor-pointer last:mr-0"
                  disabled={!isSubmitForType}
                  onClick={() => handleAddSetting('helperTypeName')}
                >
                  <AddIcon/>
                </Button>
              )}
            </div>
          )) : (
            <Skeleton className="h-24 w-full" />
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}
