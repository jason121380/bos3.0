/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Checkbox, Divider, Table,
  TableBody, TableCell, TableHead, TableRow, Typography, CardActions,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogContentText,
  TextField, DialogActions, IconButton, Select, FormControl, MenuItem
} from '@mui/material'
import { Link } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import { openSnackbar } from 'elements/snackbars'
import useFetchDeleteProducts from 'hooks/useFetchDeleteProducts'
import format from 'date-fns/format'
import { useState, useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ProdudctDrawer from './ProdudctDrawer';

import styles from './styles/Results'
import EditProductsCategoryModal from './EditProductsCategoryModal'
import PublishedDialog from './PublishedDialog';
import VendorDialog from './VendorDialog'
const localStyles = {
  card: css({
    borderRadius: '16px',
    boxShadow: 'none',
    border: '1px solid rgb(var(--border))',
    backgroundColor: 'rgb(var(--background))',
    overflow: 'hidden',
  }),
  content: css({
    padding: 0,
  }),
  tableHead: css({
    backgroundColor: 'rgb(var(--background))',
    '& .MuiTableCell-head': {
      color: 'rgb(var(--text))',
      fontWeight: 'bold',
      borderBottom: '1px solid rgb(var(--border))',
      height: '40px !important',
      padding: '2px 16px !important',
      fontSize: '14px',
    }
  }),
  tableRow: css({
    height: '40px !important',
    minHeight: '40px !important',
    '& .MuiTableCell-body': {
      padding: '2px 16px !important',
      borderBottom: '1px solid rgb(var(--border))',
      fontSize: '14px !important',
      color: 'rgb(var(--text))',
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    },
  }),
  pillButton: css({
    borderRadius: '20px !important',
    padding: '4px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    height: '32px !important',
  }),
  secondaryPill: css({
    backgroundColor: 'rgb(var(--surface)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    }
  }),
  actionButton: css({
    color: 'rgb(var(--text-tertiary))',
    padding: '4px',
    '&:hover': {
      color: 'rgb(var(--accent))',
      backgroundColor: 'rgba(26, 115, 232, 0.04)',
    },
  }),
}
function Results({ className, products, refetchProducts, onPageChange, ...rest }) {
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

  const handleCancel = () => {
    if (disableDeleteProduct) {
      setOpenDialog(true)
    }
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
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
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
        openSnackbar({
          message: err.message,
          variant: 'error',
        })
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
      const productCategories = idx(productCategoriesData, _ => _.data.productCategories)
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

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Card css={localStyles.card}>
        <CardHeader
          action={
            <CSVLink data={excelData} filename="商品列表.csv" style={{ textDecoration: 'none' }}>
              <Button css={[localStyles.pillButton, localStyles.secondaryPill]} variant="contained">
                報表匯出
              </Button>
            </CSVLink>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <Typography variant="h6" style={{ fontWeight: 'bold', color: 'rgb(var(--text))' }}>
                所有商品
              </Typography>
              <Typography color="textSecondary" variant="body2">
                共 {products.totalCount} 筆資料
              </Typography>
            </div>
          }
        />
        <CardContent css={localStyles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table size="small">
                <TableHead css={localStyles.tableHead}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedProducts.length === products.data.length &&
                          products.data.length > 0
                        }
                        color="primary"
                        indeterminate={
                          selectedProducts.length > 0 &&
                          selectedProducts.length < products.data.length
                        }
                        onChange={handleSelectAll}
                        disabled={
                          products.data.length === 0 ||
                          products.data.filter(d => !d.isUsing).length === products.data.length
                        }
                      />
                    </TableCell>
                    <TableCell>代號</TableCell>
                    <TableCell>類別</TableCell>
                    <TableCell>名稱</TableCell>
                    {/* 成本顯示判斷 */}
                    {isDisplayCost && <TableCell>成本</TableCell>}
                    <TableCell>單位</TableCell>
                    <TableCell>價格</TableCell>
                    <TableCell>自購價格</TableCell>
                    <TableCell>變更者</TableCell>
                    <TableCell>變更時間</TableCell>
                    <TableCell>副本</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.data.map((data, idx) => (
                    <TableRow
                      key={`product-${data.name}-${idx}`}
                      css={localStyles.tableRow}
                      selected={selectedProducts.indexOf(data.id) > -1 || !data.isUsing}
                      data-testid="product-row"
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={selectedProducts.indexOf(data.id) > -1}
                          onChange={() => handleSelectOne(data.id)}
                          inputProps={{
                            'data-testid': `product-${data.name}-checkbox`,
                          }}
                        />
                      </TableCell>
                      <TableCell>{data.no === null ? '無代號' : data.no}</TableCell>
                      <TableCell>
                        {data.productCategory === null ? '未分類' : data.productCategory.name}
                      </TableCell>
                      <TableCell style={{ fontWeight: '500' }}>{data.name}</TableCell>
                      {/* 成本顯示判斷 */}
                      {isDisplayCost && <TableCell>{data.cost}</TableCell>}
                      <TableCell>{data.stockUnit}</TableCell>
                      <TableCell>{data.sellPrice}</TableCell>
                      <TableCell>{data.employeePrice}</TableCell>
                      <TableCell>{data.creator !== null ? data.creator.name : ''}</TableCell>
                      <TableCell>{format(data.updatedAt, 'yyyy/MM/dd')}</TableCell>
                      <TableCell>
                        <Link to={`product/duplicate/${data.id}`}>
                          <IconButton size="small" css={localStyles.actionButton}>
                            <ContentCopyIcon fontSize='small' />
                          </IconButton>
                        </Link>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          css={localStyles.actionButton}
                          component={RouterLink}
                          size="small"
                          to={`/product/edit/${data.id}`}
                          disabled={!data.isUsing}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={products.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={products.pageOffset}
            rowsPerPage={products.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
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
        option={merchantVendorList.loading ? [] : merchantVendorList.data.getMerchantVendorList}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'刪除商品'}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={deleteOrderPwd}
              label="刪除密碼"
              onChange={event => setDeleteOrderPwd(event.target.value)}
              inputProps={{
                type: 'password',
                'data-testid': 'delete-password',
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            取消
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus data-testid="confirm">
            確認
          </Button>
        </DialogActions>
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
