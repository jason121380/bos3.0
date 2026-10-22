// 保護：單日預約紀錄的預約動作窗（NewChoseEvent）的「取消／關閉」鈕。
// 送出（開關全店預約、開關設計師預約、接受／取消預約、未出席）等後端回應時「取消／關閉」停用；
// 後端回應但沒回 id（結果不明）時動作鈕維持停用避免重複送出，「取消／關閉」恢復可按；失敗時都恢復可按。
// 已修正（Jason 2026/10/22 fix all）：原本「取消／關閉」與動作鈕共用 btnDisabled，後端沒回 id 時一直停用，只能按 Esc／點背景關；
// 比照 components/ReservationCalendar 的同名元件改為只在等待回應時停用。
// hooks 以替身回應（不連後端、不改真實預約）。
import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import React from 'react'

import { renderPage } from '__tests__/testkit.test'
import NewChoseEvent from '../NewChoseEvent'

const mockApi = {}
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('hooks/useFetchAdminBookingTime', () => ({
  __esModule: true,
  default: () => ({ adminBookingTime: (...a) => mockApi.adminBookingTime(...a) }),
  useFetchAdminBookingTimeAllStore: () => ({ adminBookingTimeAllStore: (...a) => mockApi.allStore(...a) }),
}))
jest.mock('hooks/useFetchVerifyBooking', () => () => ({ verifyBooking: (...a) => mockApi.verifyBooking(...a) }))
jest.mock('hooks/useFetchSetBookingNoShow', () => () => ({ setBookingNoShow: (...a) => mockApi.setBookingNoShow(...a) }))

afterEach(cleanup)

const T = new Date(2026, 9, 20, 10).getTime()
const ORDER = {
  id: 'b1',
  date: T,
  status: '待審核',
  isDesignate: false,
  isNoShow: false,
  companionCount: 0,
  remark: '',
  remarkForCustomer: '',
  customer: { id: 'c1', name: '王小明', cellphone: '0912' },
}
const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
const renderEvent = props => {
  const setModalOpen = jest.fn()
  renderPage(
    <NewChoseEvent
      merchantId="m1"
      clickData={{ dateTime: T, designerId: 'd1' }}
      editOrder={ORDER}
      checkinSettings={{ isBookingCheckinEnabled: false }}
      setModalOpen={setModalOpen}
      refetchData={jest.fn()}
      {...props}
    />
  )
  return { setModalOpen }
}
const actionButton = text => screen.getByText(text).closest('button')

describe('NewChoseEvent（單日預約紀錄）：「取消／關閉」只在等待回應時停用', () => {
  it.each([
    ['defaultAll', '關閉全店預約', 'allStore', { adminBookingTimeAllStore: {} }],
    ['default', '關閉預約', 'adminBookingTime', { adminBookingTime: {} }],
  ])('%s：送出中停用；後端沒回 id 時「取消」可按、動作鈕維持停用', async (modaltype, action, api, emptyData) => {
    const pending = deferred()
    mockApi[api] = jest.fn(() => pending.promise)
    const { setModalOpen } = renderEvent({ modaltype })
    fireEvent.click(actionButton(action))
    expect(actionButton(action)).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    await act(async () => pending.resolve({ data: emptyData }))
    expect(setModalOpen).not.toHaveBeenCalled()
    expect(actionButton(action)).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(setModalOpen).toHaveBeenCalledWith(false)
  })

  it('default：送出失敗時「取消」與動作鈕都恢復可按', async () => {
    const pending = deferred()
    mockApi.adminBookingTime = jest.fn(() => pending.promise)
    renderEvent({ modaltype: 'default' })
    fireEvent.click(actionButton('關閉預約'))
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    await act(async () => pending.reject(new Error('沒有權限')))
    expect(actionButton('關閉預約')).not.toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).not.toBeDisabled()
  })

  it('orderCheck：接受預約送出中「關閉」停用；後端沒回 id 時「關閉」可按、未出席維持停用', async () => {
    const pending = deferred()
    mockApi.verifyBooking = jest.fn(() => pending.promise)
    const { setModalOpen } = renderEvent({ modaltype: 'orderCheck' })
    fireEvent.click(actionButton('接受預約'))
    expect(mockApi.verifyBooking).toHaveBeenCalledWith({ orderId: 'b1', isApproval: true, isFromPC: true, password: '' })
    expect(screen.getByRole('button', { name: '關閉' })).toBeDisabled()
    await act(async () => pending.resolve({ data: { verifyBooking: {} } }))
    expect(actionButton('未出席')).toBeDisabled()
    expect(screen.getByRole('button', { name: '關閉' })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(setModalOpen).toHaveBeenCalledWith(false)
  })

  it('orderCheck：未出席送出中「關閉」停用；失敗後都恢復可按', async () => {
    const pending = deferred()
    mockApi.setBookingNoShow = jest.fn(() => pending.promise)
    renderEvent({ modaltype: 'orderCheck' })
    fireEvent.click(actionButton('未出席'))
    expect(mockApi.setBookingNoShow).toHaveBeenCalledWith({ input: { bookingIds: ['b1'], isNoShow: true } })
    expect(actionButton('未出席')).toBeDisabled()
    expect(screen.getByRole('button', { name: '關閉' })).toBeDisabled()
    await act(async () => pending.reject(new Error('失敗')))
    expect(actionButton('未出席')).not.toBeDisabled()
    expect(screen.getByRole('button', { name: '關閉' })).not.toBeDisabled()
  })
})
