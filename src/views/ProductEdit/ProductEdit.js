import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchProduct from 'hooks/useFetchProduct'
import useFetchUpdateProduct from 'hooks/useFetchUpdateProduct'
import useFetchCreateProduct from 'hooks/useFetchCreateProduct'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import { useFetchGetisUnlimProdEmpPrice } from 'hooks/useFetchGetParameterAboutSettingFunction'
import idx from 'idx'
import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useState, useMemo } from 'react'
import { useHistory } from 'react-router'
import useFetchProducts from 'hooks/useFetchProducts'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutProduct from './AboutProduct'
import AboutSalesProduct from './AboutSalesProduct'

export default function ProductCreate({ match }) {
  const isDuplicate = window.location.href.includes('duplicate')
  const itemId = match.params.id
  const products = useFetchProducts()
  const productDetail = useFetchProduct({ productId: itemId })
  const { updateProduct } = useFetchUpdateProduct()
  const { createProduct } = useFetchCreateProduct()
  const history = useHistory()
  const [productIndex, setProductIndex] = useState(0)
  const [productsArr, setProductsArr] = useState([])
  const [merchantVendor, setMerchantVendor] = useState([])
  const merchantVendorList = useFetchGetMerchantVendorList()
  const getisUnlimProdEmpPrice = useFetchGetisUnlimProdEmpPrice()
  const [saveBtn, setSaveBtn] = useState(false)
  const [vaild, setVaild] = useState(false)
  const [product, setProduct] = useState({
    itemId,
    no: '',
    name: '',
    cost: 0,
    sellPrice: 0,
    employeePrice: 0,
    safeLow: 0,
    safeHigh: 0,
    stockUnit: '',
    commission: 0,
    customerSellSetting: [],
    ProductCategoryId: '',
    isAvailableForSale: true,
    isPublished: true,
    isLocked: '',
    VendorId: null,
  })

  const handleOnChange = ({ event, key }) => {
    if (event.persist) event.persist()
    setProduct(
      produce(draft => {
        draft[key] = idx(event, _ => _.target.value)
        if (key === 'sellPrice')
          draft.customerSellSetting = cloneDeep(product.customerSellSetting).map(data => {
            data.price = idx(event, _ => _.target.value)
            return data
          })
      })
    )
  }

  const handleSubmit = async status => {
    setSaveBtn(true)
    try {
      if (!isUnlimProdEmpPrice && (product.employeePrice < product.cost)) throw new Error('自購價不可低於成本價')
      await updateProduct({ input: product })
      openSnackbar({ variant: 'success', message: '成功儲存商品變更' })
      if (status === 'toList') {
        history.push('/products')
      } else if (status === 'toLast') {
        history.push(`/product/edit/${productsArr[productIndex - 1].id}`)
      } else {
        // toNext
        history.push(`/product/edit/${productsArr[productIndex + 1].id}`)
      }
    } catch (error) {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    }
  }

  const handleCreate = async () => {
    setSaveBtn(true)
    const { itemId, ...rest } = cloneDeep(product)
    try {
      if (!isUnlimProdEmpPrice && (product.employeePrice < product.cost)) throw new Error('自購價不可低於成本價')
      await createProduct({ input: {
          OfficialBrandMerchantId: JSON.parse(localStorage.getItem('userMerchant')).id,
          ...rest
      } })
      openSnackbar({ variant: 'success', message: '成功新增商品' })
      history.push('/products')
    } catch (error) {
      setSaveBtn(false)
      openSnackbar({ variant: 'error', message: error.message })
    }
  }

  const isUnlimProdEmpPrice = useMemo(() => {
    if (!getisUnlimProdEmpPrice.loading && getisUnlimProdEmpPrice.data) {
      return getisUnlimProdEmpPrice.data.getParameterAboutSettingFunction.isUnlimProdEmpPrice
    }
    return false
  }, [getisUnlimProdEmpPrice.loading, getisUnlimProdEmpPrice.data])

  useEffect(() => {
    // 查詢失敗或查無此商品時沒有資料：維持空白表單（儲存鈕停用），不讓整頁拋錯
    if (!productDetail.loading && idx(productDetail.data, _ => _.product)) {
      const noIsNull = idx(productDetail.data, _ => _.product.no) === null
      setProduct(
        produce(draft => {
          draft.itemId = idx(productDetail.data, _ => _.product.id)
          draft.no = noIsNull ? '' : idx(productDetail.data, _ => _.product.no) + (isDuplicate ? '的副本' : '')
          draft.name = idx(productDetail.data, _ => _.product.name) + (isDuplicate ? '的副本' : '')
          draft.cost = idx(productDetail.data, _ => _.product.cost)
          if (productDetail.data.product.isAvailableForSale) {
            draft.sellPrice = idx(productDetail.data, _ => _.product.sellPrice)
          } else {
            draft.sellPrice = 0
          }
          draft.employeePrice = idx(productDetail.data, _ => _.product.employeePrice)
          draft.safeLow = idx(productDetail.data, _ => _.product.safeLow)
          draft.safeHigh = idx(productDetail.data, _ => _.product.safeHigh)
          draft.stockUnit = idx(productDetail.data, _ => _.product.stockUnit)
          if (productDetail.data.product.isAvailableForSale) {
            draft.commissionWay = idx(productDetail.data, _ => _.product.commissionWay)
          }
          draft.commission = idx(productDetail.data, _ => _.product.commission)
          draft.customerSellSetting = idx(productDetail.data, _ =>
            _.product.customerSellSetting.map(data => ({
              category: data.category,
              price: data.price,
            }))
          )
          draft.ProductCategoryId = idx(productDetail.data, _ => _.product.productCategory.id)
          draft.isAvailableForSale = idx(productDetail.data, _ => _.product.isAvailableForSale)
          draft.isLocked = idx(productDetail.data, _ => _.product.isLockedOriginalValue)
          draft.VendorId = idx(productDetail.data, _ => _.product.merchantVendor.merchantVendorUUId)
          draft.isPublished = idx(productDetail.data, _ => _.product.isPublished)
        })
      )
    }
  }, [productDetail.loading, productDetail.data])

  useEffect(() => {
    setSaveBtn(false)
    if (!products.loading && !productDetail.loading) {
      const productsArr = idx(products, _ => _.data.products.data) || []
      const productId = idx(productDetail.data, _ => _.product.id)
      setProductsArr(productsArr)
      productsArr.forEach((product, index) => {
        if (product.id === productId) {
          setProductIndex(index)
        }
      })
    }
  }, [products.loading, productDetail.loading])

  useEffect(() => {
    if (!merchantVendorList.loading) {
      const data = idx(merchantVendorList,_=>_.data.getMerchantVendorList)
      setMerchantVendor(data || [])
    }
  }, [merchantVendorList.loading])

  useEffect(() => {
    const vaild = !(product.name && product.stockUnit && product.ProductCategoryId)
    setVaild(vaild)
  }, [product])

  return (
    <Page className="ui-root" title={isDuplicate ? "新增商品" : "編輯商品"} >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <PageHeader title={isDuplicate ? "新增商品" : "編輯商品"} className="pb-0" />
        <AboutProduct
          product={product}
          onChange={handleOnChange}
          setProduct={setProduct}
          merchantVendor={merchantVendor}
        />
        {product.isAvailableForSale && !productDetail.loading && (
          <AboutSalesProduct
            product={product}
            onChange={handleOnChange}
          />
        )}
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
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  disabled={productIndex === 0 || saveBtn || vaild}
                  onClick={() => handleSubmit('toLast')}
                >
                  儲存並上一筆
                </Button>
                <Button
                  variant="secondary"
                  disabled={productIndex === productsArr.length - 1 || saveBtn || vaild}
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
