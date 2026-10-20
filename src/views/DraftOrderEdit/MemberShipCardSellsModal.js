/** @jsxImportSource @emotion/react */
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader, CardContent, CardActions } from 'ui/card-compat'
import { Modal, Paper, TablePagination } from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import { red, blue } from '@mui/material/colors'
import idx from 'idx'
import { addDays } from 'date-fns'
import pagenationLabel from './../../helper/pagenationLabel'
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
    overflowY: 'auto',
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
    margin: '3px !important',
    color: 'rgb(var(--accent)) !important',
    border: '1px solid rgba(63, 81, 181, 0.5) !important',
    borderRadius: '4px !important'
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white !important',
    borderRadius: '4px !important'
  }),
  categorieClear: css({
    backgroundColor: red[500] + '!important',
    color: 'white !important',
    padding: '4px 10px !important',
    borderRadius: '4px !important',
    '&:hover': {
      backgroundColor: red[700] + '!important',
    },
  }),
  addBtn: css({
    backgroundColor: blue[500] + '!important',
    color: 'white !important',
    padding: '4px 5px !important',
    borderRadius: '4px !important',
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
    color: 'white !important',
    padding: '6px 16px !important',
    borderRadius: '4px !important'
  }),
  closeAtBottom: {
    color: 'white !important',
    padding: '6px 16px !important',
    borderRadius: '4px !important'
  }
}

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
    <Modal open={true}>
      <Card css={styles.root}>
        <div css={styles.header}>
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
            css={styles.closeAtTop}
          >
            關閉
          </Button>
        </div>

        <div className="h-px bg-border" />
        <CardContent>
          <div css={styles.categorieDiv}>
            {productCategories.map(productCategory => (
              <Button
                variant={
                  selectedCategorie.indexOf(productCategory.uuid) !== -1 ? 'contained' : 'outlined'
                }
                color="primary"
                size="small"
                css={
                  selectedCategorie.indexOf(productCategory.uuid) !== -1
                    ? styles.clickedCategorieBtn
                    : styles.categorieBtn
                }
                onClick={() => handleClickCategorie(productCategory.uuid, productCategory.name)}
                key={productCategory.uuid}
                style={
                  selectedCategorie.indexOf(productCategory.uuid) === -1 ? { padding: '3px 9px' } : { color: 'white', padding: '3px 9px' }
                }
              >
                {productCategory.name}
              </Button>
            ))}
            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={handleClearCategorie}
            >
              清除
            </Button>
          </div>
          <p className="m-0 mb-1.5 text-body text-text-secondary">
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
                        css={styles.addBtn}
                      >
                        加入
                      </Button>
                    </TableCell>
                    <TableCell>{product.no}</TableCell>
                    <TableCell>
                      {product.membershipCategory !== null ? product.membershipCategory.name : ''}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sellPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        <CardActions css={styles.actions}>
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
          <Button
            onClick={closeModal}
            color="primary"
            variant="contained"
            css={styles.closeAtBottom}
          >
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
