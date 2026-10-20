/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ProductAutoComplete from 'components/ProductAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import idx from 'idx'
import React, { Fragment, useState, useEffect, useContext, useRef } from 'react'
import useFetchProducts from 'hooks/useFetchProducts'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import produce from 'immer'
import TeachingModeContext from 'context/teachingModeContext'
import billContext from 'context/keyInContext'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ProductsModal from './ProductsModal'

const styles = {
  // 項目列：欄位靠底對齊（標籤在上），窄螢幕換行不擠壓（比照打帳單）
  merchantSells: css({
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    rowGap: '12px',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '150px !important',
    minWidth: '150px !important',
    display: 'flex',
    marginRight: '12px !important',
  }),
  productField: css({
    width: '250px',
    maxWidth: '100%',
    display: 'flex',
    marginRight: '12px',
  }),
  priceField: css({
    width: '65px',
    display: 'flex',
    marginRight: '12px !important',
  }),
  checkbox: css({
    width: '100px',
    display: 'flex',
    marginRight: '12px',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  heading2: css({
    fontSize: theme.typography.pxToRem(13),
    fontWeight: 'bold',
  }),
}

export default function MerchantSells({
  sells,
  expanded,
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
  focusFirstField,
  changeRowFocus,
  focusRow,
  thirdPartTicket,
  getData
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
  const employeeRef = useRef()
  const productRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()
  const thirdPartyRef = useRef()
  const [focus, setFocus] = useState('')

  useEffect(() => {
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

  useEffect(() => {
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
      <div css={styles.merchantSells}>
        {/* 必填 *：Footer 送出前 helper/billVerify.js checkProductOrders 要求 sellerId 與 productId；兩者都空的列會被 handleTidyBill 丟掉，所以該列有填任一欄才標必填 */}
        <Field label="服務人員" required={!!sells.sellerId || !!sells.productId}>
        <EmployeeAutoComplete
          className={styles.field}
          placeholder="服務人員姓名/編號"
          value={sells.sellerId}
          ref={employeeRef}
          autoFocus={focus === 'employee'}
          onFocus={event => handleFocus({ event, field: 'employee' })}
          onKeyDown={event => handleKeyDown({ event, nextField: 'product' })}
          tabIndex={focusRow + '0'}
          onChange={function (value) {
            onChange({
              index,
              key: 'sellerId',
              value: idx(value, _ => _.userId),
            })
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
          className={styles.productField}
          inputProps={{ placeholder: '商品代號/名稱' }}
          value={sells.productId}
          ref={productRef}
          autoFocus={focus === 'product'}
          onFocus={event => handleFocus({ event, field: 'product' })}
          onKeyDown={event => handleKeyDown({ event, nextField: 'price' })}
          tabIndex={focusRow + '1'}
          getData={getData}
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
        />
        </Field>
        {sells.productId ? (
          <React.Fragment>
            <Field label="價格" css={styles.priceField}>
            <TextField
              fullWidth
              variant="outlined"
              value={sells.price}
              inputRef={priceRef}
              tabIndex={focusRow + '2'}
              autoFocus={focus === 'price'}
              onFocus={event => handleFocus({ event, field: 'price' })}
              onKeyDown={event => handleKeyDown({ event, nextField: 'count' })}
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
            <Field label="數量" css={styles.priceField}>
            <TextField
              fullWidth
              variant="outlined"
              value={sells.count}
              inputRef={countRef}
              autoFocus={focus === 'count'}
              tabIndex={focusRow + '3'}
              onFocus={event => handleFocus({ event, field: 'count' })}
              onKeyDown={event => handleKeyDown({ event, nextField: 'thirdParty' })}
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
                  className={styles.field}
                  fieldProps={{ placeholder: '第三方卡券' }}
                  value={sells.thirdPartyCouponMerchantId}
                  ref={thirdPartyRef}
                  autoFocus={focus === 'thirdParty'}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      changeRowFocus(index + 1)
                    }
                  }}
                  name="thirdParty"
                  onChange={e => selectThirdParty(e)}
                />
                </Field>
              )}
              {teachingMode && (
                <p className="m-0" css={styles.heading2}>勾選將入業績但不收費用**</p>
              )}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map(data => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p className="m-0" css={styles.heading2} style={{ marginTop: '4px' }}>
                        扣完後業績:{Math.round((sells.price * (100 - data.fee)) / 100)}
                      </p>
                    )
                  }
                })}
            </div>
          </React.Fragment>
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
