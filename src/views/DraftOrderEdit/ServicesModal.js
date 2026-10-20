import { TablePagination } from 'ui/pagination-compat'
import { Modal } from 'ui/modal-compat'
import { Paper } from 'ui/display-compat'
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from 'ui/table-compat'
import { Button } from 'ui/button-compat'
import { Card, CardHeader, CardContent, CardActions } from 'ui/card-compat'
import PropTypes from 'prop-types'
import { useState, useEffect, memo, useRef } from 'react'
import idx from 'idx'
import _ from 'lodash'
import { useLazyFetchService } from 'hooks/useFetchService'
import pagenationLabel from './../../helper/pagenationLabel'

// 原 emotion styles 逐值轉 Tailwind（theme.shadows[20] 原值照抄；red／blue 取自 ui/colors：red[500] #f44336、red[700] #d32f2f、
// blue[500] #2196f3、blue[700] #1976d2；原 `!important` 以 `!` 前綴保留）。未使用的 birthday／inner／categorieClear／confirmBtn 不轉
const styles = {
  root: 'absolute top-[50%] left-[50%] [transform:translate(-50%,-50%)] [outline:none] [box-shadow:0px_10px_13px_-6px_rgba(0,0,0,0.2),0px_20px_31px_3px_rgba(0,0,0,0.14),0px_8px_38px_7px_rgba(0,0,0,0.12)] w-[700px] max-h-full overflow-y-auto max-w-full',
  actions: 'justify-end',
  categorieDiv: 'mb-[5px]',
  header: 'flex justify-between items-center',
  categorieBtn: 'm-[3px]',
  clickedCategorieBtn: 'm-[3px] text-[white]',
  addBtn: 'bg-[#2196f3] text-[white] hover:bg-[#1976d2]',
  closeAtTop: 'm-[16px_24px]',
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
  }, [servicesModalOpen, services])

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
    <Modal open={servicesModalOpen}>
      <Card className={styles.root}>
        <div className={styles.header}>
          <CardHeader
            title={
              selectedCategorieName.length === 0 ? '所有服務' : `${categoryNameForDisplay}類服務`
            }
          />
          <Button
            onClick={closeModal}
            color="primary"
            variant="contained"
            className={styles.closeAtTop}
          >
            關閉
          </Button>
        </div>

        <div className="h-px bg-border" />
        <CardContent>
          <div className={styles.categorieDiv}>
            {serviceCategories.map(serviceCategorie => (
              <Button
                variant={
                  selectedCategorie.indexOf(serviceCategorie.id) !== -1 ? 'contained' : 'outlined'
                }
                color="primary"
                size="small"
                className={
                  selectedCategorie.indexOf(serviceCategorie.id) !== -1
                    ? styles.clickedCategorieBtn
                    : styles.categorieBtn
                }
                onClick={() => handleClickCategorie(serviceCategorie.id, serviceCategorie.name)}
                key={serviceCategorie.id}
                style={
                  selectedCategorie.indexOf(serviceCategorie.id) === -1 ? {} : { color: 'white' }
                }
              >
                {serviceCategorie.name}
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
                        className={styles.addBtn}
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
        <CardActions className={styles.actions}>
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
