/** @jsxImportSource @emotion/react */
import { Field, Input } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from './RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ProductAutoComplete from 'components/ProductAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import idx from 'idx'
import React, { Fragment, useState, useEffect, useContext } from 'react'
import useFetchProducts from 'hooks/useFetchProducts'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import produce from 'immer'
import TeachingModeContext from 'context/teachingModeContext'
import { useFetchThirdPartysForCreateOrder } from 'hooks/useFetchMerchant'
import billContext from 'context/keyInContext'

import styles from './styles/MerchantSells'
import ProductsModal from './ProductsModal'

function MerchantSells({
  sellsItem,
  onChange,
  onClear,
  index,
  addSells,
  removeSells,
  first,
  last,
  onProductChange,
  focusFirstField,
  expanded,
  focusRow,
  changeRowFocus,
  sells,
  productLength,
  thirdPartTicket,
  getData
}) {
  const techingModeContext = useContext(TeachingModeContext)
  const { setProductAlready } = useContext(billContext)
  const { teachingMode } = techingModeContext

  const thirdPartyCouponsData = useFetchThirdPartysForCreateOrder()

  const employeeRef = React.useRef()
  const productRef = React.useRef()
  const priceRef = React.useRef()
  const countRef = React.useRef()
  const thirdPartyRef = React.useRef()
  const [focus, setFocus] = React.useState('')
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

  React.useEffect(() => {
    if (expanded && focusFirstField) {
      idx(employeeRef, _ => _.current.focus())
      setFocus('employee')
    }
  }, [expanded, focusFirstField])

  const handleFocus = ({ event, field }) => {
    let setted = false
    if (!setted) {
      setFocus(field)
      setted = true
      event.target.focus()
    }
    if (field === 'price' || field === 'count') {
      event.target.select()
    }
    changeRowFocus(index)
  }
  const handleKeyDown = ({ event, nextField }) => {
    if (event.key === 'Enter') {
      setFocus(nextField)
    }
  }

  React.useEffect(() => {
    switch (focus) {
      case 'employee':
        idx(employeeRef, _ => _.current.focus())
        break
      case 'product':
        idx(productRef, _ => _.current.focus())
        break
      case 'price':
        idx(priceRef, _ => _.current.focus())
        break
      case 'count':
        idx(countRef, _ => _.current.focus())
        break
      case 'thirdParty':
        idx(thirdPartyRef, _ => _.current.focus())
        break
      default:
        break
    }
  }, [focus])

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
  return (
    <Fragment>
      <div css={styles.merchantSells}>
        {/* 必填 *：helper/billVerify.js checkProductOrders 要求 sellerId 與 productId；兩者都空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填 */}
        <Field label="服務人員" required={!!sellsItem.sellerId || !!sellsItem.productId}>
          <EmployeeAutoComplete
            placeholder="服務人員姓名/編號"
            className={styles.field}
            value={sellsItem.sellerId}
            ref={employeeRef}
            onChange={value => {
              onChange({
                index,
                key: 'sellerId',
                value: idx(value, _ => _.userId),
              })
            }}
            autoFocus={focus === 'employee'}
            onFocus={event => handleFocus({ event, field: 'employee' })}
            onKeyDown={event => handleKeyDown({ event, nextField: 'product' })}
            tabIndex={focusRow + '0'}
          />
        </Field>
        {index === 0 ? (
          <RowIconButton label="從清單選擇商品" className="mx-1.5" onClick={handleOpenProductsModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        <Field label="商品" required={!!sellsItem.sellerId || !!sellsItem.productId}>
          <ProductAutoComplete
            className={styles.productField}
            value={sellsItem.productId}
            ref={productRef}
            autoFocus={focus === 'product'}
            onFocus={event => handleFocus({ event, field: 'product' })}
            onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
            tabIndex={focusRow + '1'}
            getData={getData}
            isPublished
            setProductAlready={setProductAlready}
            onChange={value => {
              idx(value, _ => {
                onProductChange({
                  index,
                  value: {
                    ...sellsItem,
                    productId: _.id,
                    price: _.sellPrice,
                    count: 1,
                    isLocked: _.isLocked,
                  },
                })
              })
            }}
            inputProps={{ placeholder: '商品代號/名稱' }}
          />
        </Field>
        {sellsItem.productId && (
          <React.Fragment>
            <Field label="價格" css={styles.priceField}>
              <Input
                value={sellsItem.price}
                ref={priceRef}
                tabIndex={focusRow + '2'}
                autoFocus={focus === 'price'}
                onFocus={event => handleFocus({ event, field: 'price' })}
                onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
                data-testid={`merchantSsell-${index}-price`}
                onChange={value => {
                  setFocus('price')
                  onChange({
                    index,
                    key: 'price',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
                disabled={!!(sellsItem.isLocked === 'TRUE' || sellsItem.isLocked === 'UNSET')}
              />
            </Field>
            <Field label="數量" css={styles.priceField}>
              <Input
                value={sellsItem.count}
                ref={countRef}
                autoFocus={focus === 'count'}
                tabIndex={focusRow + '3'}
                onFocus={event => handleFocus({ event, field: 'count' })}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !thirdPartTicket) {
                    changeRowFocus(index + 1)
                  } else {
                    handleKeyDown({ event, nextField: 'thirdParty' })
                  }
                }}
                data-testid={`merchantSsell-${index}-count`}
                onChange={value => {
                  setFocus('count')
                  onChange({
                    index,
                    key: 'count',
                    value: idx(value, _ => +_.target.value || 0),
                  })
                }}
              />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {thirdPartTicket && (
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    fieldProps={{ placeholder: '第三方卡券' }}
                    className={styles.field}
                    autoFocus={focus === 'thirdParty'}
                    value={sellsItem.thirdPartyCouponMerchantId}
                    ref={thirdPartyRef}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        changeRowFocus(index + 1)
                      }
                    }}
                    name="thirdParty"
                    onChange={e => {
                      onProductChange({
                        index,
                        value: {
                          ...sellsItem,
                          thirdPartyCouponMerchantId: e ? e.id : null,
                        },
                      })
                    }}
                    inputProps={{
                      'data-testid': `service-${index}-thirdParty`,
                    }}
                  />
                </Field>
              )}
              {!thirdPartyCouponsData.loading &&
                sellsItem.thirdPartyCouponMerchantId &&
                idx(thirdPartyCouponsData, _ =>
                  _.merchant.thirdpartyCoupons.map(data => {
                    if (data.id === sellsItem.thirdPartyCouponMerchantId) {
                      return (
                        <p className="m-0" css={styles.heading2} style={{ marginTop: '4px' }}>
                          {`扣完後業績:${Math.round((sellsItem.price * (100 - data.fee)) / 100)}`}
                        </p>
                      )
                    }
                  })
                )}
              {teachingMode && (
                <p className="m-0" css={styles.heading2}>勾選將入業績但不收費用**</p>
              )}
            </div>
          </React.Fragment>
        )}

        <RowIconButton
          label="清除此列" className="mr-1.5"
          onClick={() => {
            onClear({ index })
            setFocus('employee')
          }}
          data-testid={`merchantSsell-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first && (
          <RowIconButton
            label="刪除此列" className="mr-1.5"
            onClick={() => {
              removeSells({ index })
              setFocus('employee')
            }}
            data-testid={`merchantSsell-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        )}
      </div>
      {last && (
        <AddRowButton
          onClick={() => {
            addSells()
            setFocus('employee')
          }}
          data-testid={`merchantSsell-${index}-add`}
        />
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
          sells={sells}
          productLength={productLength}
          sellsItem={sellsItem}
          onPageChange={handlePageChange}
          setProductsModalOpen={setProductsModalOpen}
        />
      )}
    </Fragment>
  )
}

export default React.memo(MerchantSells)
