/** @jsxImportSource @emotion/react */
import { Dialog } from 'ui/modal-compat'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon, DisabledByDefaultRounded as DisabledByDefaultRoundedIcon } from 'ui/icons'
import styles from './styles/OrderTable'
import { css } from '@emotion/react'

import NewChoseEvent from './NewChoseEvent'
import HolidayEdit from './HolidayEdit'
import clsx from 'clsx'

const OrderTable = ({
  orderRange, calendarData, designerNameType, merchantId, checkinMode,
  openTime, refetchData, remarkDisplay, designerId, cusRemarkDisplay,
  ndsRef, checkinSettings
}) => {
  const isCheckinIcon = <AssignmentTurnedInRoundedIcon style={{ top: 5, right: 5, position: 'absolute' }}/>
  const noCheckinIcon = <DisabledByDefaultRoundedIcon style={{ top: 5, right: 5, position: 'absolute' }}/>
  const [modalOpen, setModalOpen] = useState(false)
  const [holidayModel, setHolidayModel] = useState(false)
  const [modaltype, setModalType] = useState('')
  const [editOrder, setEditOrder] = useState({})
  const [holidayData, setHolidayData] = useState({})
  const [clickData, setClickData] = useState({})
  const basicWidth = 150
  const ndWidth = 30
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

  const findTitleWidth = (length, breakLength) => {
    let width = basicWidth
    if (length > 1) {
      width = (length - 1) * basicWidth
    }
    if (breakLength > 0) {
      width += breakWidth
    }
    if (length > 1 || breakLength > 0) {
      width += ndWidth
    }
    if (length <= 1 && breakLength > 0) {
      width = basicWidth + ndWidth
    }
    if (length === 1 && breakLength === 2) {
      width = basicWidth
    }
    return width
  }

  const findOrderWidth = length => {
    const width = basicWidth * Math.max(0, length - 1)
    return width
  };

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

  const handleShowCheckinIcon = (orderTime, isCheckin) => {
    if (!checkinSettings.isBookingCheckinEnabled) return null
    if (isCheckin) return isCheckinIcon
    if (orderTime < new Date().getTime()) return noCheckinIcon
  }

  return (
    <div css={styles.TableContainer} className='ManagementReservationRecord bg-background'>

      {/* table head */}
      <div css={styles.tableHead}>
        <div style={{ position: 'sticky', left: 0, zIndex: 1 }} css={css([styles.timeTitle, styles.title])}>時間</div>
        {calendarData.map(data => (
          <div style={{ width: findTitleWidth(data.length, data.breakLength)}} key={`name-${data.title}`} css={styles.title}>
            {data.title}
          </div>
        ))}
      </div>

      {/* table body */}
      <div css={styles.tableBody}>

        {/* 時間 */}
        <div
          style={{ position: 'sticky', left: 0, zIndex: 5, background: 'rgb(var(--background))' }}
          css={styles.timeWrap}
          id='darkBg'
        >
          {orderRange[0].map(d => (
            <div key={d} css={styles.timeItem}>{format(d, 'HH:mm')}</div>
          ))}
        </div>

        {/* 指定預約 */}
        {calendarData.map(({
          title, length, breakLength, countHoliday, orders, orderGroup, breakGroup, bookingLimit, countOrder
        }, index) => {
          const width = findTitleWidth(length, breakLength)
          return (
            <div key={`${title}-${index}`} style={{ width: width }} css={styles.desWrap}>
              {orderRange[index].map(d => (
                <div
                  key={d}
                  css={styles.orderItem}
                  style={{ width: width}}
                  onClick={() => {
                    setModalType(countHoliday[d] ? 'openOrder' : 'default')
                    setModalOpen(true)
                    setClickData({
                      dateTime: d,
                      designerId: designerId,
                    })
                  }}
                >
                <div style={{ width: length > 1 ? ndWidth : basicWidth }} css={css([styles.limitItem, (length > 1 && countHoliday[d]) ? styles.holiday : {}])} className='hoverItem'>
                  {length > 1 || breakLength > 0  ? handleCountLimit(countOrder[d], bookingLimit) : `可預約人數:${handleCountLimit(countOrder[d], bookingLimit)}`}
                </div>
                </div>
              ))}
              {length > 1 && (
                <div style={{ width: (length - 1) * basicWidth }} css={styles.calendarWrap}>
                  {orderGroup.map(({ data, parentStyle }, i) => (
                    <div key={`currentData-${i}`} css={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, start, end, style, type, designerId, ...rest }) => {
                        return (
                          <div
                            key={key}
                            ref={e => e && ndsRef.current.push(e)}
                            style={{ ...style, width: `${(length - 1) * basicWidth / data.length}px`, position: 'relative'  }}
                            css={styles.clickItem}
                            id='darkBorder'
                            onClick={() => {
                              if(rest.isDone) {
                                window.open(`/order/${rest.createdOrderId}`, '_blank');
                              } else if (type.includes('HOLIDAY')) {
                                setHolidayModel(true)
                                setHolidayData({
                                  designerId,
                                  startTime: start,
                                  endTime: end
                                })
                              } else {
                                setEditOrder({
                                  id: key,
                                  date: start,
                                  status: rest.bookingStatus,
                                  isDesignate: rest.isDesignate,
                                  customer: {
                                    id: rest.customerId,
                                    name: rest.nameToDisplay,
                                    cellphone: rest.customerCellphone,
                                  },
                                  designer: {
                                    id: designerId,
                                    name: renderName(rest)
                                  },
                                  remark: rest.remark,
                                  remarkForCustomer: rest.remarkForCustomer,
                                  timeCost: rest.timeCost,
                                  isBookingCostUsing: rest.isBookingCostUsing,
                                  companionCount: rest.companionCount,
                                  isCheckin: rest.isCheckin,
                                  notificationDayCount: rest.notificationDayCount,
                                  notificationDate: rest.notificationDate
                                })
                                setModalOpen(true)
                                setModalType(rest.status === '待審核' ? 'orderCheck' : 'orderSuccess')
                              }
                            }}
                          >
                            <span>{rest.displayBirthdayIcon && '🎂'}{rest.nameToDisplay}</span>
                            {cusRemarkDisplay && <span id='cusRemark' style={{ fontSize: 12 }}>{rest.remarkForCustomer}</span>}
                            {remarkDisplay && <span id='remark' style={{ fontSize: 12 }}>{rest.remark}</span>}
                            {handleShowCheckinIcon(start, rest.isCheckin)}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
              {breakLength > 0 && (
                <div style={{ width: length > 1 ? breakWidth : basicWidth , left: findOrderWidth(length) }} css={styles.calendarWrap}>
                  {breakGroup.map(({ data, parentStyle }, i) => (
                    <div key={`isBreakGroups-${i}`} css={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, nameToDisplay, start, end, style }, i) => {
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
                                startTime: start,
                                endTime: end
                              })
                            }}
                          >
                            <span>{nameToDisplay}</span>
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
        <NewChoseEvent
          openTime={openTime}
          editOrder={editOrder}
          setEditOrder={setEditOrder}
          modaltype={modaltype}
          setModalType={setModalType}
          merchantId={merchantId}
          setModalOpen={setModalOpen}
          clickData={clickData}
          refetchData={refetchData}
          checkinSettings={checkinSettings}
          checkinMode={checkinMode}
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
    </div>
  )
}

export default OrderTable
