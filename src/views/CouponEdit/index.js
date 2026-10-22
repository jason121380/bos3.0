import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { openSnackbar } from 'elements/snackbars'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import useFetchServiceTicket from 'hooks/useFetchServiceTicket'
import { useFetchTicketsForList } from 'hooks/useFetchTickets'
import useFetchUpdateService from 'hooks/useFetchUpdateService'
import useFetchCreateCoupon from 'hooks/useFetchCreateCoupon'
import idx from 'idx'
import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useSelector } from 'react-redux'

import AboutAssistantSetting from './AboutAssistantSetting'
import AboutCoupon from './AboutCoupon'
import AboutDeduction from './AboutDeduction'

function ServiceCategoryEdit({ match }) {
  const isDuplicate = window.location.href.includes('duplicate')
  const deductionDisplay = useSelector(state => state.deductionDisplay.coupon)
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null

  const merchantCommissions = useFetchMerchantCommissionWay()
  const customerCategory = useFetchMerchantCustomerCategory()
  const merchantHelperItemsData = useFetchMerchantHelperItems({ merchantId })
  const merchantHelperItems = idx(merchantHelperItemsData, _ => _.data.merchantHelperItems)
  const { updateService } = useFetchUpdateService()
  const { createCoupon } = useFetchCreateCoupon()
  const tickets = useFetchTicketsForList({
    keyword: '',
    categoryIds: [],
  })
  const history = useHistory()
  const ticket = useFetchServiceTicket({ serviceId: match.params.id })
  const [vaild, setVaild] = useState(false)
  const [couponIndex, setCouponIndex] = useState(0)
  const [couponsArr, setCouponsArr] = useState([])

  useEffect(() => {
    ticket.refetch()
  }, [])

  useEffect(() => {
    setSaveBtn(false)
    if (!ticket.loading && !customerCategory.loading && !merchantCommissions.loading) {
      setCoupon(
        produce(draft => {
          draft.itemId = idx(ticket.data, _ => _.service.id)
          draft.name = idx(ticket.data, _ => _.service.name) + (isDuplicate ? '的副本' : '')
          draft.price = idx(ticket.data, _ => _.service.price)
          draft.no = idx(ticket.data, _ => _.service.no) + (isDuplicate ? '的副本' : '')
          draft.isLaunched = idx(ticket.data, _ => _.service.isLaunched)
          draft.ticketAvailableCount = idx(
            ticket.data,
            _ => _.service.serviceDetail.ticketAvailableCount
          )
          draft.ServiceCategoryId = idx(ticket.data, _ => _.service.serviceCategory.id)
          draft.serviceDeductionItems = idx(ticket.data, _ =>
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
                    // {
                    //   name: '材料費',
                    //   type: 'onSalary',
                    //   price: 0,
                    //   isSpecial: false,
                    //   deductionWay: '',
                    //   designatePrice: 0,
                    //   nonDesignatePrice: 0,
                    //   deductionOrder: 1,
                    //   deductionReference: 0,
                    // },
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
          draft.helperDeductionSetting = idx(ticket.data, _ =>
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
                      // eslint-disable-next-line eqeqeq -- 刻意保留寬鬆比較：值可能是輸入框字串或 null，改成 !== 會改變結果
                      isDesignate: !(data.point != 0),
                      deductionWay: '點數',
                    }
                  } else if (data.cash || data.designateCash || data.nonDesignateCash > 0) {
                    return {
                      ...data,
                      // eslint-disable-next-line eqeqeq -- 刻意保留寬鬆比較：值可能是輸入框字串或 null，改成 !== 會改變結果
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
                  deductionWay: '',
                  isSplitted: false,
                },
              ]
          )
          draft.isLocked = idx(ticket.data, _ => _.service.isLockedOriginalValue)
          draft.performanceCalculationMode = idx(
            ticket.data,
            _ => _.service.performanceCalculationMode
          )
          draft.handlingFeeDecountMode = idx(ticket.data, _ => _.service.handlingFeeDecountMode)
        })
      )
    }
  }, [
    ticket.data,
    ticket.loading,
    customerCategory.data,
    customerCategory.loading,
    merchantCommissions.data,
    merchantCommissions.loading,
  ])

  const [coupon, setCoupon] = useState({
    itemId: '',
    no: '',
    name: '',
    price: 0,
    isTicket: true,
    ticketAvailableCount: 0,
    isTicketCountNow: false,
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
        deductionWay: '',
        isSplitted: false,
      },
    ],
    serviceDeductionItems: [],
    customerSellSetting: [],
    ServiceCategoryId: '',
    isLocked: '',
    performanceCalculationMode: 'USING',
    handlingFeeDecountMode: 'USING',
    isLaunched: true,
  })

  const [saveBtn, setSaveBtn] = useState(false)

  const [coupon2, setCoupon2] = useState({
    itemId: '',
    no: '',
    name: '',
    price: 0,
    isTicket: true,
    ticketAvailableCount: 1,
    isTicketCountNow: false,
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
        deductionWay: '',
        isSplitted: false,
      },
    ],
    serviceDeductionItems: [],
    customerSellSetting: [],
    ServiceCategoryId: '',
    isLocked: '',
    performanceCalculationMode: 'USING',
    handlingFeeDecountMode: 'USING',
  })

  const handleOnChange = ({ event, key }) => {
    if (event.persist) event.persist()
    setCoupon(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }

  const handleTidyData = forCreate => {
    const newCoupon = cloneDeep(coupon)
    const newHelperDeductionSetting = newCoupon.helperDeductionSetting.map(
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

    const newItemSettings = newCoupon.serviceDeductionItems.map(data =>
      data.itemSettings.map(({ __typename, ...keepProteries }) => keepProteries)
    )
    newCoupon.serviceDeductionItems.forEach((data, index) =>
      newItemSettings.forEach((data2, index2) => {
        if (index === index2) {
          data.itemSettings = [...data2]
        }
      })
    )
    const newCouponDeductionItems = newCoupon.serviceDeductionItems.map(
      ({ __typename, ...keepProteries }) => keepProteries
    )

    newCoupon.helperDeductionSetting = newHelperDeductionSetting
    newCoupon[forCreate ? 'ServiceDeductionItems' : 'serviceDeductionItems'] = newCouponDeductionItems
    if (forCreate) {
      newCoupon.OfficialBrandMerchantId = JSON.parse(localStorage.getItem('userMerchant')).id
    }
    return newCoupon
  }

  const handleSubmit = async status => {
    setSaveBtn(true)
    const newCoupon = handleTidyData()
    try {
      await updateService({ input: newCoupon })
      openSnackbar({ variant: 'success', message: '成功儲存卡片變更' })
      if (status === 'toList') {
        history.push('/coupons')
      } else if (status === 'toLast') {
        history.push(`/coupon/edit/${couponsArr[couponIndex - 1].id}`)
      } else if (status === 'toNext') {
        history.push(`/coupon/edit/${couponsArr[couponIndex + 1].id}`)
      }
    } catch (error) {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    }
  }

  const handleCreate = async () => {
    setSaveBtn(true)
    const { itemId, serviceDeductionItems, ...rest } = handleTidyData(true)
    try {
      await createCoupon({ input: rest })
      openSnackbar({ variant: 'success', message: '成功新增卡券' })
      history.push('/coupons')
    } catch (error) {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    }
  }

  useEffect(() => {
    if (!tickets.loading && !ticket.loading) {
      // 列表查詢失敗時以空陣列處理（只影響上一筆／下一筆），不整頁錯誤
      const couponsArr = idx(tickets, _ => _.data.ticketsForList) || []
      const ticketId = idx(ticket.data, _ => _.service.id)
      setCouponsArr(couponsArr)
      couponsArr.forEach((coupon, index) => {
        if (coupon.id === ticketId) {
          setCouponIndex(index)
        }
      })
    }
  }, [tickets.loading, ticket.loading])

  useEffect(() => {
    // 把「系統預設」移到最後；沒有「系統預設」時不推入空物件（否則扣項卡讀 {}.itemSettings 整頁錯誤）
    let defaultSetting = null
    const newCoupon = cloneDeep(coupon)
    newCoupon.serviceDeductionItems.forEach((data, index) => {
      if (data.type === '系統預設') {
        defaultSetting = data
        newCoupon.serviceDeductionItems.splice(index, 1)
      }
    })
    if (defaultSetting) newCoupon.serviceDeductionItems.push(defaultSetting)
    setCoupon2(newCoupon)
    const vaild = !(coupon.name && coupon.ServiceCategoryId && coupon.ticketAvailableCount)
    setVaild(vaild)
  }, [coupon])

  return (
    <Page className="ui-root" title={isDuplicate ? "新增卡券項目" : "編輯卡券項目"} >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <PageHeader className="pb-0" title={isDuplicate ? "新增卡券項目" : "編輯卡券項目"} />
        <AboutCoupon coupon={coupon} onChange={handleOnChange} />

        {deductionDisplay && coupon2.itemId !== '' && (
          <AboutDeduction
            ServiceDeductionItems={coupon2.serviceDeductionItems}
            onChange={handleOnChange}
          />
        )}

        <AboutAssistantSetting
          merchantHelperItems={merchantHelperItems}
          support={coupon.helperDeductionSetting}
          onChange={handleOnChange}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
        {isDuplicate ? (
          <Button variant="primary" disabled={saveBtn || vaild} onClick={handleCreate}>
            新增
          </Button>
        ) : (
          <>
            <Button variant="primary" disabled={saveBtn || vaild} onClick={() => handleSubmit('toList')}>
              儲存
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={couponIndex === 0 || saveBtn || vaild}
                onClick={() => handleSubmit('toLast')}
              >
                儲存並上一筆
              </Button>
              <Button
                variant="secondary"
                disabled={couponIndex >= couponsArr.length - 1 || saveBtn || vaild}
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
