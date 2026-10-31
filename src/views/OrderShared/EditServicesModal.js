import PropTypes from 'prop-types'
import { useEffect, memo } from 'react'
import idx from 'idx'
import { useLazyFetchService } from 'hooks/useFetchService'
import ItemPickerModal from './ItemPickerModal'
import { SERVICE_COLUMNS } from './pickerColumns'

// 帳單詳細／掛單詳細／重新開單的「選服務」彈窗（三頁原本各一份、邏輯逐字相同，2026/10/21 合併）。
// 打帳單選服務後組助理欄位的方式不同，留在 OrderCreate/ServicesModal.js；兩者畫面同為 ItemPickerModal。
// getRowKey：列的 key，重新開單原本用 data.id，其餘兩頁用 index（預設）
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
  servicesOnPanel,
  setHelperFromModal,
  onPageChange,
  setServicesModalOpen,
  getRowKey,
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
        index: servicesLength === 1 && servicesOnPanel[0].serviceId === '' ? 0 : servicesLength,
        value: {
          ...servicesOnPanel[servicesLength - 1],
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

  // 原本開頭的 `if (helperFromModal !== []) helperFromModal = []` 永遠成立、只改區域變數（之後沒有讀取），沒有作用，
  // 2026/10/22 經 Jason 同意刪除；呼叫端仍傳入的 helperFromModal 本來就沒有被使用
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（setHelperFromModal、setServicesModalOpen）；只在 [serviceDetail.data, serviceDetail.loading] 變動時呼叫，補上會每次 render 重跑
  }, [serviceDetail.data, serviceDetail.loading])

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
      getRowKey={getRowKey}
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
}

export default memo(ServicesModal)
