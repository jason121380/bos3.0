import PropTypes from 'prop-types'
import { useEffect, memo } from 'react'
import idx from 'idx'
import { useLazyFetchService } from 'hooks/useFetchService'
import ItemPickerModal from 'views/OrderShared/ItemPickerModal'
import { SERVICE_COLUMNS } from 'views/OrderShared/pickerColumns'

// 打帳單「選服務」彈窗。畫面與帳單詳細／掛單詳細／重新開單共用（OrderShared/ItemPickerModal）；
// 選服務後組助理欄位的方式（含 helperDeductiontype、略過空 type）與其他三頁不同，所以邏輯留在本檔（2026/10/21）
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
  onPageChange,
  setServicesModalOpen,
}) {
  const serviceDetail = useLazyFetchService()
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
    if (!serviceDetail.loading && serviceDetail.data) {
      const newHelper = serviceDetail.data.service.helperDeductionSetting
        .map(data =>
          data.type !== ''
            ? data.nameList.map(name => {
              return {
                type: `${data.type}-${name}`,
                helperDeductiontype: data.helperDeductionType,
              }
            })
            : []
        )
        .reduce((total, item) => total.concat(item), [])
        .map(data => ({
          type: data.type,
          helperId: '',
          isDesignate: false,
          helperDeductiontype: data.helperDeductiontype,
        }))
      setHelperFromModal(newHelper)
      setServicesModalOpen(false)
    } else {
    }
  }, [serviceDetail.data, serviceDetail.loading, setHelperFromModal, setServicesModalOpen])

  return (
    <ItemPickerModal
      open={servicesModalOpen}
      closeModal={closeModal}
      noun="服務"
      categories={serviceCategories}
      selectedCategorie={selectedCategorie}
      selectedCategorieName={selectedCategorieName}
      onClickCategorie={handleClickCategorie}
      onClearCategorie={handleClearCategorie}
      caption={<>{services.totalCount} 筆服務</>}
      columns={SERVICE_COLUMNS}
      rows={services.data}
      onSelect={handleSelectService}
      paging={{
        source: services,
        count: services.totalCount,
        page: services.pageOffset,
        rowsPerPage: services.pageLimit,
      }}
      onPageChange={onPageChange}
    />
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
