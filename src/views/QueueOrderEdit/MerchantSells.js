import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ProductAutoComplete from 'components/ProductAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import idx from 'idx'
import { Fragment, useState, useEffect, useContext } from 'react'
import useFetchProducts from 'hooks/useFetchProducts'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import produce from 'immer'
import TeachingModeContext from 'context/teachingModeContext'
import billContext from 'context/keyInContext'

import ProductsModal from './ProductsModal'

export default function MerchantSells({
  sells,
  onChange,
  onClear,
  index,
  addSells,
  removeSells,
  onProductChange,
  first,
  last,
  sellsItem,
  productLength,
  thirdPartTicket,
}) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const { thirdPartyCoupons, setProductAlready } = useContext(billContext)

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
  const selectThirdParty = e => {
    if (e !== null) {
      onProductChange({
        index,
        value: {
          ...sells,
          thirdPartyCouponMerchantId: e.id,
        },
      })
    } else {
      onProductChange({
        index,
        value: {
          ...sells,
          thirdPartyCouponMerchantId: null,
        },
      })
    }
  }
  return (
    <Fragment>
      <div className="mb-6 flex flex-wrap items-end justify-start gap-y-[12px]">
        {/* 必填 *：Footer.js 重試時 helper/billVerify.js checkProductOrders 要求 sellerId 與 productId；兩者都空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填（同打帳單） */}
        <Field label="服務人員" required={!!sells.sellerId || !!sells.productId}>
          <EmployeeAutoComplete
            placeholder="服務人員姓名/編號"
            className="!mr-[12px] flex !min-w-[150px]"
            value={sells.sellerId}
            onChange={function (value) {
              onChange({
                index,
                key: 'sellerId',
                value: idx(value, _ => _.userId),
              })
            }}
            inputProps={{
              'data-testid': `merchantSsell-${index}-employee`,
            }}
          />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇商品" className="mx-1.5" onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="商品" required={!!sells.sellerId || !!sells.productId}>
          <ProductAutoComplete
            setProductAlready={setProductAlready}
            className="mr-[12px] flex w-[250px] max-w-full"
            value={sells.productId}
            onChange={function (value) {
              idx(value, _ => {
                onProductChange({
                  index,
                  value: {
                    ...sells,
                    productId: _.id,
                    price: _.sellPrice,
                    count: 1,
                    isLocked: _.isLocked,
                  },
                })
              })
            }}
            inputProps={{
              'data-testid': `merchantSsell-${index}-product`,
            }}
          />
        </Field>
        {sells.productId ? (
          <Fragment>
            <Field label="價格" className="!mr-[12px] flex w-[65px]">
              <TextField
                fullWidth
                variant="outlined"
                value={sells.price}
                onChange={function (value) {
                  onChange({
                    index,
                    key: 'price',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
                inputProps={{
                  'data-testid': `merchantSsell-${index}-price`,
                }}
                disabled={!!(sells.isLocked === 'TRUE' || sells.isLocked === 'UNSET')}
              />
            </Field>
            <Field label="數量" className="!mr-[12px] flex w-[65px]">
              <TextField
                fullWidth
                variant="outlined"
                value={sells.count}
                onChange={function (value) {
                  onChange({
                    index,
                    key: 'count',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
                inputProps={{
                  'data-testid': `merchantSsell-${index}-count`,
                }}
              />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    fieldProps={{ placeholder: '第三方卡券' }}
                    className="!mr-[12px] flex !min-w-[150px]"
                    value={sells.thirdPartyCouponMerchantId}
                    name="thirdParty"
                    onChange={e => selectThirdParty(e)}
                    inputProps={{
                      'data-testid': `service-${index}-thirdParty`,
                    }}
                  />
                </Field>
              )}
              {teachingMode && (
                <p className="m-0 text-[0.8125rem] font-bold">勾選將入業績但不收費用**</p>
              )}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map(data => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p className="m-0 text-[0.8125rem] font-bold">
                        扣完後業績:{Math.round((sells.price * (100 - data.fee)) / 100)}
                      </p>
                    )
                  }
                  return undefined
                })}
            </div>
          </Fragment>
        ) : (
          ''
        )}

        <RowIconButton
          label="清除此列" className="mr-1.5"
          onClick={function () {
            onClear({ index })
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first ? (
          <RowIconButton
            label="刪除此列" className="mr-1.5"
            onClick={function () {
              removeSells({ index })
            }}
            data-testid={`merchantSsell-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          ''
        )}
      </div>
      {last ? (
        <AddRowButton
          onClick={function () {
            addSells()
          }}
          data-testid={`merchantSsell-${index}-add`}
        />
      ) : (
        ''
      )}
      {productsModalOpen && (
        <ProductsModal
          productsModalOpen={productsModalOpen}
          productList={productList}
          productCategories={productCategories}
          closeModal={handleCloseProductsModal}
          selectedCategorie={selectedCategorie}
          setSelectedCategorie={setSelectedCategorie}
          selectedCategorieName={selectedCategorieName}
          setSelectedCategorieName={setSelectedCategorieName}
          setSetting={setSetting}
          onProductChange={onProductChange}
          sells={sellsItem}
          productLength={productLength}
          sellsItem={sells}
          onPageChange={handlePageChange}
          setProductsModalOpen={setProductsModalOpen}
        />
      )}
    </Fragment>
  )
}
