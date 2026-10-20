import { TablePagination } from 'ui/pagination-compat'
import { Modal } from 'ui/modal-compat'
import { Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader, CardContent, CardActions } from 'ui/card-compat'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import idx from 'idx'
import { addDays } from 'date-fns'
import pagenationLabel from './../../helper/pagenationLabel'


const MemberShipCardSellsModal = ({
  productsModalOpen,
  productList,
  productCategories,
  closeModal,
  selectedCategorie,
  setSelectedCategorie,
  selectedCategorieName,
  setSelectedCategorieName,
  setSetting,
  onCardChange,
  sells,
  productLength,
  sellsItem,
  onPageChange,
  setProductsModalOpen,
}) => {
  const pageRef = useRef(null)
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')
  const handleClickCategorie = (categorieUUId, categorieName) => {
    setSelectedCategorieName([categorieName])
    setSelectedCategorie([categorieUUId])
    setSetting(pre => {
      return {
        ...pre,
        categoryUUIds: [categorieUUId],
      }
    })
  }

  const handleSelectProduct = selectProduct => {
    idx(selectProduct, _ => {
      onCardChange({
        index: productLength === 1 && sells[0].membershipUUID === '' ? 0 : productLength,
        value: {
          ...sellsItem,
          membershipUUID: _.uuid,
          price: _.sellPrice,
          expiryDate: _.effecitveDay === 0 ? null : addDays(new Date(), _.effecitveDay).getTime(),
          effecitveDay: _.effecitveDay,
          isLocked: _.isLocked,
          thirdPartyCouponMerchantId: null,
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
      categoryUUIds: [],
    })
  }

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
  }, [productList, productsModalOpen])

  return (
    <Modal open={productsModalOpen}>
      <Card className="absolute left-1/2 top-1/2 max-h-full w-[700px] max-w-full overflow-y-auto [outline:none] [transform:translate(-50%,-50%)] [box-shadow:0px_10px_13px_-6px_rgba(0,0,0,0.2),0px_20px_31px_3px_rgba(0,0,0,0.14),0px_8px_38px_7px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <CardHeader
            title={
              selectedCategorieName.length === 0
                ? '所有會員卡'
                : `${categoryNameForDisplay}類會員卡`
            }
          />
          <Button
            color="primary"
            variant="contained"
            onClick={closeModal}
            className="!mx-[24px] !my-[16px]"
          >
            關閉
          </Button>
        </div>

        <div className="h-px bg-border" />
        <CardContent>
          <div className="mb-[5px]">
            {productCategories.map(productCategory => (
              <Button
                variant={
                  selectedCategorie.indexOf(productCategory.uuid) !== -1 ? 'contained' : 'outlined'
                }
                color="primary"
                size="small"
                onClick={() => handleClickCategorie(productCategory.uuid, productCategory.name)}
                key={productCategory.uuid}
                style={{ margin: 3 }}
              >
                {productCategory.name}
              </Button>
            ))}
            <Button
              variant="contained"
              size="small"
              color="error"
              className="!text-white"
              onClick={handleClearCategorie}
            >
              清除
            </Button>
          </div>
          <p className="mb-2 mt-0 text-caption text-text-secondary">
            {/* {productList.totalCount} 項商品 */}
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
                  <TableCell>天數</TableCell>
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
                        className="!bg-[#2196f3] !text-white hover:!bg-[#1976d2]"
                      >
                        加入
                      </Button>
                    </TableCell>
                    <TableCell>{product.no}</TableCell>
                    <TableCell>
                      {product.membershipCategory !== null ? product.membershipCategory.name : ''}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.effecitveDay}天</TableCell>
                    <TableCell>{product.sellPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions className="justify-end">
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={productList.data.length}
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
MemberShipCardSellsModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

MemberShipCardSellsModal.defaultProps = {
  open: false,
  onClose: () => { },
}
export default MemberShipCardSellsModal
