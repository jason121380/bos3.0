import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateService from 'hooks/useFetchCreateService'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchService from 'hooks/useFetchService'
import useFetchServices from 'hooks/useFetchServices'
import useFetchUpdateService from 'hooks/useFetchUpdateService'
import idx from 'idx'
import produce from 'immer'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { useSelector } from 'react-redux'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import helperDeduction from './../../helper/helperDeduction.js'

import AboutAssistantSetting from './AboutAssistantSetting'
import AboutDeduction from './AboutDeduction'
import AboutService from './AboutService'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

function ServiceCategoryEdit({ match }) {
  // eslint-disable-next-line no-restricted-globals -- 既有寫法（window.location），改版不動邏輯
  const isDuplicate = location.href.includes('duplicate')
  const deductionDisplay = useSelector(state => state.deductionDisplay.service)
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  const merchantCommissions = useFetchMerchantCommissionWay()
  const customerCategory = useFetchMerchantCustomerCategory()
  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()

  const merchantHelperItemsData = useFetchMerchantHelperItems({ merchantId })
  const merchantHelperItems = idx(merchantHelperItemsData, _ => _.data.merchantHelperItems)
  const { updateService } = useFetchUpdateService()
  const { createService } = useFetchCreateService()
  const services = useFetchServices()
  const history = useHistory()
  const serviceDetail = useFetchService({ serviceId: match.params.id })
  const [serviceIndex, setServiceIndex] = useState(0)
  const [servicesArr, setServicesArr] = useState([])
  const [vaild, setVaild] = useState(false)
  const [helperPoint, setHelperPoint] = useState(0)
  useEffect(() => {
    serviceDetail.refetch()
  }, [match.params.id])
  // 服務設定初始化useEffect
  useEffect(() => {
    if (!serviceDetail.loading && !customerCategory.loading && !merchantCommissions.loading) {
      setService(
        produce(draft => {
          draft.itemId = idx(serviceDetail.data, _ => _.service.id)
          draft.name = idx(serviceDetail.data, _ => _.service.name) + (isDuplicate ? '的副本' : '')
          draft.price = idx(serviceDetail.data, _ => _.service.price)
          draft.no = idx(serviceDetail.data, _ => _.service.no) + (isDuplicate ? '的副本' : '')
          draft.ServiceCategoryId = idx(serviceDetail.data, _ => _.service.serviceCategory.id)
          draft.serviceDeductionItems = idx(serviceDetail.data, _ =>
            _.service.serviceDetail.serviceDeductionItems.length > 0
              ? _.service.serviceDetail.serviceDeductionItems.map(item => {
                if (item.itemSettings.length === 0) {
                  return {
                    ...item,
                    itemSettings: [
                      {
                        name: '材料費',
                        type: 'onSales',
                        price: 0,
                        isSpecial: false,
                        deductionWay: '',
                        designatePrice: 0,
                        nonDesignatePrice: 0,
                        deductionOrder: 1,
                        deductionReference: 0,
                      },
                    ],
                  }
                } else {
                  if (item.itemSettings[0].deductionOrder === null) {
                    const arr = []
                    for (let i = 0; i < item.itemSettings.length; i++) {
                      arr.push({
                        ...item.itemSettings[i],
                        name: '材料費',
                        deductionOrder: i + 1,
                        deductionReference: 0,
                      })
                    }
                    return {
                      ...item,
                      itemSettings: [...arr],
                    }
                  } else {
                    const arr = []
                    for (let i = 0; i < item.itemSettings.length; i++) {
                      arr.push({
                        ...item.itemSettings[i],
                        name: '材料費',
                        deductionOrder: i + 1,
                      })
                    }
                    return {
                      ...item,
                      itemSettings: [...arr],
                    }
                  }
                }
              })
              : idx(merchantCommissions.data, _ =>
                _.merchantCommissionWay.map(data => ({
                  type: data.name,
                  itemSettings: [
                    {
                      name: '材料費',
                      type: 'onSales',
                      price: 0,
                      isSpecial: false,
                      deductionWay: '',
                      designatePrice: 0,
                      nonDesignatePrice: 0,
                      deductionOrder: 1,
                      deductionReference: 0,
                    },
                  ],
                }))
              )
          )
          draft.customerSellSetting = idx(customerCategory.data, _ =>
            _.merchantCustomerCategory.map(data => ({
              category: data.name,
              percent: 100,
              birthday: 100,
            }))
          )
          draft.helperDeductionSetting = idx(serviceDetail.data, _ =>
            _.service.helperDeductionSetting.length > 0
              ? _.service.helperDeductionSetting.map(data => {
                if (data.type === '') {
                  return {
                    ...data,
                    deductionWay: '',
                  }
                } else {
                  if (data.point || data.designatePoint || data.nonDesignatePoint > 0) {
                    return {
                      ...data,
                      isDesignate: !(data.point != 0),
                      deductionWay: '點數',
                    }
                  } else if (data.cash || data.designateCash || data.nonDesignateCash > 0) {
                    return {
                      ...data,
                      isDesignate: !(data.cash != 0),
                      deductionWay: '固定金額',
                    }
                  } else {
                    return {
                      ...data,
                      isDesignate: (data.designatePercent !== 0 || data.nonDesignatePercent !== 0),
                      deductionWay: '業績%數',
                    }
                  }
                }
              })
              : [
                {
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
                  isDesignate: false,
                  isSplitted: false,
                  deductionWay: '',
                },
              ]
          )
          draft.isLocked = idx(serviceDetail.data, _ => _.service.isLocked)
          draft.isNoCash = idx(serviceDetail.data, _ => _.service.isNoCash)
          draft.isSpecialRakeUsing = idx(serviceDetail.data, _ => _.service.isSpecialRakeUsing)
          draft.specialRake = idx(serviceDetail.data, _ => _.service.specialRake)
          draft.bindedThirdPartTicketId = idx(serviceDetail.data, _ => _.service.bindedThirdPartTicket.id) === null
            ? 'none' : idx(serviceDetail.data, _ => _.service.bindedThirdPartTicket.id)
          draft.isBindedThirdPartTicketLocked = idx(serviceDetail.data, _ => _.service.isBindedThirdPartTicketLocked)
        })
      )
    }
  }, [
    serviceDetail.data,
    serviceDetail.loading,
    customerCategory.data,
    customerCategory.loading,
    merchantCommissions.data,
    merchantCommissions.loading,
  ])
  const [saveBtn, setSaveBtn] = useState(false)
  const [service, setService] = useState({
    itemId: '',
    no: '',
    name: '',
    price: 0,
    isTicket: false,
    isTicketCountNow: true,
    helperDeductionSetting: [
      {
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
        isDesignate: false,
        isSplitted: false,
        deductionWay: '',
      },
    ],
    serviceDeductionItems: [],
    customerSellSetting: [],
    ServiceCategoryId: '',
    isLocked: '',
    isNoCash: false,
    isSpecialRakeUsing: false,
    specialRake: 0,
    bindedThirdPartTicketId: '',
    isBindedThirdPartTicketLocked: '',
  })

  // service2是用來把系統預設重新排列到最下面用的
  const [service2, setService2] = useState({
    itemId: '',
    no: '',
    name: '',
    price: 0,
    isTicket: false,
    isTicketCountNow: true,
    helperDeductionSetting: [
      {
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
        isDesignate: false,
        isSplitted: false,
        deductionWay: '',
      },
    ],
    serviceDeductionItems: [],
    customerSellSetting: [],
    ServiceCategoryId: '',
    isLocked: '',
    isNoCash: false,
    isSpecialRakeUsing: false,
    specialRake: 0,
    bindedThirdPartTicketId: '',
    isBindedThirdPartTicketLocked: '',
  })

  const [truthPerformPredict, setTruthPerformPredict] = useState([])
  const [helperDeductionNums, setHelperDeductionNums] = useState(0)

  const handleOnChange = ({ event, key }) => {
    if (event.persist) event.persist()
    setService(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }

  const handleCheckboxChange = ({ value, key }) => {
    setService(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleTidyData = forCreate => {
    const newService = cloneDeep(service)
    const newHelperDeductionSetting = newService.helperDeductionSetting.map(
      ({ deductionWay, isDesignate, __typename, ...keepProteries }) => {
        return {
          ...keepProteries,
          point: parseFloat(keepProteries.point) || 0,
          cash: parseFloat(keepProteries.cash) || 0,
          percent: parseFloat(keepProteries.percent) || 0,
          designateCash: parseFloat(keepProteries.designateCash) || 0,
          nonDesignateCash: parseFloat(keepProteries.nonDesignateCash) || 0,
          designatePercent: parseFloat(keepProteries.designatePercent) || 0,
          nonDesignatePercent: parseFloat(keepProteries.nonDesignatePercent) || 0,
          designatePoint: parseFloat(keepProteries.designatePoint) || 0,
          nonDesignatePoint: parseFloat(keepProteries.nonDesignatePoint) || 0,
        }
      }
    )

    const newItemSettings = newService.serviceDeductionItems.map(data =>
      data.itemSettings.map(({ __typename, ...keepProteries }) => keepProteries)
    )
    newService.serviceDeductionItems.forEach((data, index) =>
      newItemSettings.forEach((data2, index2) => {
        if (index === index2) {
          data.itemSettings = [...data2]
        }
      })
    )
    const newServiceDeductionItems = newService.serviceDeductionItems.map(
      ({ __typename, ...keepProteries }) => keepProteries
    )

    newService.helperDeductionSetting = newHelperDeductionSetting
    newService[forCreate ? 'ServiceDeductionItems' : 'serviceDeductionItems'] = newServiceDeductionItems
    if (newService.bindedThirdPartTicketId === 'none') {
      newService.bindedThirdPartTicketId = null
    }
    if (forCreate) {
      newService.OfficialBrandMerchantId = JSON.parse(localStorage.getItem('userMerchant')).id
    }
    return newService
  }

  const handleSubmit = async status => {
    setSaveBtn(true)
    const returnData = handleTidyData()
    try {
      await updateService({ input: returnData })
      openSnackbar({ variant: 'success', message: '成功儲存服務變更' })
      if (status === 'toList') {
        history.push('/services')
      } else if (status === 'toLast') {
        history.push(`/service/edit/${servicesArr[serviceIndex - 1].id}`)
      } else if (status === 'toNext') {
        history.push(`/service/edit/${servicesArr[serviceIndex + 1].id}`)
      }
    } catch (error) {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    }
  }

  const handleCreate = async () => {
    setSaveBtn(true)
    const { itemId, serviceDeductionItems, ...returnData } = handleTidyData(true)
    try {
      await createService({ input: returnData })
      services.refetch()
      openSnackbar({ variant: 'success', message: '成功新增服務' })
      history.push('/services')
    } catch (error) {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    }
  }

  useEffect(() => {
    setSaveBtn(false)
    if (!services.loading && !serviceDetail.loading) {
      const servicesArr = idx(services, _ => _.data.services.data)
      const serviceId = idx(serviceDetail.data, _ => _.service.id)
      setServicesArr(servicesArr)
      servicesArr.forEach((service, index) => {
        if (service.id === serviceId) {
          setServiceIndex(index)
        }
      })
    }
  }, [services.loading, serviceDetail.loading, match.params.id])

  
  useEffect(() => {
    let defaultSetting = {}
    const newService = cloneDeep(service)
    newService.serviceDeductionItems.forEach((data, index) => {
      if (data.type === '系統預設') {
        defaultSetting = data
        newService.serviceDeductionItems.splice(index, 1)
      }
    })
    newService.serviceDeductionItems.push(defaultSetting)
    setService2(newService)
    const vaild = !(service.name && service.ServiceCategoryId)
    setVaild(vaild)
  }, [service])

  useEffect(() => {
    // 計算預估實業績 完整邏輯要問後端
    const newService = cloneDeep(service)
    let defaultSetting = {}
    if (newService.serviceDeductionItems.length > 0) {
      newService.serviceDeductionItems.forEach((data, index) => {
        if (data.type === '系統預設') {
          defaultSetting = data
          newService.serviceDeductionItems.splice(index, 1)
        }
      })
      newService.serviceDeductionItems.push(defaultSetting)
    }
    const servicePrice = newService.price

    const truthPerformPredict = []
    let totalNumDecution = 0

    const serviceWithDeductionSetting = newService.serviceDeductionItems.map(data =>
      data.itemSettings.filter(item => item.type === 'onSales' || item.type === 'onSalary')
    )
    serviceWithDeductionSetting.forEach((data, index) => {
      if (data.find(d => d.type === 'onSales') !== undefined) {
        let afterDeductionPrice = 0
        const A = [] // 剩餘業績array  A[0]原始虛業績
        const X = [] // 扣業績array
        const Y = [] // 扣薪水array
        A.push(servicePrice)
        data.forEach(data2 => {
          if (data2.deductionWay === '扣趴數') {
            if (!data2.isSpecial) {
              if (data2.type === 'onSales') {
                afterDeductionPrice =
                  A[data2.deductionReference] - A[data2.deductionReference] * (data2.price * 0.01)
                A.push(afterDeductionPrice)
                X.push(A[data2.deductionReference] * (data2.price * 0.01))
                totalNumDecution = X.reduce((accu, curVal) => (accu += curVal), 0)
              } else {
                afterDeductionPrice =
                  A[data2.deductionReference] - A[data2.deductionReference] * (data2.price * 0.01)
                A.push(afterDeductionPrice)
                Y.push(A[data2.deductionReference] * (data2.price * 0.01))
              }
            } else {
              if (data2.type === 'onSales') {
                const numForDeduction =
                  data2.designatePrice < data2.nonDesignatePrice
                    ? data2.designatePrice
                    : data2.nonDesignatePrice

                afterDeductionPrice =
                  A[data2.deductionReference] -
                  A[data2.deductionReference] * (numForDeduction * 0.01)
                A.push(afterDeductionPrice)
                X.push(A[data2.deductionReference] * (numForDeduction * 0.01))
                totalNumDecution = X.reduce((accu, curVal) => (accu += curVal), 0)
              } else {
                const numForDeduction =
                  data2.designatePrice < data2.nonDesignatePrice
                    ? data2.designatePrice
                    : data2.nonDesignatePrice

                afterDeductionPrice =
                  A[data2.deductionReference] -
                  A[data2.deductionReference] * (numForDeduction * 0.01)
                A.push(afterDeductionPrice)
                Y.push(A[data2.deductionReference] * (numForDeduction * 0.01))
              }
            }
          } else {
            if (!data2.isSpecial) {
              afterDeductionPrice = A[data2.deductionReference] - data2.price
              if (data2.type === 'onSales') {
                A.push(afterDeductionPrice)
                X.push(data2.price)
                totalNumDecution = X.reduce((accu, curVal) => (accu += curVal), 0)
              } else {
                A.push(afterDeductionPrice)
                Y.push(data2.price)
              }
            } else {
              if (data2.type === 'onSales') {
                const numForDeduction =
                  data2.designatePrice < data2.nonDesignatePrice
                    ? data2.designatePrice
                    : data2.nonDesignatePrice
                afterDeductionPrice = A[data2.deductionReference] - numForDeduction
                A.push(afterDeductionPrice)
                X.push(numForDeduction)
                totalNumDecution = X.reduce((accu, curVal) => (accu += curVal), 0)
              } else {
                const numForDeduction =
                  data2.designatePrice < data2.nonDesignatePrice
                    ? data2.designatePrice
                    : data2.nonDesignatePrice
                afterDeductionPrice = A[data2.deductionReference] - numForDeduction
                A.push(afterDeductionPrice)
                Y.push(numForDeduction)
              }
            }
          }
        })
        truthPerformPredict.push(servicePrice - totalNumDecution)
      } else {
        truthPerformPredict.push(servicePrice)
      }
    })
    setTruthPerformPredict(truthPerformPredict)
  }, [service, service2])

  useEffect(() => {
    // 計算預估實業績要扣的互助金額
    const newService = cloneDeep(service)
    const helperDeductionOnSales = newService.helperDeductionSetting.filter(
      data => data.helperDeductionType === 'onSales'
    )
    helperDeduction(helperDeductionOnSales, setHelperPoint, setHelperDeductionNums, newService.price)
  }, [service, merchantJobTitlePoint.loading])

  // 頁面外距由 #printContainer 提供；表單頁內容寬度 max-w-4xl（與舊版 Container md 相近）
  return (
    <Page className="ui-root" title={isDuplicate ? "新增服務項目" : "編輯服務項目"}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader className="pb-0" title={isDuplicate ? "新增服務項目" : "編輯服務項目"} />
        <AboutService
          service={service}
          onChange={handleOnChange}
          handleCheckboxChange={handleCheckboxChange}
        />

        {(isDuplicate || deductionDisplay) && service2.itemId !== '' && (
          <AboutDeduction
            ServiceDeductionItems={service2.serviceDeductionItems}
            onChange={handleOnChange}
            truthPerformPredict={truthPerformPredict}
            helperDeductionNums={helperDeductionNums}
            helperPoint={helperPoint}
          />
        )}

        <AboutAssistantSetting
          merchantHelperItems={merchantHelperItems}
          support={service.helperDeductionSetting}
          onChange={handleOnChange}
        />
        <div className="flex items-center justify-between gap-2">
          {isDuplicate ? (
            <Button variant="primary" disabled={saveBtn || vaild} onClick={handleCreate}>
              新增
            </Button>
          ) : (
            <>
              <Button variant="primary" disabled={saveBtn || vaild} onClick={() => handleSubmit('toList')}>
                儲存
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={serviceIndex === 0 || saveBtn || vaild}
                  onClick={() => handleSubmit('toLast')}
                >
                  儲存並上一筆
                </Button>
                <Button
                  variant="secondary"
                  disabled={serviceIndex === servicesArr.length - 1 || saveBtn || vaild}
                  onClick={() => handleSubmit('toNext')}
                >
                  儲存並下一筆
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryEdit
