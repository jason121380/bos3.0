import { Modal } from 'ui/modal-compat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from 'ui/card'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import idx from 'idx'
import pagenationLabel from './../../helper/pagenationLabel'
import { formatNumber } from 'ui/format'

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
      <Card className="absolute left-1/2 top-1/2 max-h-[calc(100%-32px)] w-[700px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background shadow-float outline-none">
        <CardHeader
          className="items-center pb-4"
          action={
            <Button variant="secondary" size="sm" onClick={closeModal}>
              關閉
            </Button>
          }
        >
          <CardTitle>
            {selectedCategorieName.length === 0 ? '所有商品' : `${categoryNameForDisplay}類商品`}
          </CardTitle>
        </CardHeader>

        <div className="h-px bg-border" />
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {productCategories.map(productCategory => (
              <Button
                variant={
                  selectedCategorie.indexOf(productCategory.id) !== -1 ? 'primary' : 'secondary'
                }
                size="sm"
                onClick={() => handleClickCategorie(productCategory.id, productCategory.name)}
                key={productCategory.id}
              >
                {productCategory.name}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={handleClearCategorie}>
              清除
            </Button>
          </div>
          <p className="mb-2 mt-0 text-caption text-text-secondary">
            {productList.totalCount} 項商品
          </p>
          <Table dense>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px">
                  <Button variant="ghost" size="sm" />
                </TableHead>
                <TableHead>代號</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>參考價格</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productList.data.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="w-px">
                    <Button variant="primary" size="sm" onClick={() => handleSelectProduct(product)}>
                      加入
                    </Button>
                  </TableCell>
                  <TableCell>{product.no}</TableCell>
                  <TableCell>
                    {product.productCategory !== null ? product.productCategory.name : ''}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell numeric>{formatNumber(product.sellPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-wrap">
          <TablePagination
            ref={pageRef}
            className="pt-0"
            labelRowsPerPage='每頁顯示數量'
            count={productList.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={productList.pageOffset}
            rowsPerPage={productList.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
          <Button variant="secondary" onClick={closeModal}>
            關閉
          </Button>
        </CardFooter>
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
