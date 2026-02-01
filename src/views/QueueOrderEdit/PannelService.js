/** @jsxImportSource @emotion/react */
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import billContext from 'context/keyInContext'
import _ from 'lodash'
import { useContext, useEffect, useState, useRef } from 'react'
import uuid from 'uuid'
import useFetchServices from 'hooks/useFetchServices'
import useFetchServiceCategories from 'hooks/useFetchServiceCategories'
import useFetchGetIsHelperDesignationSetting from 'hooks/useFetchGetIsHelperDesignationSetting'
import idx from 'idx'
import produce from 'immer'
import ServicesModal from './ServicesModal'
import Services from './Services'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
  const { handleBillChange, order, bindedThirdPart, orderId } = useContext(billContext)
  const [services, setServices] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [focusRow, setFocusRow] = useState(0)

  const [servicesModalOpen, setServicesModalOpen] = useState(false)
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
  const servicesData = useFetchServices(pageSetting)
  const servicesForTicketLocked = useFetchServices({ orderId: orderId })
  const serviceCategoriesData = useFetchServiceCategories()
  const isHelperDesignationData = useFetchGetIsHelperDesignationSetting()
  const [isHelperDesignation, setIsHelperDesignationData] = useState(false)
  const [helperFromModal, setHelperFromModal] = useState([])

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
    if (!serviceCategoriesData.loading && !servicesData.loading) {
      const serviceCategories = idx(serviceCategoriesData, _ => _.data.serviceCategories)
      const servicesInModal = idx(servicesData, _ => _.data.services)

      setServiceCategories(serviceCategories)
      setServicesInModal(servicesInModal)
    } else {
    }
  }, [serviceCategoriesData.loading, servicesData.loading])

  useEffect(() => {
    if (!order.loading && !servicesForTicketLocked.loading) {
      let newServices = []
      const orderDetail = JSON.parse(idx(order, _ => _.data.getOrderInputByQueueId))
      const findTicketDisabled = id => {
        const services = idx(servicesForTicketLocked, _ => _.data.services.data)
        const data = services.find(d => d.id === id).isBindedThirdPartTicketLocked
        return data
      }
      if (orderDetail.serviceOrders.length > 0) {
        orderDetail.serviceOrders.map(data =>
          newServices.push({
            id: uuid(),
            price: data.price,
            serviceId: data.serviceId,
            thirdPartyCouponMerchantId: data.thirdPartyCouponMerchantId,
            isBindedThirdPartTicketLocked: findTicketDisabled(data.serviceId),
            serviceOrderHelpers: data.serviceOrderHelpers.map(helper => ({
              type: helper.type,
              helperId: helper.helperId,
              isDesignate: helper.isDesignate,
              helperDeductiontype: helper.helperDeductionType,
            })),
          })
        )
      } else {
        newServices.push({
          id: uuid(),
          price: 0,
          serviceId: '',
          serviceOrderHelpers: [],
        })
      }
      if (newServices.length > 0 && newServices[0].serviceId !== '') {
        setExpanded(true)
      }
      setServices(newServices)
    }
  }, [order.loading, servicesForTicketLocked.loading])

  function handleAddService() {
    const newServices = _.cloneDeep(services)
    newServices.push({
      id: uuid(),
      serviceId: '',
      price: 0,
      serviceOrderHelpers: [],
    })
    setServices(newServices)
    setFocusRow(newServices.length - 1)
  }

  const useHandleAddServiceRef = useRef(handleAddService)
  useEffect(() => {
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
        style={{ width: '100%' }}
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
