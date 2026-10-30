import { Checkbox, FormControlLabel } from 'ui/checkbox'
import { Field, Input } from 'ui/input'
import { Eraser, Copy, Trash2 } from 'lucide-react'
import { RowIconButton, AddRowButton } from 'views/OrderCreate/RowAction'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import ServicesAutoComplete from 'components/ServicesAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import billContext from 'context/keyInContext'
import { useLazyFetchServiceNew } from 'hooks/useFetchService'
import idx from 'idx'
import cloneDeep from 'lodash/cloneDeep'
import React, { Fragment, useRef, useEffect } from 'react'
import { formatNumber } from 'ui/format'
import { ROW_ICON_ALIGN } from 'views/OrderShared/rowAlign'

// 版面比照打帳單（views/OrderCreate/styles/Services）：欄位上方標籤、上緣對齊（OrderShared/rowAlign）、窄螢幕換行不擠壓
// 原 emotion styles 逐值轉 Tailwind（spacing 單位 8px；pxToRem 以 16px 換算）。自動完成元件的 className／assistField 原以 css 套在根節點
const styles = {
  service: 'flex items-start justify-start flex-wrap gap-y-[12px] mb-[24px]',
  field: 'w-[150px] min-w-[150px] flex mr-[12px]',
  servicesField: 'w-[250px] flex mr-[12px]',
  assistField: 'w-[120px] min-w-[120px] flex mr-[12px]',
  priceField: 'w-[65px] flex mr-[12px]',
  checkbox: 'w-[100px] flex mr-[12px] last:mr-0',
  heading2: 'text-label font-bold',
}

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
  servicesLength,
  isHelperDesignation,
  thirdPartTicket,
  bindedThirdPart,
}) {
  const [helper, setHelper] = React.useState(service.serviceOrderHelpers)
  const [getService, serviceDetail] = useLazyFetchServiceNew()
  const { orderId, thirdPartyCoupons, focus, setFocus, bill } = React.useContext(billContext)
  const [helperRefs, setHelperRefs] = React.useState([])
  const [helperDesignateRefs, setHelperDesignateRefs] = React.useState([])
  const [ticketDisabled, setTicketDisabled] = React.useState(false)
  const useGetServiceRef = React.useRef(getService)
  const thirdPartyRef = React.useRef()

  const serviceRef = useRef()
  const priceRef = useRef()

  useEffect(() => {
    if (expanded && focusFirstField && bill.serviceOrders.length === index && bill.designerId) {
      idx(serviceRef, _ => _.current.focus())
    } else {
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [expanded, focusFirstField] 變動時執行；bill.designerId、bill.serviceOrders.length、index 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [expanded, focusFirstField])

  React.useEffect(() => {
    if (service.serviceId) {
      useGetServiceRef.current({
        variables: {
          serviceId: service.serviceId,
        },
      })
    }
  }, [service.serviceId])
  React.useEffect(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [serviceDetail.data, serviceDetail.loading] 變動時執行；helper 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [serviceDetail.data, serviceDetail.loading])
  React.useEffect(() => {
    if (helper.length > 0) {
      setHelperRefs(elRefs =>
        Array(helper.length)
          .fill()
          .map((_, i) => elRefs[i] || React.createRef())
      )
      setHelperDesignateRefs(elRefs =>
        Array(helper.length)
          .fill()
          .map((_, i) => elRefs[i] || React.createRef())
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [focus, focusRow] 變動時執行；helper.length、helperRefs、index、service.isLocked 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [focus, focusRow])

  const handleFocus = event => {
    setFocus(event.target.name)
    event.target.focus()
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
      default:
        // 其他值不處理（與原本沒有 default 時相同）
        break
    }
    // 店家的鎖定設定（bindedThirdPart）可能比服務晚回來，也要重新判斷「依店家設定」
  }, [service, bindedThirdPart])
  return (
    <Fragment>
      <div className={styles.service}>
        {index === 0 ? (
          <RowIconButton label="從清單選擇服務" className={`mx-1.5 ${ROW_ICON_ALIGN}`} onClick={handleOpenServicesModal}>
            <Copy aria-hidden="true" strokeWidth={1.75} />
          </RowIconButton>
        ) : (
          <span aria-hidden="true" className={`mx-1.5 h-8 w-8 shrink-0 ${ROW_ICON_ALIGN}`} />
        )}
        {/* 不標必填 *：本頁 PannelService 寫入 bill.serviceOrders 前一律 filter(d => d.serviceId)，
            沒選服務的列會被略過，不會被 helper/billVerify.js 的 checkServicesOrders 擋下 */}
        <Field label="服務項目">
          <ServicesAutoComplete
            onChange={handleServiceChange}
            className={styles.servicesField}
            value={service.serviceId}
            orderId={orderId}
            ref={serviceRef}
            name="service"
            autoFocus={focus === 'service'}
            onFocus={handleFocus}
            onFieldChange={handleServiceFieldChange}
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
            inputProps={{
              'data-testid': `service-${index}`,
              placeholder: '服務名稱/代號',
            }}
          />
        </Field>
        {service.serviceId ? (
          <React.Fragment>
            <Field label="價格" className={styles.priceField}>
              <Input
                ref={priceRef}
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
                data-testid={`service-${index}-price`}
                disabled={!!(service.isLocked === 'TRUE' || service.isLocked === 'UNSET')}
              />
            </Field>

            {!serviceDetail.loading &&
              helper.map((data, idx) => (
                <React.Fragment key={`${data.type}-${idx}`}>
                  <div>
                    <Field label={`${data.type}`}>
                      <EmployeeAutoComplete
                        className={styles.field}
                        assistField={styles.assistField}
                        isAssist={true}
                        placeholder={data.type}
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
                        className={styles.checkbox}
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
                </React.Fragment>
              ))}
          </React.Fragment>
        ) : (
          ''
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {(thirdPartTicket || (ticketDisabled && service.thirdPartyCouponMerchantId)) && (
            <Field label="第三方卡券">
              <ThirdPartyAutoComplete
                className={styles.field}
                fieldProps={{ placeholder: '第三方卡券' }}
                value={service.thirdPartyCouponMerchantId}
                ref={thirdPartyRef}
                name="thirdParty"
                disabled={ticketDisabled}
                onChange={e => handleThirdPartyChange(e ? e.id : null)}
                onFocus={handleFocus}
                inputProps={{
                  'data-testid': `service-${index}-thirdParty`,
                }}
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
                    <p key={index} className={`m-0 ${styles.heading2}`} style={{ marginTop: '4px' }}>
                      扣完後業績:{formatNumber(Math.round((service.price * (100 - data.fee)) / 100))}
                    </p>
                  )
                } else {
                  return (
                    <p key={index} className={`m-0 ${styles.heading2}`} style={{ marginTop: '4px' }}>
                      扣完後業績:{formatNumber(Math.round(service.price - data.fee))}
                    </p>
                  )
                }
              }
              return undefined
            })}
        </div>
        <RowIconButton
          label="清除此列"
          className={`mr-1.5 ${ROW_ICON_ALIGN}`}
          onClick={handleClear}
          data-testid={`service-${index}-clear`}
        >
          <Eraser aria-hidden="true" strokeWidth={1.75} />
        </RowIconButton>

        {!first ? (
          <RowIconButton
            label="刪除此列"
            className={`mr-1.5 ${ROW_ICON_ALIGN}`}
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
