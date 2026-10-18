/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
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
  TablePagination,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { red, blue } from '@mui/material/colors'
import idx from 'idx'
import pagenationLabel from './../../helper/pagenationLabel'
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
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
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
    color: 'white !important',
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
}

function ProductsModal({
  productsModalOpen,
  productList,
  productCategories,
  closeModal,
  selectedCategorie,
  setSelectedCategorie,
  selectedCategorieName,
  setSelectedCategorieName,
  setSetting,
  onProductChange,
  sells,
  productLength,
  sellsItem,
  onPageChange,
  setProductsModalOpen,
}) {
  const pageRef = useRef(null)
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')
  const handleClickCategorie = (categorieId, categorieName) => {
    setSelectedCategorieName([categorieName])
    setSelectedCategorie([categorieId])
    setSetting(pre => {
      return {
        ...pre,
        categoryIds: [categorieId],
      }
    })
  }

  const handleSelectProduct = selectProduct => {
    idx(selectProduct, _ => {
      onProductChange({
        index: productLength === 1 && sells[0].productId === '' ? 0 : productLength,
        value: {
          ...sellsItem,
          productId: _.id,
          price: _.sellPrice,
          count: 1,
          isLocked: _.isLocked,
        },
      })
    })
    setProductsModalOpen(false)
  }

  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setSelectedCategorieName('')
    setSetting({
      keyword: '',
      categoryIds: [],
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (pageRef.current) {
        pagenationLabel(pageRef.current)
        clearInterval(timer)
      }
    }, 100);

    const clearTimer = setTimeout(() => {
      clearInterval(timer)
    }, 1000);

    return () => {
      clearInterval(timer)
      clearTimeout(clearTimer)
    }
  }, [productsModalOpen, productList])

  useEffect(() => {
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
  }, [selectedCategorieName])

  const handleOnChangePage = (_event, nextPage) => {
    onPageChange({
      value: nextPage,
      key: 'pageOffset',
    })
  }

  const handleOnChangeRowsPerPage = event => {
    onPageChange({
      value: event.target.value,
      key: 'pageLimit',
    })
  }

  return (
    <Modal open={productsModalOpen}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader
            title={
              selectedCategorieName.length === 0 ? '所有商品' : `${categoryNameForDisplay}類商品`
            }
          />
          <Button
            color="primary"
            variant="contained"
            onClick={closeModal}
            css={styles.closeAtTop}
          >
            關閉
          </Button>
        </div>

        <div className="h-px bg-border" />
        <CardContent>
          <div css={styles.categorieDiv}>
            {productCategories.map(productCategory => (
              <Button
                variant={
                  selectedCategorie.indexOf(productCategory.id) !== -1 ? 'contained' : 'outlined'
                }
                color="primary"
                size="small"
                css={
                  selectedCategorie.indexOf(productCategory.id) !== -1
                    ? styles.clickedCategorieBtn
                    : styles.categorieBtn
                }
                onClick={() => handleClickCategorie(productCategory.id, productCategory.name)}
                key={productCategory.id}
                style={
                  selectedCategorie.indexOf(productCategory.id) === -1 ? {} : { color: 'white' }
                }
              >
                {productCategory.name}
              </Button>
            ))}
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={handleClearCategorie}
            >
              清除
            </Button>
          </div>
          <p className="m-0 mb-1.5 text-body text-text-secondary">
            {productList.totalCount} 項商品
          </p>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Button />
                  </TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>類別</TableCell>
                  <TableCell>名稱</TableCell>
                  <TableCell>參考價格</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productList.data.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell padding="checkbox">
                      <Button
                        size="small"
                        onClick={() => handleSelectProduct(product)}
                        css={styles.addBtn}
                      >
                        加入
                      </Button>
                    </TableCell>
                    <TableCell>{product.no}</TableCell>
                    <TableCell>
                      {product.productCategory !== null ? product.productCategory.name : ''}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sellPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={productList.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={productList.pageOffset}
            rowsPerPage={productList.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
          <Button onClick={closeModal} color="primary" variant="contained">
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
