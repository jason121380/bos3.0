import { Modal } from 'ui/modal-compat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from 'ui/card'
import PropTypes from 'prop-types'
import { memo, useState, useEffect } from 'react'
import idx from 'idx'
import { formatNumber } from 'ui/format'


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
            {selectedCategorieName.length === 0 ? '所有卡券' : `${categoryNameForDisplay}類卡券`}
          </CardTitle>
        </CardHeader>

        <div className="h-px bg-border" />
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {couponCategories.map(couponCategorie => (
              <Button
                variant={
                  selectedCategorie.indexOf(couponCategorie.id) !== -1 ? 'primary' : 'secondary'
                }
                size="sm"
                onClick={() => handleClickCategorie(couponCategorie.id, couponCategorie.name)}
                key={couponCategorie.id}
              >
                {couponCategorie.name}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={handleClearCategorie}>
              清除
            </Button>
          </div>
          <p className="mb-2 mt-0 text-caption text-text-secondary">
            {coupons.length}張卡券
          </p>
          <Table dense>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px">
                  <Button variant="ghost" size="sm" />
                </TableHead>
                <TableHead>代號</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>參考價格</TableHead>
                <TableHead numeric>可使用次數</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon, index) => (
                <TableRow key={index}>
                  <TableCell className="w-px">
                    <Button variant="primary" size="sm" onClick={() => handleSelectCoupon(coupon)}>
                      加入
                    </Button>
                  </TableCell>
                  <TableCell>{coupon.no}</TableCell>
                  <TableCell>{coupon.name}</TableCell>
                  <TableCell numeric>{formatNumber(coupon.price)}</TableCell>
                  <TableCell numeric>{formatNumber(coupon.ticketAvailableCount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-wrap">
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
          <Button variant="secondary" onClick={closeModal}>
            關閉
          </Button>
        </CardFooter>
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
