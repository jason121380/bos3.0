import { useState, useEffect } from 'react'
import idx from 'idx'
import produce from 'immer'
import useFetchProducts from 'hooks/useFetchProducts'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import { useFetchGetMembershipsForModal } from 'hooks/useFetchGetMembership'
import { useFetchGetMembershipCategories } from 'hooks/useFetchGetMembershipCategory'

// 店販列／會員卡列「從清單選擇」彈窗背後的狀態（四個帳單頁的 MerchantSells／MemberShipCardSells 原本各一份、逐字相同，2026/10/21 合併）：
// 開關、分類篩選、查詢條件（分頁／關鍵字／分類）、清單與分類查詢、關閉時重設條件。
// 查詢在每一列建立（與合併前相同：列一出現就查，清單載入完成前「從清單選擇」不會開啟）。
// modalProps 直接展開給 OrderShared 的 ProductsModal／MemberShipCardSellsModal；選取後帶入的欄位（onProductChange／onCardChange）仍由各頁傳入。

// 店販：只列出可販售的商品
export function useProductPicker() {
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [selectedCategorieName, setSelectedCategorieName] = useState([])
  const [productList, setProductList] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [setting, setSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const products = useFetchProducts(setting)
  const productCategoriesData = useFetchProductCategories()
  useEffect(() => {
    if (!products.loading && !productCategoriesData.loading) {
      const productList = idx(products, _ => _.data.products)
      const productForSell = productList.data.filter(product => product.isAvailableForSale)
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories)

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
    setSetting({
      keyword: '',
      categoryIds: [],
    })
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
  const [setting, setSetting] = useState({
    isAvailableForSale: true,
    pageLimit: 50,
    pageOffset: 0,
    keyword: "",
    categoryUUIds: [],
  });
  const products = useFetchGetMembershipsForModal(setting);
  const productCategoriesData = useFetchGetMembershipCategories({});

  useEffect(() => {
    if (!products.loading && !productCategoriesData.loading) {
      const productList = idx(products, (_) => _.data.memberships);
      const productCategories = idx(productCategoriesData, (_) => _.data.membershipCategories);
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
    setSetting({
      keyword: "",
      categoryUUIds: [],
    });
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
