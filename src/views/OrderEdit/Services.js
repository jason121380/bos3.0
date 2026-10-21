import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { Field } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ServicesAutoComplete from 'components/ServicesAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import billContext from 'context/keyInContext'
import { useLazyFetchServiceNew } from 'hooks/useFetchService'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import { Fragment, useRef, useEffect, useState, useContext, createRef } from 'react'


export default function Services({
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
  focusRow,
  focusFirstField,
  expanded,
  handleOpenServicesModal,
  changeRowFocus,
  isHelperDesignation,
  servicesLength,
  thirdPartTicket,
  bindedThirdPart,
  getData
}) {
  const [helper, setHelper] = useState(service.serviceOrderHelpers)
  const [getService, serviceDetail] = useLazyFetchServiceNew()
  const {
    orderId,
    thirdPartyCoupons,
    focus,
    setFocus,
    bill,
    setServiceAlready,
    setServiceDetailAlready,
    setThirdPartyAlready,
  } = useContext(billContext)
  const [helperRefs, setHelperRefs] = useState([])
  const [helperDesignateRefs, setHelperDesignateRefs] = useState([])
  const [ticketDisabled, setTicketDisabled] = useState(false)
  const useGetServiceRef = useRef(getService)
  const thirdPartyRef = useRef()
  
  const serviceRef = useRef()
  const priceRef = useRef()


  useEffect(() => {
    if (setServiceDetailAlready !== undefined) {
      setServiceDetailAlready(!serviceDetail.loading)
    }
  }, []);
  useEffect(() => {
    if (expanded && focusFirstField && bill.serviceOrders.length === index && bill.designerId) {
      idx(serviceRef, _ => _.current.focus())
    } else {
    }
  }, [expanded, focusFirstField])

  useEffect(() => {
    if (service.serviceId) {
      useGetServiceRef.current({
        variables: {
          serviceId: service.serviceId,
        },
      })
    }
  }, [service.serviceId])
  useEffect(() => {
    if (!serviceDetail.loading && serviceDetail.data) {
      const newHelper = serviceDetail.data.service.helperDeductionSetting
        .map(data =>
          data.nameList.map(name => {
            return { type: `${data.type}-${name}`, helperDeductiontype: data.helperDeductionType }
          })
        )
        .reduce((total, item) => total.concat(item), [])
        .map((data, index) => ({
          type: data.type,
          helperDeductiontype: data.helperDeductiontype,
          helperId:
            helper.length > 0 && helper[index] !== undefined && helper[index].type === data.type
              ? helper[index].helperId
              : '',
          isDesignate:
            helper.length > 0 && helper[index] !== undefined && helper[index].type === data.type
              ? helper[index].isDesignate
              : false,
        }))

      helper.forEach(data => {
        newHelper.forEach(data2 => {
          if (data.type === data2.type && data.helperDeductiontype === data2.helperDeductiontype) {
            data2.helperId = data.helperId
          }
        })
      })

      // 服務互助如果沒勾指定 打帳單不出現指不指定checkBox 之後處理
      // newHelper = serviceDetail.data.service.helperDeductionSetting.map((data, idx) => ({
      //   ...newHelper[idx],
      //   isCheckoutbox: data.cash > 0 || data.percent > 0 || data.point > 0 ? false : true,
      // }))
      setHelper(newHelper)
    }
  }, [serviceDetail.data, serviceDetail.loading])
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
    }
  }, [helper])

  const handleClear = () => {
    let newHelper = cloneDeep(helper)
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
  const handlePriceChange = event => {
    serviceOnChange({
      index,
      value: idx(event, _ => +_.target.value || 0),
      key: 'price',
    })
  }
  const handleAssistantChange = ({ value, helperIndex }) => {
    const Helper = cloneDeep(helper)
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
    const Helper = cloneDeep(helper)
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
  }
  useEffect(() => {
    switch (focus) {
      case 'price':
        if (index === focusRow) {
          if (service.isLocked === 'TRUE') {
            if (helper.length > 0) {
              idx(helperRefs, _ => _[0].current.focus())
            } else {
              idx(thirdPartyRef, _ => _.current.focus())
            }
          } else {
            idx(priceRef, _ => _.current.focus())
          }
        }
        break
      case 'service':
        if (index === focusRow) {
          idx(serviceRef, _ => _.current.focus())
        }
        break
      default:
        break
    }
  }, [focus, focusRow])

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
      <div className="mb-6 flex flex-wrap items-end justify-start gap-y-[12px]">
        {index === 0 ? (
          <RowIconButton label="從清單選擇服務" className="mx-1.5" onClick={handleOpenServicesModal}><Copy aria-hidden="true" strokeWidth={1.75} /></RowIconButton>
        ) : (
          <span aria-hidden="true" className="mx-1.5 h-8 w-8 shrink-0" />
        )}
        {/* 必填 *：Footer 送出前 helper/billVerify.js checkServicesOrders 要求每一列都有 serviceId（空列不會被丟掉） */}
        <Field label="服務項目" required>
        <ServicesAutoComplete
          setServiceAlready={setServiceAlready}
          inputProps={{ placeholder: '服務名稱/代號' }}
          onChange={handleServiceChange}
          className="mr-[12px] flex w-[250px]"
          value={service.serviceId}
          orderId={orderId}
          ref={serviceRef}
          name="service"
          autoFocus={focus === 'service'}
          onFocus={handleFocus}
          onFieldChange={handleServiceFieldChange}
          getData={getData}
          onKeyDown={event => {
            if (event.key === 'Enter' && bill.serviceOrders[index] !== undefined) {
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
        />
        </Field>
        {service.serviceId ? (
          <Fragment>
            <Field label="價格" className="mr-[12px] flex w-[65px]">
            <TextField
              fullWidth
              variant="outlined"
              inputRef={priceRef}
              name="price"
              onFocus={handleFocus}
              autoFocus={focus === 'price'}
              onKeyDown={event => {
                if (event.key === 'Enter' && helper.length > 0 && !serviceDetail.loading) {
                  setFocus(helper[0].type)
                  idx(helperRefs, _ => _[0].current.focus())
                }
                if (
                  event.key === 'Enter' &&
                  helper.length === 0 &&
                  !serviceDetail.loading &&
                  isHelperDesignation
                ) {
                  if (ticketDisabled || !thirdPartTicket) {
                    changeRowFocus(index + 1)
                    setFocus('service')
                  } else {
                    setFocus('thirdParty')
                    thirdPartyRef.current.focus()
                  }
                } else if (
                  event.key === 'Enter' &&
                  helper.length === 0 &&
                  !serviceDetail.loading &&
                  !isHelperDesignation
                ) {
                  if (ticketDisabled || !thirdPartTicket) {
                    changeRowFocus(index + 1)
                    setFocus('service')
                  } else {
                    setFocus('thirdParty')
                    thirdPartyRef.current.focus()
                  }
                }
              }}
              value={service.price}
              onChange={handlePriceChange}
              disabled={!!(service.isLocked === 'TRUE' || service.isLocked === 'UNSET')}
            />
            </Field>

            {!serviceDetail.loading &&
              helper.map((data, idx) => (
                <div key={`${data.type}-${idx}`}>
                  <Field label={`${data.type}`}>
                  <EmployeeAutoComplete
                    className="mr-[12px] flex w-[150px] min-w-[150px]"
                    assistField="mr-[12px] flex w-[120px] min-w-[120px]"
                    isAssist={true}
                    placeholder={`${data.type}`}
                    value={data.helperId}
                    name={data.type}
                    ref={helperRefs[idx]}
                    autoFocus={focus === data.type}
                    onChange={value =>
                      handleAssistantChange({
                        value,
                        dataType: data.type,
                        helperIndex: idx,
                      })
                    }
                    onKeyDown={event => {
                      if (event.key === 'Enter' && isHelperDesignation) {
                        setFocus(data.type + 'designate')
                        helperDesignateRefs[idx].current.focus()
                      } else if (event.key === 'Enter' && idx + 1 < helper.length) {
                        setFocus(helper[idx + 1].type)
                        helperRefs[idx + 1].current.focus()
                      } else if (
                        event.key === 'Enter' &&
                        idx + 1 === helper.length &&
                        isHelperDesignation &&
                        thirdPartTicket
                      ) {
                        setFocus('thirdParty')
                        thirdPartyRef.current.focus()
                      } else if (
                        event.key === 'Enter' &&
                        idx + 1 === helper.length &&
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
                    <FormControlLabel
                      control={<Checkbox color="primary" inputRef={helperDesignateRefs[idx]} />}
                      autoFocus={focus === data.type + 'designate'}
                      inputRef={helperDesignateRefs[idx]}
                      name={data.type + 'designate'}
                      onFocus={handleFocus}
                      checked={data.isDesignate}
                      label="指定"
                      className="mr-[12px] flex w-[100px] last:mr-0"
                      onChange={(_event, state) =>
                        handleIsDesignateChange({
                          dataType: data.type,
                          value: state,
                          helperIndex: idx,
                        })
                      }
                      onKeyDown={event => {
                        if (event.key === 'Enter' && idx + 1 < helper.length) {
                          setFocus(helper[idx + 1].type)
                          helperRefs[idx + 1].current.focus()
                        } else if (
                          event.key === 'Enter' &&
                          idx + 1 === helper.length &&
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
                    />
                  )}
                </div>
              ))}
          </Fragment>
        ) : (
          ''
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {(thirdPartTicket || (ticketDisabled && service.thirdPartyCouponMerchantId)) && (
            <Field label="第三方卡券">
            <ThirdPartyAutoComplete
              setThirdPartyAlready={setThirdPartyAlready}
              className="mr-[12px] flex w-[150px] min-w-[150px]"
              fieldProps={{ placeholder: '第三方卡券' }}
              value={service.thirdPartyCouponMerchantId}
              ref={thirdPartyRef}
              name="thirdParty"
              disabled={ticketDisabled}
              autoFocus={focus === 'thirdParty'}
              onChange={e => handleThirdPartyChange(e ? e.id : null)}
              onFocus={handleFocus}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  if (servicesLength - 1 !== index) {
                    setFocus('service')
                  }
                  changeRowFocus(index + 1)
                }
              }}
            />
            </Field>
          )}
          {(thirdPartTicket || (ticketDisabled && service.thirdPartyCouponMerchantId)) &&
            thirdPartyCoupons.map((data, index) => {
              if (data.id === service.thirdPartyCouponMerchantId) {
                if (data.type === 'PERCENT') {
                  return (
                    <p className="m-0 text-[0.8125rem] font-bold" key={index} style={{ marginTop: '4px' }}>
                      扣完後業績:{Math.round((service.price * (100 - data.fee)) / 100)}
                    </p>
                  )
                } else {
                  return (
                    <p className="m-0 text-[0.8125rem] font-bold" key={index} style={{ marginTop: '4px' }}>
                      扣完後業績:{Math.round(service.price - data.fee)}
                    </p>
                  )
                }
              }
            })}
        </div>
        <RowIconButton
          label="清除此列" className="mr-1.5"
          onClick={handleClear}
          data-testid={`service-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>

        {!first ? (
          <RowIconButton
            label="刪除此列" className="mr-1.5"
            onClick={function () {
              removeService(index)
            }}
            data-testid={`service-${index}-delete`}
          >
            <Trash2 aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          ''
        )}
      </div>
      {last ? (
        <AddRowButton
          onClick={addService}
          data-testid={`service-${index}-add`}
        />
      ) : (
        ''
      )}
    </Fragment>
  )
}
