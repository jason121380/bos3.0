import { TablePagination } from 'ui/pagination-compat'
import { Modal } from 'ui/modal-compat'
import { Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader, CardContent, CardActions } from 'ui/card-compat'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import idx from 'idx'
import pagenationLabel from './../../helper/pagenationLabel'

// 原 emotion styles 逐值轉 Tailwind（theme.shadows[20] 原值照抄；red／blue 取自 ui/colors：red[500] #f44336、red[700] #d32f2f、
// blue[500] #2196f3、blue[700] #1976d2；原 `!important` 以 `!` 前綴保留）。未使用的 birthday／inner／categorieClear／confirmBtn 不轉
const styles = {
  root: 'absolute top-[50%] left-[50%] [transform:translate(-50%,-50%)] [outline:none] [box-shadow:0px_10px_13px_-6px_rgba(0,0,0,0.2),0px_20px_31px_3px_rgba(0,0,0,0.14),0px_8px_38px_7px_rgba(0,0,0,0.12)] w-[700px] max-h-full overflow-y-auto max-w-full',
  actions: 'justify-end',
  categorieDiv: 'mb-[5px]',
  header: 'flex justify-between items-center',
  categorieBtn: 'm-[3px]',
  clickedCategorieBtn: 'm-[3px] text-[white]',
  addBtn: 'bg-[#2196f3] text-[white] hover:bg-[#1976d2]',
  closeAtTop: 'm-[16px_24px]',
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
      <Card className={styles.root}>
        <div className={styles.header}>
          <CardHeader
            title={
              selectedCategorieName.length === 0 ? '所有商品' : `${categoryNameForDisplay}類商品`
            }
          />
          <Button
            color="primary"
            variant="contained"
            onClick={closeModal}
            className={styles.closeAtTop}
          >
            關閉
          </Button>
        </div>

        <div className="h-px bg-border" />
        <CardContent>
          <div className={styles.categorieDiv}>
            {productCategories.map(productCategory => (
              <Button
                variant={
                  selectedCategorie.indexOf(productCategory.id) !== -1 ? 'contained' : 'outlined'
                }
                color="primary"
                size="small"
                className={
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
                        className={styles.addBtn}
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
        <CardActions className={styles.actions}>
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
