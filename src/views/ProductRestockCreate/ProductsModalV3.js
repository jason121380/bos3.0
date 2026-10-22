// 外框已換 ui/dialog：舊版無 onClose（點背景、Esc 不會關閉），故不傳 onOpenChange；內含 MUI TextField 本體與價格/數量 handler 原樣（無彈出層），ToggleButton 已改 ui/toggle-group
import { TextField } from 'ui/text-field'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { openSnackbar } from 'elements/snackbars'
import cloneDeep from 'lodash/cloneDeep'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Button } from 'ui/button'
import { Dialog, DialogContent } from 'ui/dialog'
import { Checkbox } from 'ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'
import { formatNumber } from 'ui/format'

function ProductsModal({
  productsModalOpen,
  closeModal,
  productList,
  productCategories,
  selectedCategorie,
  setPurchaseRecords,
  purchaseRecords,
  vendorOptions,
}) {
  const [selectedCategorieId, setSelectedCategorieId] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [categorie, setCategorie] = useState('')
  const [vendor, setVendor] = useState('')
  const [sortType, setSortType] = useState('NO')

  useEffect(() => {
    const tmpArr = []

    if (!!categorie && !!vendor) {
      productList.filter(product => product.merchantVendor !== null &&
        product.merchantVendor.merchantVendorUUId === vendor &&
        product.productCategory !== null && product.productCategory.id === categorie).map(product => tmpArr.push(product))
    } else if (!!categorie && vendor === '') {
      productList.filter(product => product.productCategory !== null && product.productCategory.id === categorie)
        .map(product => tmpArr.push(product))
    } else if (!!vendor && categorie === '') {
      productList
        .filter(product => product.merchantVendor !== null && product.merchantVendor.merchantVendorUUId === vendor)
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

  }, [vendor, categorie])

  useEffect(() => {
    const cloneData = cloneDeep(selectedCategorieId)
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
      productList.forEach(d => {
        d.price = 0
        d.count = 0
        d.total = 0
      })
      setSelectedCategorieId(productList)
    }
  }, [productList.loading])

  const handleProductInputOnChange = (e, index, id) => {
    if (e.target.value < 0) {
      e.target.value = 0
      openSnackbar({ message: '請輸入0以上的數字', variant: 'warning' })
    }
    const productForModified = cloneDeep(selectedCategorieId)
    productForModified.forEach((product, index2) => {
      if (index === index2) {
        switch (e.target.name) {
          case 'price':
            const priceValue = +e.target.value || 0
            product.cost = priceValue
            product.total = priceValue * product.count
            const existedIndex = selectedProducts.map(d => d.productId).indexOf(id)
            if (existedIndex !== -1) {
              // 已勾選的商品與清單上顯示的進貨價一致（原本 0 會變成 1、小數被捨去，與「先改價格再勾選」的結果不同）
              selectedProducts[existedIndex].cost = priceValue

              selectedProducts[existedIndex].total = priceValue * selectedProducts[existedIndex].count
            }

            break
          case 'count':
            const countValue = +e.target.value || 0
            product.count = countValue || 1
            product.total = countValue * product.cost
            const existedIndex1 = selectedProducts.map(d => d.productId).indexOf(id)
            if (existedIndex1 !== -1) {
              // 與清單上顯示的數量一致（原本小數被捨去，與「先改數量再勾選」的結果不同）
              selectedProducts[existedIndex1].count = product.count
              selectedProducts[existedIndex1].total = product.count * selectedProducts[existedIndex1].cost
            }

            break
          case 'selected':
            product.selected = e.target.checked
            const existedIndex2 = selectedProducts.map(d => d.productId).indexOf(id)
            if (existedIndex2 !== -1) {
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
      productOutsideOfModal.forEach(data => {
        input.push({
          productId: data.productId,
          count: data.count,
          unitPrice: data.unitPrice,
        })
      })
    }
    if (selectedProducts.length > 0) {
      selectedProducts.forEach(data => {
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
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-heading text-text">
        所有商品
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
    // 舊版 Dialog 無 onClose，故不傳 onOpenChange；hideClose 保留原關閉鈕，寬度以 className 保留 MUI md（960px）
    <Dialog open={productsModalOpen}>
      <DialogContent size="lg" className="max-w-[960px]" hideClose aria-describedby={undefined}>
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
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
              </div>
              <div className="h-px bg-border" />
              <div className="flex flex-wrap gap-1.5">
                {vendorOptions.map(d => (
                  <Button
                    size="sm"
                    variant="secondary"
                    className={chipClass(d.uuid === vendor)}
                    aria-pressed={d.uuid === vendor}
                    onClick={() => setVendor(d.uuid)}
                    key={d.uuid}
                  >
                    {d.name}
                  </Button>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0"
              onClick={() => {
                setCategorie('')
                setVendor('')
              }}
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
                <TableHead>廠商</TableHead>
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
                  <TableCell>
                    {/* 新增進貨的商品都已綁定廠商（General 只列有廠商的商品） */}
                    {product.merchantVendor.name}
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
                      value={product.count}
                      InputProps={{ inputProps: { min: 0 } }}
                      type="number"
                      style={{ width: '90px' }}
                    />
                  </TableCell>
                  <TableCell numeric>{formatNumber(product.remainingCount)}</TableCell>
                  <TableCell numeric>{formatNumber(product.total)}</TableCell>
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
      </DialogContent>
    </Dialog>
  )
}

ProductsModal.propTypes = {
  productsModalOpen: PropTypes.bool,
  closeModal: PropTypes.func,
}

export default ProductsModal
