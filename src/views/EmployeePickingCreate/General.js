// 欄位使用 Autocomplete / Select / DatePicker 與 inputRef 焦點串接，沿用 MUI
import { Select, MenuItem, FormControl, InputLabel } from 'ui/form-control'
import { TextField } from 'ui/text-field'
import { DatePicker } from 'ui/date-picker'
import { useFetchProductsInEmployeePicking } from 'hooks/useFetchProducts'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import idx from 'idx'
import { useState, useEffect, useRef } from 'react'
import { FilterNone as FilterNoneIcon, Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import cloneDeep from 'lodash/cloneDeep'
import { openSnackbar } from 'elements/snackbars'

import { Button } from 'ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from 'ui/card'
import ProductsModalV3 from './ProductsModalV3'
import { Autocomplete } from 'ui/combobox'

export default function General({
  className,
  picking,
  setPicking,
  setPageLoading,
  onChange,
  setIsClick,
  purpose
}) {
  const [setting, setSetting] = useState({
    keyword: '',
    categoryIds: [],
    isPublished: true
  })
  const [pickerKeyword, setPickerKeyword] = useState('')

  const products = useFetchProductsInEmployeePicking(setting)
  const productCategoriesData = useFetchProductCategoriesInCreatePicking()
  const users = useFetchUsersForCreatePicking({
    keyword: '',
    pageLimit: 100,
    pageOffset: 0,
  })
  const [productsOption, setProductsOption] = useState([])
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [productList, setProductList] = useState([])
  const [productCategories, setProductCategories] = useState([])
  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [selectedCategorieName, setSelectedCategorieName] = useState([])
  const [productKeyword, setProductKeyword] = useState('')
  const [focusRow, setFocusRow] = useState(0)
  const [focus, setFocus] = useState('')
  const [pickerOption, setPickerOption] = useState([])
  const [tabIndex, setTabIndex] = useState(0)

  const productRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()
  const designerRef = useRef()
  const purposeRef = useRef()
  const remarkRef = useRef()

  useEffect(() => {
    if (!productCategoriesData.loading) {
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories) || []

      setProductCategories(productCategories)
    }
  }, [productCategoriesData.loading])

  const handleOpenProductsModal = () => {
    if (inputEnabled) {
      setProductsModalOpen(!productsModalOpen)
    }
  }

  const handleCloseProductsModal = () => {
    setProductsModalOpen(false)
    setSelectedCategorie([])
    setSelectedCategorieName([])
    // 保留「只查已上架」（原本關閉清單後條件被換掉，商品選項變成連已下架的都列出）
    setSetting({
      keyword: '',
      categoryIds: [],
      isPublished: true,
    })
  }
  useEffect(() => {
    if (!products.loading) {
      // 查詢失敗時 data 為 undefined：沒有商品可選，不讓整頁拋錯
      const productList = idx(products, _ => _.data.products.data) || []
      setProductsOption(productList)
      const productsAddCount = productList.map(data => {
        return {
          productCategory: data.productCategory,
          cost: data.cost,
          productName: data.name,
          productNo: data.no,
          price: data.employeePrice,
          total: data.employeePrice * 1,
          unit: data.stockUnit,
          count: 1,
          selected: false,
          id: data.id,
        }
      })
      setProductList(productsAddCount)
    }
  }, [products.loading, picking, setting])

  useEffect(() => {
    if (!users.loading) {
      setPageLoading(users.loading)
      setPickerOption(idx(users, _ => _.data.users.users) || [])
    }
  }, [users.loading, setPageLoading])

  const productLabel = option => `${option.no === null ? '無代號' : option.no} ${option.name}`

  const handleInputChange = event => {
    idx(event, _ => {
      setPickerKeyword(_.target.value)
    })
  }

  const handleAddProduct = () => {
    if (inputEnabled) {
      const newPicking = cloneDeep(picking)
      newPicking.productList.push({
        productName: '',
        productNo: '',
        price: 0,
        count: 0,
        total: 0,
        cost: 0,
        unit: '',
      })
      setPicking(newPicking)
      setFocusRow(newPicking.length - 1)
    }
  }

  const hadnleSelectProduct = (product, index) => {
    const newPicking = cloneDeep(picking)
    if (product === null) {
      newPicking.productList.forEach((data, index1) => {
        if (index1 === index) {
          newPicking.productList[index] = {
            price: 0,
            productName: '',
            productNo: '',
            total: 0,
            count: 0,
            cost: 0,
            unit: '',
          }
        }
      })
    } else {
      // 商品清單彈窗不經過這裡（直接改整張領料單），只有本列下拉選商品
      newPicking.productList.forEach((data, index1) => {
        if (index1 === index) {
          newPicking.productList[index] = {
            ...newPicking.productList[index],
            price: product.employeePrice,
            cost: product.cost,
            unit: product.stockUnit,
            productName: product.name,
            productNo: product.no,
            total: product.employeePrice * 1,
            count: 1,
          }
        }
      })
    }
    setFocus('price')
    priceRef.current.focus()
    setProductKeyword('')
    setPicking(newPicking)
  }

  const handlePriceOnChange = (event, index) => {
    if (event.target.value < 0) {
      event.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const newPicking = cloneDeep(picking)
    newPicking.productList.forEach((data, index1) => {
      if (index1 === index) {
        newPicking.productList[index].price = Number(event.target.value)
        newPicking.productList[index].total = Number(event.target.value) * data.count
      }
    })
    setPicking(newPicking)
  }
  const handleProductCountOnChange = (event, index) => {
    if (event.target.value < 0) {
      event.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const newPicking = cloneDeep(picking)
    newPicking.productList.forEach((data, index1) => {
      if (index1 === index) {
        newPicking.productList[index].count = Number(event.target.value)
        newPicking.productList[index].total = Number(event.target.value) * data.price
      }
    })
    setPicking(newPicking)
  }
  const handleProductInputOnChange = (event, index) => {
    const newPicking = cloneDeep(picking)
    newPicking.productList.forEach((data, index1) => {
      if (index1 === index) {
        newPicking.productList[index].productName = event.target.value
      }
    })
    setPicking(newPicking)
  }

  const handleDeleteProduct = index => {
    const newPicking = cloneDeep(picking)
    newPicking.productList.splice(index, 1)
    setPicking(newPicking)
  }

  const productTotal = () => {
    return  picking.productList.reduce((accu, curVal) => accu + curVal.total, 0)
  }

  const handleChangeFocusRow = index => {
    if (index < picking.productList.length) {
      setFocusRow(index)
    }
    if (index === picking.productList.length) {
      handleAddProduct()
    }
    setTabIndex(index)
  }

  useEffect(() => {
    switch (focus) {
      case 'price':
        idx(priceRef, _ => _.current.focus())
        idx(priceRef, _ => _.current.select())
        break
      case 'product':
        idx(productRef, _ => _.current.focus())
        break
      case 'count':
        idx(countRef, _ => _.current.focus())
        idx(countRef, _ => _.current.select())
        break
      case 'purpose':
        idx(purposeRef, _ => _.current.focus())
        break
      case 'designer':
        idx(designerRef, _ => _.current.focus())
        break
      case 'remark':
        idx(remarkRef, _ => _.current.focus())
        break
      default:
        break
    }
  }, [focus])

  useEffect(() => {
    if (picking.PickerId !== '' && picking.purpose !== '' && picking.productList.length > 0) {
      const emptyProduct = picking.productList.filter(d => {
        return d.productName === ''
      })
      if (emptyProduct.length > 0) {
        setIsClick(true)
      } else {
        setIsClick(false)
      }
    } else {
      setIsClick(true)
    }
  }, [picking, setIsClick])
  const [errorText, setErrorText] = useState('')
  const inputEnabled = !products.loading && !users.loading
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle>領料資訊</CardTitle>
      </CardHeader>
      <CardContent className="border-0 border-t border-solid border-border">
        <DatePicker
          disableFuture
          format='yyyy/MM/dd'
          label='日期'
          className="w-full !mb-[24px]"
          value={picking.date}
          onError={(e) => e ? setErrorText('時間有誤') : setErrorText('')}
          localeText={{
            toolbarTitle: '選擇日期'
          }}
          slotProps={{
            toolbar: {
              toolbarFormat: 'yyyy年M月d日'
            },
            textField: {
              variant: 'standard',
              fullWidth: true,
              helperText: errorText
            }
          }}
          onChange={event => {
            return onChange({
              event: new Date(event).getTime(),
              key: 'date',
            })
          }}
        />
        {/* 手機（< 640px）分兩列：清單鈕＋商品撐滿，第二列自購價／數量／小計／刪除／新增；640px 以上維持原單列 */}
        {picking.productList.map((data, index) => (
          <div className="mb-6 grid grid-cols-12 items-center gap-2" key={index}>
            {/* 先隱藏 */}
            {index === 0 ? (
              <div className="col-span-1">
                <Button variant="ghost" size="icon" aria-label="從商品清單選取" onClick={handleOpenProductsModal}>
                  <FilterNoneIcon />
                </Button>
              </div>
            ) : (
              <div className="col-span-1">

              </div>
            )}
            <div className="col-span-11 sm:col-span-4">
              <Autocomplete
                style={{ width: '100%' }}
                options={productsOption}
                disabled={!inputEnabled}
                // value={selectedProduct}
                onFocus={() => setTabIndex(index)}
                inputValue={data.productName || productKeyword}
                autoHighlight
                // 原本以關鍵字分兩支，但兩支組出的文字相同；選項顯示也與此相同
                getOptionLabel={productLabel}
                renderOption={(props, option) =>
                  <li {...props} key={option.id}>{productLabel(option)}</li>
                }
                onKeyDown={event => {
                  if (event.key === 'Enter' && picking.productList[index].productName !== '') {
                    priceRef.current.focus()
                    setFocus('price')
                  }
                }}
                onChange={(_event, value) => hadnleSelectProduct(value, index)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="選擇商品"
                    variant="outlined"
                    fullWidth
                    name="product"
                    inputRef={tabIndex === index ? productRef : null}
                    onChange={event => handleProductInputOnChange(event, index)}
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                label="自購價"
                disabled={!inputEnabled}
                inputRef={tabIndex === index ? priceRef : null}
                variant="outlined"
                fullWidth
                name="price"
                onChange={event => handlePriceOnChange(event, index)}
                onFocus={() => setTabIndex(index)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    countRef.current.focus()
                    setFocus('count')
                  }
                }}
                value={data.price}
                type="number"
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="col-span-4 sm:col-span-2">
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                label="數量"
                disabled={!inputEnabled}
                variant="outlined"
                fullWidth
                name="count"
                inputRef={tabIndex === index ? countRef : null}
                onFocus={() => setTabIndex(index)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    handleChangeFocusRow(index + 1)
                    setFocus('product')
                  }
                }}
                value={data.count}
                type="number"
                InputLabelProps={{ shrink: true }}
                onChange={event => handleProductCountOnChange(event, index)}
                onWheel={() => document.activeElement.blur()}
              />
            </div>
            <div className="col-span-2 sm:col-span-1 text-center text-body tabular-nums text-text">
              {data.total !== 0 && data.total}
            </div>
            {index !== 0 ? (
              <div className="col-span-1">
                <Button variant="ghost" size="icon" aria-label="刪除此列" onClick={() => handleDeleteProduct(index)}>
                  <DeleteForeverIcon />
                </Button>
              </div>
            ) : (
              <div className="col-span-1">

              </div>
            )}
            {index === picking.productList.length - 1 ? (
              <div className="col-span-1">
                <Button variant="ghost" size="icon" aria-label="新增一列" onClick={handleAddProduct}>
                  <AddIcon />
                </Button>
              </div>
            ) : (
              <div className="col-span-1">

              </div>
            )}
          </div>
        ))}
        <Autocomplete
          className="w-full !mb-[24px]"
          options={pickerOption}
          disabled={!inputEnabled}
          autoHighlight
          getOptionLabel={option =>
            option.designerNo === pickerKeyword
              ? `${option.designerNo} ${option.name}`
              : option.name
          }
          renderOption={(props, option) => <li {...props} key={option.id}>{`${option.designerNo || ''} ${option.name}`}</li>}
          onFocus={() => setFocus('designer')}
          onChange={(_event, value) => {
            onChange({ event: { target: { value: value ? value.id : '' } }, key: 'PickerId' })
            setFocus('purpose')
            purposeRef.current.focus()
          }
          }
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('purpose')
              purposeRef.current.focus()
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              label="領料人"
              variant="outlined"
              fullWidth
              onChange={handleInputChange}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password',
              }}
            />
          )}
        />
        <FormControl
          fullWidth
          focused={focus === 'purpose'}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setFocus('remark')
            }
          }}
          className="w-full !mb-[24px]"
          variant="outlined"
        >
          <InputLabel>用途</InputLabel>
          <Select
            disabled={purpose.length === 0}
            inputRef={purposeRef}
            value={picking.purpose}
            label='用途'
            onFocus={() => setFocus('purpose')}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                setFocus('remark')
              }
            }}
            onChange={event => {
              onChange({ event, key: 'purpose' })
              setFocus('remark')
            }}
          >
            {purpose.map(data => (
              <MenuItem key={data} value={data}>{data}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          inputRef={remarkRef}
          multiline
          minRows="4"
          label="備註"
          onFocus={() => setFocus('remark')}
          variant="outlined"
          fullWidth
          className="w-full !mb-[24px]"
          onChange={event => onChange({ event, key: 'remark' })}
        />
      </CardContent>
      {productsModalOpen && (
        <ProductsModalV3
          productsModalOpen={productsModalOpen}
          closeModal={handleCloseProductsModal}
          productList={productList}
          setProductList={setProductList}
          productCategories={productCategories}
          onChange={onChange}
          setSelectedCategorie={setSelectedCategorie}
          setSelectedCategorieName={setSelectedCategorieName}
          selectedCategorie={selectedCategorie}
          selectedCategorieName={selectedCategorieName}
          setSetting={setSetting}
          productListLength={picking.productList.length}
          setPicking={setPicking}
          picking={picking}
        />
      )}
      <CardFooter className="justify-start text-body font-medium tabular-nums text-text">合計：{productTotal()}</CardFooter>
    </Card>
  )
}
