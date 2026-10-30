import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { panelSummary } from 'views/OrderCreate/Panel/summary'
import billContext from 'context/keyInContext'
import { useFetchServiceOrders } from 'hooks/useFetchOrder'
import cloneDeep from 'lodash/cloneDeep'
import React, { useContext } from 'react'
import uuid from 'lib/uuid'
import useFetchServices from 'hooks/useFetchServices'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import useFetchGetIsHelperDesignationSetting from 'hooks/useFetchGetIsHelperDesignationSetting'
import idx from 'idx'
import produce from 'immer'

import ServicesModal from 'views/OrderShared/EditServicesModal'
import Services from './Services'
import useOncePerOrder from './useOncePerOrder'

export default function PanelService({ thirdPartTicket, expanded, setExpanded }) {
  const { handleBillChange, orderId, bindedThirdPart, services, setServices, sData, setSData } = useContext(billContext)
  const servicesOrder = useFetchServiceOrders({ id: orderId })
  const isFirstLoad = useOncePerOrder()
  const [focusRow, setFocusRow] = React.useState(0)

  const [servicesModalOpen, setServicesModalOpen] = React.useState(false)
  const [servicesInModal, setServicesInModal] = React.useState([])
  const [serviceCategories, setServiceCategories] = React.useState([])
  const [selectedCategorie, setSelectedCategorie] = React.useState([])
  const [selectedCategorieName, setSelectedCategorieName] = React.useState([])
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const servicesData = useFetchServices(pageSetting)
  const serviceCategoriesData = useFetchServiceCategories()
  const isHelperDesignationData = useFetchGetIsHelperDesignationSetting()
  const [isHelperDesignation, setIsHelperDesignationData] = React.useState(false)
  const [helperFromModal, setHelperFromModal] = React.useState([])

  const getData = value => {
    !sData.length && setSData(value)
  }

  // 打帳單判斷指定助理服務顯示checkbox變數
  React.useEffect(() => {
    if (!isHelperDesignationData.loading) {
      const isHelperDesignation = idx(isHelperDesignationData, _ => _.data.getIsHelperDesignationDisplay)

      setIsHelperDesignationData(isHelperDesignation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isHelperDesignationData.loading])

  React.useEffect(() => {
    if (!serviceCategoriesData.loading && !servicesData.loading) {
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      const servicesInModal = idx(servicesData, _ => _.data.services)

      setServiceCategories(serviceCategories)
      setServicesInModal(servicesInModal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [serviceCategoriesData.loading, servicesData.loading])

  React.useEffect(() => {
    // 同一張帳單只帶入一次（見 useOncePerOrder）
    // 查詢失敗時 data 為 undefined，不讀欄位（2026/10/28 稽核 B-04）
    if (!servicesOrder.loading && idx(servicesOrder, _ => _.data.order.serviceOrders) && isFirstLoad(orderId)) {
      const newServices =
        servicesOrder.data.order.serviceOrders.length > 0
          ? servicesOrder.data.order.serviceOrders.map(data => ({
              id: uuid(),
              price: data.price,
              serviceId: data.service.id,
              isLocked: data.service.isLocked,
              isNoCash: data.service.isNoCash,
              thirdPartyPayName: data.thirdPartyPayName,
              thirdPartyCouponMerchantId: data.thirdPartyPayId,
              isBindedThirdPartTicketLocked: data.service.isBindedThirdPartTicketLocked,
              serviceOrderHelpers: data.helperList.map(helper => ({
                type: helper.type,
                helperId: helper.helper.id,
                isDesignate: helper.isDesignate,
                helperDeductiontype: helper.helperDeductionType,
              })),
            }))
          : [
              {
                id: uuid(),
                price: 0,
                serviceId: '',
                serviceOrderHelpers: [],
              },
            ]

      if (newServices.length > 0 && newServices[0].serviceId !== '') {
        setExpanded(true)
      }
      setServices(newServices)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [servicesOrder.loading, setExpanded, setServices, isFirstLoad, orderId])
  function handleAddService() {
    const newServices = cloneDeep(services)
    newServices.push({
      id: uuid(),
      serviceId: '',
      price: 0,
      serviceOrderHelpers: [],
    })
    setServices(newServices)
    setFocusRow(newServices.length - 1)
  }

  const useHandleAddServiceRef = React.useRef(handleAddService)
  React.useEffect(() => {
    useHandleAddServiceRef.current()
  }, [])
  function handleHelperChange({ index, value }) {
    const newServices = cloneDeep(services)
    newServices[index].serviceOrderHelpers = value
    setServices(newServices)
    handleBillChange({
      key: 'serviceOrders',
      value: newServices
        .filter(d => d.serviceId)
        .map(d => ({
          serviceId: d.serviceId,
          price: d.price,
          isNoCash: d.isNoCash,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
        })),
    })
  }
  function handleServiceChange({ index, key, value }) {
    const newServices = cloneDeep(services)
    newServices[index][key] = value
    handleBillChange({
      key: 'serviceOrders',
      value: newServices
        .filter(d => d.serviceId)
        .map(d => ({
          serviceId: d.serviceId,
          price: d.price,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
          isLocked: d.isLocked,
          isNoCash: d.isNoCash,
        })),
    })
    setServices(newServices)
  }

  function handleRemoveService(index) {
    let newServices = cloneDeep(services)
    newServices = newServices.filter((_d, idx) => idx !== index)
    handleBillChange({
      key: 'serviceOrders',
      value: newServices
        .filter(d => d.serviceId)
        .map(d => ({
          serviceId: d.serviceId,
          price: d.price,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
        })),
    })
    setServices(newServices)
  }
  function handleClear(index) {
    const newServices = cloneDeep(services)
    newServices[index] = {
      ...newServices[index],
      serviceId: '',
      price: 0,
      thirdPartyCouponMerchantId: null,
      serviceOrderHelpers: [],
    }
    setServices(newServices)
    handleBillChange({
      key: 'serviceOrders',
      value: newServices
        .filter(d => d.serviceId)
        .map(d => ({
          serviceId: d.serviceId,
          price: d.price,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
          isNoCash: d.isNoCash,
        })),
    })
  }

  function handleServiceOnChange({ index, value }) {
    const newServices = cloneDeep(services)
    newServices[index] = value
    handleBillChange({
      key: 'serviceOrders',
      value: newServices
        .filter(d => d.serviceId)
        .map(d => ({
          serviceId: d.serviceId,
          price: d.price,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          isLocked: d.isLocked,
          isNoCash: d.isNoCash,
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
        })),
    })
    setServices(newServices)
  }
  const handleAccordionClick = () => {
    setExpanded(val => !val)
  }

  const handleOpenServicesModal = () => {
    if (!servicesData.loading) {
      setServicesModalOpen(true)
    }
  }

  const handleCloseServicesModal = () => {
    setServicesModalOpen(false)
    setSelectedCategorie([])
    setSelectedCategorieName([])
    setPageSetting({
      pageLimit: 50,
      pageOffset: 0,
      keyword: '',
      categoryIds: [],
    })
  }

  const handlePageChange = ({ value, key }) => {
    setPageSetting(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const handleChangeFocusRow = index => {
    if (index < services.length) {
      setFocusRow(index)
    }
    if (index === services.length) {
      handleAddService()
    }
  }

  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        aria-controls="panel-content"
        id="panel-header"
        data-testid="panelService"
        onClick={handleAccordionClick}
        style={{ width: '100%' }}
        summaryMeta={
          !expanded &&
          panelSummary(
            services.filter(d => d.serviceId).length,
            services.filter(d => d.serviceId).reduce((total, d) => total + d.price, 0)
          )
        }
      >
        <p className="m-0 !text-[16px] font-bold text-text">項目消費</p>
      </AccordionSummary>
      {/* 原相容層把 aria-controls 對應的 id 放在內容區；新 Accordion 沒有自動產生，這裡補上讓 aria-controls 仍指得到 */}
      <AccordionDetails id="panel-content" className="flex items-center justify-start overflow-x-auto">
        <div className="flex flex-col items-start justify-start">
          {servicesModalOpen && (
            <ServicesModal
              servicesModalOpen={servicesModalOpen}
              services={servicesInModal}
              servicesLength={services.length}
              serviceCategories={serviceCategories}
              closeModal={handleCloseServicesModal}
              onServiceChange={handleServiceOnChange}
              setPageSetting={setPageSetting}
              servicesRefetch={services.refetch}
              selectedCategorie={selectedCategorie}
              setSelectedCategorie={setSelectedCategorie}
              selectedCategorieName={selectedCategorieName}
              setSelectedCategorieName={setSelectedCategorieName}
              servicesOnPannel={services}
              setHelperFromModal={setHelperFromModal}
              helperFromModal={helperFromModal}
              onPageChange={handlePageChange}
              setServicesModalOpen={setServicesModalOpen}
            />
          )}
          {services.map((service, index) => (
            <Services
              key={`pannel-service-${service.id}-${index}`}
              index={index}
              service={service}
              helperOnChange={handleHelperChange}
              serviceOnChange={handleServiceChange}
              onServiceChange={handleServiceOnChange}
              addService={handleAddService}
              removeService={handleRemoveService}
              focusRow={focusRow}
              first={index === 0}
              last={index + 1 === services.length}
              onClear={handleClear}
              focusFirstField={index === focusRow}
              expanded={expanded}
              handleOpenServicesModal={handleOpenServicesModal}
              changeRowFocus={handleChangeFocusRow}
              services={services}
              servicesLength={services.length}
              thirdPartTicket={thirdPartTicket}
              bindedThirdPart={bindedThirdPart}
              isHelperDesignation={isHelperDesignation}
              getData={getData}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
