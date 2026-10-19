/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import { Field, Input } from 'ui/input'
import { CheckboxField } from 'ui/checkbox'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from './RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ServicesAutoComplete from 'components/ServicesAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import { useLazyFetchServiceNew } from 'hooks/useFetchService'
import billContext from 'context/keyInContext'
import idx from 'idx'
import _ from 'lodash'
import { Fragment, createRef, memo, useEffect, useRef, useState, useContext } from 'react'
import TeachingModeContext from 'context/teachingModeContext'
import { useFetchThirdPartysForCreateOrder } from 'hooks/useFetchMerchant'

import styles from './styles/Services'

function Services({
  index,
  service,
  helperOnChange,
  serviceOnChange,
  addService,
  removeService,
  onServiceChange,
  first,
  last,
  onClear,
  expanded,
  focusRow,
  focusFirstField,
  changeRowFocus,
  helperFromModal,
  servicesOnPannel,
  handleOpenServicesModal,
  servicesModalOpen,
  isHelperDesignation,
  thirdPartTicket,
  bindedThirdPart,
  reset,
  getData
}) {
  const techingModeContext = useContext(TeachingModeContext)
  const { teachingMode } = techingModeContext
  const [helper, setHelper] = useState([])
  const [isHelperChange, setIsHelperChange] = useState(false)
  const [getService, serviceDetail] = useLazyFetchServiceNew()
  const { focus, setFocus, bill, setServiceAlready } = useContext(billContext)
  const [helperRefs, setHelperRefs] = useState([])
  const [helperDesignateRefs, setHelperDesignateRefs] = useState([])
  const thirdPartyRef = useRef()
  const priceRef = useRef()
  const serviceRef = useRef()
  const thirdPartyCouponsData = useFetchThirdPartysForCreateOrder()
  const [ticketDisabled, setTicketDisabled] = useState(false)
  useEffect(() => {
    if (expanded && focusFirstField && bill.serviceOrders.length === index && bill.designerId) {
      idx(serviceRef, _ => _.current.focus())
    } else {
    }
  }, [expanded, focusFirstField])

  useEffect(() => {
    setHelper(service.serviceOrderHelpers)
  }, [service])

  // render互助人員
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
      setHelper(newHelper)
    }
  }, [serviceDetail.data, serviceDetail.loading, reset])

  useEffect(() => {
    if (
      helperFromModal.length !== 0 &&
      index === servicesOnPannel.length - 1 &&
      !servicesModalOpen
    ) {
      setHelper(helperFromModal)
    }
  }, [helperFromModal, servicesModalOpen])

  useEffect(() => {
    if (helper.length > 0) {
      setHelperRefs(elRefs =>
        Array(helper.length)
          .fill()
          .map((_, i) => elRefs[i] || createRef())
      )
      setHelperDesignateRefs(elRefs =>
        Array(helper.length)
          .fill()
          .map((_, i) => elRefs[i] || createRef())
      )
    } else {
    }
  }, [helper])

  const handleClear = () => {
    let newHelper = _.cloneDeep(helper)
    newHelper = newHelper.map(data => ({
      type: data.type,
      helperId: '',
      isDesignate: false,
    }))
    setHelper(newHelper)
    helperOnChange({
      index,
      value: newHelper,
    })
    onClear(index)
    setFocus('service')
    idx(serviceRef, _ => _.current.focus())
  }
  const handleServiceChange = value => {
    idx(value, _ => {
      onServiceChange({
        index,
        value: {
          ...service,
          serviceId: _.id,
          price: _.price,
          isLocked: _.isLocked,
          isNoCash: _.isNoCash,
          thirdPartyCouponMerchantId: _.bindedThirdPartTicket === null ? null : _.bindedThirdPartTicket.id,
          isBindedThirdPartTicketLocked: _.isBindedThirdPartTicketLocked,
        },
      })
    })
  }

  useEffect(() => {
    if (service.serviceId) {
      getService({
        variables: {
          serviceId: service.serviceId,
        },
      })
    }
  }, [service.serviceId])

  useEffect(() => {
    if (!serviceDetail.loading && serviceDetail.data) {
      service.serviceOrderHelpers = serviceDetail.data.service.helperDeductionSetting
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
    }
  }, [serviceDetail.data, serviceDetail.loading,])

  const handlePriceChange = (event, index) => {
    setFocus('price')
    serviceOnChange({
      index,
      value: idx(event, _ => +_.target.value || 0),
      key: 'price',
    })
  }
  const handleAssistantChange = ({ value, helperIndex }) => {
    setIsHelperChange(true)
    const Helper = _.cloneDeep(helper)
    Helper[helperIndex] = {
      ...Helper[helperIndex],
      helperId: value.userId,
    }
    setHelper(Helper)
    helperOnChange({
      index,
      value: Helper,
    })
  }
  const handleIsDesignateChange = ({ value, helperIndex }) => {
    const Helper = _.cloneDeep(helper)
    Helper[helperIndex].isDesignate = value
    setHelper(Helper)
    helperOnChange({
      index,
      value: Helper,
    })
  }
  const handleServiceFieldChange = () => {
    onServiceChange({
      index,
      value: {
        ...service,
        serviceId: '',
        price: 0,
        serviceOrderHelpers: [],
      },
    })
  }
  const handleThirdPartyChange = event => {
    serviceOnChange({
      index,
      value: event || null,
      key: 'thirdPartyCouponMerchantId',
    })
    setFocus('thirdParty')
  }

  useEffect(() => {
    switch (focus) {
      case 'price':
        if (service.isLocked === 'TRUE') {
          if (helper.length > 0) {
            idx(helperRefs, _ => _[0].current.focus())
          } else {
            idx(thirdPartyRef, _ => _.current.focus())
          }
        } else {
          idx(priceRef, _ => _.current.focus())
        }
        break
      case 'service':
        idx(serviceRef, _ => _.current.focus())
        break
      default:
        break
    }
  }, [focus])

  const handleFocus = event => {
    let setted = false
    if (!setted) {
      setFocus(event.target.name)
      setted = true
      event.target.focus()
    }
    if (event.target.name === 'price') {
      event.target.select()
    }
    changeRowFocus(index)
  }

  useEffect(() => {
    if (reset === 'reset') {
      setHelper([])
    }
  }, [reset])

  useEffect(() => {
    const lockedEnum = service.isBindedThirdPartTicketLocked
    switch (lockedEnum) {
      case 'TRUE':
        setTicketDisabled(true)
        break
      case 'FALSE':
        setTicketDisabled(false)
        break
      case 'UNSET':
        setTicketDisabled(bindedThirdPart.service)
        break
    }
  }, [service])
  return (
    <Fragment>
      <div css={styles.service}>
        {index === 0 ? (
          <RowIconButton label="從清單選擇服務" className="mx-1.5" onClick={handleOpenServicesModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        {/* 必填 *：helper/billVerify.js checkServicesOrders 要求每一列都有 serviceId（空列不會被丟掉） */}
        <Field label="服務項目" required>
          <ServicesAutoComplete
            onChange={handleServiceChange}
            className={styles.servicesField}
            value={service.serviceId}
            onFieldChange={handleServiceFieldChange}
            setServiceAlready={setServiceAlready}
            getData={getData}
            onKeyDown={event => {
              if (event.key === 'Enter' && servicesOnPannel[index].serviceId !== '') {
                if (!(service.isLocked === 'TRUE' || service.isLocked === 'UNSET')) {
                  setFocus('price')
                } else if (helper.length > 0) {
                  setFocus(helper[0].type)
                  idx(helperRefs, _ => _[0].current.focus())
                } else {
                  if (ticketDisabled || !thirdPartTicket) {
                    changeRowFocus(index + 1)
                    setFocus('service')
                  } else {
                    setFocus('thirdParty')
                    thirdPartyRef.current.focus()
                  }
                }
              }
            }}
            name="service"
            ref={serviceRef}
            autoFocus={focus === 'service'}
            tabIndex={focusRow + '0'}
            onFocus={handleFocus}
            inputProps={{ placeholder: '服務名稱/代號' }}
          />
        </Field>
        {service.serviceId && (
          <Fragment>
            <Field label="價格" css={styles.priceField}>
              <Input
                ref={priceRef}
                value={service.price}
                tabIndex={focusRow + '1'}
                name="price"
                onFocus={handleFocus}
                onKeyDown={event => {
                  if (event.key === 'Enter' && helper.length > 0 && !serviceDetail.loading) {
                    setFocus(helper[0].type)
                    idx(helperRefs, _ => _[0].current.focus())
                  }
                  if (event.key === 'Enter' && helper.length === 0 && !serviceDetail.loading) {
                    if (ticketDisabled) {
                      changeRowFocus(index + 1)
                      setFocus('service')
                    } else if (!(thirdPartTicket || (ticketDisabled && service.thirdPartyCouponMerchantId))) {
                      changeRowFocus(index + 1)
                      setFocus('service')
                    } else {
                      setFocus('thirdParty')
                      thirdPartyRef.current.focus()
                    }
                  }
                }}
                onChange={event => handlePriceChange(event, index)}
                autoFocus={focus === 'price'}
                disabled={!!(service.isLocked === 'TRUE' || service.isLocked === 'UNSET')}
              />
            </Field>
            {!serviceDetail.loading &&
              !servicesModalOpen &&
              helper.map((data, helperIdx) => (
                <Fragment key={`helper-${data.type}-${helperIdx}`}>
                  <div>
                    <Field label={data.type}>
                      <EmployeeAutoComplete
                        placeholder={data.type}
                        className={styles.field}
                        assistField={styles.assistField}
                        isAssist={true}
                        value={data.helperId}
                        name={data.type}
                        ref={helperRefs[helperIdx]}
                        autoFocus={focus === data.type}
                        tabIndex={focusRow + '2' + helperIdx}
                        onChange={value => {
                          setFocus(data.type)
                          handleAssistantChange({
                            value,
                            dataType: data.type,
                            helperIndex: helperIdx,
                          })
                        }}
                        onKeyDown={event => {
                          if (event.key === 'Enter' && isHelperDesignation) {
                            setFocus(data.type + 'designate')
                            helperDesignateRefs[helperIdx].current.focus()
                          } else if (event.key === 'Enter' && helperIdx + 1 < helper.length) {
                            setFocus(helper[helperIdx + 1].type)
                            helperRefs[helperIdx + 1].current.focus()
                          } else if (
                            event.key === 'Enter' &&
                            helperIdx + 1 === helper.length &&
                            isHelperDesignation &&
                            thirdPartTicket
                          ) {
                            setFocus('thirdParty')
                            thirdPartyRef.current.focus()
                          } else if (
                            event.key === 'Enter' &&
                            helperIdx + 1 === helper.length &&
                            thirdPartTicket
                          ) {
                            if (ticketDisabled) {
                              changeRowFocus(index + 1)
                              setFocus('service')
                            } else {
                              setFocus('thirdParty')
                              thirdPartyRef.current.focus()
                            }
                          } else if (event.key === 'Enter') {
                            changeRowFocus(index + 1)
                            setFocus('service')
                          }
                        }}
                        onFocus={handleFocus}
                      />
                    </Field>
                    {isHelperDesignation && (
                      <CheckboxField
                        tabIndex={focusRow + '3' + helperIdx}
                        autoFocus={focus === data.type + 'designate'}
                        ref={helperDesignateRefs[helperIdx]}
                        onFocus={handleFocus}
                        name={data.type + 'designate'}
                        data-testid={`service-${index}_helper-employee-${helperIdx}-assign`}
                        onKeyDown={event => {
                          if (event.key === 'Enter' && helperIdx + 1 < helper.length) {
                            setFocus(helper[helperIdx + 1].type)
                            helperRefs[helperIdx + 1].current.focus()
                          } else if (
                            event.key === 'Enter' &&
                            helperIdx + 1 === helper.length &&
                            thirdPartTicket
                          ) {
                            if (ticketDisabled) {
                              changeRowFocus(index + 1)
                              setFocus('service')
                            } else {
                              setFocus('thirdParty')
                              thirdPartyRef.current.focus()
                            }
                          } else if (event.key === 'Enter' && !thirdPartTicket) {
                            changeRowFocus(index + 1)
                            setFocus('service')
                          }
                        }}
                        checked={data.isDesignate}
                        label="指定"
                        css={styles.checkbox}
                        onChange={(_event, state) =>
                          handleIsDesignateChange({
                            dataType: data.type,
                            value: state,
                            helperIndex: helperIdx,
                          })
                        }
                      />
                    )}
                  </div>
                </Fragment>
              ))}
            {(thirdPartTicket || (ticketDisabled && service.thirdPartyCouponMerchantId)) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Field label="第三方卡券">
                  <ThirdPartyAutoComplete
                    fieldProps={{ placeholder: '第三方卡券' }}
                    className={styles.field}
                    value={service.thirdPartyCouponMerchantId}
                    ref={thirdPartyRef}
                    autoFocus={focus === 'thirdParty'}
                    name="thirdParty"
                    disabled={ticketDisabled}
                    onChange={e => {
                      setFocus('thirdParty')
                      handleThirdPartyChange(e === null ? '' : e.id)
                    }}
                    onFocus={handleFocus}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        changeRowFocus(index + 1)
                        setFocus('service')
                      }
                    }}
                  />
                </Field>
                {!thirdPartyCouponsData.loading &&
                  service.thirdPartyCouponMerchantId &&
                  idx(thirdPartyCouponsData, _ =>
                    _.data.merchant.thirdpartyCoupons.map((data, index) => {
                      if (data.id === service.thirdPartyCouponMerchantId) {
                        if (data.type === 'PERCENT') {
                          return (
                            <p className="m-0" key={index} css={styles.heading2} style={{ marginTop: '4px' }}>
                              {`扣完後業績:${Math.round((service.price * (100 - data.fee)) / 100)}`}
                            </p>
                          )
                        } else {
                          return (
                            <p className="m-0" key={index} css={styles.heading2} style={{ marginTop: '4px' }}>
                              {`扣完後業績:${Math.round(service.price - data.fee)}`}
                            </p>
                          )
                        }
                      }
                    })
                  )}
              </div>
            )}
            {teachingMode && (
              <p className="m-0" css={styles.heading2}>勾選將入業績但不收費用**</p>
            )}
          </Fragment>
        )}
        <RowIconButton
          label="清除此列" className="mr-1.5"
          onClick={handleClear}
          data-testid={`service-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>
        {!first && (
          <RowIconButton
            label="刪除此列" className="mr-1.5"
            onClick={() => {
              removeService(index)
              setFocus('service')
            }}
            data-testid={`service-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        )}
      </div>
      {last && (
        <AddRowButton
          data-testid={`service-${index}-add`}
          onClick={() => {
            addService()
            changeRowFocus(index + 1)
          }}
        />
      )}
    </Fragment>
  )
}

export default memo(Services)
