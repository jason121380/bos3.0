/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react'
import { AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon, DisabledByDefaultRounded as DisabledByDefaultRoundedIcon, EventBusy as EventBusyIcon } from 'ui/icons'
import { TableContainer, Paper, Dialog } from '@mui/material'
import { format } from 'date-fns'
import styles from './styles/OrderTable'
import { css } from '@emotion/react'

import ChoseEvent from './ChoseEvent'
import HolidayEdit from './HolidayEdit'

const OrderTable = ({
  orderRange, calendarData, designerNameType, merchantId, refetchData,
  remarkDisplay, cusRemarkDisplay, ndsRef, checkinSettings, bookingCusCheck,
  checkinMode, modalOpen, setModalOpen, editOrder, setEditOrder, calendarSize,
  cancelPasswordUsing
}) => {
  const isCheckinIcon = <AssignmentTurnedInRoundedIcon style={{ top: 5, right: 5, position: 'absolute' }} />
  const noCheckinIcon = <DisabledByDefaultRoundedIcon style={{ top: 5, right: 5, position: 'absolute' }} />
  const { designate, nonDesignate } = calendarData
  const [holidayModel, setHolidayModel] = useState(false)
  const [modaltype, setModalType] = useState('')
  const [holidayData, setHolidayData] = useState({})
  const [clickData, setClickData] = useState({})
  // const basicWidth = 150
  const limitWidth = 60
  const ndWidth = 30
  const noNdWidth = 30
  const breakWidth = 75

  const renderName = data => {
    const { designerName, designerNickname } = data
    let name = designerName
    if (designerNameType === 'NICKNAME') {
      name = designerNickname || designerName
    } else if (designerName === 'BOTH') {
      name = `${designerName}${designerNickname ? `(${designerNickname})` : ''}`
    }
    return name
  }
  const handleCountLimit = (count, limit) => {
    if (!count) return limit
    return (limit - count) < 0 ? 0 : limit - count
  }

  useEffect(() => {
    ndsRef.current.forEach(element => {
      const remark = element.querySelector('#remark')
      const cusRemark = element.querySelector('#cusRemark')
      if (element) {
        if (element.offsetHeight <= 70 && element.offsetWidth <= 150) {
          if (remarkDisplay && cusRemarkDisplay) {
            if (remark && cusRemark && remark.offsetHeight >= 34 && cusRemark.offsetHeight >= 34) {
              remark.style.alignSelf = 'flex-start'
              remark.style.wordBreak = 'keep-all'
              remark.classList.add("textAnimation");
              cusRemark.style.whiteSpace = 'nowrap'
              cusRemark.style.alignSelf = 'flex-start'
              cusRemark.style.wordBreak = 'keep-all'
              cusRemark.classList.add("textAnimation");
            } else if (remark && remark.offsetHeight >= 34 && cusRemark.offsetHeight <= 17) {
              remark.style.alignSelf = 'flex-start'
              remark.style.wordBreak = 'keep-all'
              remark.classList.add("textAnimation");
            } else if (cusRemark && cusRemark.offsetHeight >= 34 && remark.offsetHeight <= 17) {
              cusRemark.style.whiteSpace = 'nowrap'
              cusRemark.style.alignSelf = 'flex-start'
              cusRemark.style.wordBreak = 'keep-all'
              cusRemark.classList.add("textAnimation");
            }
          }
        } else {
          if (remark) {
            remark.style.alignSelf = null
            remark.style.wordBreak = null
            remark.classList.remove("textAnimation");
          }
          if (cusRemark) {
            cusRemark.style.whiteSpace = null
            cusRemark.style.alignSelf = null
            cusRemark.style.wordBreak = null
          }
        }
      }
    });
  }, [ndsRef, calendarData])

  const findNDSWidth = () => {
    return nonDesignate.length > 1 ? (nonDesignate.length - 1) * calendarSize.width + noNdWidth : limitWidth
  }

  const findDesignerWidth = (length, breakLength) => {
    let width = calendarSize.width
    if (length > 1) {
      width = (length - 1) * calendarSize.width
    }
    if (breakLength > 0) {
      width += breakWidth
    }
    if (length > 1 || breakLength > 0) {
      width += ndWidth
    }
    if (length <= 1 && breakLength > 0) {
      width = calendarSize.width + ndWidth
    }
    return width
  }

  const findOrderWidth = length => {
    const width = calendarSize.width * Math.max(0, length - 1)
    return width
  };

  const handleShowCheckinIcon = (orderTime, isCheckin) => {
    if (!checkinSettings.isBookingCheckinEnabled) return null
    if (isCheckin) return isCheckinIcon
    if (orderTime < new Date().getTime()) return noCheckinIcon
  }

  return (
    <TableContainer component={Paper} css={styles.TableContainer} className="ManagementReservationRecord">

      {/* table head */}
      <div css={styles.tableHead}>
        <div style={{ position: 'sticky', left: 0, zIndex: 5, width: findNDSWidth() }} css={css([styles.ndsTitle, styles.title])}>不指定</div>
        <div style={{ position: 'sticky', left: findNDSWidth(), zIndex: 1 }} css={css([styles.timeTitle, styles.title])}>時間</div>
        {designate.map(designer => (
          <div style={{ width: findDesignerWidth(designer.length, designer.breakLength) }} key={`name-${designer.designerId}`} css={styles.title}>
            {renderName(designer)}
          </div>
        ))}
      </div>

      {/* table body */}
      <div css={styles.tableBody}>

        {/* 不指定預約 */}
        <div
          style={{ position: 'sticky', left: 0, zIndex: 5, background: 'rgb(var(--background))', width: findNDSWidth() }}
          css={styles.ndsWrap}
          id='darkBg'
        >
          {orderRange.map(d => (
            <div
              key={`nds-${d}`}
              css={styles.ndsItem}
              style={{ width: (nonDesignate.length - 1) * calendarSize.width + limitWidth, height: calendarSize.height }}
              onClick={() => {
                setModalType('ndsDefault')
                setModalOpen(true)
                setClickData({
                  dateTime: d,
                })
              }}
            >
              <div
                style={{ width: nonDesignate.length > 1 ? noNdWidth : calendarSize.width }}
                className='hoverItem'
                css={styles.limitItem}
              ></div>
            </div>
          ))}
          {nonDesignate.length > 1 && (
            <div style={{ width: (nonDesignate.length - 1) * calendarSize.width }} css={styles.calendarWrap}>
              {nonDesignate.isOrderGroups.map(({ data, parentStyle }, i) => (
                <div key={`isNdsOrderGroups-${i}`} css={styles.clickWrap} style={parentStyle}>
                  {data.map(({ key, dates, customData, style }) => {
                    return <div
                      key={key}
                      ref={e => e && ndsRef.current.push(e)}
                      style={{ ...style, width: `${(nonDesignate.length - 1) * calendarSize.width / data.length - 2}px`, position: 'relative' }}
                      css={styles.clickItem}
                      id='darkBorder'
                      onClick={() => {
                        setEditOrder({
                          id: key,
                          date: dates,
                          status: customData.bookingStatus,
                          isDesignate: customData.isDesignate,
                          customer: {
                            id: customData.customerId,
                            name: customData.nameToDisplay,
                            cellphone: customData.customerCellphone,
                          },
                          remark: customData.remark,
                          remarkForCustomer: customData.remarkForCustomer,
                          timeCost: customData.timeCost,
                          isBookingCostUsing: customData.isBookingCostUsing,
                          isCheckin: customData.isCheckin,
                          notificationDayCount: customData.notificationDayCount,
                          notificationDate: customData.notificationDate,
                          isCusCheckRequired: customData.isCusCheckRequired
                        })
                        setModalOpen(true)
                        setModalType('editNdsOrder')
                      }}
                    >
                      <span>{customData.displayBirthdayIcon && '🎂'}{customData.nameToDisplay}</span>
                      {cusRemarkDisplay && <span id='cusRemark' style={{ fontSize: 12 }}>{customData.remarkForCustomer}</span>}
                      {remarkDisplay && <span id='remark' style={{ fontSize: 12 }}>{customData.remark}</span>}
                      {handleShowCheckinIcon(dates, customData.isCheckin)}
                    </div>
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 時間 */}
        <div
          style={{ position: 'sticky', left: findNDSWidth(), zIndex: 5, background: 'rgb(var(--background))' }}
          css={styles.timeWrap}
          id='darkBg'
        >
          {orderRange.map(d => (
            <div key={d} style={{ height: calendarSize.height }} css={styles.timeItem}>{format(d, 'HH:mm')}</div>
          ))}
        </div>

        {/* 指定預約 */}
        {designate.map(({
          designerId, length, isBreakGroups, breakLength, countHoliday, isOrderGroups, bookingLimit, countOrder, ...rest
        }) => {
          return (
            <div key={`${designerId}`} style={{ width: findDesignerWidth(length, breakLength) }} css={styles.desWrap}>
              {orderRange.map(d => (
                <div
                  key={`${designerId}-${d}`}
                  css={styles.orderItem}
                  style={{ width: findDesignerWidth(length, breakLength), height: calendarSize.height }}
                  onClick={() => {
                    setModalType(countHoliday[d] ? 'openOrder' : 'default')
                    setModalOpen(true)
                    setClickData({
                      dateTime: d,
                      designerId: designerId,
                    })
                  }}
                >
                  <div style={{ width: length > 1 || breakLength > 0 ? ndWidth : calendarSize.width }} className='hoverItem' css={css([styles.limitItem, countHoliday[d] ? styles.holiday : {}])}>
                    {!(length > 1 || breakLength > 0) && <span className="capacity-label">可預約人數</span>}
                    <span className="capacity-value">{handleCountLimit(countOrder[d], bookingLimit)}</span>
                  </div>
                </div>
              ))}
              {length > 1 && (
                <div style={{ width: (length - 1) * calendarSize.width }} css={styles.calendarWrap}>
                  {isOrderGroups.map(({ data, parentStyle }, i) => (
                    <div key={`isOrderGroups-${i}`} css={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, dates, customData, style }) => {
                        return (
                          <div
                            ref={e => e && ndsRef.current.push(e)}
                            key={key}
                            style={{ ...style, width: `${(length - 1) * calendarSize.width / data.length}px`, position: 'relative' }}
                            css={styles.clickItem}
                            id='darkBorder'
                            onClick={() => {
                              if (customData.isDone) {
                                window.open(`/order/${customData.createdOrderId}`, '_blank');
                              } else if (key.includes('HOLIDAY')) {
                                setHolidayModel(true)
                                setHolidayData({
                                  designerId,
                                  startTime: customData.start,
                                  endTime: customData.end
                                })
                              } else if (customData.type === 'EVENT') {
                                setEditOrder({
                                  id: key,
                                  date: dates,
                                  status: customData.bookingStatus,
                                  isDesignate: customData.isDesignate,
                                  customer: {
                                    id: customData.customerId,
                                    name: customData.nameToDisplay,
                                    cellphone: customData.customerCellphone,
                                  },
                                  designer: {
                                    id: designerId,
                                    name: renderName(rest)
                                  },
                                  remark: customData.remark,
                                  remarkForCustomer: customData.remarkForCustomer,
                                  timeCost: customData.timeCost,
                                  isBookingCostUsing: customData.isBookingCostUsing,
                                  companionCount: customData.companionCount,
                                  isCheckin: customData.isCheckin,
                                  notificationDayCount: customData.notificationDayCount,
                                  notificationDate: customData.notificationDate,
                                  isCusCheckRequired: customData.isCusCheckRequired,
                                  isNoShow: customData.isNoShow
                                })
                                setModalOpen(true)
                                setModalType('event')
                              } else {
                                setEditOrder({
                                  id: key,
                                  date: dates,
                                  status: customData.bookingStatus,
                                  isDesignate: customData.isDesignate,
                                  customer: {
                                    id: customData.customerId,
                                    name: customData.nameToDisplay,
                                    cellphone: customData.customerCellphone,
                                  },
                                  designer: {
                                    id: designerId,
                                    name: renderName(rest)
                                  },
                                  remark: customData.remark,
                                  remarkForCustomer: customData.remarkForCustomer,
                                  timeCost: customData.timeCost,
                                  isBookingCostUsing: customData.isBookingCostUsing,
                                  companionCount: customData.companionCount,
                                  isCheckin: customData.isCheckin,
                                  notificationDayCount: customData.notificationDayCount,
                                  notificationDate: customData.notificationDate,
                                  isCusCheckRequired: customData.isCusCheckRequired,
                                  isNoShow: customData.isNoShow
                                })
                                setModalOpen(true)
                                setModalType('editOrder')
                              }
                            }}
                          >
                            <span>{customData.displayBirthdayIcon && '🎂'}{customData.nameToDisplay}</span>
                            {cusRemarkDisplay && <span id='cusRemark' style={{ fontSize: 12 }}>{customData.remarkForCustomer}</span>}
                            {remarkDisplay && <span id='remark' style={{ fontSize: 12 }}>{customData.remark}</span>}
                            {customData.type !== 'EVENT' && handleShowCheckinIcon(dates, customData.isCheckin)}
                            {(customData.isNoShow && !checkinMode) && <EventBusyIcon style={{ top: 5, left: 5, position: 'absolute' }} />}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
              {breakLength > 0 && (
                <div style={{ width: length > 1 ? breakWidth : calendarSize.width, left: findOrderWidth(length) }} css={styles.calendarWrap}>
                  {isBreakGroups.map(({ data, parentStyle }, i) => (
                    <div key={`isBreakGroups-${i}`} css={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, customData, style }, i) => {
                        return (
                          <div
                            key={key}
                            style={{ ...style, width: '100%' }}
                            css={styles.clickItem}
                            id='darkBorder'
                            onClick={() => {
                              setHolidayModel(true)
                              setHolidayData({
                                designerId,
                                startTime: customData.start,
                                endTime: customData.end
                              })
                            }}
                          >
                            <span>{customData.nameToDisplay}</span>
                            {remarkDisplay && <span style={{ fontSize: 12 }}>{customData.remark}</span>}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 彈窗 */}
      <Dialog className='ManagementReservationRecordDialog' fullWidth maxWidth="xs" open={modalOpen} onClose={() => setModalOpen(false)}>
        <ChoseEvent
          editOrder={editOrder}
          setEditOrder={setEditOrder}
          modaltype={modaltype}
          setModalType={setModalType}
          merchantId={merchantId}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          clickData={clickData}
          orderRange={orderRange}
          bookingCusCheck={bookingCusCheck}
          refetchData={refetchData}
          checkinSettings={checkinSettings}
          checkinMode={checkinMode}
          cancelPasswordUsing={cancelPasswordUsing}
        />
      </Dialog>
      <Dialog className='ManagementReservationRecordDialog' fullWidth maxWidth="sm" open={holidayModel} onClose={() => setHolidayModel(false)}>
        <HolidayEdit
          holidayData={holidayData}
          setHolidayData={setHolidayData}
          setHolidayModel={setHolidayModel}
          refetchData={refetchData}
        />
      </Dialog>
    </TableContainer>
  )
}

export default OrderTable
