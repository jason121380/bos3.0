/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  CardActions,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { red, blue } from '@mui/material/colors'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 700,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
    backgroundColor: 'rgb(var(--background))',
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    marginBottom: '5px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  categorieClear: css({
    backgroundColor: red[500],
    color: 'white',
    '&:hover': {
      backgroundColor: red[700],
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
  }),
  closeAtTop: css({
    margin: '16px 24px',
  }),
  confirmAtTop: css({
    margin: '16px 0px',
  }),
}

function ProductsModal({
  productsModalOpen,
  closeModal,
  productList,
  setProductList,
  productCategories,
  setSelectedCategorie,
  setSelectedCategorieName,
  selectedCategorie,
  selectedCategorieName,
  setSetting,
  setPicking,
  picking,
}) {
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')
  const [selectedCategorieId, setSelectedCategorieId] = useState([])
  const [clickedProduct, setClickedProduct] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])

  const handleClickCategorie = (categorieId, categorieName) => {
    const tmpArr = []
    if (categorieId) {
      productList
        .filter(product => product.productCategory.id === categorieId)
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
  }

  useEffect(() => {
    if (productList.length > 0) {
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
    const productForModified = _.cloneDeep(selectedCategorieId)
    switch (e.target.name) {
      case 'price':
        productForModified[index].price = parseInt(e.target.value) || 0
        productForModified[index].total = productForModified[index].price * productForModified[index].count
        const existedIndex = selectedProducts.map(d => d.productId).indexOf(id)
        if (existedIndex != -1) {
          selectedProducts[existedIndex].price = parseInt(e.target.value) || 1

          selectedProducts[existedIndex].total =
            parseInt(e.target.value) * selectedProducts[existedIndex].count
        }
        break
      case 'count':
        productForModified[index].count = parseInt(e.target.value) || 1
        productForModified[index].total = productForModified[index].count * productForModified[index].price
        const existedIndex1 = selectedProducts.map(d => d.productId).indexOf(id)
        if (existedIndex1 != -1) {
          selectedProducts[existedIndex1].count = parseInt(e.target.value) || 1
          selectedProducts[existedIndex1].total =
            parseInt(e.target.value) * selectedProducts[existedIndex1].price
        }
        break
      case 'selected':
        productForModified[index].selected = e.target.checked
        const existedIndex2 = selectedProducts.map(d => d.productId).indexOf(id)
        if (existedIndex2 != -1) {
          selectedProducts[existedIndex2].selected = e.target.checked
        } else {
          selectedProducts.push({
            productId: id,
            count: productForModified[index].count,
            price: productForModified[index].price,
            total: productForModified[index].total,
            productName: productForModified[index].productName,
            productNo: productForModified[index].productNo,
            unit: productForModified[index].unit,
            cost: productForModified[index].cost,
            selected: productForModified[index].selected,
          })
        }
        if (!e.target.checked) {
          selectedProducts.splice(existedIndex2, 1)
          productForModified[index].selected = false
        }
        break
      default:
        break
    }
    setSelectedCategorieId(productForModified)
  }

  const handleSelectProductsConfirm = () => {
    const input = []

    const productOutsideOfModal = picking.productList.filter(
      data => data.count > 0 && data.price > 0 && data.total > 0 && data.productName.length > 0
    )
    if (productOutsideOfModal.length > 0) {
      productOutsideOfModal.map(data => {
        input.push({
          count: data.count,
          price: data.price,
          total: data.total,
          productName: data.productName,
          productNo: data.productNo,
          unit: data.unit,
          cost: data.cost,
        })
      })
    }

    if (selectedProducts.length > 0) {
      selectedProducts.map(data => {
        input.push({
          count: data.count,
          price: data.price,
          total: data.total,
          productName: data.productName,
          productNo: data.productNo,
          unit: data.unit,
          cost: data.cost,
        })
      })

      setSelectedProducts()
      setPicking({ ...picking, productList: [...input] })
    } else {
      setPicking({
        ...picking,
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
  return (
    <Modal open={productsModalOpen}>
      <Card css={styles.root} className='EmployeePickingCreateProductsModal'>
        <div css={styles.header}>
          <CardHeader
            title={
              selectedCategorieName.length === 0 ? '所有商品' : `${categoryNameForDisplay}類商品`
            }
          />
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
        <CardContent style={{ backgroundColor: '#FFF' }}>
          <div css={styles.categorieDiv}>
            {productCategories.map(productCategory => (
              <Button
                variant="contained"
                color="primary"
                size="small"
                css={styles.categorieBtn}
                onClick={() => handleClickCategorie(productCategory.id, productCategory.name)}
                disabled={selectedCategorie.indexOf(productCategory.id) !== -1}
                key={productCategory.id}
              >
                {productCategory.name}
              </Button>
            ))}
            <Button
              variant="contained"
              size="small"
              color="secondary"
              css={styles.categorieClear}
              onClick={() => handleClickCategorie(null, null)}
            >
              清除篩選
            </Button>
          </div>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Button />
                  </TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>價格</TableCell>
                  <TableCell>數量</TableCell>
                  <TableCell>類別</TableCell>
                  <TableCell>名稱</TableCell>
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
                    <TableCell>
                      {product.productNo === null || product.productNo === ''
                        ? '無代號'
                        : product.productNo}
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="價格"
                        variant="outlined"
                        fullWidth
                        name="price"
                        onChange={e => handleProductInputOnChange(e, index, product.id)}
                        value={product.price}
                        type="number"
                        style={{ width: '90px', margin: '10px 0 5px 0' }}
                        onWheel={() => document.activeElement.blur()}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        className='displayArrow'
                        label="數量"
                        variant="outlined"
                        fullWidth
                        name="count"
                        onChange={e => handleProductInputOnChange(e, index, product.id)}
                        value={product.count}
                        type="number"
                        style={{ width: '90px' }}
                        onWheel={() => document.activeElement.blur()}
                      />
                    </TableCell>
                    <TableCell>
                      {product.productCategory !== null ? product.productCategory.name : ''}
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions css={styles.actions}>
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
    </Modal>
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
