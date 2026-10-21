import PropTypes from 'prop-types'
import { memo } from 'react'
import idx from 'idx'
import ItemPickerModal from 'views/OrderShared/ItemPickerModal'
import { COUPON_COLUMNS_WITH_CATEGORY } from 'views/OrderShared/pickerColumns'

// 打帳單「選卡券」彈窗。畫面與其他三頁共用（OrderShared/ItemPickerModal）；選取後帶入的欄位與其他三頁不同
// （其他三頁另帶 intoPerformanceWhileBuying: false），表格多一欄「類別」，所以邏輯留在本檔（2026/10/21）
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
      columns={COUPON_COLUMNS_WITH_CATEGORY}
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
