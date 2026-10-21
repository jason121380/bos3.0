import { Modal } from 'ui/modal-compat'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from 'ui/card'
import PropTypes from 'prop-types'
import { useState, useEffect, memo, useRef } from 'react'
import idx from 'idx'
import { useLazyFetchService } from 'hooks/useFetchService'
import pagenationLabel from './../../helper/pagenationLabel'


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
            {selectedCategorieName.length === 0 ? '所有服務' : `${categoryNameForDisplay}類服務`}
          </CardTitle>
        </CardHeader>

        <div className="h-px bg-border" />
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {serviceCategories.map(serviceCategorie => (
              <Button
                variant={
                  selectedCategorie.indexOf(serviceCategorie.id) !== -1 ? 'primary' : 'secondary'
                }
                size="sm"
                onClick={() => handleClickCategorie(serviceCategorie.id, serviceCategorie.name)}
                key={serviceCategorie.id}
              >
                {serviceCategorie.name}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={handleClearCategorie}>
              清除
            </Button>
          </div>
          <p className="mb-2 mt-0 text-caption text-text-secondary">
            {services.totalCount} 筆服務
          </p>
          <Table dense>
            <TableHeader>
              <TableRow>
                <TableHead className="w-px">
                  <Button variant="ghost" size="sm" />
                </TableHead>
                <TableHead>代號</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>名稱</TableHead>
                <TableHead numeric>參考價格</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.data.map((data, index) => (
                <TableRow key={index}>
                  <TableCell className="w-px">
                    <Button variant="primary" size="sm" onClick={() => handleSelectService(data)}>
                      加入
                    </Button>
                  </TableCell>
                  <TableCell>{data.no}</TableCell>
                  <TableCell>{idx(data, _ => _.serviceCategory.name)}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell numeric>{data.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-wrap">
          <TablePagination
            ref={pageRef}
            className="pt-0"
            labelRowsPerPage='每頁顯示數量'
            count={services.totalCount}
            onPageChange={handleOnChangePage}
            onRowsPerPageChange={handleOnChangeRowsPerPage}
            page={services.pageOffset}
            rowsPerPage={services.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />

          <Button variant="secondary" onClick={closeModal}>
            關閉
          </Button>
        </CardFooter>
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
