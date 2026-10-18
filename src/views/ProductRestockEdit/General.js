/** @jsxImportSource @emotion/react */
import {
  Card, CardActions, CardContent, CardHeader, Divider,
  TextField, Grid, Autocomplete, FormControl, InputLabel, Input,
  InputAdornment, IconButton
} from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { useFetchProductsInProductRestock } from 'hooks/useFetchProducts'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import idx from 'idx'
import { useState, useEffect, useRef } from 'react'
import { FilterNone as FilterNoneIcon, Add as AddIcon, DeleteForever as DeleteForeverIcon, InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import _ from 'lodash'
import { openSnackbar } from 'elements/snackbars'
import format from 'date-fns/format'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ProductsModalV3 from './ProductsModalV3'

const styles = {
  cardContent: css({}),
  formControl: css({
    marginBottom: theme.spacing(3),
    ':last:child': {
      marginBottom: 0,
    },
    width: '100%',
  }),
  createIcon: css({
    cursor: 'pointer',
  }),
  productArrayInput: css({
    // width: '100%',
  }),
  productArrayDiv: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'nowrap',
  }),
  productArrayIcons: css({
    cursor: 'pointer',
  }),
}

export default function General({
  className,
  purchaseRecord,
  setPurchaseRecord,
  disabled
}) {
  const [setting, setSetting] = useState({
    keyword: '',
    categoryIds: [],
    merchantVendorUUIds: !!purchaseRecord.vendorUUId ? [purchaseRecord.vendorUUId] : [],
  })
  const products = useFetchProductsInProductRestock(setting)
  const productCategoriesData = useFetchProductCategoriesInCreatePicking()
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
  const [productOptions, setProductOptions] = useState([])

  const productRef = useRef()
  const priceRef = useRef()
  const countRef = useRef()

  const handleAddProduct = () => {
    const newData = _.cloneDeep(purchaseRecord)
    newData.purchaseProduct.push({
      productID: '',
      productName: '',
      count: 0,
      unitPrice: 0,
    })
    setPurchaseRecord(newData)
    setFocusRow(newData.purchaseProduct.length - 1)
  }
  const handleDeleteProduct = index => {
    const newData = _.cloneDeep(purchaseRecord)
    newData.purchaseProduct.splice(index, 1)
    setPurchaseRecord(newData)
  }

  useEffect(() => {
    if (!productCategoriesData.loading) {
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories)

      setProductCategories(productCategories)
    }
  }, [productCategoriesData.loading])

  useEffect(() => {
    if (!products.loading) {
      setProductOptions(idx(products, _ => _.data.products.data))
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
  /* ----------------------------------------------------------------------------------------------------------------------------------------------------- */

  const handleOpenProductsModal = () => {
    setProductsModalOpen(!productsModalOpen)
  }

  const handleCloseProductsModal = () => {
    setProductsModalOpen(false)
    setSelectedCategorie([])
    setSelectedCategorieName([])
  }
  useEffect(() => {
    if (!products.loading) {
      const productList = idx(products, _ => _.data.products.data)
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
          remainingCount: data.remainingCount
        }
      })
      setProductList(productsAddCount)
    }
  }, [products.loading, setting])

  useEffect(() => {
    if (!products.loading) {
      setProductOptions(idx(products, _ => _.data.products.data))
    }
  }, [products.loading])

  const hadnleSelectProduct = (product, index, source) => {
    const newData = _.cloneDeep(purchaseRecord)
    if (product === null) {
      newData.purchaseProduct[index] = {
        productID: '',
        productName: '',
      }
    } else {
      if (source === 'notModal') {
        newData.purchaseProduct[index] = {
          ...newData.purchaseProduct[index],
          productID: product.id,
          productName: product.name,
          unitPrice: product.cost,
        }
        setPurchaseRecord(newData)
      } else {
        newData.purchaseProduct[index] = {
          ...newData.purchaseProduct[index],
          productID: product.id,
        }
        newData.purchaseProduct.push({
          productID: '',
          productName: '',
          count: '',
          unitPrice: '',
        })
        setPurchaseRecord(newData)
      }
    }
    if (newData.purchaseProduct[index].productID !== '') {
      setFocus('price')
      priceRef.current && priceRef.current.focus()
    }
    setProductKeyword('')
    setPurchaseRecord(newData)
  }

  const handlePriceOnChange = (event, index) => {
    if (event.target.value < 0) {
      event.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const newData = _.cloneDeep(purchaseRecord)
    newData.purchaseProduct[index].unitPrice = Number(event.target.value)
    setPurchaseRecord(newData)
  }
  const handleProductCountOnChange = (event, index) => {
    if (event.target.value < 0) {
      event.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const newData = _.cloneDeep(purchaseRecord)
    newData.purchaseProduct[index].count = Number(event.target.value)
    setPurchaseRecord(newData)
  }

  useEffect(() => {
    setProductTotal(
      purchaseRecord.purchaseProduct.reduce((accu, curVal) => accu + (Number(curVal.unitPrice) * Number(curVal.count)), 0)
    )
  }, [purchaseRecord, setting])

  const handleChangeFocusRow = index => {
    if (index < purchaseRecord.purchaseProduct.length) {
      setFocusRow(index)
    }
    if (index === purchaseRecord.purchaseProduct.length) {
      handleAddProduct()
    }
  }

  const productFilter = options => {
    const newOptions = options
    const filterOptions = newOptions.filter(d => {
      return (d.no !== null && d.no.includes(productKeyword)) || (d.name !== null && d.name.includes(productKeyword))
    })
    return filterOptions
  }

  const Title = () => (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <span>進貨資訊-{purchaseRecord.vendorName}</span>
      {purchaseRecord.stockInDate && (
        <span style={{ marginLeft: 'auto' }} >
          入庫時間：{format(purchaseRecord.stockInDate, 'yyyy-MM-dd-HH:MM')}
        </span>
      )}
    </div>
  )

  return (
    <Card css={className}>
      <CardHeader title={<Title />} />
      <Divider />
      <CardContent css={styles.cardContent}>
        <MobileDatePicker
          closeOnSelect
          label='進貨日期'
          css={styles.formControl}
          value={purchaseRecord.date}
          disabled={disabled}
          onChange={val => setPurchaseRecord({ ...purchaseRecord, date: new Date(val).getTime() })}
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
              <FormControl css={styles.formControl} variant="filled">
                <InputLabel htmlFor="date-picker">進貨日期</InputLabel>
                <Input
                  id="date-picker"
                  type='text'
                  onClick={inputProps.onClick}
                  readOnly={disabled}
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
        {purchaseRecord.purchaseProduct.map((data, index) => (
          <Grid container css={styles.productArrayDiv} key={index}>
            {/* 先隱藏 */}
            {index === 0 ? (
              <Grid item sm={1}  >
                <IconButton disabled={disabled} onClick={handleOpenProductsModal}>
                  <FilterNoneIcon css={styles.createIcon} />
                </IconButton>
              </Grid>
            ) : (
              <Grid item sm={1}></Grid>
            )}
            <Grid item sm={4} style={{ marginRight: '20px' }}>
              <Autocomplete
                freeSolo
                readOnly={disabled}
                onFocus={() => { setFocusRow(index) }}
                id="prodcut-select"
                style={{ width: '100%' }}
                options={productOptions || []}
                autoHighlight
                filterOptions={productFilter}
                getOptionLabel={option => (data ? data.productName : '')}
                value={data ? data.productName : ''}
                onChange={(_event, value) => hadnleSelectProduct(value, index, 'notModal')}
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {`${option.no} ${option.name}`}
                    </li>
                  )
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="選擇商品"
                    variant="outlined"
                    fullWidth
                    name="product"
                    tabIndex={focusRow + '0'}
                    ref={(index === focusRow && focus === 'product') ? productRef : null}
                    onChange={event => setProductKeyword(event.target.value)}
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item sm={2} style={{ marginRight: '20px' }}>
              <TextField
                InputProps={{ inputProps: { min: 0, readOnly: disabled } }}
                onFocus={() => { setFocusRow(index) }}
                label="價格"
                ref={(index === focusRow && focus === 'price') ? priceRef : null}
                variant="outlined"
                fullWidth
                name="price"
                tabIndex={focusRow + '1'}
                css={styles.productArrayInput}
                onChange={event => handlePriceOnChange(event, index)}
                InputLabelProps={{ shrink: true }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    setFocus('count')
                    countRef.current.focus()
                  }
                }}
                value={data.unitPrice}
                type="number"
              />
            </Grid>
            <Grid item sm={2}>
              <TextField
                InputProps={{ inputProps: { min: 0, readOnly: disabled } }}
                onFocus={() => { setFocusRow(index) }}
                label="數量"
                variant="outlined"
                fullWidth
                name="count"
                ref={(index === focusRow && focus === 'count') ? countRef : null}
                css={styles.productArrayInput}
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
            </Grid>
            {index !== 0 ? (
              <Grid item sm={1} >
                <IconButton disabled={disabled} onClick={() => handleDeleteProduct(index)}>
                  <DeleteForeverIcon
                    css={styles.productArrayIcons}
                  />
                </IconButton>
              </Grid>
            ) : (
              <Grid item sm={1}></Grid>
            )}
            {index === purchaseRecord.purchaseProduct.length - 1 ? (
              <Grid item sm={1} >
                <IconButton disabled={disabled} onClick={handleAddProduct}>
                  <AddIcon css={styles.purchaseProduct} />
                </IconButton>
              </Grid>
            ) : (
              <Grid item sm={1}></Grid>
            )}
          </Grid>
        ))}
        <TextField
          label="操作者"
          css={styles.formControl}
          variant="outlined"
          fullWidth
          value={purchaseRecord.operatorName}
          inputProps={{
            autoComplete: 'new-password',
            readOnly: true,
          }}
        />
        <TextField
          multiline
          minRows="4"
          label="備註"
          variant="outlined"
          fullWidth
          css={styles.formControl}
          value={purchaseRecord.remark}
          InputProps={{ inputProps: { readOnly: disabled } }}
          onChange={event =>
            setPurchaseRecord({ ...purchaseRecord, remark: event.target.value })
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
          onSelectProduct={hadnleSelectProduct}
          productListLength={purchaseRecord.purchaseProduct.length}
          purchaseRecords={purchaseRecord}
          setPurchaseRecords={setPurchaseRecord}
        />
      )}
      <Divider />
      <CardActions>合計：{productTotal}</CardActions>
    </Card>
  )
}
