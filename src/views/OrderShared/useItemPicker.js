import { useState, useEffect } from 'react'
import idx from 'idx'
import produce from 'immer'
import useFetchProducts from 'hooks/useFetchProducts'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { useFetchGetMembershipsForModal } from 'hooks/useFetchGetMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'

// 店販列／會員卡列「從清單選擇」彈窗背後的狀態（四個帳單頁的 MerchantSells／MemberShipCardSells 原本各一份、逐字相同，2026/10/21 合併）：
// 開關、分類篩選、查詢條件（分頁／關鍵字／分類）、清單與分類查詢、關閉時重設條件。
// 清單或分類查詢失敗時當作空的（2026/10/22：原本店販清單查詢失敗會讓帳單四頁整頁錯誤）。
// 查詢在每一列建立（與合併前相同：列一出現就查，清單載入完成前「從清單選擇」不會開啟）。
// modalProps 直接展開給 OrderShared 的 ProductsModal／MemberShipCardSellsModal；選取後帶入的欄位（onProductChange／onCardChange）仍由各頁傳入。

// 第一次開啟時的查詢條件；關閉彈窗與彈窗內「清除」分類都回到這一份（只清掉關鍵字與分類，可販售與分頁參數保留預設）。
// 2026/10/22 修正：原本重設成只有 keyword／分類的物件，少了 isAvailableForSale 與分頁參數。
export const PRODUCT_PICKER_SETTING = Object.freeze({
  pageLimit: 50,
  pageOffset: 0,
  keyword: '',
  categoryIds: [],
})
export const MEMBERSHIP_PICKER_SETTING = Object.freeze({
  isAvailableForSale: true,
  pageLimit: 50,
  pageOffset: 0,
  keyword: '',
  categoryUUIds: [],
})

// 查詢失敗時的空清單：0 筆，分頁沿用目前的查詢條件
const emptyPage = setting => ({ data: [], totalCount: 0, pageOffset: setting.pageOffset, pageLimit: setting.pageLimit })

// 店販：只列出可販售的商品
export function useProductPicker() {
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [selectedCategorieName, setSelectedCategorieName] = useState([])
  const [productList, setProductList] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [setting, setSetting] = useState(PRODUCT_PICKER_SETTING)
  const products = useFetchProducts(setting)
  const productCategoriesData = useFetchProductCategories()
  useEffect(() => {
    if (!products.loading && !productCategoriesData.loading) {
      // 查詢失敗時 data 為 undefined（錯誤提示由 errorLink 統一跳出）：清單與分類當作空的，帳單頁照常可用
      // 分頁欄位一併補上，彈窗的分頁才不會顯示 NaN、按下一頁也不會把 NaN 寫進查詢條件（Codex review PR #263）
      const productList = idx(products, _ => _.data.products) || emptyPage(setting)
      const productForSell = productList.data.filter(product => product.isAvailableForSale)
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories) || []

      setProductList({
        ...productList,
        data: productForSell,
      })
      setProductCategories(productCategories)
    }
  }, [products.loading, products.data, productCategoriesData.loading])

  const handleOpenProductsModal = () => {
    if (!products.loading) {
      setProductsModalOpen(!productsModalOpen)
    }
  }

  const handleCloseProductsModal = () => {
    setProductsModalOpen(false)
    setSelectedCategorie([])
    setSelectedCategorieName([])
    setSetting(PRODUCT_PICKER_SETTING)
  }

  const handlePageChange = ({ value, key }) => {
    setSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  return {
    productsModalOpen,
    handleOpenProductsModal,
    modalProps: {
      productsModalOpen,
      productList,
      productCategories,
      closeModal: handleCloseProductsModal,
      selectedCategorie,
      setSelectedCategorie,
      selectedCategorieName,
      setSelectedCategorieName,
      setSetting,
      onPageChange: handlePageChange,
      setProductsModalOpen,
    },
  }
}

// 會員卡
export function useMembershipPicker() {
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState([]);
  const [selectedCategorieName, setSelectedCategorieName] = useState([]);
  const [productList, setProductList] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [setting, setSetting] = useState(MEMBERSHIP_PICKER_SETTING);
  const products = useFetchGetMembershipsForModal(setting);
  const productCategoriesData = useFetchGetMembershipCategories({});

  useEffect(() => {
    if (!products.loading && !productCategoriesData.loading) {
      // 查詢失敗時同店販：清單與分類當作空的（彈窗以 productList.data.length 計筆數）
      const productList = idx(products, (_) => _.data.memberships) || emptyPage(setting);
      const productCategories = idx(productCategoriesData, (_) => _.data.membershipCategories) || [];
      setProductList({
        ...productList,
      });
      setProductCategories(productCategories);
    }
  }, [products.loading, products.data, productCategoriesData.loading]);

  const handleOpenProductsModal = () => {
    if (!products.loading) {
      setProductsModalOpen(!productsModalOpen);
    }
  };

  const handleCloseProductsModal = () => {
    setProductsModalOpen(false);
    setSelectedCategorie([]);
    setSelectedCategorieName([]);
    setSetting(MEMBERSHIP_PICKER_SETTING);
  };

  const handlePageChange = ({ value, key }) => {
    setSetting(
      produce((draft) => {
        draft[key] = value;
      })
    );
  };

  return {
    productsModalOpen,
    handleOpenProductsModal,
    modalProps: {
      productsModalOpen,
      productList,
      productCategories,
      closeModal: handleCloseProductsModal,
      selectedCategorie,
      setSelectedCategorie,
      selectedCategorieName,
      setSelectedCategorieName,
      setSetting,
      onPageChange: handlePageChange,
      setProductsModalOpen,
    },
  }
}
