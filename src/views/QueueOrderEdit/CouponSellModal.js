/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  CardActions,
  Paper,
  Button,
} from '@mui/material'
import PropTypes from 'prop-types'
import { memo, useState, useEffect } from 'react'
import idx from 'idx'
import { blue } from '@mui/material/colors'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 700,
    maxHeight: '100%',
    overflowY: 'auto !important',
    maxWidth: '100%',
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    marginBottom: '5px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  categorieClear: css({
    color: 'white !important',
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
  }),
  addBtn: css({
    backgroundColor: blue[500] + '!important',
    color: 'white !important',
    '&:hover': {
      backgroundColor: blue[700] + '!important',
    },
  }),
  confirmBtn: css({
    margin: '7px 0',
    float: 'right',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  closeAtTop: css({
    margin: '16px 24px !important',
  },)
}

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
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader
            title={
              selectedCategorieName.length === 0 ? '所有卡券' : `${categoryNameForDisplay}類卡券`
            }
          />
          <Button
            onClick={closeModal}
            color="primary"
            variant="contained"
            css={styles.closeAtTop}
          >
            關閉
          </Button>
        </div>

        <div className="h-px bg-border" />
        <CardContent>
          <div css={styles.categorieDiv}>
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
              css={styles.categorieClear}
              onClick={handleClearCategorie}
            >
              清除
            </Button>
          </div>
          <p className="m-0 mb-1.5 text-body text-text-secondary">
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
                        css={styles.addBtn}
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
        <CardActions css={styles.actions}>
          {/* <TablePagination
            labelRowsPerPage='每頁顯示數量'
              component="div"
                count={services.totalCount}
                onChangePage={handleOnChangePage}
                onChangeRowsPerPage={handleOnChangeRowsPerPage}
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
