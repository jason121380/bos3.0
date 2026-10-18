/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import { memo, useContext, useEffect, useState, Fragment } from 'react'
import Services from 'views/OrderCreate/Services'
import { panelSummary } from './summary'
import styles from 'views/OrderCreate/styles/PannelService'
import { useFetchServicesForAutoComplete } from 'hooks/useFetchServices'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import useFetchGetIsHelperDesignationSetting from 'hooks/useFetchGetIsHelperDesignationSetting'
import idx from 'idx'
import produce from 'immer'
import TeachingModeContext from 'context/teachingModeContext'

import ServicesModal from '../ServicesModal'

function PannelService({ expanded, onPanelClick, thirdPartTicket, reset }) {
  const {
    handleBillChange, bindedThirdPart, bill,
    services, setServices, sData, setSData
  } = useContext(billContext)
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext

  const [focusRow, setFocusRow] = useState(0)

  const [servicesInModal, setServicesInModal] = useState([])
  const [serviceCategories, setServiceCategories] = useState([])

  const [selectedCategorie, setSelectedCategorie] = useState([])
  const [selectedCategorieName, setSelectedCategorieName] = useState([])
  const [pageSetting, setPageSetting] = useState({
    pageLimit: 50,
    pageOffset: 0,
    keyword: '',
    categoryIds: [],
  })
  const servicesData = useFetchServicesForAutoComplete(pageSetting)
  const serviceCategoriesData = useFetchServiceCategories()
  const isHelperDesignationData = useFetchGetIsHelperDesignationSetting()

  const [isHelperDesignation, setIsHelperDesignationData] = useState(false)

  const [servicesModalOpen, setServicesModalOpen] = useState(false)
  const [helperFromModal, setHelperFromModal] = useState([])

  const getData = value => {
    !sData.length && setSData(value)
  }

  useEffect(() => {
    if(reset === 'reset'){
      setFocusRow(0)
      setServices([
        {
          serviceId: '',
          price: 0,
          thirdPartyCouponMerchantId: null,
          serviceOrderHelpers: [],
        }
      ])
    }
  }, [reset])
  
  useEffect(() => {
    if (!serviceCategoriesData.loading && !servicesData.loading) {
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      const servicesInModal = idx(servicesData, _ => _.data.services)

      setServiceCategories(serviceCategories)
      setServicesInModal(servicesInModal)
    } else {
    }
  }, [serviceCategoriesData.loading, servicesData.loading])
  // 打帳單判斷指定助理服務顯示checkbox變數
  useEffect(() => {
    if (!isHelperDesignationData.loading) {
      const isHelperDesignation = idx(
        isHelperDesignationData,
        _ => _.data.getIsHelperDesignationDisplay
      )

      setIsHelperDesignationData(isHelperDesignation)
    }
  }, [isHelperDesignationData.loading])

  useEffect(() => {
    if (expanded) {
      setFocusRow(0)
    }
  }, [expanded])
  
  const handleAddService = () => {
    const newServices = _.cloneDeep(services)
    newServices.push({
      serviceId: '',
      price: 0,
      thirdPartyCouponMerchantId: null,
      serviceOrderHelpers: [],
    })
    setServices(newServices)
    setFocusRow(newServices.length - 1)
  }
  useEffect(() => {
    const defalutRows = 1
    setServices(
      Array(defalutRows)
        .fill()
        .map(_ => ({
          serviceId: '',
          price: 0,
          thirdPartyCouponMerchantId: null,
          serviceOrderHelpers: [],
        }))
    )
  }, [])
  function handleHelperChange({ index, value }) {
    const newServices = _.cloneDeep(services)
    newServices[index].serviceOrderHelpers = value
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

  function handleServiceChange({ index, key, value }) {
    const newServices = _.cloneDeep(services)
    newServices[index][key] = value
    handleBillChange({
      key: 'serviceOrders',
      value: newServices
        .filter(d => d.serviceId)
        .map(d => ({
          serviceId: d.serviceId,
          price: d.price,
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          isNoCash: d.isNoCash,
        })),
    })
    setServices(newServices)
  }

  function handleRemoveService(index) {
    let newServices = _.cloneDeep(services)
    newServices = newServices.filter((_d, idx) => idx !== index)
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
    setServices(newServices)
    setFocusRow(newServices.length - 1)
  }
  function handleClear(index) {
    const newServices = _.cloneDeep(services)
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
    const newServices = _.cloneDeep(services)
    newServices[index] = value
    handleBillChange({
      key: 'serviceOrders',
      value: newServices
        .filter(d => d.serviceId)
        .map(d => ({
          serviceId: d.serviceId,
          price: d.price,
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          isLocked: d.isLocked,
          isNoCash: d.isNoCash,
        })),
    })
    setServices(newServices)
  }

  const handleChangeFocusRow = index => {
    if (index < services.length) {
      setFocusRow(index)
    }
    if (index === services.length) {
      handleAddService()
    }
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

  return (
    <Accordion key="panelService" expanded={expanded}>
      <AccordionSummary
        style={{ width: '100%' }}
        onClick={onPanelClick}
        summaryMeta={!expanded && panelSummary(
          bill.serviceOrders.filter(d => d.serviceId).length,
          bill.serviceOrders.reduce((total, d) => total + d.price, 0)
        )}
        data-testid="panelService"
      >
        <p className="m-0" css={styles.heading}>項目消費</p>
        {teachingMode && (
          <p className="m-0" css={styles.heading2}>服務項目必須設定好助理才能輸入助理**</p>
        )}
      </AccordionSummary>
      <AccordionDetails css={styles.details}>
        <div css={styles.fieldOutter}>
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
              onPageChange={handlePageChange}
              setServicesModalOpen={setServicesModalOpen}
            />
          )}
          {services.map((service, index) => (
            <Fragment key={index}>
              <Services
                servicesModalOpen={servicesModalOpen}
                servicesOnPannel={services}
                changeRowFocus={handleChangeFocusRow}
                focusFirstField={index === focusRow}
                focusRow={focusRow}
                key={`pannel-service-${service.id}-${index}`}
                index={index}
                service={service}
                helperOnChange={handleHelperChange}
                serviceOnChange={handleServiceChange}
                onServiceChange={handleServiceOnChange}
                addService={handleAddService}
                removeService={handleRemoveService}
                first={index === 0}
                last={index + 1 === services.length}
                onClear={handleClear}
                expanded={expanded}
                helperFromModal={helperFromModal}
                handleOpenServicesModal={handleOpenServicesModal}
                isHelperDesignation={isHelperDesignation}
                thirdPartTicket={thirdPartTicket}
                bindedThirdPart={bindedThirdPart}
                reset={reset}
                getData={getData}
              />
            </Fragment>
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default memo(PannelService)
