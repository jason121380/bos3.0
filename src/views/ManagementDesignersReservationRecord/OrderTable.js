// 預約動作彈窗內有相容層 PasswordDialog（Radix Dialog 與其焦點鎖互搶），保留相容層 Dialog；公休彈窗只有切換鈕與按鈕，改 ui/dialog
import { Dialog } from 'ui/modal-compat'
import { Dialog as UiDialog, DialogContent as UiDialogContent } from 'ui/dialog'
import { useState, useEffect } from 'react'
import { AssignmentTurnedInRounded as AssignmentTurnedInRoundedIcon, DisabledByDefaultRounded as DisabledByDefaultRoundedIcon, EventBusy as EventBusyIcon } from 'ui/icons'
import { format } from 'date-fns'
import { readableTextOn } from 'components/CalendarColorClip'

import NewChoseEvent from './NewChoseEvent'
import HolidayEdit from './HolidayEdit'

// 原 ./styles/OrderTable.js（emotion css 物件，只有本檔使用，已刪除）逐值轉 Tailwind；原 `!important` 以 `!` 前綴保留。
// title 與 ndsTitle／timeTitle 合併時 title 的 borderRight 在後、覆蓋 ndsTitle，故 ndsTitle 不另輸出。
const styles = {
  TableContainer: 'min-h-[60vh] h-[calc(100vh-260px)] overflow-scroll relative !rounded-[16px] ![box-shadow:none] ![border:1px_solid_rgb(var(--border))] [&>div]:flex',
  title: 'p-[12px_16px] break-all font-[800] bg-[rgb(var(--surface))] text-[rgb(var(--text))] min-h-[56px] flex items-center justify-center shrink-0 [border-right:1px_solid_rgb(var(--border))] text-[14px] tracking-[0.5px] uppercase',
  timeTitle: 'w-[60px] shrink-0 !px-1', // 60px 欄寬扣掉左右 16px 內距放不下「時間」兩字會斷行
  ndsItem: '[border-top:1px_solid_rgb(var(--border))] [border-right:1px_solid_rgb(var(--border))] [border-left:1px_solid_rgb(var(--border))] flex justify-end bg-[rgb(var(--surface))]',
  ndsWrap: 'w-[100px] shrink-0 flex flex-col items-end',
  timeItem: '[border-top:1px_solid_rgb(var(--border))] [border-right:1px_solid_rgb(var(--border))] text-center [align-content:center] text-[14px] font-bold text-[rgb(var(--text))] bg-[rgb(var(--surface))]',
  timeWrap: 'w-[60px] shrink-0',
  desWrap: 'relative [flex:1_1_auto]',
  orderItem: '[border-top:1px_solid_rgb(var(--border))] [border-right:1px_solid_rgb(var(--border))] flex justify-end',
  limitItem: 'w-full text-[rgb(var(--text-tertiary))] flex items-center justify-center text-[12px] overflow-hidden flex-col cursor-pointer [transition:background-color_0.2s] hover:!bg-accent/10 [&_.capacity-label]:text-[10px] [&_.capacity-label]:text-[#bbb] [&_.capacity-label]:mb-[2px] [&_.capacity-value]:text-[14px] [&_.capacity-value]:font-bold [&_.capacity-value]:text-[rgb(var(--accent))]',
  calendarWrap: 'absolute h-full top-0 left-0 overflow-hidden [border-right:1px_solid_rgb(var(--border))]',
  clickWrap: 'flex gap-0 absolute w-full',
  clickItem: 'rounded-[12px] cursor-pointer flex items-center justify-center flex-col text-[13px] font-bold text-[#fff] [border:2px_solid_white] [box-shadow:0px_4px_10px_rgba(0,0,0,0.1)] overflow-hidden [transition:transform_0.1s_ease] hover:z-10 hover:[transform:scale(1.02)] [&_span]:p-[0px_8px] [&_span]:break-all [&_span]:text-center',
  holiday: '!bg-danger/10 [&_.capacity-value]:!text-danger',
  tableBody: 'relative w-full [border-bottom:1px_solid_rgb(var(--border))]',
  tableHead: 'sticky top-0 z-10 w-full [border-bottom:1px_solid_rgb(var(--border))]',
}

const OrderTable = ({
  orderRange, calendarData, designerNameType, merchantId,
  openTime, refetchData, remarkDisplay, isOne, designerId,
  cusRemarkDisplay, ndsRef, checkinSettings, checkinMode,
  calendarSize, cancelPasswordUsing
}) => {
  const isCheckinIcon = <AssignmentTurnedInRoundedIcon style={{ top: 5, right: 5, position: 'absolute' }} />
  const noCheckinIcon = <DisabledByDefaultRoundedIcon style={{ top: 5, right: 5, position: 'absolute' }} />
  const [modalOpen, setModalOpen] = useState(false)
  const [holidayModel, setHolidayModel] = useState(false)
  const [modaltype, setModalType] = useState('')
  const [editOrder, setEditOrder] = useState({})
  const [holidayData, setHolidayData] = useState({})
  const [clickData, setClickData] = useState({})
  const ndWidth = 30

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
    let width = calendarSize.width
    if (length > 1) {
      width = (length - 1) * calendarSize.width
    }
    if (breakLength > 0) {
      width += calendarSize.breakWidth
    }
    if (length > 1 || breakLength > 0) {
      width += ndWidth
    }
    if (length <= 1 && breakLength > 0) {
      width = calendarSize.width + ndWidth
    }
    if (length === 1 && breakLength === 2) {
      width = calendarSize.width
    }
    return width
  }

  const findOrderWidth = length => {
    const width = calendarSize.width * Math.max(0, length - 1)
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
    <div className={`ManagementReservationRecord bg-background ${styles.TableContainer}`}>

      {/* table head */}
      <div className={styles.tableHead}>
        <div style={{ position: 'sticky', left: 0, zIndex: 1 }} className={`${styles.timeTitle} ${styles.title}`}>時間</div>
        {calendarData.map(data => (
          <div style={{ flex: 1 }} key={`name-${data.title}`} className={styles.title}>
            {data.title}
          </div>
        ))}
      </div>

      {/* table body */}
      <div className={styles.tableBody}>

        {/* 時間 */}
        <div
          style={{ position: 'sticky', left: 0, zIndex: 5, background: 'rgb(var(--background))' }}
          className={styles.timeWrap}
          id='darkBg'
        >
          {orderRange[0].map(d => (
            <div key={d} className={styles.timeItem} style={{ height: calendarSize.height, lineHeight: calendarSize.height + 'px' }}>{format(d, 'HH:mm')}</div>
          ))}
        </div>

        {/* 指定預約 */}
        {calendarData.map(({
          title, length, breakLength, countHoliday, orders, orderGroup, breakGroup, bookingLimit, countOrder
        }, index) => {
          return (
            <div key={`${title}-${index}`} style={{ flex: 1 }} className={styles.desWrap}>
              {orderRange[index].map(d => (
                <div
                  key={d}
                  className={styles.orderItem}
                  style={{ width: '100%', height: calendarSize.height }}
                  onClick={() => {
                    if (countHoliday[d]) return
                    if (isOne) {
                      setModalType(countHoliday[d] ? 'openOrder' : 'default')
                    } else {
                      setModalType(countHoliday[d] ? 'openAllOrder' : 'defaultAll')
                    }
                    setModalOpen(true)
                    setClickData({
                      dateTime: d,
                      designerId: isOne ? designerId[0] : '',
                    })
                  }}
                >
                  <div style={{ width: '100%', zIndex: 2 }} className={`hoverItem ${styles.limitItem}${length > 1 && countHoliday[d] ? ` ${styles.holiday}` : ''}`}>
                    {isOne ? length > 1 || breakLength > 0 ? handleCountLimit(countOrder[d], bookingLimit) : `可預約人數:${handleCountLimit(countOrder[d], bookingLimit)}` : ''}
                  </div>
                </div>
              ))}
              {length > 1 && (
                <div style={{ width: '100%' }} className={styles.calendarWrap}>
                  {orderGroup.map(({ data, parentStyle }, i) => (
                    <div key={`currentData-${i}`} className={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, start, end, style, type, designerId, ...rest }) => {
                        return (
                          <div
                            key={key}
                            ref={e => e && ndsRef.current.push(e)}
                            style={{ ...style, color: readableTextOn(style.backgroundColor), width: `${100 / data.length}%`, position: 'relative' }}
                            className={styles.clickItem}
                            id='darkBorder'
                            onClick={() => {
                              if (rest.isDone) {
                                window.open(`/order/${rest.createdOrderId}`, '_blank');
                              } else if (type.includes('HOLIDAY')) {
                                if (!isOne) {
                                  setModalType(countHoliday[start] ? 'openAllOrder' : 'defaultAll')
                                  setModalOpen(true)
                                  setClickData({
                                    dateTime: start,
                                    designerId: '',
                                  })
                                } else {
                                  setHolidayModel(true)
                                  setHolidayData({
                                    designerId,
                                    startTime: start,
                                    endTime: end
                                  })
                                }
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
                                  notificationDate: rest.notificationDate,
                                  isNoShow: rest.isNoShow
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
                            {(rest.isNoShow && !checkinMode) && <EventBusyIcon style={{ top: 5, left: 5, position: 'absolute' }} />}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
              {breakLength > 0 && (
                <div style={{ width: '100%', left: 0 }} className={styles.calendarWrap}>
                  {breakGroup.map(({ data, parentStyle }, i) => (
                    <div key={`isBreakGroups-${i}`} className={styles.clickWrap} style={parentStyle}>
                      {data.map(({ key, nameToDisplay, start, end, style }, i) => {
                        return (
                          <div
                            key={key}
                            style={{ ...style, color: readableTextOn(style.backgroundColor), width: '100%' }}
                            className={styles.clickItem}
                            id='darkBorder'
                            onClick={() => {
                              if (!isOne) {
                                setModalType(countHoliday[start] ? 'openAllOrder' : 'defaultAll')
                                setModalOpen(true)
                                setClickData({
                                  dateTime: start,
                                  designerId: '',
                                })
                              } else {
                                setHolidayModel(true)
                                setHolidayData({
                                  designerId,
                                  startTime: start,
                                  endTime: end
                                })
                              }
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
