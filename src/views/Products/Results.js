// 分頁使用 ui/table TablePagination（pagenationLabel 找不到 MUI class 即不動作，ui 版自帶中文筆數文字）
import { Link } from 'react-router-dom';
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteProducts from 'hooks/useFetchDeleteProducts'
import format from 'date-fns/format'
import { useState, useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import idx from 'idx'
import useFetchProductCategories from 'hooks/useFetchProductCategories'
import useFetchSettingMultipleUpdateProductCategory from 'hooks/useFetchSettingMultipleUpdateProductCategory'
import useFetchGetProductCostIsDisplayInProductReport from 'hooks/useFetchGetProductCostIsDisplayInProductReport' // 成本顯示判斷
import useFetchSetMultipleUpdateProductIsPublished from 'hooks/useFetchSetMultipleUpdateProductIsPublished'
import useFetchSetMultipleUpdateProductVendor from 'hooks/useFetchSetMultipleUpdateProductVendor'
import { useFetchGetMerchantVendorList } from 'hooks/useFetchGetVendor'
import pagenationLabel from './../../helper/pagenationLabel'
import { Copy, Download, Pencil } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Checkbox } from 'ui/checkbox'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { formatNumber } from 'ui/format'
import { Field, Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

import ProdudctDrawer from './ProdudctDrawer';

import EditProductsCategoryModal from './EditProductsCategoryModal'
import PublishedDialog from './PublishedDialog';
import VendorDialog from './VendorDialog'
function Results({ className = '', products, refetchProducts, onPageChange, ...rest }) {
  const pageRef = useRef(null)
  const { setProductsCategory } = useFetchSettingMultipleUpdateProductCategory()
  const { setPublished } = useFetchSetMultipleUpdateProductIsPublished()
  const { setVendor } = useFetchSetMultipleUpdateProductVendor()
  const { delProducts } = useFetchDeleteProducts()
  const passwordData = useFetchMerchantPassword()
  const productCategoriesData = useFetchProductCategories()
  const producCostIsDisplayData = useFetchGetProductCostIsDisplayInProductReport()
  const merchantVendorList = useFetchGetMerchantVendorList()
  const isDisplayCost = idx(producCostIsDisplayData, _ => _.data.getIsProductCostDisplay)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [deleteOrderPwd, setDeleteOrderPwd] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [disableDeleteProduct, setDisableDeleteProduct] = useState(false)
  const [openEditProductsCategoryModal, setOpenEditProductsCategoryModal] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [openVendorDialog, setOpenVendorDialog] = useState(false)
  const [productCategories, setProductCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [excelData, setExcelData] = useState([])
  const [isPublished, setIsPublished] = useState(true)
  const [merchantVendorId, setMerchantVendorId] = useState('')
  const [isClick, setIsClick] = useState(false)

  const handleSelectAll = event => {
    const newSelectedPayment = event.target.checked
      ? products.data.filter(d => d.isUsing).map(payment => payment.id)
      : []
    setSelectedProducts(newSelectedPayment)
  }

  const handleSelectOne = id => {
    const newSelect = [...selectedProducts], index = newSelect.indexOf(id)
    if (index > -1) {
      newSelect.splice(index, 1)
    } else {
      newSelect.push(id)
    }
    setSelectedProducts(newSelect)
  }

  // 只有需要刪除密碼時才由批次操作列呼叫（不需要時直接 handleConfirmCancel）
  const handleCancel = () => {
    setOpenDialog(true)
  }

  const handleConfirmCancel = () => {
    delProducts(
      disableDeleteProduct
        ? { itemIds: selectedProducts, password: deleteOrderPwd }
        : { itemIds: selectedProducts }
    )
      .then(() => {
        setSelectedProducts([])
        setOpenDialog(false)
        setDeleteOrderPwd('')
        refetchProducts()
        openSnackbar({ message: '成功刪除商品', variant: 'success' })
      })
      .catch(err => {
        setSelectedProducts([])
        setOpenDialog(false)
        setDeleteOrderPwd('')
      })
  }

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

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleUpdateProductsCategory = () => {
    const sub = {
      productIds: selectedProducts,
      categoryId: selectedCategoryId,
    }
    setProductsCategory({ input: sub })
      .then(() => {
        setSelectedProducts([])
        setSelectedCategoryId('')
        setOpenEditProductsCategoryModal(false)
        refetchProducts()
        openSnackbar({ message: '編輯商品類別成功', variant: 'success' })
      })
      .catch(err => {
        setSelectedProducts([])
        setSelectedCategoryId('')
        setOpenEditProductsCategoryModal(false)
      })
  }

  const handleClosePublishDialog = () => {
    setOpenPublishDialog(false)
    setOpenVendorDialog(false)
    setIsPublished(true)
    setSelectedProducts([])
    setMerchantVendorId('')
  }

  const handleSetPublished = async () => {
    setIsClick(true)
    try {
      await setPublished({
        input: {
          productIds: selectedProducts,
          isPublished
        }
      })
      openSnackbar({
        variant: 'success',
        message: '設定成功'
      })
      handleClosePublishDialog()
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    } finally {
      setIsClick(false)
    }
  }
  const handleSetVendor = async () => {
    setIsClick(true)
    try {
      await setVendor({
        input: {
          productIds: selectedProducts,
          MerchantVendorId: merchantVendorId
        }
      })
      openSnackbar({
        variant: 'success',
        message: '設定成功'
      })
      handleClosePublishDialog()
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
    } finally {
      setIsClick(false)
    }
  }

  useEffect(() => {
    if (!passwordData.loading) {
      const disableDeleteProduct = idx(
        passwordData,
        _ => _.data.merchantPassword.deleteProduct.isUsing
      )
      setDisableDeleteProduct(disableDeleteProduct)
    }
  }, [passwordData.loading])

  useEffect(() => {
    if (!productCategoriesData.loading) {
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories) || []
      setProductCategories(productCategories)
    }
  }, [productCategoriesData.loading])

  useEffect(() => {
    refetchProducts()
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [products, pageRef.current])

  useEffect(() => {
    const excelData = []
    products.data.forEach(data => {
      // 成本顯示判斷
      if (isDisplayCost === false) {
        excelData.push({
          代號: data.no,
          類別: data.productCategory === null ? '未分類' : data.productCategory.name,
          名稱: data.name,
          單位: data.stockUnit,
          價格: data.sellPrice,
          自購價格: data.employeePrice,
          變更者: data.creator !== null ? data.creator.name : '',
          變更時間: format(data.updatedAt, 'yyyy/MM/dd'),
        })
      } else {
        excelData.push({
          代號: data.no,
          類別: data.productCategory === null ? '未分類' : data.productCategory.name,
          名稱: data.name,
          成本: data.cost,
          單位: data.stockUnit,
          價格: data.sellPrice,
          自購價格: data.employeePrice,
          變更者: data.creator !== null ? data.creator.name : '',
          變更時間: format(data.updatedAt, 'yyyy/MM/dd'),
        })
      }
    })
    setExcelData(excelData)
  }, [products, isDisplayCost])

  const usingCount = products.data.filter(d => d.isUsing).length
  // 停用商品的編輯連結：連結無 disabled 屬性，比照舊版 IconButton disabled 改用 aria-disabled + 取消指標事件
  const linkDisabled = disabledLink => (disabledLink ? { 'aria-disabled': true, tabIndex: -1, className: 'pointer-events-none opacity-40' } : {})
  return (
    <div {...rest} className={className}>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="商品列表.csv" className="no-underline">
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>所有商品</CardTitle>
            <span className="text-label tabular-nums text-text-secondary">
              共 {products.totalCount} 筆資料
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-2">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    aria-label="全選"
                    // 全選只選啟用中的商品，勾選狀態也以啟用中的筆數比對（原本與全部筆數比，有停用商品時永遠是半選、無法一鍵取消）
                    checked={selectedProducts.length === usingCount && usingCount > 0}
                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < usingCount}
                    onChange={handleSelectAll}
                    disabled={
                      products.data.length === 0 ||
                      products.data.filter(d => !d.isUsing).length === products.data.length
                    }
                  />
                </TableHead>
                <TableHead>代號</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>名稱</TableHead>
                {/* 成本顯示判斷 */}
                {isDisplayCost && <TableHead numeric>成本</TableHead>}
                <TableHead>單位</TableHead>
                <TableHead numeric>價格</TableHead>
                <TableHead numeric>自購價格</TableHead>
                <TableHead>變更者</TableHead>
                <TableHead>變更時間</TableHead>
                <TableHead>副本</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.data.map((data, idx) => (
                <TableRow
                  key={`product-${data.name}-${idx}`}
                  data-state={selectedProducts.indexOf(data.id) > -1 || !data.isUsing ? 'selected' : undefined}
                  data-testid="product-row"
                >
                  <TableCell className="w-12">
                    <Checkbox
                      aria-label={`選取 ${data.name}`}
                      checked={selectedProducts.indexOf(data.id) > -1}
                      onChange={() => handleSelectOne(data.id)}
                      data-testid={`product-${data.name}-checkbox`}
                    />
                  </TableCell>
                  <TableCell className="tabular-nums">{data.no === null ? '無代號' : data.no}</TableCell>
                  <TableCell>
                    {data.productCategory === null ? '未分類' : data.productCategory.name}
                  </TableCell>
                  <TableCell className="font-medium">{data.name}</TableCell>
                  {/* 成本顯示判斷 */}
                  {isDisplayCost && <TableCell numeric>{formatNumber(data.cost)}</TableCell>}
                  <TableCell>{data.stockUnit}</TableCell>
                  <TableCell numeric>{formatNumber(data.sellPrice)}</TableCell>
                  <TableCell numeric>{formatNumber(data.employeePrice)}</TableCell>
                  <TableCell>{data.creator !== null ? data.creator.name : ''}</TableCell>
                  <TableCell className="tabular-nums">{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon" className="text-text-secondary">
                      <Link to={`product/duplicate/${data.id}`} aria-label="複製商品">
                        <Copy strokeWidth={1.75} />
                      </Link>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" className="text-text-secondary">
                      <RouterLink
                        aria-label="編輯商品"
                        to={`/product/edit/${data.id}`}
                        {...linkDisabled(!data.isUsing)}
                      >
                        <Pencil strokeWidth={1.75} />
                      </RouterLink>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end px-3 pb-2">
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            count={products.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={products.pageOffset}
            rowsPerPage={products.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </div>
      </Card>
      <ProdudctDrawer
        selectedProducts={selectedProducts}
        disableDeleteProduct={disableDeleteProduct}
        handleCancel={handleCancel}
        handleConfirmCancel={handleConfirmCancel}
        setOpenPublishDialog={setOpenPublishDialog}
        setOpenEditProductsCategoryModal={setOpenEditProductsCategoryModal}
        setOpenVendorDialog={setOpenVendorDialog}
      />
      <PublishedDialog
        open={openPublishDialog}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        handleClosePublishDialog={handleClosePublishDialog}
        handleSetPublished={handleSetPublished}
        isClick={isClick}
      />
      <VendorDialog
        open={openVendorDialog}
        handleClosePublishDialog={handleClosePublishDialog}
        handleSetVendor={handleSetVendor}
        isClick={isClick}
        merchantVendorId={merchantVendorId}
        setMerchantVendorId={setMerchantVendorId}
        option={idx(merchantVendorList, _ => _.data.getMerchantVendorList) || []}
      />
      <Dialog
        open={openDialog}
        onOpenChange={o => !o && handleCloseDialog()}
      >
        <DialogContent size="sm" aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogHeader>
            <DialogTitle id="alert-dialog-title">{'刪除商品'}</DialogTitle>
            <DialogDescription id="alert-dialog-description">刪除後商品將從列表移除，請輸入刪除密碼確認。</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="刪除密碼" htmlFor="delete-product-password">
              <Input
                id="delete-product-password"
                type="password"
                value={deleteOrderPwd}
                onChange={event => setDeleteOrderPwd(event.target.value)}
                data-testid="delete-password"
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel} autoFocus data-testid="confirm">
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {openEditProductsCategoryModal && (
        <EditProductsCategoryModal
          openEditProductsCategoryModal={openEditProductsCategoryModal}
          onClose={() => setOpenEditProductsCategoryModal(false)}
          productCategories={productCategories}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          handleUpdateProductsCategory={handleUpdateProductsCategory}
        />
      )}
    </div>
  )
}

export default Results
