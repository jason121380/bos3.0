/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import billContext from 'context/keyInContext'
import { useFetchServiceOrders } from 'hooks/useFetchOrder'
import _ from 'lodash'
import React, { useContext } from 'react'
import uuid from 'uuid'
import useFetchServices from 'hooks/useFetchServices'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import useFetchGetIsHelperDesignationSetting from 'hooks/useFetchGetIsHelperDesignationSetting'
import idx from 'idx'
import produce from 'immer'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import ServicesModal from './ServicesModal'
import Services from './Services'

const styles = {
  root: css({
    width: '100%',
    marginTop: theme.spacing(3),
  }),
  heading: css({
    fontSize: '15px !important',
    fontWeight: theme.typography.fontWeightRegular,
  }),
  details: css({
    overflowX: 'auto',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }),
  fieldOutter: css({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
  }),
}

export default function PannelService({ thirdPartTicket }) {
  const { handleBillChange, orderId, bindedThirdPart } = useContext(billContext)
  const servicesOrder = useFetchServiceOrders({ id: orderId })
  const [services, setServices] = React.useState([])
  const [expanded, setExpanded] = React.useState(false)
  const [focusRow, setFocusRow] = React.useState(0)

  const isHelperDesignationData = useFetchGetIsHelperDesignationSetting()
  const [isHelperDesignation, setIsHelperDesignationData] = React.useState(false)
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
  const [helperFromModal, setHelperFromModal] = React.useState([])

  // 打帳單判斷指定助理服務顯示checkbox變數
  React.useEffect(() => {
    if (!isHelperDesignationData.loading) {
      const isHelperDesignation = idx(
        isHelperDesignationData,
        _ => _.data.getIsHelperDesignationDisplay
      )

      setIsHelperDesignationData(isHelperDesignation)
    }
  }, [isHelperDesignationData.loading])

  React.useEffect(() => {
    if (!serviceCategoriesData.loading && !servicesData.loading) {
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      const servicesInModal = idx(servicesData, _ => _.data.services)

      setServiceCategories(serviceCategories)
      setServicesInModal(servicesInModal)
    } else {
    }
  }, [serviceCategoriesData.loading, servicesData.loading])

  React.useEffect(() => {
    if (!servicesOrder.loading) {
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
  }, [servicesOrder.loading])
  function handleAddService() {
    const newService = _.cloneDeep(services)
    newService.push({
      id: uuid(),
      serviceId: '',
      price: 0,
      serviceOrderHelpers: [],
    })
    setServices(newService)
    setFocusRow(newService.length - 1)
  }

  const useHandleAddServiceRef = React.useRef(handleAddService)
  React.useEffect(() => {
    useHandleAddServiceRef.current()
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
          isNoCash: d.isNoCash,
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
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
          serviceOrderHelpers: d.serviceOrderHelpers.filter(i => i.helperId),
          thirdPartyCouponMerchantId: d.thirdPartyCouponMerchantId,
          isLocked: d.isLocked,
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
        })),
    })
    setServices(newServices)
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

  const handleChange = ({ index, value }) => {
    const newServices = _.cloneDeep(services)
    newServices[index] = value
    setServices(newServices)
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
    <Accordion defaultExpanded={expanded} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel-content"
        id="panel-header"
        data-testid="panelService"
        onClick={handleAccordionClick}
      >
        <Typography css={styles.heading}>項目消費</Typography>
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
              onChange={handleChange}
              handleOpenServicesModal={handleOpenServicesModal}
              changeRowFocus={handleChangeFocusRow}
              services={services}
              servicesLength={services.length}
              thirdPartTicket={thirdPartTicket}
              bindedThirdPart={bindedThirdPart}
              isHelperDesignation={isHelperDesignation}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}
