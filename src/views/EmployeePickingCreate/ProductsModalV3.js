import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { Button } from 'ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Checkbox } from 'ui/checkbox'
import { Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

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

    tmpArr.forEach((product, index) => {
      product.selected = false
    })

    tmpArr.forEach((product, index) => {
      selectedProducts.forEach((selectedProduct, selectedProductindex) => {
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
    const productForModified = cloneDeep(selectedCategorieId)
    switch (e.target.name) {
      case 'price':
        productForModified[index].price = parseInt(e.target.value, 10) || 0
        productForModified[index].total = productForModified[index].price * productForModified[index].count
        const existedIndex = selectedProducts.map(d => d.productId).indexOf(id)
        if (existedIndex !== -1) {
          selectedProducts[existedIndex].price = parseInt(e.target.value, 10) || 1

          selectedProducts[existedIndex].total =
            parseInt(e.target.value, 10) * selectedProducts[existedIndex].count
        }
        break
      case 'count':
        productForModified[index].count = parseInt(e.target.value, 10) || 1
        productForModified[index].total = productForModified[index].count * productForModified[index].price
        const existedIndex1 = selectedProducts.map(d => d.productId).indexOf(id)
        if (existedIndex1 !== -1) {
          selectedProducts[existedIndex1].count = parseInt(e.target.value, 10) || 1
          selectedProducts[existedIndex1].total =
            parseInt(e.target.value, 10) * selectedProducts[existedIndex1].price
        }
        break
      case 'selected':
        productForModified[index].selected = e.target.checked
        const existedIndex2 = selectedProducts.map(d => d.productId).indexOf(id)
        if (existedIndex2 !== -1) {
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
      productOutsideOfModal.forEach(data => {
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
      selectedProducts.forEach(data => {
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
    // 舊版 Modal 未設 onClose（點背景／Esc 不關閉），故不傳 onOpenChange；hideClose 保留原關閉鈕，寬度保留原 700px；className 保留 scss 掛點
    <Dialog open={productsModalOpen}>
      <DialogContent size="md" className="EmployeePickingCreateProductsModal max-w-[700px]" hideClose aria-describedby={undefined}>
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <DialogTitle>
            {selectedCategorieName.length === 0 ? '所有商品' : `${categoryNameForDisplay}類商品`}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleSelectProductsConfirm}
            >
              確定
            </Button>
            <Button
              variant="ghost"
              onClick={closeModal}
            >
              關閉
            </Button>
          </div>
        </DialogHeader>

        <DialogBody className="border-0 border-t border-solid border-border">
          <div className="mb-3 flex flex-wrap gap-2">
            {productCategories.map(productCategory => (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleClickCategorie(productCategory.id, productCategory.name)}
                disabled={selectedCategorie.indexOf(productCategory.id) !== -1}
                key={productCategory.id}
              >
                {productCategory.name}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              onClick={() => handleClickCategorie(null, null)}
            >
              清除篩選
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                </TableHead>
                <TableHead>代號</TableHead>
                <TableHead>價格</TableHead>
                <TableHead>數量</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>合計</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedCategorieId.map((product, index) => (
                <TableRow key={index} data-state={product.selected ? 'selected' : undefined}>
                  <TableCell className="text-center">
                    <Checkbox
                      aria-label={`選取 ${product.productName}`}
                      name="selected"
                      onChange={e => handleProductInputOnChange(e, index, product.id)}
                      checked={product.selected}
                      value={product.selected}
                    />
                  </TableCell>
                  <TableCell>
                    {product.productNo === null || product.productNo === ''
                      ? '無代號'
                      : product.productNo}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="price"
                      aria-label="價格"
                      onChange={e => handleProductInputOnChange(e, index, product.id)}
                      value={product.price}
                      className="mb-[5px] mt-2.5 w-[90px]"
                      onWheel={() => document.activeElement.blur()}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      name="count"
                      aria-label="數量"
                      onChange={e => handleProductInputOnChange(e, index, product.id)}
                      value={product.count}
                      className="w-[90px]"
                      onWheel={() => document.activeElement.blur()}
                    />
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {product.productCategory !== null ? product.productCategory.name : ''}
                  </TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell numeric>{formatNumber(product.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={closeModal}
          >
            關閉
          </Button>
          <Button
            variant="primary"
            onClick={handleSelectProductsConfirm}
          >
            確定
          </Button>
        </DialogFooter>
      </DialogContent>
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
