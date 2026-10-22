// 預約動作彈窗內有日期選擇器／下拉／Autocomplete 與相容層 PasswordDialog，保留相容層 Dialog；公休彈窗只有切換鈕與按鈕，改 ui/dialog
import { Dialog } from 'ui/modal-compat'
import { Dialog as UiDialog, DialogContent as UiDialogContent } from 'ui/dialog'
import React, { useState, useEffect } from 'react'
import { AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon, DisabledByDefaultRounded as DisabledByDefaultRoundedIcon, EventBusy as EventBusyIcon } from 'ui/icons'
import { format } from 'date-fns'
import { readableTextOn } from 'components/CalendarColorClip'
import { CalendarOff } from 'lucide-react'

import ChoseEvent from './ChoseEvent'
import HolidayEdit from 'components/ReservationCalendar/HolidayEdit'

// 原 ./styles/OrderTable.js（emotion css 物件，只有本檔使用，已刪除）逐值轉 Tailwind；原 `!important` 以 `!` 前綴保留。
// title 與 ndsTitle／timeTitle 合併時 title 的 borderRight 在後、覆蓋 ndsTitle，故 ndsTitle 不另輸出。
const styles = {
  TableContainer: 'min-h-[60vh] h-[calc(100vh-260px)] overflow-scroll relative !rounded-[16px] ![box-shadow:none] ![border:1px_solid_rgb(var(--border))] [&>div]:flex',
  title: 'p-[12px_16px] break-all font-[800] bg-[rgb(var(--surface))] text-[rgb(var(--text))] min-h-[56px] flex items-center justify-center shrink-0 [border-right:1px_solid_rgb(var(--border))] text-[14px] tracking-[0.5px] uppercase',
  timeTitle: 'w-[60px] !px-1', // 60px 欄寬扣掉左右 16px 內距放不下「時間」兩字會斷行
  ndsItem: '[border-top:1px_solid_rgb(var(--border))] [border-right:1px_solid_rgb(var(--border))] [border-left:1px_solid_rgb(var(--border))] flex justify-end bg-[rgb(var(--surface))]',
  ndsWrap: 'w-[100px] shrink-0 flex flex-col items-end',
  timeItem: '[border-top:1px_solid_rgb(var(--border))] [border-right:1px_solid_rgb(var(--border))] text-center [align-content:center] text-[14px] font-bold text-[rgb(var(--text))] bg-[rgb(var(--surface))]',
  timeWrap: 'w-[60px] shrink-0',
  desWrap: 'relative shrink-0',
  orderItem: '[border-top:1px_solid_rgb(var(--border))] [border-right:1px_solid_rgb(var(--border))] flex justify-end',
  limitItem: 'w-full text-[rgb(var(--text-tertiary))] flex items-center justify-center text-[12px] overflow-hidden flex-col cursor-pointer [transition:background-color_0.2s] hover:!bg-accent/10 [&_.capacity-label]:text-[12px] [&_.capacity-label]:leading-4 [&_.capacity-label]:text-[rgb(var(--text-secondary))] [&_.capacity-label]:mb-[2px] [&_.capacity-value]:text-[14px] [&_.capacity-value]:font-bold [&_.capacity-value]:text-[rgb(var(--accent))]',
  calendarWrap: 'absolute h-full top-0 left-0 overflow-hidden [border-right:1px_solid_rgb(var(--border))]',
  clickWrap: 'flex gap-0 absolute w-full',
  clickItem: 'rounded-[12px] cursor-pointer flex items-center justify-center flex-col text-[13px] font-bold text-[#fff] [border:2px_solid_white] [box-shadow:0px_4px_10px_rgba(0,0,0,0.1)] overflow-hidden [transition:transform_0.1s_ease] hover:z-10 hover:[transform:scale(1.02)] [&_span]:p-[0px_8px] [&_span]:break-all [&_span]:text-center',
  holiday: '!bg-danger/10 [&_.capacity-value]:!text-danger',
  tableBody: 'relative w-fit [border-bottom:1px_solid_rgb(var(--border))]',
  tableHead: 'sticky top-0 z-10 w-fit [border-bottom:1px_solid_rgb(var(--border))]',
}

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
    } else if (designerNameType === 'BOTH') {
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
    <div className={`ManagementReservationRecord bg-background ${styles.TableContainer}`}>

      {/* table head */}
      <div className={styles.tableHead}>
        <div style={{ position: 'sticky', left: 0, zIndex: 5, width: findNDSWidth() }} className={styles.title}>不指定</div>
        <div style={{ position: 'sticky', left: findNDSWidth(), zIndex: 1 }} className={`${styles.timeTitle} ${styles.title}`}>時間</div>
        {designate.map(designer => (
          <div style={{ width: findDesignerWidth(designer.length, designer.breakLength) }} key={`name-${designer.designerId}`} className={styles.title}>
            {renderName(designer)}
          </div>
        ))}
      </div>

      {/* table body */}
      <div className={styles.tableBody}>

        {/* 不指定預約 */}
        <div
          style={{ position: 'sticky', left: 0, zIndex: 5, background: 'rgb(var(--background))', width: findNDSWidth() }}
          className={styles.ndsWrap}
          id='darkBg'
        >
          {orderRange.map(d => (
            <div
              key={`nds-${d}`}
              className={styles.ndsItem}
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
                className={`hoverItem ${styles.limitItem}`}
              ></div>
            </div>
          ))}
          {nonDesignate.length > 1 && (
            <div style={{ width: (nonDesignate.length - 1) * calendarSize.width }} className={styles.calendarWrap}>
              {nonDesignate.isOrderGroups.map(({ data, parentStyle }, i) => (
                <div key={`isNdsOrderGroups-${i}`} className={styles.clickWrap} style={parentStyle}>
                  {data.map(({ key, dates, customData, style }) => {
                    return <div
                      key={key}
                      ref={e => e && ndsRef.current.push(e)}
                      style={{ ...style, color: readableTextOn(style.backgroundColor), width: `${(nonDesignate.length - 1) * calendarSize.width / data.length - 2}px`, position: 'relative' }}
                      className={styles.clickItem}
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
          className={styles.timeWrap}
          id='darkBg'
        >
          {orderRange.map(d => (
            <div key={d} style={{ height: calendarSize.height }} className={styles.timeItem}>{format(d, 'HH:mm')}</div>
          ))}
        </div>

        {/* 指定預約 */}
        {designate.map(({
          designerId, length, isBreakGroups, breakLength, countHoliday, isOrderGroups, bookingLimit, countOrder, ...rest
        }) => {
          return (
            <div key={`${designerId}`} style={{ width: findDesignerWidth(length, breakLength) }} className={styles.desWrap}>
              {orderRange.map(d => (
                <div
                  key={`${designerId}-${d}`}
                  className={styles.orderItem}
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
                  {/* 不可預約時段（countHoliday）原本只靠淡紅底色＋紅字：數字前加圖示、讀屏與滑過提示補文字 */}
                  <div
                    style={{ width: length > 1 || breakLength > 0 ? ndWidth : calendarSize.width }}
                    className={`hoverItem ${styles.limitItem}${countHoliday[d] ? ` ${styles.holiday}` : ''}`}
                    title={countHoliday[d] ? '不可預約時段' : undefined}
                  >
                    {!(length > 1 || breakLength > 0) && <span className="capacity-label">可預約人數</span>}
                    <span className="capacity-value inline-flex items-center gap-0.5">
                      {countHoliday[d] ? <CalendarOff aria-hidden="true" strokeWidth={2} className="h-3 w-3 shrink-0" /> : null}
                      {countHoliday[d] ? <span className="sr-only">不可預約時段，</span> : null}
                      {handleCountLimit(countOrder[d], bookingLimit)}
                    </span>
                  </div>
                </div>
              ))}
              {length > 1 && (
                <div style={{ width: (length - 1) * calendarSize.width }} className={styles.calendarWrap}>
                  {isOrderGroups.map(({ data, parentStyle }, i) => (
                    <div key={`isOrderGroups-${i}`} className={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, dates, customData, style }) => {
                        return (
                          <div
                            ref={e => e && ndsRef.current.push(e)}
                            key={key}
                            style={{ ...style, color: readableTextOn(style.backgroundColor), width: `${(length - 1) * calendarSize.width / data.length}px`, position: 'relative' }}
                            className={styles.clickItem}
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
                <div style={{ width: length > 1 ? breakWidth : calendarSize.width, left: findOrderWidth(length) }} className={styles.calendarWrap}>
                  {isBreakGroups.map(({ data, parentStyle }, i) => (
                    <div key={`isBreakGroups-${i}`} className={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, customData, style }, i) => {
                        return (
                          <div
                            key={key}
                            style={{ ...style, color: readableTextOn(style.backgroundColor), width: '100%' }}
                            className={styles.clickItem}
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
