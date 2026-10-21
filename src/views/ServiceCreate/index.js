import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateService from 'hooks/useFetchCreateService'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchServices from 'hooks/useFetchServices'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import helperDeduction from './../../helper/helperDeduction.js'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutAssistantSetting from './AboutAssistantSetting'
import AboutDeduction from './AboutDeduction'
import AboutService from './AboutService'

function ServiceCategoryCreate() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const merchantCommissions = useFetchMerchantCommissionWay()
  const customerCategory = useFetchMerchantCustomerCategory()
  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()
  const merchantHelperItemsData = useFetchMerchantHelperItems({ merchantId })
  const merchantHelperItems = idx(merchantHelperItemsData, _ => _.data.merchantHelperItems)
  const { createService } = useFetchCreateService()
  const services = useFetchServices()
  const history = useHistory()
  React.useEffect(() => {
    if (!merchantCommissions.loading && !customerCategory.loading) {
      setService(
        produce(draft => {
          draft.ServiceDeductionItems = idx(merchantCommissions.data, _ =>
            _.merchantCommissionWay.map(data => ({
              type: data.name,
              itemSettings: [
                {
                  isSpecial: false,
                  name: '材料費',
                  type: 'onSales',
                  deductionWay: '',
                  price: 0,
                  designatePrice: 0,
                  nonDesignatePrice: 0,
                  deductionOrder: 1,
                  deductionReference: 0,
                },
              ],
            }))
          )
          draft.customerSellSetting = idx(customerCategory.data, _ =>
            _.merchantCustomerCategory.map(data => ({
              category: data.name,
              percent: 100,
              birthday: 100,
            }))
          )
        })
      )
    }
  }, [
    merchantCommissions.loading,
    merchantCommissions.data,
    customerCategory.data,
    customerCategory.loading,
  ])
  const [saveBtn, setSaveBtn] = React.useState(false)
  const [service, setService] = React.useState({
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
        deductionWay: '',
        isSplitted: false,
      },
    ],
    ServiceDeductionItems: [],
    customerSellSetting: [],
    ServiceCategoryId: '',
    OfficialBrandMerchantId: merchantId,
    isLocked: 'UNSET',
    isNoCash: false,
    isSpecialRakeUsing: false,
    specialRake: 0,
    bindedThirdPartTicketId: 'none',
    isBindedThirdPartTicketLocked: 'UNSET',
  })

  const [truthPerformPredict, setTruthPerformPredict] = React.useState([])
  const [helperDeductionNums, setHelperDeductionNums] = React.useState(0)
  const [helperPoint, setHelperPoint] = React.useState(0)

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

  const vaild = !(service.name && service.ServiceCategoryId)

  const handleSubmit = () => {
    setSaveBtn(true)
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
    newService.helperDeductionSetting = newHelperDeductionSetting
    if (newService.bindedThirdPartTicketId === 'none') {
      newService.bindedThirdPartTicketId = null
    }
    createService({
      input: newService,
    }).then(() => {
      services.refetch()
      openSnackbar({ variant: 'success', message: '成功新增服務' })
      history.push('/services')
    }).catch(error => {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    })
  }

  React.useEffect(() => {
    // 計算預估實業績 完整邏輯要問後端
    if (service.ServiceDeductionItems.length > 0) {
      const newService = cloneDeep(service)
      const servicePrice = newService.price
      const truthPerformPredict = []
      let totalNumDecution = 0
      const serviceWithDeductionSetting = newService.ServiceDeductionItems.map(data =>
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
    }
  }, [service, merchantCommissions.loading])

  React.useEffect(() => {
    // 計算預估實業績要扣的互助金額
    const newService = cloneDeep(service)
    const helperDeductionOnSales = newService.helperDeductionSetting.filter(
      data => data.helperDeductionType === 'onSales'
    )
    helperDeduction(helperDeductionOnSales, setHelperPoint, setHelperDeductionNums, newService.price)
  }, [service, merchantJobTitlePoint.loading])

  return (
    <Page className="ui-root" title="新增服務項目">
      {/* 頁面外距由 #printContainer 提供；表單頁內容寬度 max-w-4xl（與舊版 Container md 相近） */}
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader className="pb-0" title='新增服務項目' />
        <AboutService
          service={service}
          onChange={handleOnChange}
          handleCheckboxChange={handleCheckboxChange}
        />

        <AboutDeduction
          ServiceDeductionItems={service.ServiceDeductionItems}
          onChange={handleOnChange}
          truthPerformPredict={truthPerformPredict}
          helperDeductionNums={helperDeductionNums}
          helperPoint={helperPoint}
        />

        <AboutAssistantSetting
          merchantHelperItems={merchantHelperItems}
          support={service.helperDeductionSetting}
          onChange={handleOnChange}
        />

        <div>
          <Button variant="primary" disabled={vaild || saveBtn} onClick={handleSubmit}>
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
