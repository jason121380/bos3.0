import { Input, TextField, InputAdornment } from 'ui/text-field'
import { FormControl, InputLabel } from 'ui/form-control'
import { MobileDatePicker } from 'ui/date-picker'
import { useFetchProductsInProductRestock } from 'hooks/useFetchProducts'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import idx from 'idx'
import { useState, useEffect, useRef } from 'react'
import { InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import cloneDeep from 'lodash/cloneDeep'
import clone from 'lodash/clone'
import { openSnackbar } from 'elements/snackbars'
import format from 'date-fns/format'
import { Copy, Plus, Trash2 } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'

import ProductsModalV3 from './ProductsModalV3'
import { Autocomplete } from 'ui/combobox'

export default function General({
  className,
  picking,
  setPageLoading,
  purchaseRecords,
  setPurchaseRecords,
}) {
  const [setting, setSetting] = useState({
    keyword: '',
    categoryIds: [],
    merchantVendorUUIds: [],
  })
  const [operatorKeyword, setOperatorKeyword] = useState('')
  const products = useFetchProductsInProductRestock(setting)
  const productCategoriesData = useFetchProductCategoriesInCreatePicking()
  const users = useFetchUsersForCreatePicking({
    keyword: '',
    pageLimit: 100,
    pageOffset: 0,
  })
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [productList, setProductList] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [selectedCategorieName, setSelectedCategorieName] = useState([])
  const [productTotal, setProductTotal] = useState(0)
  const [productKeyword, setProductKeyword] = useState('')
  const [focusRow, setFocusRow] = useState(0)
  const [focus, setFocus] = useState('')
  const [operator, setOperator] = useState([])
  const [productOptions, setProductOptions] = useState([])
  const [vendorOptions, setVendorOptions] = useState([])
  const getMerchantVendor = useFetchGetMerchantVendorList()

  const productRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()

  const handleAddProduct = () => {
    if (inputEnabled) {
      const newData = cloneDeep(purchaseRecords)
      newData.productList.push({
        productId: '',
        count: 0,
        unitPrice: 0,
      })
      setPurchaseRecords(newData)
      setFocusRow(newData.productList.length - 1)
    }
  }

  const handleDeleteProduct = index => {
    const newData = cloneDeep(purchaseRecords)
    newData.productList.splice(index, 1)
    setPurchaseRecords(newData)
  }

  const handleChangePurchaseRecords = (key, value) => {
    const newData = clone(purchaseRecords)
    if (value === null) {
      newData[key] = ''
      setPurchaseRecords(newData)
    } else {
      newData[key] = value.id
      setPurchaseRecords(newData)
    }
  }

  useEffect(() => {
    if (!getMerchantVendor.loading) {
      setVendorOptions(idx(getMerchantVendor, _ => _.data.getMerchantVendorList))
    }
  }, [getMerchantVendor.loading])

  useEffect(() => {
    if (!productCategoriesData.loading) {
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories)

      setProductCategories(productCategories)
    }
  }, [productCategoriesData.loading])

  useEffect(() => {
    if (!users.loading) {
      setPageLoading(users.loading)
      const operator = idx(users, _ => _.data.users.users)
      setOperator(operator)
    }
  }, [users.loading])

  useEffect(() => {
    if (!products.loading) {
      const data = idx(products, _ => _.data.products.data).filter(d => d.merchantVendor !== null)
      setProductOptions(data)
    }
  }, [products.loading])

  useEffect(() => {
    switch (focus) {
      case 'price':
        idx(priceRef, _ => _.current.focus())
        break
      case 'product':
        idx(productRef, _ => _.current.focus())
        break
      case 'count':
        idx(countRef, _ => _.current.focus())
        break
      default:
        break
    }
  }, [focus])


  const handleOpenProductsModal = () => {
    inputEnabled && setProductsModalOpen(!productsModalOpen)
  }

  const handleCloseProductsModal = () => {
    setProductsModalOpen(false)
    setSelectedCategorie([])
    setSelectedCategorieName([])
    setSetting({
      keyword: '',
      categoryIds: [],
      merchantVendorUUIds: [],
    })
  }
  useEffect(() => {
    if (!products.loading) {
      const productList = idx(products, _ => _.data.products.data).filter(d => d.merchantVendor !== null)
      const productsAddCount = productList.map(data => {
        return {
          productCategory: data.productCategory,
          merchantVendor: data.merchantVendor,
          cost: data.cost,
          productName: data.name,
          productNo: data.no,
          price: data.employeePrice,
          total: data.employeePrice * 1,
          unit: data.stockUnit,
          count: 1,
          selected: false,
          id: data.id,
          remainingCount: data.remainingCount
        }
      })
      setProductList(productsAddCount)
    }
  }, [products.loading, picking, setting])

  const hadnleSelectProduct = (product, index, source) => {
    const newData = cloneDeep(purchaseRecords)
    if (product === null) {
      newData.productList[index] = {
        productId: '',
        count: 0,
        unitPrice: 0,
      }
    } else {
      if (source === 'notModal') {
        newData.productList[index] = {
          productId: product.id,
          count: 0,
          unitPrice: product.cost,
        }
        setPurchaseRecords(newData)
      } else {
        newData.productList[index] = {
          ...newData.productList[index],
          productId: product.id,
        }
        newData.productList.push({
          productId: '',
          count: '',
          unitPrice: '',
        })
      }
    }
    if (newData.productList[index].productId !== '') {
      setFocus('price')
      priceRef.current && priceRef.current.focus()
    }
    setProductKeyword('')
    setPurchaseRecords(newData)
  }
  const handlePriceOnChange = (event, index) => {
    if (event.target.value < 0) {
      event.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const newData = cloneDeep(purchaseRecords)
    newData.productList[index].unitPrice = Number(event.target.value)
    setPurchaseRecords(newData)
  }
  const handleProductCountOnChange = (event, index) => {
    if (event.target.value < 0) {
      event.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const newData = cloneDeep(purchaseRecords)
    newData.productList[index].count = Number(event.target.value)
    setPurchaseRecords(newData)
  }

  useEffect(() => {
    setProductTotal(
      purchaseRecords.productList.reduce((accu, curVal) => accu + (Number(curVal.unitPrice) * Number(curVal.count)), 0)
    )
  }, [purchaseRecords, setting])

  const handleChangeFocusRow = index => {
    if (index < purchaseRecords.productList.length) {
      setFocusRow(index)
    }
    if (index === purchaseRecords.productList.length) {
      handleAddProduct()
    }
  }
  const getProductName = id => {
    if (id === '') {
      return ''
    } else {
      const filterData = productOptions.filter(d => d.id === id)
      return filterData[0]
    }
  }

  const productFilter = options => {
    const newOptions = options
    const filterOptions = newOptions.filter(d => {
      return (d.no !== null && d.no.includes(productKeyword)) || (d.name !== null && d.name.includes(productKeyword))
    })
    return filterOptions
  }

  const inputEnabled =
    !productCategoriesData.loading && !users.loading && !products.loading
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>進貨資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <MobileDatePicker
          closeOnSelect
          label='進貨日期'
          value={purchaseRecords.date}
          onChange={val => setPurchaseRecords({ ...purchaseRecords, date: new Date(val).getTime() })}
          format="yyyy/MM/dd"
          localeText={{
            toolbarTitle: '進貨日期'
          }}
          slotProps={{
            toolbar: {
              toolbarFormat: 'M月d日'
            }
          }}
          slots={{
            field: inputProps => (
              <FormControl fullWidth variant="filled">
                <InputLabel htmlFor="date-picker">進貨日期</InputLabel>
                <Input
                  id="date-picker"
                  type='text'
                  onClick={inputProps.onClick}
                  endAdornment={
                    <InputAdornment position="end"><InsertInvitationIcon /></InputAdornment>
                  }
                  label="進貨日期"
                  value={format(inputProps.value, inputProps.format)}
                />
              </FormControl>
            )
          }}
        />
        <div className="flex flex-col gap-4">
          {purchaseRecords.productList.map((data, index) => (
            <div className="flex flex-nowrap items-center gap-4" key={index}>
              {/* 先隱藏 */}
              {/* 圖示按鈕維持不進入 Tab 順序（tabIndex -1），與舊版純圖示相同，不打斷「價格→數量→下一列」的輸入流程 */}
              {index === 0 ? (
                <div className="w-9 shrink-0">
                  <Button variant="ghost" size="icon" tabIndex={-1} aria-label="從商品清單挑選" onClick={handleOpenProductsModal}>
                    <Copy strokeWidth={1.75} />
                  </Button>
                </div>
              ) : (
                <div className="w-9 shrink-0"></div>
              )}
              <div className="min-w-0 flex-[4]">
                <Autocomplete
                  onFocus={() => { setFocusRow(index) }}
                  disabled={!inputEnabled}
                  style={{ width: '100%' }}
                  options={productOptions}
                  value={getProductName(data.productId)}
                  autoHighlight
                  isOptionEqualToValue={(option, value) => option.id === data.productId || null}
                  getOptionLabel={option => option ? `${option.no} ${option.name}` : ''}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.id}>
                        {`${option.no} ${option.name}`}
                      </li>
                    )
                  }}
                  onChange={(_event, value) => hadnleSelectProduct(value, index, 'notModal')}
                  filterOptions={productFilter}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="選擇商品"
                      variant="outlined"
                      fullWidth
                      name="product"
                      ref={(index === focusRow && focus === 'product') ? productRef : null}
                      onChange={event => setProductKeyword(event.target.value)}
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password',
                      }}
                    />
                  )}
                />
              </div>
              <div className="min-w-0 flex-[2]">
                <TextField
                  focused={index === focusRow && focus === 'price'}
                  onFocus={() => { setFocusRow(index) }}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={!inputEnabled}
                  label="價格"
                  ref={(index === focusRow && focus === 'price') ? priceRef : null}
                  variant="outlined"
                  fullWidth
                  name="price"
                  onChange={event => handlePriceOnChange(event, index)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('count')
                      countRef.current && countRef.current.focus()
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  value={data.unitPrice}
                  type="number"
                />
              </div>
              <div className="min-w-0 flex-[2]">
                <TextField
                  focused={index === focusRow && focus === 'count'}
                  onFocus={() => { setFocusRow(index) }}
                  InputProps={{ inputProps: { min: 0 } }}
                  label="數量"
                  variant="outlined"
                  disabled={!inputEnabled}
                  fullWidth
                  name="count"
                  ref={(index === focusRow && focus === 'count') ? countRef : null}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('product')
                      handleChangeFocusRow(index + 1)
                    }
                  }}
                  value={data.count}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  onChange={event => handleProductCountOnChange(event, index)}
                />
              </div>
              <div className="w-16 shrink-0 text-center text-body tabular-nums text-text">
                {data.total !== 0 && data.total}
              </div>
              {index !== 0 ? (
                <div className="w-9 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    tabIndex={-1}
                    aria-label="刪除此列"
                    className="text-text-secondary hover:text-danger"
                    onClick={() => handleDeleteProduct(index)}
                  >
                    <Trash2 strokeWidth={1.75} />
                  </Button>
                </div>
              ) : (
                <div className="w-9 shrink-0"></div>
              )}
              {index === purchaseRecords.productList.length - 1 ? (
                <div className="w-9 shrink-0">
                  <Button variant="ghost" size="icon" tabIndex={-1} aria-label="新增一列" onClick={handleAddProduct}>
                    <Plus strokeWidth={1.75} />
                  </Button>
                </div>
              ) : (
                <div className="w-9 shrink-0"></div>
              )}
            </div>
          ))}
        </div>
        <Autocomplete
          options={operator}
          disabled={!inputEnabled}
          // value={purchaseRecords.operatorId}
          autoHighlight
          getOptionLabel={option =>
            option.designerNo === operatorKeyword
              ? `${option.designerNo} ${option.name}`
              : option.name
          }
          renderOption={(props, option) => (
            <li {...props}>
              {`${option.designerNo || ''} ${option.name}`}
            </li>
          )}
          isOptionEqualToValue={data => data.id === purchaseRecords.operatorId || ''}
          onChange={(_event, value) => handleChangePurchaseRecords('operatorId', value)}
          renderInput={params => (
            <TextField
              {...params}
              label="操作者"
              variant="outlined"
              fullWidth
              onChange={event => setOperatorKeyword(event.target.value)}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password',
              }}
            />
          )}
        />
        <TextField
          multiline
          minRows="4"
          label="備註"
          variant="outlined"
          fullWidth
          onChange={event =>
            setPurchaseRecords({ ...purchaseRecords, remark: event.target.value.trim() })
          }
        />
      </CardContent>
      {productsModalOpen && (
        <ProductsModalV3
          productsModalOpen={productsModalOpen}
          closeModal={handleCloseProductsModal}
          productList={productList}
          setProductList={setProductList}
          productCategories={productCategories}
          setSelectedProduct={setSelectedProduct}
          setSelectedCategorie={setSelectedCategorie}
          setSelectedCategorieName={setSelectedCategorieName}
          selectedCategorie={selectedCategorie}
          selectedCategorieName={selectedCategorieName}
          setSetting={setSetting}
          setting={setting}
          onSelectProduct={hadnleSelectProduct}
          productListLength={purchaseRecords.productList.length}
          purchaseRecords={purchaseRecords}
          setPurchaseRecords={setPurchaseRecords}
          vendorOptions={vendorOptions}
        />
      )}
      <CardFooter className="justify-start text-body text-text">
        合計：<span className="font-medium tabular-nums">{formatNumber(productTotal)}</span>
      </CardFooter>
    </Card>
  )
}
