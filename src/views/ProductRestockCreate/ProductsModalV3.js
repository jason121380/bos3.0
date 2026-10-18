/** @jsxImportSource @emotion/react */
import {
  Card, CardHeader, CardContent, Divider, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, CardActions, Paper,
  Button, TextField, FormControlLabel, Checkbox, ToggleButtonGroup,
  ToggleButton, Dialog
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { red, blue } from '@mui/material/colors'
import { openSnackbar } from 'elements/snackbars'
import _ from 'lodash'
import { css } from '@emotion/react'

const styles = {
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
    backgroundColor: 'rgb(var(--background))',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    margin: '5px 0',
  }),
  categorieBtn: css({
    margin: '3px !important',
  }),
  categorieClear: css({
    backgroundColor: red[500] + '!important',
    color: 'white',
    width: '80px',
    '&:hover': {
      backgroundColor: red[700] + '!important',
    },
  }),
  addBtn: css({
    backgroundColor: blue[500],
    color: 'white',
    '&:hover': {
      backgroundColor: blue[700],
    },
  }),
  confirmBtn: css({
    margin: '7px 0',
    float: 'right',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgb(var(--background))',
  }),
  closeAtTop: css({
    margin: '16px 24px !important',
  }),
  confirmAtTop: css({
    margin: '16px 0px !important',
  }),
  sticky: css({
    position: 'sticky',
    top: 0,
    zIndex: '99',
  })
}

function ProductsModal({
  productsModalOpen,
  closeModal,
  productList,
  productCategories,
  selectedCategorie,
  selectedCategorieName,
  setPurchaseRecords,
  purchaseRecords,
  vendorOptions,
}) {
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')
  const [selectedCategorieId, setSelectedCategorieId] = useState([])
  const [clickedProduct, setClickedProduct] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [categorie, setCategorie] = useState('')
  const [vendor, setVendor] = useState('')
  const [sortType, setSortType] = useState('NO')

  useEffect(() => {
    const tmpArr = []

    if (!!categorie && !!vendor) {
      productList.filter(product => product.merchantVendor !== null &&
        product.merchantVendor.merchantVendorUUId === vendor &&
        product.productCategory.id === categorie).map(product => tmpArr.push(product))
    } else if (!!categorie && vendor === '') {
      productList.filter(product => product.productCategory.id === categorie)
        .map(product => tmpArr.push(product))
    } else if (!!vendor && categorie === '') {
      productList
        .filter(product => product.merchantVendor !== null && product.merchantVendor.merchantVendorUUId === vendor)
        .map(product => tmpArr.push(product))
    } else {
      productList.map(product => tmpArr.push(product))
    }
    setSelectedCategorieId(tmpArr)

    tmpArr.map((product, index) => {
      product.selected = false
    })

    tmpArr.map((product, index) => {
      selectedProducts.map((selectedProduct, selectedProductindex) => {
        if (selectedProduct.productId === product.id) {
          product.selected = true
          product.price = selectedProduct.price
          product.cost = selectedProduct.cost
          product.count = selectedProduct.count
        }
      })
    })

  }, [vendor, categorie])

  useEffect(() => {
    const cloneData = _.cloneDeep(selectedCategorieId)
    if (sortType === 'STOCK_DESC') {
      cloneData.sort((a, b) => b.remainingCount - a.remainingCount)
    } else if (sortType === 'STOCK_ASC') {
      cloneData.sort((a, b) => a.remainingCount - b.remainingCount)
    } else {
      const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})
      cloneData.sort((a, b) => {
        const noA = a.productNo
        const noB = b.productNo
        return collator.compare(noA, noB)
      })
    }
    setSelectedCategorieId(cloneData)
  }, [sortType])

  useEffect(() => {
    if (productList.length > 0) {
      productList.map(d => {
        d.price = 0
        d.count = 0
        d.total = 0
      })
      setSelectedCategorieId(productList)
    }
  }, [productList.loading])

  useEffect(() => {
    if (!productsModalOpen) {
      setClickedProduct([])
    }
  }, [productsModalOpen])

  useEffect(() => {
    if (!productList.loading) {
      if (selectedCategorieName.length === 0) return
      setCategoryNameForDisplay('')
      if (selectedCategorieName.length === 1) {
        selectedCategorieName.forEach(categoryName => {
          setCategoryNameForDisplay(pre => {
            return `${pre}${categoryName}`
          })
        })
      } else {
        selectedCategorieName.forEach((categoryName, index) => {
          if (index === 0) {
            setCategoryNameForDisplay(pre => {
              return `${pre}${categoryName}`
            })
          } else {
            setCategoryNameForDisplay(pre => {
              return `${pre},${categoryName}`
            })
          }
        })
      }
    }
  }, [selectedCategorieName, productList.loading])
  const handleProductInputOnChange = (e, index, id) => {
    if (e.target.value < 0) {
      e.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const productForModified = _.cloneDeep(selectedCategorieId)
    productForModified.forEach((product, index2) => {
      if (index === index2) {
        switch (e.target.name) {
          case 'price':
            const priceValue = +e.target.value || 0
            product.cost = priceValue
            product.total = priceValue * product.count
            const existedIndex = selectedProducts.map(d => d.productId).indexOf(id)
            if (existedIndex != -1) {
              selectedProducts[existedIndex].cost = parseInt(e.target.value) || 1

              selectedProducts[existedIndex].total =
                parseInt(e.target.value) * selectedProducts[existedIndex].count
            }

            break
          case 'count':
            const countValue = +e.target.value || 0
            product.count = countValue || 1
            product.total = countValue * product.cost
            const existedIndex1 = selectedProducts.map(d => d.productId).indexOf(id)
            if (existedIndex1 != -1) {
              selectedProducts[existedIndex1].count = parseInt(e.target.value) || 1
              selectedProducts[existedIndex1].total =
                parseInt(e.target.value) * selectedProducts[existedIndex1].cost
            }

            break
          case 'selected':
            product.selected = e.target.checked
            const existedIndex2 = selectedProducts.map(d => d.productId).indexOf(id)
            if (existedIndex2 != -1) {
              selectedProducts[existedIndex2].selected = e.target.checked
            } else {
              selectedProducts.push({
                productId: id,
                count: product.count,
                price: product.cost,
                total: product.total,
                productName: product.productName,
                productNo: product.productNo,
                unit: product.unit,
                cost: product.cost,
                selected: product.selected,
              })
            }
            if (!e.target.checked) {
              selectedProducts.splice(existedIndex2, 1)
              product.selected = false
            }
            break
          default:
            break
        }
      }
    })
    setSelectedCategorieId(productForModified)
  }

  const handleSelectProductsConfirm = () => {
    const input = []
    const productOutsideOfModal = purchaseRecords.productList.filter(data => data.productId)
    if (productOutsideOfModal.length > 0) {
      productOutsideOfModal.map(data => {
        input.push({
          productId: data.productId,
          count: data.count,
          unitPrice: data.unitPrice,
        })
      })
    }
    if (selectedProducts.length > 0) {
      selectedProducts.map(data => {
        input.push({
          productId: data.productId,
          count: data.count,
          unitPrice: data.cost,
        })
      })
      setSelectedProducts()
      setPurchaseRecords({ ...purchaseRecords, productList: [...input] })
    } else {
      setPurchaseRecords({
        ...purchaseRecords,
        productList: [
          {
            productName: '',
            productNo: '',
            price: 0,
            count: 0,
            total: 0,
            cost: 0,
            unit: '',
          },
        ],
      })
    }
    closeModal()
  }

  const Header = () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      {selectedCategorieName.length === 0 ? '所有商品' : `${categoryNameForDisplay}類商品`}
      <ToggleButtonGroup
        size="small"
        exclusive
        value={sortType}
        onChange={(e, v) => v && setSortType(v)}
      >
        <ToggleButton value='NO'>編號</ToggleButton>
        <ToggleButton value='STOCK_DESC'>庫存多到少</ToggleButton>
        <ToggleButton value='STOCK_ASC'>庫存少到多</ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
  return (
    <Dialog maxWidth='md' open={productsModalOpen}>
      <Card>
        <div css={styles.header}>
          <CardHeader title={<Header/>} />
          <div>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSelectProductsConfirm}
              css={styles.confirmAtTop}
            >
              確定
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={closeModal}
              css={styles.closeAtTop}
            >
              關閉
            </Button>
          </div>
        </div>

        <Divider />
        <CardContent style={{ backgroundColor: '#FFF', paddingTop: '0' }}>
          <div css={styles.categorieDiv}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', rowGap: '10px' }}
          >
            <div style={{ width: 'calc(100% - 90px)' }}>
              {productCategories.map(productCategory => (
                <Button
                  variant={productCategory.id === categorie ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  css={styles.categorieBtn}
                  onClick={() => setCategorie(productCategory.id)}
                  disabled={selectedCategorie.indexOf(productCategory.id) !== -1}
                  key={productCategory.id}
                >
                  {productCategory.name}
                </Button>
              ))}
              <Divider />
              {vendorOptions.map(d => (
                <Button
                  variant={d.uuid === vendor ? 'contained' : 'outlined'}
                  color="primary"
                  size="small"
                  css={styles.categorieBtn}
                  onClick={() => setVendor(d.uuid)}
                  key={d.uuid}
                  selected
                >
                  {d.name}
                </Button>
              ))}
            </div>
            <div>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                css={styles.categorieClear}
                onClick={() => {
                  setCategorie('')
                  setVendor('')
                }}
              >
                清除篩選
              </Button>
            </div>
          </div>
          <TableContainer component={Paper} style={{ height: '60vh' }}>
            <Table>
              <TableHead>
                <TableRow css={styles.sticky}>
                  <TableCell padding="checkbox">
                    <Button />
                  </TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>類別</TableCell>
                  <TableCell>廠商</TableCell>
                  <TableCell>名稱</TableCell>
                  <TableCell>價格</TableCell>
                  <TableCell>數量</TableCell>
                  <TableCell>目前庫存</TableCell>
                  <TableCell>合計</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedCategorieId.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ textAlign: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="selected"
                            onChange={e => handleProductInputOnChange(e, index, product.id)}
                            checked={product.selected}
                            value={product.selected}
                            color="primary"
                          />
                        }
                      />
                    </TableCell>
                    <TableCell>{product.productNo}</TableCell>
                    <TableCell>
                      {product.productCategory !== null ? product.productCategory.name : ''}
                    </TableCell>
                    <TableCell>
                      {product.merchantVendor !== null ? product.merchantVendor.name : ''}
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell style={{ padding: '10px' }}>
                      <TextField
                        label="價格"
                        variant="outlined"
                        fullWidth
                        name="price"
                        onChange={e => handleProductInputOnChange(e, index, product.id)}
                        InputProps={{ inputProps: { min: 0 } }}
                        value={product.cost}
                        type="number"
                        style={{ width: '90px' }}
                      />
                    </TableCell>
                    <TableCell style={{ padding: '10px' }}>
                      <TextField
                        label="數量"
                        variant="outlined"
                        fullWidth
                        name="count"
                        onChange={e => handleProductInputOnChange(e, index, product.id)}
                        value={product.count}
                        InputProps={{ inputProps: { min: 0 } }}
                        type="number"
                        style={{ width: '90px' }}
                      />
                    </TableCell>
                    <TableCell>{product.remainingCount}</TableCell>
                    <TableCell>{product.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions css={styles.actions} style={{ padding: '0 24px' }}>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSelectProductsConfirm}
            css={styles.confirmAtTop}
          >
            確定
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={closeModal}
            style={{ marginLeft: '24px' }}
          >
            關閉
          </Button>
        </CardActions>
      </Card>
    </Dialog>
  )
}

ProductsModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

ProductsModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default ProductsModal
