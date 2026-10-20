// 預約動作彈窗內容依 modaltype 切換、沒有標題（Radix Dialog 需 DialogTitle，補標題屬文案變更），保留相容層 Dialog；公休彈窗只有切換鈕與按鈕，改 ui/dialog
import { Dialog } from 'ui/modal-compat'
import { Dialog as UiDialog, DialogContent as UiDialogContent } from 'ui/dialog'
import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon, DisabledByDefaultRounded as DisabledByDefaultRoundedIcon } from 'ui/icons'

import NewChoseEvent from './NewChoseEvent'
import HolidayEdit from './HolidayEdit'

// 預約表格樣式（原 styles/OrderTable.js 的 emotion 物件等值轉 Tailwind；單邊框線用任意屬性，避免 border-style 套到四邊）
const titleClass = 'py-[2px] px-[5px] font-semibold bg-[#08424c] text-[#fff] flex items-center justify-center [border-right:1px_solid_lightgray] text-[14px] h-[40px]'
const limitItemClass = 'w-[100px] text-[#8a8a8a] flex items-center justify-center text-[14px] overflow-hidden flex-col cursor-pointer [border-left:1px_solid_lightgray]'
const calendarWrapClass = 'absolute h-full top-0 left-0 overflow-hidden [border-right:1px_solid_lightgray]'
const clickItemClass = 'rounded-[15px] cursor-pointer flex items-center justify-center flex-col text-[14px] text-[#fff] [border:3px_solid_white] overflow-hidden hover:z-[3] [&_span]:py-0 [&_span]:px-[4px] [&_span]:[word-break:break-all]'

const OrderTable = ({
  orderRange, calendarData, designerNameType, merchantId,
  openTime, refetchData, remarkDisplay, designerId,
  cusRemarkDisplay, ndsRef, checkinSettings, checkinMode
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
    <div className="ManagementReservationRecord bg-background min-h-[60vh] h-[calc(100vh-260px)] overflow-scroll relative [&>div]:flex">

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
            <div key={d} className="h-[70px] [border-top:1px_solid_lightgray] [border-right:1px_solid_lightgray] text-center leading-[80px] text-[14px]">{format(d, 'HH:mm')}</div>
          ))}
        </div>

        {/* 指定預約 */}
        {calendarData.map(({
          title, length, breakLength, countHoliday, orders, orderGroup, breakGroup, bookingLimit, countOrder
        }, index) => {
          const width = findTitleWidth(length, breakLength)
          return (
            <div key={`${title}-${index}`} style={{ width: width }} className="min-w-[100px] relative shrink-0">
              {orderRange[index].map(d => (
                <div
                  key={d}
                  className="h-[70px] [border-top:1px_solid_lightgray] [border-right:1px_solid_lightgray] flex justify-end"
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
                <div style={{ width: length > 1 ? ndWidth : basicWidth }} className={`hoverItem ${limitItemClass}${(length > 1 && countHoliday[d]) ? ' [background:#ffa9a9]' : ''}`}>
                  {length > 1 || breakLength > 0  ? handleCountLimit(countOrder[d], bookingLimit) : `可預約人數:${handleCountLimit(countOrder[d], bookingLimit)}`}
                </div>
                </div>
              ))}
              {length > 1 && (
                <div style={{ width: (length - 1) * basicWidth }} className={calendarWrapClass}>
                  {orderGroup.map(({ data, parentStyle }, i) => (
                    <div key={`currentData-${i}`} className="flex gap-0 absolute w-full" style={parentStyle}>
                      {data.map(({ key, start, end, style, type, designerId, ...rest }) => {
                        return (
                          <div
                            key={key}
                            ref={e => e && ndsRef.current.push(e)}
                            style={{ ...style, width: `${(length - 1) * basicWidth / data.length}px`, position: 'relative' }}
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
                    <div key={`isBreakGroups-${i}`} className="flex gap-0 absolute w-full" style={parentStyle}>
                      {data.map(({ key, nameToDisplay, start, end, style }, i) => {
                        return (
                          <div
                            key={key}
                            style={{ ...style, width: '100%' }}
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
      <UiDialog open={holidayModel} onOpenChange={o => !o && setHolidayModel(false)}>
        <UiDialogContent size="md" aria-describedby={undefined} className='ManagementReservationRecordDialog'>
          <HolidayEdit
            holidayData={holidayData} 
            setHolidayData={setHolidayData} 
            setHolidayModel={setHolidayModel}
            refetchData={refetchData}
          />
        </UiDialogContent>
      </UiDialog>
    </div>
  )
}

export default OrderTable
