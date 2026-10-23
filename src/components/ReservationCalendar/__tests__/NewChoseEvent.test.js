// 保護：預約動作窗（NewChoseEvent）的「全店」模式。設計師單週預約表目前只會開「單一設計師」的動作（default／openOrder／預約），
// 全店模式（defaultAll／openAllOrder：關閉／開啟全店預約）由元件的 modaltype 支援，這裡直接驗證元件介面：
// 送出正確的時段與開關、成功後重抓並關窗、失敗提示並可再按；沒有設計師時新預約連結的設計師參數為空。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import React from 'react'

import { renderPage } from '__tests__/testkit.test'
import NewChoseEvent from '../DesignerWeekReservation/NewChoseEvent'
import { openSnackbar } from 'elements/snackbars'

const mockApi = {}
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.mock('hooks/useFetchAdminBookingTime', () => ({
  __esModule: true,
  default: () => ({ adminBookingTime: (...a) => mockApi.adminBookingTime(...a) }),
  useFetchAdminBookingTimeAllStore: () => ({ adminBookingTimeAllStore: (...a) => mockApi.allStore(...a) }),
}))
jest.mock('hooks/useFetchVerifyBooking', () => () => ({ verifyBooking: (...a) => mockApi.verifyBooking(...a) }))

afterEach(cleanup)

const T = new Date(2026, 9, 20, 10).getTime()
const renderEvent = props => {
  const setModalOpen = jest.fn()
  const refetchData = jest.fn()
  renderPage(
    <NewChoseEvent
      merchantId="m1"
      clickData={{ dateTime: T, designerId: '' }}
      editOrder={{}}
      checkinSettings={{ isBookingCheckinEnabled: false }}
      setModalOpen={setModalOpen}
      refetchData={refetchData}
      {...props}
    />
  )
  return { setModalOpen, refetchData }
}

describe('NewChoseEvent 全店模式', () => {
  beforeEach(() => openSnackbar.mockClear())

  it('defaultAll：新預約連結（沒有設計師時參數為空）；關閉全店預約成功後重抓、關窗', async () => {
    mockApi.allStore = jest.fn(() => Promise.resolve({ data: { adminBookingTimeAllStore: { storeId: 's1' } } }))
    const { setModalOpen, refetchData } = renderEvent({ modaltype: 'defaultAll' })
    expect(screen.getByText('新預約').closest('a')).toHaveAttribute('href', `/customer/reservation/m1?usingLineLogin=0&date=${T}&designerId=`)
    fireEvent.click(screen.getByText('關閉全店預約'))
    expect(mockApi.allStore).toHaveBeenCalledWith({ datetime: T, appointable: false })
    await wait(() => expect(setModalOpen).toHaveBeenCalledWith(false))
    expect(refetchData).toHaveBeenCalledTimes(1)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '變更成功', variant: 'success' })
  })

  it('openAllOrder：開啟全店預約；失敗提示並可再按；後端沒回店家 id 不關窗；取消關窗', async () => {
    mockApi.allStore = jest.fn(() => Promise.reject(new Error('沒有權限')))
    const { setModalOpen } = renderEvent({ modaltype: 'openAllOrder' })
    const open = screen.getByText('開啟全店預約').closest('button')
    fireEvent.click(open)
    expect(mockApi.allStore).toHaveBeenCalledWith({ datetime: T, appointable: true })
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '沒有權限', variant: 'error' }))
    expect(open).not.toBeDisabled()
    mockApi.allStore = jest.fn(() => Promise.resolve({ data: { adminBookingTimeAllStore: {} } }))
    fireEvent.click(open)
    // 送出中：動作鈕與取消都停用
    expect(open).toBeDisabled()
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    await act(() => Promise.resolve())
    expect(setModalOpen).not.toHaveBeenCalled()
    // 已修正（Jason 2026/10/22 fix all）：後端沒回店家 id 時原本連「取消」也一直停用；改為回應後「取消」可按，
    // 動作鈕維持停用（結果不明，避免重複送出）
    expect(open).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(setModalOpen).toHaveBeenCalledWith(false)
    cleanup()
    const second = renderEvent({ modaltype: 'openAllOrder' })
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(second.setModalOpen).toHaveBeenCalledWith(false)
  })

  it('報到模式的全店窗只有新預約（帶入點選的設計師）；單一設計師窗沒有設計師時參數為空；未知的動作類型什麼都不顯示', () => {
    renderEvent({ modaltype: 'defaultAll', checkinMode: true, clickData: { dateTime: T, designerId: 'd1' } })
    expect(screen.queryByText('關閉全店預約')).toBeNull()
    expect(screen.getByText('新預約').closest('a')).toHaveAttribute('href', `/customer/reservation/m1?usingLineLogin=0&date=${T}&designerId=d1`)
    cleanup()
    renderEvent({ modaltype: 'default' })
    expect(screen.getByText('新預約').closest('a')).toHaveAttribute('href', `/customer/reservation/m1?usingLineLogin=0&date=${T}&designerId=`)
    cleanup()
    renderEvent({ modaltype: 'unknown' })
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })
})

// 已修正（Jason 2026/10/22 fix all）：審核窗的「接受預約」「取消預約」列原本送出中沒有停用，可重複送出；
// 改為送出中（pending）停用，後端回應後恢復
describe('NewChoseEvent 審核窗：接受／取消預約送出中停用', () => {
  const ORDER = {
    id: 'b1', date: T, status: '待審核', isDesignate: false, companionCount: 0, remark: '', remarkForCustomer: '',
    customer: { id: 'c1', name: '王小明', cellphone: '0912' },
  }
  const deferred = () => {
    let resolve
    const promise = new Promise(res => { resolve = res })
    return { promise, resolve }
  }
  const row = text => screen.getByText(text).closest('button')

  it.each([['接受預約', true], ['取消預約', false]])('%s：送出中兩列都停用、不會重複送出；回應後恢復', async (text, isApproval) => {
    const pending = deferred()
    mockApi.verifyBooking = jest.fn(() => pending.promise)
    renderEvent({ modaltype: 'orderCheck', editOrder: ORDER })
    fireEvent.click(row(text))
    fireEvent.click(row(text))
    expect(mockApi.verifyBooking).toHaveBeenCalledTimes(1)
    expect(mockApi.verifyBooking).toHaveBeenCalledWith({ orderId: 'b1', isApproval })
    expect(row('接受預約')).toBeDisabled()
    expect(row('取消預約')).toBeDisabled()
    await act(async () => pending.resolve({ data: { verifyBooking: {} } }))
    expect(row('接受預約')).not.toBeDisabled()
    expect(row('取消預約')).not.toBeDisabled()
  })
})
