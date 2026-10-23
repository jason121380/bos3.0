import { Button } from 'ui/button'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Skeleton } from 'ui/skeleton'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import { memo, Fragment, useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import useFetchSettingCommissionWay from 'hooks/useFetchSettingCommissionWay'
import produce from 'immer'
import idx from 'idx'
import { openSnackbar } from 'elements/snackbars'

const basisForDeductionSelection = [
  {
    value: 'BYORIGIN',
    label: '依原業績',
  },
  {
    value: 'BYFIXED',
    label: '依扣除手續費後業績',
  },
]

function Service({ className,
  merchantCommissionWay, 
  isSubmitForType,
  isSubmitForPoint,
  isSubmitForCommission,
  setIsSubmitForCommission,
  setIsSubmitForPoint,
  setIsSubmitForType
}) {
  const [service, setService] = useState({
    commission: [{ name: '', basisForDeduction: '' }],
  })

  const { setCommission } = useFetchSettingCommissionWay()

  useEffect(() => {
    if (!merchantCommissionWay.loading && merchantCommissionWay.data) {
      const commission = idx(merchantCommissionWay.data, _ =>
        _.merchantCommissionWay.length > 0
          ? _.merchantCommissionWay.map(d => ({
              name: d.name,
              basisForDeduction: d.basisForDeduction,
            }))
          : [{ name: '', basisForDeduction: '' }]
      )

      setService({commission})
    }
  }, [merchantCommissionWay.loading ])

  const handleServiceChange = ({ changedData, key }) => {
    setService(
      produce(draft => {
        draft[key] = changedData
      })
    )
  }
  const handleSubmit = async () => {
    let checkArray = []
    service.commission.forEach(d => {
      if (checkArray.indexOf(d.name) === -1) {
        checkArray.push(d.name)
      }
    })
    const basisForDeductionCount = service.commission.filter(d => d.basisForDeduction === '').length
    if (checkArray.length === service.commission.length) {
      if (basisForDeductionCount > 0) {
        openSnackbar({
          message: "請選擇服務扣項依據方式",
          variant: 'error',
        })
      } else {
        setCommission({ 
          input: service.commission
        }).then(res => {
          if(res.data.settingCommissionWay){
            openSnackbar({
              message: "編輯成功",
              variant: 'success',
            })
            merchantCommissionWay.refetch()
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
    } else {
      openSnackbar({
        message: "服務扣項名稱已被重複",
        variant: 'error',
      })
    }
    
  }

  // 本區只有服務扣項（commission）；原本的 deductionItems 分支沒有呼叫端（service 也沒有該欄位），2026/10/22 移除
  const handleAddSetting = (...rest) => {
    const newService = cloneDeep(service)
    switch (rest[0]) {
      case 'commission':
        newService.commission.push({ name: '', basisForDeduction: '' })
        handleServiceChange({ changedData: newService.commission, key: 'commission' })
        break
      // no default
    }
  }
  const handleDeleteSetting = (...rest) => {
    const newService = cloneDeep(service)
    switch (rest[0]) {
      case 'commission':
        newService.commission.splice(rest[1], 1)
        handleServiceChange({ changedData: newService.commission, key: 'commission' })
        break
      // no default
    }
  }

  const handleCommissionName = (index, event) => {
    const newService = cloneDeep(service)
    newService.commission[index].name = event.target.value
    handleServiceChange({ changedData: newService.commission, key: 'commission' })
  }
  const handleCommissionBasisForDeduction = (index, event) => {
    const newService = cloneDeep(service)
    newService.commission[index].basisForDeduction = event.target.value
    handleServiceChange({ changedData: newService.commission, key: 'commission' })
  }
  const handleEdit = () =>{
    setIsSubmitForCommission(true)
    setIsSubmitForPoint(false)
    setIsSubmitForType(false)
  }
  return (
    <Fragment>
      <Card>
        <CardHeader
          action={
            isSubmitForCommission ? (
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
              // 讀不到扣項方式（讀取中或查詢失敗）時不能編輯：存檔會以畫面上的列整批取代後端資料
              disabled={!merchantCommissionWay.data || isSubmitForType || isSubmitForPoint}
            >
              編輯
            </Button>
          )}
        >
          <CardTitle>服務扣項方式命名</CardTitle>
        </CardHeader>
        <CardContent>
          {!merchantCommissionWay.loading ? (
            service.commission.map((data, index) => (
              <div className="flex items-center mb-[24px] flex-wrap gap-y-[10px]" key={index}>
                <Field label="服務扣項命名" className="w-44">
                  <Input
                    type="text"
                    value={data.name}
                    disabled={!isSubmitForCommission}
                    onChange={event => handleCommissionName(index, event)}
                  />
                </Field>
                <Field label="扣項依據方式" className="ml-3 w-[150px]">
                  <NativeSelect
                    value={data.basisForDeduction}
                    disabled={!isSubmitForCommission}
                    onChange={event => handleCommissionBasisForDeduction(index, event)}
                  >
                    {basisForDeductionSelection.map((data, idx) => (
                      <NativeSelectOption value={data.value} key={`${data.label}-${idx}`}>
                        {data.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
                {service.commission.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="刪除"
                    className="w-[50px] max-sm:w-[50px] flex mr-[12px] cursor-pointer last:mr-0"
                    disabled={!isSubmitForCommission}
                    onClick={() => handleDeleteSetting('commission', index)}
                  >
                  <DeleteForeverIcon/>
                  </Button>
                )}
                {index === service.commission.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="新增"
                    className="w-[50px] max-sm:w-[50px] flex mr-[12px] cursor-pointer last:mr-0"
                    disabled={!isSubmitForCommission}
                    onClick={() =>  handleAddSetting('commission')}
                  >
                    <AddIcon/>
                  </Button>
              )}
              </div>
          ))):(
            <Skeleton className="h-24 w-full" />
          )}
        </CardContent>
      </Card>
    </Fragment>
  )
}

export default memo(Service)
