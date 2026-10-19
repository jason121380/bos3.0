/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { Add as AddIcon, BackspaceOutlined as BackspaceOutlinedIcon, DeleteForever as DeleteForeverIcon, FilterNone as FilterNoneIcon } from 'ui/icons'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ProductsModal from './ProductsModal'

const styles = {
  merchantSells: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing(3),
  }),
  field: css({
    width: '150px !important',
    minWidth: '150px !important',
    display: 'flex',
    marginRight: '12px !important',
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
  action: css({
    width: '50px !important',
    display: 'flex',
    marginRight: '12px',
    cursor: 'pointer',
    '&:last-child': {
      marginRight: '0px',
    },
  }),
  createIcon: css({
    cursor: 'pointer',
    margin: '10px',
  }),
  heading2: css({
    fontSize: theme.typography.pxToRem(13),
    fontWeight: 'bold',
  }),
}

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
      <div css={styles.merchantSells}>
        <EmployeeAutoComplete
          className={styles.field}
          label="服務人員姓名/編號"
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
        {index === 0 ? (
          <FilterNoneIcon css={styles.createIcon} onClick={handleOpenProductsModal} />
        ) : (
          <span style={{ margin: '22px' }} />
        )}
        <ProductAutoComplete
          setProductAlready={setProductAlready}
          className={styles.field}
          label="商品代號/名稱"
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
        {sells.productId ? (
          <Fragment>
            <TextField
              variant="outlined"
              label="價格"
              css={styles.priceField}
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
            <TextField
              variant="outlined"
              label="數量"
              css={styles.priceField}
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
            <div style={{ display: 'block' }}>
              {thirdPartTicket && (
                <ThirdPartyAutoComplete
                  className={styles.field}
                  label="第三方卡券"
                  value={sells.thirdPartyCouponMerchantId}
                  autoFocus={focus === 'thirdParty'}
                  name="thirdParty"
                  onChange={e => selectThirdParty(e)}
                  inputProps={{
                    'data-testid': `service-${index}-thirdParty`,
                  }}
                />
              )}
              {teachingMode && (
                <p className="m-0" css={styles.heading2}>勾選將入業績但不收費用**</p>
              )}
              {sells.thirdPartyCouponMerchantId &&
                thirdPartyCoupons.map(data => {
                  if (data.id === sells.thirdPartyCouponMerchantId) {
                    return (
                      <p className="m-0" css={styles.heading2}>
                        扣完後業績:{Math.round((sells.price * (100 - data.fee)) / 100)}
                      </p>
                    )
                  }
                })}
            </div>
          </Fragment>
        ) : (
          ''
        )}

        <BackspaceOutlinedIcon
          css={styles.action}
          onClick={function () {
            onClear({ index })
          }}
          data-testid={`merchantSsell-${index}-clear`}
        />
        {!first ? (
          <DeleteForeverIcon
            css={styles.action}
            onClick={function () {
              removeSells({ index })
            }}
            data-testid={`merchantSsell-${index}-delete`}
          />
        ) : (
          ''
        )}
      </div>
      {last ? (
        <AddIcon
          css={styles.action}
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
