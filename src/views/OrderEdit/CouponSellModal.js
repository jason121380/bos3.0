import { Modal } from 'ui/modal-compat'
import { Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader, CardContent, CardActions } from 'ui/card-compat'
import PropTypes from 'prop-types'
import { memo, useState, useEffect } from 'react'
import idx from 'idx'
import _ from 'lodash'


function CouponSellModal({
  couponModalOpen,
  closeModal,
  coupons,
  onChange,
  couponsOnPannel,
  couponsLength,
  setCouponModalOpen,
  couponCategories,
  setSelectedCategorie,
  selectedCategorie,
  setSelectedCategorieName,
  selectedCategorieName,
  setPageSetting,
}) {
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')

  const handleSelectCoupon = coupon => {
    idx(coupon, _ => {
      onChange({
        index: couponsLength === 1 && couponsOnPannel[0].serviceId === '' ? 0 : couponsLength,
        value: {
          ...couponsOnPannel[couponsLength - 1],
          serviceId: _.id,
          availableCount: _.ticketAvailableCount,
          price: _.price,
          remark: _.remark,
          isLocked: _.isLocked,
          intoPerformanceWhileBuying: false,
        },
      })
    })
    setCouponModalOpen(false)
  }

  const handleClickCategorie = (categorieId, categorieName) => {
    setSelectedCategorieName([categorieName])
    setSelectedCategorie([categorieId])
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [categorieId],
      }
    })
  }
  const handleClearCategorie = () => {
    setSelectedCategorie([])
    setSelectedCategorieName('')
    setPageSetting(pre => {
      return {
        ...pre,
        categoryIds: [],
      }
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

  return (
    <Modal open={couponModalOpen}>
      <Card className="absolute left-1/2 top-1/2 max-h-full w-[700px] max-w-full !overflow-y-auto [outline:none] [transform:translate(-50%,-50%)] [box-shadow:0px_10px_13px_-6px_rgba(0,0,0,0.2),0px_20px_31px_3px_rgba(0,0,0,0.14),0px_8px_38px_7px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between">
          <CardHeader
            title={
              selectedCategorieName.length === 0 ? '所有卡券' : `${categoryNameForDisplay}類卡券`
            }
          />
          <Button
            onClick={closeModal}
            color="primary"
            variant="contained"
            className="!mx-[24px] !my-[16px]"
          >
            關閉
          </Button>
        </div>

        <div className="h-px bg-border" />
        <CardContent>
          <div className="mb-[5px]">
            {couponCategories.map(couponCategorie => (
              <Button
                variant={
                  selectedCategorie.indexOf(couponCategorie.id) !== -1 ? 'contained' : 'outlined'
                }
                color="primary"
                size="small"
                onClick={() => handleClickCategorie(couponCategorie.id, couponCategorie.name)}
                key={couponCategorie.id}
                style={{ margin: 3 }}
              >
                {couponCategorie.name}
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
            {coupons.length}張卡券
          </p>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Button />
                  </TableCell>
                  <TableCell>代號</TableCell>
                  <TableCell>名稱</TableCell>
                  <TableCell>參考價格</TableCell>
                  <TableCell>可使用次數</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.map((coupon, index) => (
                  <TableRow key={index}>
                    <TableCell padding="checkbox">
                      <Button
                        size="small"
                        onClick={() => handleSelectCoupon(coupon)}
                        className="!bg-[#2196f3] !text-white hover:!bg-[#1976d2]"
                      >
                        加入
                      </Button>
                    </TableCell>
                    <TableCell>{coupon.no}</TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>{coupon.price}</TableCell>
                    <TableCell>{coupon.ticketAvailableCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions className="justify-end">
          {/* <TablePagination
            labelRowsPerPage='每頁顯示數量'
              component="div"
                count={services.totalCount}
                onPageChange={handleOnChangePage}
                onRowsPerPageChange={handleOnChangeRowsPerPage}
                page={services.pageOffset}
                rowsPerPage={services.pageLimit}
              rowsPerPageOptions={[5, 10, 25, 50]}
            /> */}
          <Button color="primary" variant="contained" onClick={closeModal}>
            關閉
          </Button>
        </CardActions>
      </Card>
    </Modal>
  )
}

CouponSellModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

CouponSellModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(CouponSellModal)
