/** @jsxImportSource @emotion/react */
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Autocomplete
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { useFetchProductsInEmployeePicking } from 'hooks/useFetchProducts'
import { useFetchProductCategoriesInCreatePicking } from 'hooks/useFetchProductCategories'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import idx from 'idx'
import { useState, useEffect, useRef } from 'react'
import { FilterNone as FilterNoneIcon, Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'
import { openSnackbar } from 'elements/snackbars'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import ProductsModalV3 from './ProductsModalV3'

const styles = {
  cardContent: css({}),
  formControl: css({
    marginBottom: theme.spacing(3) + '!important',
    ':last:child': {
      marginBottom: 0,
    },
    width: '100%',
  }),
  createIcon: css({
    cursor: 'pointer',
    marginRight: '7px',
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
  datePicker: css({
    '& input.MuiInput-input': {
      padding: '6px 0 7px'
    }
  }),
}

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
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories)

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
    setSetting({
      keyword: '',
      categoryIds: [],
    })
  }
  useEffect(() => {
    if (!products.loading) {
      const productList = idx(products, _ => _.data.products.data)
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
      setPickerOption(idx(users, _ => _.data.users.users))
    }
  }, [users.loading])

  const handleInputChange = event => {
    idx(event, _ => {
      setPickerKeyword(_.target.value)
    })
  }

  const handleAddProduct = () => {
    if (inputEnabled) {
      const newPicking = _.cloneDeep(picking)
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

  const hadnleSelectProduct = (product, index, source) => {
    const newPicking = _.cloneDeep(picking)
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
      if (source === 'notModal') {
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
      } else {
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
        newPicking.productList.push({
          productName: '',
          productNo: '',
          price: 0,
          count: 0,
          total: 0,
          cost: 0,
          unit: '',
        })
      }
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
    const newPicking = _.cloneDeep(picking)
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
    const newPicking = _.cloneDeep(picking)
    newPicking.productList.forEach((data, index1) => {
      if (index1 === index) {
        newPicking.productList[index].count = Number(event.target.value)
        newPicking.productList[index].total = Number(event.target.value) * data.price
      }
    })
    setPicking(newPicking)
  }
  const handleProductInputOnChange = (event, index) => {
    const newPicking = _.cloneDeep(picking)
    newPicking.productList.forEach((data, index1) => {
      if (index1 === index) {
        newPicking.productList[index].productName = event.target.value
      }
    })
    setPicking(newPicking)
  }

  const handleDeleteProduct = index => {
    const newPicking = _.cloneDeep(picking)
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
  }, [picking])
  const [errorText, setErrorText] = useState('')
  const inputEnabled = !products.loading && !users.loading
  return (
    <Card css={className}>
      <CardHeader title="領料資訊" />
      <Divider />
      <CardContent css={styles.cardContent}>
        <DatePicker
          disableFuture
          format='yyyy/MM/dd'
          label='日期'
          css={css(styles.formControl, styles.datePicker)}
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
        {picking.productList.map((data, index) => (
          <Grid spacing={1} container css={styles.productArrayDiv} key={index}>
            {/* 先隱藏 */}
            {index === 0 ? (
              <Grid item sm={1}>
                <FilterNoneIcon css={styles.createIcon} onClick={handleOpenProductsModal} />
              </Grid>
            ) : (
              <Grid item sm={1}>

              </Grid>
            )}
            <Grid item sm={4}>
              <Autocomplete
                style={{ width: '100%' }}
                options={productsOption}
                disabled={!inputEnabled}
                // value={selectedProduct}
                onFocus={() => setTabIndex(index)}
                inputValue={data.productName || productKeyword}
                autoHighlight
                getOptionLabel={option =>
                  (option.no !== null && option.no !== '' && option.no.includes(productKeyword)) ||
                    option.name.includes(productKeyword)
                    ? `${option.no === null ? '無代號' : option.no} ${option.name}`
                    : `${option.no === null ? '無代號' : option.no} ${option.name}`
                }
                renderOption={(props, option) =>
                  <li {...props} key={option.id}>{`${option.no === null && option.no !== '' ? '無代號' : option.no} ${option.name}`}</li>
                }
                onKeyDown={event => {
                  if (event.key === 'Enter' && picking.productList[index].productName !== '') {
                    priceRef.current.focus()
                    setFocus('price')
                  }
                }}
                onChange={(_event, value) => hadnleSelectProduct(value, index, 'notModal')}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="選擇商品"
                    variant="outlined"
                    fullWidth
                    name="product"
                    tabIndex={focusRow + '0'}
                    inputRef={tabIndex === index ? productRef : null}
                    onChange={event => handleProductInputOnChange(event, index)}
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password',
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item sm={2}>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                label="自購價"
                disabled={!inputEnabled}
                inputRef={tabIndex === index ? priceRef : null}
                variant="outlined"
                fullWidth
                name="price"
                tabIndex={focusRow + '1'}
                css={styles.productArrayInput}
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
            </Grid>
            <Grid item sm={2}>
              <TextField
                InputProps={{ inputProps: { min: 0 } }}
                label="數量"
                disabled={!inputEnabled}
                variant="outlined"
                fullWidth
                name="count"
                inputRef={tabIndex === index ? countRef : null}
                css={styles.productArrayInput}
                tabIndex={focusRow + '2'}
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
            </Grid>
            <Grid item sm={1} style={{ textAlign: 'center' }}>
              <Typography variant="body1">{data.total !== 0 && data.total}</Typography>
            </Grid>
            {index !== 0 ? (
              <Grid item sm={1}>
                <DeleteForeverIcon
                  css={styles.productArrayIcons}
                  onClick={() => handleDeleteProduct(index)}
                />
              </Grid>
            ) : (
              <Grid item sm={1}>

              </Grid>
            )}
            {index === picking.productList.length - 1 ? (
              <Grid item sm={1}>
                <AddIcon css={styles.productArrayIcons} onClick={handleAddProduct} />
              </Grid>
            ) : (
              <Grid item sm={1}>

              </Grid>
            )}
          </Grid>
        ))}
        <Autocomplete
          css={styles.formControl}
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
          css={styles.formControl}
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
          css={styles.formControl}
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
          onSelectProduct={hadnleSelectProduct}
          productListLength={picking.productList.length}
          setPicking={setPicking}
          picking={picking}
        />
      )}
      <Divider />
      <CardActions>合計：{productTotal()}</CardActions>
    </Card>
  )
}
