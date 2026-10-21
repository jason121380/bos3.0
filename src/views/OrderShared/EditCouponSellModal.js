import PropTypes from 'prop-types'
import { memo } from 'react'
import idx from 'idx'
import ItemPickerModal from './ItemPickerModal'
import { COUPON_COLUMNS } from './pickerColumns'

// 帳單詳細／掛單詳細／重新開單的「選卡券」彈窗（三頁原本各一份、邏輯逐字相同，2026/10/21 合併）。
// 打帳單的選取欄位不同，留在 OrderCreate/CouponSellModal.js；兩者畫面同為 ItemPickerModal
function CouponSellModal({
  couponModalOpen,
  closeModal,
  coupons,
  onChange,
  couponsOnPannel,
  couponsLength,
  setCouponModalOpen,
  couponCategories,
  setSelectedCategorie,
  selectedCategorie,
  setSelectedCategorieName,
  selectedCategorieName,
  setPageSetting,
}) {
  const handleSelectCoupon = coupon => {
    idx(coupon, _ => {
      onChange({
        index: couponsLength === 1 && couponsOnPannel[0].serviceId === '' ? 0 : couponsLength,
        value: {
          ...couponsOnPannel[couponsLength - 1],
          serviceId: _.id,
          availableCount: _.ticketAvailableCount,
          price: _.price,
          remark: _.remark,
          isLocked: _.isLocked,
          intoPerformanceWhileBuying: false,
        },
      })
    })
    setCouponModalOpen(false)
  }

  const handleClickCategorie = (categorieId, categorieName) => {
    setSelectedCategorieName([categorieName])
    setSelectedCategorie([categorieId])
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [categorieId],
      }
    })
  }
  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setSelectedCategorieName('')
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [],
      }
    })
  }

  return (
    <ItemPickerModal
      open={couponModalOpen}
      closeModal={closeModal}
      noun="卡券"
      categories={couponCategories}
      selectedCategorie={selectedCategorie}
      selectedCategorieName={selectedCategorieName}
      onClickCategorie={handleClickCategorie}
      onClearCategorie={handleClearCategorie}
      caption={<>{coupons.length}張卡券</>}
      columns={COUPON_COLUMNS}
      rows={coupons}
      onSelect={handleSelectCoupon}
    />
  )
}

CouponSellModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

CouponSellModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(CouponSellModal)
