import PropTypes from 'prop-types'
import idx from 'idx'
import { addDays } from 'date-fns'
import { formatNumber } from 'ui/format'
import ItemPickerModal from './ItemPickerModal'

// 會員卡販賣「選會員卡」彈窗：四頁原本各一份，2026/10/21 合併。各頁差異以 props 表達（預設值＝打帳單／帳單詳細）：
// - showEffectiveDays：「天數」欄（掛單詳細原本沒有，傳 false）
// - titleByCategory：標題依所選分類顯示「○○類會員卡」（重新開單原本固定「所有會員卡」，傳 false）
// 掛單詳細原本寫 <Modal open={true}>：呼叫端只在 productsModalOpen 為 true 時才渲染本元件，與 open={productsModalOpen} 相同
const MemberShipCardSellsModal = ({
  productsModalOpen,
  productList,
  productCategories,
  closeModal,
  selectedCategorie,
  setSelectedCategorie,
  selectedCategorieName,
  setSelectedCategorieName,
  setSetting,
  onCardChange,
  sells,
  productLength,
  sellsItem,
  onPageChange,
  setProductsModalOpen,
  showEffectiveDays = true,
  titleByCategory = true,
}) => {
  const handleClickCategorie = (categorieUUId, categorieName) => {
    setSelectedCategorieName([categorieName])
    setSelectedCategorie([categorieUUId])
    setSetting(pre => {
      return {
        ...pre,
        categoryUUIds: [categorieUUId],
      }
    })
  }

  const handleSelectProduct = selectProduct => {
    idx(selectProduct, _ => {
      onCardChange({
        index: productLength === 1 && sells[0].membershipUUID === '' ? 0 : productLength,
        value: {
          ...sellsItem,
          membershipUUID: _.uuid,
          price: _.sellPrice,
          expiryDate: _.effecitveDay === 0 ? null : addDays(new Date(), _.effecitveDay).getTime(),
          effecitveDay: _.effecitveDay,
          isLocked: _.isLocked,
          thirdPartyCouponMerchantId: null,
        },
      })
    })
    setProductsModalOpen(false)
  }

  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setSelectedCategorieName('')
    setSetting({
      keyword: '',
      categoryUUIds: [],
    })
  }

  return (
    <ItemPickerModal
      open={productsModalOpen}
      closeModal={closeModal}
      noun="會員卡"
      titleByCategory={titleByCategory}
      categories={productCategories}
      categoryKey="uuid"
      selectedCategorie={selectedCategorie}
      selectedCategorieName={selectedCategorieName}
      onClickCategorie={handleClickCategorie}
      onClearCategorie={handleClearCategorie}
      columns={[
        { header: '代號', cell: product => product.no },
        {
          header: '類別',
          cell: product => (product.membershipCategory !== null ? product.membershipCategory.name : ''),
        },
        { header: '名稱', cell: product => product.name },
        ...(showEffectiveDays
          ? [{ header: '天數', numeric: true, cell: product => <>{product.effecitveDay}天</> }]
          : []),
        { header: '參考價格', numeric: true, cell: product => formatNumber(product.sellPrice) },
      ]}
      rows={productList.data}
      onSelect={handleSelectProduct}
      paging={{
        source: productList,
        count: productList.data.length,
        page: productList.pageOffset,
        rowsPerPage: productList.pageLimit,
      }}
      onPageChange={onPageChange}
    />
  )
}
MemberShipCardSellsModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

MemberShipCardSellsModal.defaultProps = {
  open: false,
  onClose: () => { },
}
export default MemberShipCardSellsModal
