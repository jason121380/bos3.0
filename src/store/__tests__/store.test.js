// 保護全站 Redux store：WebSocket 推播（班表、預約、打卡 QR code）、抽成顯示設定、釘選頁要寫進正確的 slice，且彼此不互相覆蓋
import { configureStore } from '@reduxjs/toolkit'
import store from 'store'
import socketReducer, { socketActions } from 'store/socket'
import reservationReducer, { reservationActions } from 'store/reservation'
import deductionDisplayReducer, { deductionDisplayActions } from 'store/deductionDisplay'
import QRcodeClockInReducer, { QRcodeClockInActions } from 'store/QRcodeClockIn'
import pinnedTableReducer, { pinnedTableActions } from 'store/pinnedTable'
import teachingModeReducer from 'context/teachingModeReducer'
import { TEACHING_MODE } from 'context/types'

const freshStore = () =>
  configureStore({
    reducer: {
      socket: socketReducer,
      reservation: reservationReducer,
      deductionDisplay: deductionDisplayReducer,
      QRcodeClockIn: QRcodeClockInReducer,
      pinnedTable: pinnedTableReducer,
    },
  })

describe('全站 store 初始狀態', () => {
  it('五個 slice 都已掛上，初始值讓畫面在推播到達前可安全讀取', () => {
    expect(store.getState()).toEqual({
      socket: { schedule: null },
      reservation: { reservationData: null },
      deductionDisplay: { service: false, coupon: false },
      QRcodeClockIn: { key: null },
      pinnedTable: { table: [] },
    })
  })
})

describe('WebSocket 推播寫入', () => {
  it('新班表只更新 socket.schedule，不影響預約資料', () => {
    const s = freshStore()
    s.dispatch(reservationActions.setReservation({ id: 'r1' }))
    s.dispatch(socketActions.setSchedule({ userId: 'u1', date: '2026-10-21' }))
    expect(s.getState().socket.schedule).toEqual({ userId: 'u1', date: '2026-10-21' })
    expect(s.getState().reservation.reservationData).toEqual({ id: 'r1' })
  })

  it('預約推播以最新一筆覆蓋（週曆依此重新整理）', () => {
    const s = freshStore()
    s.dispatch(reservationActions.setReservation({ id: 'r1' }))
    s.dispatch(reservationActions.setReservation({ id: 'r2' }))
    expect(s.getState().reservation.reservationData).toEqual({ id: 'r2' })
  })

  it('打卡 QR code 過期時換成新 key', () => {
    const s = freshStore()
    s.dispatch(QRcodeClockInActions.setQRcodeKey('k-1'))
    expect(s.getState().QRcodeClockIn.key).toBe('k-1')
    s.dispatch(QRcodeClockInActions.setQRcodeKey(null))
    expect(s.getState().QRcodeClockIn.key).toBeNull()
  })
})

describe('抽成顯示設定', () => {
  it('服務／卡券抽成的顯示開關一次設定兩個欄位，忽略多餘欄位', () => {
    const s = freshStore()
    s.dispatch(deductionDisplayActions.setDisplay({ service: true, coupon: false, extra: 1 }))
    expect(s.getState().deductionDisplay).toEqual({ service: true, coupon: false })
  })
})

describe('釘選頁', () => {
  it('以整份清單取代（個人頁調整順序後同步側欄）', () => {
    const s = freshStore()
    s.dispatch(pinnedTableActions.setPinnedTable([{ url: '/a' }, { url: '/b' }]))
    s.dispatch(pinnedTableActions.setPinnedTable([{ url: '/b' }]))
    expect(s.getState().pinnedTable.table).toEqual([{ url: '/b' }])
  })
})

describe('教學模式 reducer', () => {
  it('TEACHING_MODE 切換開關並保留其他狀態', () => {
    const state = { teachingMode: true, other: 1 }
    expect(teachingModeReducer(state, { type: TEACHING_MODE })).toEqual({ teachingMode: false, other: 1 })
  })

  it('未知 action 原樣回傳（同一個物件，不觸發重新渲染）', () => {
    const state = { teachingMode: false }
    expect(teachingModeReducer(state, { type: 'OTHER' })).toBe(state)
  })
})
