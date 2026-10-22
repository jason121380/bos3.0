import PropTypes from 'prop-types'
import idx from 'idx'
import { formatNumber } from 'ui/format'
import ItemPickerModal from './ItemPickerModal'
import { PRODUCT_PICKER_SETTING } from './useItemPicker'

// 店販「選商品」彈窗：打帳單／帳單詳細／掛單詳細／重新開單四頁原本各一份、內容相同（只有 effect 宣告順序不同），2026/10/21 合併
function ProductsModal({
  productsModalOpen,
  productList,
  productCategories,
  closeModal,
  selectedCategorie,
  setSelectedCategorie,
  selectedCategorieName,
  setSelectedCategorieName,
  setSetting,
  onProductChange,
  sells,
  productLength,
  sellsItem,
  onPageChange,
  setProductsModalOpen,
}) {
  const handleClickCategorie = (categorieId, categorieName) => {
    setSelectedCategorieName([categorieName])
    setSelectedCategorie([categorieId])
    setSetting(pre => {
      return {
        ...pre,
        categoryIds: [categorieId],
      }
    })
  }

  const handleSelectProduct = selectProduct => {
    idx(selectProduct, _ => {
      onProductChange({
        index: productLength === 1 && sells[0].productId === '' ? 0 : productLength,
        value: {
          ...sellsItem,
          productId: _.id,
          price: _.sellPrice,
          count: 1,
          isLocked: _.isLocked,
        },
      })
    })
    setProductsModalOpen(false)
  }

  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setSelectedCategorieName('')
    // 回到第一次開啟時的完整查詢條件（OrderShared/useItemPicker），只清掉關鍵字與分類
    setSetting(PRODUCT_PICKER_SETTING)
  }

  return (
    <ItemPickerModal
      open={productsModalOpen}
      closeModal={closeModal}
      noun="商品"
      categories={productCategories}
      selectedCategorie={selectedCategorie}
      selectedCategorieName={selectedCategorieName}
      onClickCategorie={handleClickCategorie}
      onClearCategorie={handleClearCategorie}
      caption={<>{productList.totalCount} 項商品</>}
      columns={[
        { header: '代號', cell: product => product.no },
        {
          header: '類別',
          cell: product => (product.productCategory !== null ? product.productCategory.name : ''),
        },
        { header: '名稱', cell: product => product.name },
        { header: '參考價格', numeric: true, cell: product => formatNumber(product.sellPrice) },
      ]}
      rows={productList.data}
      onSelect={handleSelectProduct}
      paging={{
        source: productList,
        count: productList.totalCount,
        page: productList.pageOffset,
        rowsPerPage: productList.pageLimit,
      }}
      onPageChange={onPageChange}
    />
  )
}

ProductsModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

ProductsModal.defaultProps = {
  open: false,
}

export default ProductsModal
