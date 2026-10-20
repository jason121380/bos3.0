// 兩個彈窗內只有動作清單與時段切換鈕（無下拉／日期彈層），改用 ui Dialog；舊版無關閉鈕（點背景關閉），故 hideClose
import { Dialog, DialogContent, DialogTitle } from 'ui/dialog'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { readableTextOn } from 'components/CalendarColorClip'
import { AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon, DisabledByDefaultRounded as DisabledByDefaultRoundedIcon } from 'ui/icons'

import NewChoseEvent from './NewChoseEvent'
import HolidayEdit from './HolidayEdit'
import clsx from 'clsx'

// 原 styles/OrderTable（emotion）等值轉 Tailwind；框線只設單邊，用任意屬性避免 border-style 影響其他邊
const titleClass = 'flex h-[40px] items-center justify-center [border-right:1px_solid_lightgray] bg-[#08424c] px-[5px] py-[2px] text-[14px] font-semibold text-white'
const clickWrapClass = 'absolute flex w-full gap-0'
const clickItemClass = 'flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[15px] [border:3px_solid_white] text-[14px] text-white hover:z-[3] [&_span]:break-all [&_span]:px-[4px] [&_span]:py-0'
const calendarWrapClass = 'absolute left-0 top-0 h-full overflow-hidden [border-right:1px_solid_lightgray]'

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
    <div className='ManagementReservationRecord relative h-[calc(100vh-260px)] min-h-[60vh] overflow-scroll bg-background [&>div]:flex'>

      {/* table head */}
      <div className="sticky top-0 z-[7] w-fit">
        <div style={{ position: 'sticky', left: 0, zIndex: 1 }} className={`w-[50px] ${titleClass}`}>時間</div>
        {calendarData.map(data => (
          <div style={{ width: findTitleWidth(data.length, data.breakLength)}} key={`name-${data.title}`} className={titleClass}>
            {data.title}
          </div>
        ))}
      </div>

      {/* table body */}
      <div className="relative w-fit [border-bottom:1px_solid_lightgray]">

        {/* 時間 */}
        <div
          style={{ position: 'sticky', left: 0, zIndex: 5, background: 'rgb(var(--background))' }}
          className="w-[50px] shrink-0"
          id='darkBg'
        >
          {orderRange[0].map(d => (
            <div key={d} className="h-[70px] [border-top:1px_solid_lightgray] [border-right:1px_solid_lightgray] text-center text-[14px] leading-[80px]">{format(d, 'HH:mm')}</div>
          ))}
        </div>

        {/* 指定預約 */}
        {calendarData.map(({
          title, length, breakLength, countHoliday, orders, orderGroup, breakGroup, bookingLimit, countOrder
        }, index) => {
          const width = findTitleWidth(length, breakLength)
          return (
            <div key={`${title}-${index}`} style={{ width: width }} className="relative min-w-[100px] shrink-0">
              {orderRange[index].map(d => (
                <div
                  key={d}
                  className="flex h-[70px] justify-end [border-top:1px_solid_lightgray] [border-right:1px_solid_lightgray]"
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
                <div style={{ width: length > 1 ? ndWidth : basicWidth }} className={`flex w-[100px] cursor-pointer flex-col items-center justify-center overflow-hidden text-[14px] text-[#8a8a8a] [border-left:1px_solid_lightgray]${(length > 1 && countHoliday[d]) ? ' [background:#ffa9a9]' : ''} hoverItem`}>
                  {length > 1 || breakLength > 0  ? handleCountLimit(countOrder[d], bookingLimit) : `可預約人數:${handleCountLimit(countOrder[d], bookingLimit)}`}
                </div>
                </div>
              ))}
              {length > 1 && (
                <div style={{ width: (length - 1) * basicWidth }} className={calendarWrapClass}>
                  {orderGroup.map(({ data, parentStyle }, i) => (
                    <div key={`currentData-${i}`} className={clickWrapClass} style={parentStyle}>
                      {data.map(({ key, start, end, style, type, designerId, ...rest }) => {
                        return (
                          <div
                            key={key}
                            ref={e => e && ndsRef.current.push(e)}
                            style={{ ...style, color: readableTextOn(style.backgroundColor), width: `${(length - 1) * basicWidth / data.length}px`, position: 'relative'  }}
                            className={clickItemClass}
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
                <div style={{ width: length > 1 ? breakWidth : basicWidth , left: findOrderWidth(length) }} className={calendarWrapClass}>
                  {breakGroup.map(({ data, parentStyle }, i) => (
                    <div key={`isBreakGroups-${i}`} className={clickWrapClass} style={parentStyle}>
                      {data.map(({ key, nameToDisplay, start, end, style }, i) => {
                        return (
                          <div
                            key={key}
                            style={{ ...style, color: readableTextOn(style.backgroundColor), width: '100%' }}
                            className={clickItemClass}
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
      <Dialog open={modalOpen} onOpenChange={o => !o && setModalOpen(false)}>
        <DialogContent size="sm" hideClose aria-describedby={undefined} className='ManagementReservationRecordDialog'>
        {/* 原彈窗沒有標題；Radix Dialog 需有標題供輔助技術朗讀，以 sr-only 提供 */}
        <DialogTitle className="sr-only">預約動作</DialogTitle>
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
        </DialogContent>
      </Dialog>
      <Dialog open={holidayModel} onOpenChange={o => !o && setHolidayModel(false)}>
        <DialogContent size="md" hideClose aria-describedby={undefined} className='ManagementReservationRecordDialog'>
        <HolidayEdit
          holidayData={holidayData} 
          setHolidayData={setHolidayData} 
          setHolidayModel={setHolidayModel}
          refetchData={refetchData}
        />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OrderTable
