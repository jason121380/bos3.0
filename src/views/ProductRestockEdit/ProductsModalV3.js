// MUI Dialog 保留：舊版無 onClose（點背景、Esc 不會關閉），且內含 MUI TextField（ToggleButton 已改 ui/toggle-group）
import {
  TextField,
   Dialog
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { openSnackbar } from 'elements/snackbars'
import _ from 'lodash'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Button } from 'ui/button'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

function ProductsModal({
  productsModalOpen,
  closeModal,
  productList,
  productCategories,
  selectedCategorie,
  selectedCategorieName,
  setPurchaseRecords,
  purchaseRecords,
}) {
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')
  const [selectedCategorieId, setSelectedCategorieId] = useState([])
  const [clickedProduct, setClickedProduct] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [categorie, setCategorie] = useState('')
  const [sortType, setSortType] = useState('NO')

  useEffect(() => {
    const tmpArr = []
    if (categorie !== '') {
      productList
        .filter(product => product.productCategory.id === categorie)
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
  }, [categorie])

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
    const productOutsideOfModal = purchaseRecords.purchaseProduct.filter(data => data.productID)
    if (productOutsideOfModal.length > 0) {
      productOutsideOfModal.map(data => {
        input.push({
          productID: data.productID,
          productName: data.productName,
          count: data.count,
          unitPrice: data.unitPrice,
        })
      })
    }
    if (selectedProducts.length > 0) {
      selectedProducts.map(data => {
        input.push({
          productID: data.productId,
          productName: data.productName,
          count: data.count,
          unitPrice: data.cost,
        })
      })
      setSelectedProducts()
      setPurchaseRecords({ ...purchaseRecords, purchaseProduct: [...input] })
    }
    closeModal()
  }

  const Header = () => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-heading text-text">
        {selectedCategorieName.length === 0 ? '所有商品' : `${categoryNameForDisplay}類商品`}
      </span>
      <ToggleGroup
        size="small"
        exclusive
        value={sortType}
        onChange={(e, v) => v && setSortType(v)}
      >
        <ToggleGroupItem value='NO'>編號</ToggleGroupItem>
        <ToggleGroupItem value='STOCK_DESC'>庫存多到少</ToggleGroupItem>
        <ToggleGroupItem value='STOCK_ASC'>庫存少到多</ToggleGroupItem>
      </ToggleGroup>

    </div>
  )
  // 篩選鈕的選取狀態（舊版以 contained / outlined 區分）
  const chipClass = active => cn('h-7 px-3', active && 'bg-accent/8 text-accent hover:bg-accent/8')

  return (
    <Dialog maxWidth='md' open={productsModalOpen}>
      <div className="ui-root flex flex-col bg-background">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Header/>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="primary"
              onClick={handleSelectProductsConfirm}
            >
              確定
            </Button>
            <Button
              variant="secondary"
              onClick={closeModal}
            >
              關閉
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />
        <div className="flex flex-col gap-3 px-6 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {productCategories.map(productCategory => (
              <Button
                size="sm"
                variant="secondary"
                className={chipClass(productCategory.id === categorie)}
                aria-pressed={productCategory.id === categorie}
                onClick={() => setCategorie(productCategory.id)}
                disabled={selectedCategorie.indexOf(productCategory.id) !== -1}
                key={productCategory.id}
              >
                {productCategory.name}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCategorie('')}
            >
              清除篩選
            </Button>
          </div>
          <Table wrapperClassName="h-[60vh] overflow-auto">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12" aria-label="選取" />
                <TableHead>代號</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead>價格</TableHead>
                <TableHead>數量</TableHead>
                <TableHead numeric>目前庫存</TableHead>
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
                  <TableCell className="tabular-nums">{product.productNo}</TableCell>
                  <TableCell>
                    {product.productCategory !== null ? product.productCategory.name : ''}
                  </TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell className="py-2.5">
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
                  <TableCell className="py-2.5">
                    <TextField
                      label="數量"
                      variant="outlined"
                      fullWidth
                      name="count"
                      onChange={e => handleProductInputOnChange(e, index, product.id)}
                      defaultValue="0"
                      InputProps={{ inputProps: { min: 0 } }}
                      // value={product.count}
                      type="number"
                      style={{ width: '90px' }}
                    />
                  </TableCell>
                  <TableCell numeric>{product.remainingCount}</TableCell>
                  <TableCell numeric>{product.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end gap-2 border-0 border-t border-solid border-border px-6 py-4">
          <Button
            variant="primary"
            onClick={handleSelectProductsConfirm}
          >
            確定
          </Button>
          <Button
            variant="secondary"
            onClick={closeModal}
          >
            關閉
          </Button>
        </div>
      </div>
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
