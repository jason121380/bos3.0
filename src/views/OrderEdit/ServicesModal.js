/** @jsxImportSource @emotion/react */
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader, CardContent, CardActions } from 'ui/card-compat'
import { Modal, Paper, TablePagination } from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect, memo, useRef } from 'react'
import idx from 'idx'
import { blue } from '@mui/material/colors'
import _ from 'lodash'
import { useLazyFetchService } from 'hooks/useFetchService'
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
    margin: '3px',
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
  }),
  categorieClear: css({
    color: 'white',
  }),
  addBtn: css({
    backgroundColor: blue[500],
    color: 'white !important',
    '&:hover': {
      backgroundColor: blue[700],
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
    margin: '16px 24px',
  }),
}

function ServicesModal({
  servicesModalOpen,
  services,
  servicesLength,
  serviceCategories,
  closeModal,
  onServiceChange,
  setPageSetting,
  selectedCategorie,
  setSelectedCategorie,
  selectedCategorieName,
  setSelectedCategorieName,
  servicesOnPannel,
  setHelperFromModal,
  helperFromModal,
  onPageChange,
  setServicesModalOpen,
}) {
  const pageRef = useRef(null)
  const serviceDetail = useLazyFetchService()
  const [categoryNameForDisplay, setCategoryNameForDisplay] = useState('')
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
  const handleSelectService = selectService => {
    idx(selectService, _ => {
      onServiceChange({
        index: servicesLength === 1 && servicesOnPannel[0].serviceId === '' ? 0 : servicesLength,
        value: {
          ...servicesOnPannel[servicesLength - 1],
          serviceId: _.id,
          price: _.price,
          isLocked: _.isLocked,
          isNoCash: _.isNoCash,
          serviceOrderHelpers: [],
          thirdPartyCouponMerchantId: _.bindedThirdPartTicket === null ? null : _.bindedThirdPartTicket.id,
          isBindedThirdPartTicketLocked: _.isBindedThirdPartTicketLocked,
        },
      })
      serviceDetail.getService({
        serviceId: _.id,
      })
    })
  }

  useEffect(() => {
    if (helperFromModal !== []) {
      helperFromModal = []
    }
    if (!serviceDetail.loading && serviceDetail.data) {
      const newHelper = serviceDetail.data.service.helperDeductionSetting
        .map(data => data.nameList.map(name => `${data.type}-${name}`))
        .reduce((total, item) => total.concat(item), [])
        .map(data => ({
          type: data,
          helperId: '',
          isDesignate: false,
        }))
      setHelperFromModal(newHelper)
      setServicesModalOpen(false)
    } else {
    }
  }, [serviceDetail.data, serviceDetail.loading])

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
  }, [services, servicesModalOpen])

  return (
    <Modal open={servicesModalOpen}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader
            title={
              selectedCategorieName.length === 0 ? '所有服務' : `${categoryNameForDisplay}類服務`
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
            {serviceCategories.map(serviceCategorie => (
              <Button
                variant={
                  selectedCategorie.indexOf(serviceCategorie.id) !== -1 ? 'contained' : 'outlined'
                }
                color="primary"
                size="small"
                onClick={() => handleClickCategorie(serviceCategorie.id, serviceCategorie.name)}
                key={serviceCategorie.id}
                style={{ margin: 3 }}
              >
                {serviceCategorie.name}
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
          <p className="mb-2 mt-0 text-caption text-text-secondary">
            {services.totalCount} 筆服務
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
                {services.data.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell padding="checkbox">
                      <Button
                        size="small"
                        onClick={() => handleSelectService(data)}
                        css={styles.addBtn}
                      >
                        加入
                      </Button>
                    </TableCell>
                    <TableCell>{data.no}</TableCell>
                    <TableCell>{idx(data, _ => _.serviceCategory.name)}</TableCell>
                    <TableCell>{data.name}</TableCell>
                    <TableCell>{data.price}</TableCell>
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
            count={services.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={services.pageOffset}
            rowsPerPage={services.pageLimit}
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

ServicesModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

ServicesModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(ServicesModal)
