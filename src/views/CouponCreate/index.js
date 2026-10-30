import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchCreateCoupon from 'hooks/useFetchCreateCoupon'
import useFetchMerchantCommissionWay from 'hooks/useFetchMerchantCommissionWay'
import useFetchMerchantCustomerCategory from 'hooks/useFetchMerchantCustomerCategory'
import useFetchMerchantHelperItems from 'hooks/useFetchMerchantHelperItems'
import idx from 'idx'
import produce from 'immer'
import React from 'react'
import { useHistory } from 'react-router'
import cloneDeep from 'lodash/cloneDeep'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutAssistantSetting from 'views/CouponShared/AboutAssistantSetting'
// 一般資訊區塊與另一頁共用（views/CouponShared，2026/10/28）
import AboutCoupon from 'views/CouponShared/AboutCoupon'
import AboutDeduction from 'views/CouponShared/AboutDeduction'

function ServiceCategoryCreate() {
  const merchantId = localStorage.getItem('userMerchant')
    ? JSON.parse(localStorage.getItem('userMerchant')).id
    : null
  const merchantCommissions = useFetchMerchantCommissionWay()
  const customerCategory = useFetchMerchantCustomerCategory()
  const merchantHelperItemsData = useFetchMerchantHelperItems({ merchantId })
  const merchantHelperItems = idx(merchantHelperItemsData, _ => _.data.merchantHelperItems)
  const { createCoupon } = useFetchCreateCoupon()
  const history = useHistory()

  React.useEffect(() => {
    if (!merchantCommissions.loading && !customerCategory.loading) {
      setCoupon(
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
          ) || [] // 查詢失敗時沒有扣項卡，不整頁錯誤
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
  const [coupon, setCoupon] = React.useState({
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
        deductionWay: '',
        isSplitted: false,
      },
    ],
    ServiceDeductionItems: [],
    customerSellSetting: [],
    ServiceCategoryId: '',
    OfficialBrandMerchantId: merchantId,
    isLocked: 'UNSET',
    performanceCalculationMode: 'USING',
    handlingFeeDecountMode: 'USING',
    isLaunched: true
  })

  const handleOnChange = ({ event, key }) => {
    if (event.persist) event.persist()
    setCoupon(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
      })
    )
  }
  const vaild = !(coupon.name && coupon.ServiceCategoryId && coupon.ticketAvailableCount)
  // 停用原因（STYLE.md §6）：依 vaild 的三個欄位，依畫面順序列出目前缺的
  const missing = [
    !coupon.name && '名稱',
    !coupon.ServiceCategoryId && '服務類別',
    !coupon.ticketAvailableCount && '次數',
  ].filter(Boolean)
  const handleSubmit = () => {
    setSaveBtn(true)
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
    newCoupon.helperDeductionSetting = newHelperDeductionSetting

    createCoupon({ input: newCoupon }).then(() => {
      openSnackbar({ variant: 'success', message: '成功新增卡券' })
      history.push('/coupons')
    }).catch(error => {
      setSaveBtn(false)
    })
  }

  return (
    <Page className="ui-root" title="新增卡券項目">
      {/* 頁面外距由 #printContainer 提供；表單頁內容寬度 max-w-4xl（與舊版 Container md 相近） */}
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader className="pb-0" title='新增卡券項目' />
        <AboutCoupon coupon={coupon} onChange={handleOnChange} />

        <AboutDeduction
          ServiceDeductionItems={coupon.ServiceDeductionItems}
          onChange={handleOnChange}
        />

        <AboutAssistantSetting
          merchantHelperItems={merchantHelperItems}
          support={coupon.helperDeductionSetting}
          onChange={handleOnChange}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" disabled={vaild || saveBtn} aria-describedby={vaild ? 'coupon-create-missing' : undefined} onClick={handleSubmit}>
            新增卡券
          </Button>
          {vaild && (
            <p id="coupon-create-missing" role="status" className="text-caption text-text-secondary">
              尚缺：{missing.join('、')}
            </p>
          )}
        </div>
      </div>
    </Page>
  )
}

export default ServiceCategoryCreate
