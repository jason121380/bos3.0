import React from 'react'
import useFetchMerchantDeductionItems from 'hooks/useFetchMerchantDeductionItems'
import SharedAboutDeduction from 'views/CouponShared/AboutDeduction'

// 編輯卡券的扣項區塊：畫面與 handler 與新增卡券共用（views/CouponShared/AboutDeduction，2026/10/30）。
// 原本編輯頁這個區塊掛載時會查一次店家扣項項目（merchantDeductionItems）；畫面上用到它的下拉已註解，
// 但查詢照原樣保留（不改 API 呼叫，與 ServiceEdit/AboutDeduction 相同）。是否移除這支查詢需另行決定。
function AboutDeduction(props) {
  useFetchMerchantDeductionItems()
  return <SharedAboutDeduction {...props} stateKey="serviceDeductionItems" />
}

export default AboutDeduction
