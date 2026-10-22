// 保護：openSnackbar 確認型對話框「按下確認後真的做了什麼」——離職、月結、日結、鎖定加扣項、掛單、刪除版本紀錄、
// 批次編輯（助理）。這些都是不可逆的批次動作：確認鈕要呼叫正確的 mutation、帶對參數、成功後提示並重新整理；
// 處理期間確認鈕停用（防連點重複月結／日結）；進度提示卡沿用同一個訊息槽，進度超過 100% 時顯示 99%。
// 另驗證提示卡滑鼠移入暫停自動消失、移出後以一半時間（1.5 秒）重新計時。
import { act, cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import React from 'react'

import CustomizedSnackbars, { openSnackbar } from '../snackbars'

const mockApi = {}
jest.mock('hooks/useRemoveUserFromMerchant', () => () => ({ setRemoveUserFromMerchant: (...a) => mockApi.remove(...a) }))
jest.mock('hooks/useFetchSetUserSalaryMonthlyCheckoutV2', () => () => ({
  setUserSalaryMonthlyCheckoutV2: (...a) => mockApi.monthly(...a),
}))
jest.mock('hooks/useFetchSettingUpdateUserOrderableList', () => () => ({
  setUpdateUserOrderableList: (...a) => mockApi.orderable(...a),
}))
jest.mock('hooks/useFetchSetLockUserSalaryItem', () => () => ({ setUserSalaryItemLock: (...a) => mockApi.lock(...a) }))
jest.mock('hooks/useFetchCloseDailyAccountV3', () => () => ({ closeDailyAccountV3: (...a) => mockApi.daily(...a) }))
jest.mock('hooks/useFetchSystemUpdateRecord', () => ({
  useFetchCreateSystemUpdateDelete: () => ({ SystemUpdateDelete: (...a) => mockApi.deleteRecord(...a) }),
}))

const realLocation = window.location
let reload
beforeEach(() => {
  reload = jest.fn()
  delete window.location
  window.location = { reload }
  jest.spyOn(console, 'log').mockImplementation(() => {})
  localStorage.clear()
})
afterEach(() => {
  cleanup()
  window.location = realLocation
  jest.useRealTimers()
})

const flush = () => act(() => new Promise(resolve => setTimeout(resolve, 0)))

describe('確認型：離職', () => {
  it('確認後移除員工、更新可打單人員、提示並導回員工列表', async () => {
    mockApi.remove = jest.fn(() => Promise.resolve({}))
    mockApi.orderable = jest.fn(() => Promise.resolve({}))
    render(<CustomizedSnackbars />)
    act(() => openSnackbar({ message: ' 確定設定離職？ ', variant: 'error', resign: true, designerId: 'u-9' }))
    const dialog = screen.getByRole('alertdialog', { name: '設定離職' })
    // 訊息去頭尾空白；說明後果
    expect(dialog).toHaveTextContent('確定設定離職？此員工將從本店人員名單移除')
    fireEvent.click(screen.getByRole('button', { name: '確定離職' }))
    await flush()
    expect(mockApi.remove).toHaveBeenCalledWith({ input: 'u-9' })
    expect(mockApi.orderable).toHaveBeenCalledTimes(1)
    expect(window.location).toBe('/management/employee')
    expect(screen.getByRole('status')).toHaveTextContent('設定離職完成')
  })

  it('移除失敗：提示設定失敗、不導頁', async () => {
    mockApi.remove = jest.fn(() => Promise.reject(new Error('x')))
    mockApi.orderable = jest.fn()
    render(<CustomizedSnackbars />)
    act(() => openSnackbar({ message: '確定？', variant: 'error', resign: true, designerId: 'u-9' }))
    fireEvent.click(screen.getByRole('button', { name: '確定離職' }))
    await flush()
    expect(mockApi.orderable).not.toHaveBeenCalled()
    expect(window.location.reload).toBe(reload)
    expect(screen.getByRole('alert')).toHaveTextContent('設定失敗')
  })
})

describe('確認型：月結', () => {
  it('逐筆月結、顯示進度（超過 100% 顯示 99%）、完成後重抓並重新整理；處理中確認鈕停用', async () => {
    let release
    const gate = new Promise(resolve => {
      release = resolve
    })
    mockApi.monthly = jest.fn(() => gate)
    const userRefetch = jest.fn()
    const checkedRefetch = jest.fn()
    localStorage.setItem('currentTime', 'x')
    const inputs = [1, 2, 3, 4, 5, 6].map(i => ({ userId: `u${i}` }))
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({
        message: '確定月結？',
        variant: 'error',
        resign: true,
        salaryCheckout: true,
        monthlyCheckoutInput: inputs,
        salaryCheckoutDate: '2026-10',
        userSalayItemDataRefetch: userRefetch,
        isSalaryChackedDataRefetch: checkedRefetch,
      })
    )
    expect(screen.getByRole('alertdialog', { name: '確認月結' })).toHaveTextContent('將結算所選月份的薪資')
    fireEvent.click(screen.getByRole('button', { name: '結算' }))
    // 處理中：確認鈕停用、顯示處理中
    expect(screen.getByRole('button', { name: '處理中…' })).toBeDisabled()
    expect(localStorage.getItem('currentTime')).toBeNull()
    expect(mockApi.monthly).toHaveBeenCalledWith({ input: { userId: 'u1' }, date: '2026-10' })
    release({})
    await wait(() => expect(screen.getByRole('status')).toHaveTextContent('月結成功'))
    expect(mockApi.monthly).toHaveBeenCalledTimes(6)
    expect(mockApi.monthly.mock.calls.map(c => c[0].input.userId)).toEqual(['u1', 'u2', 'u3', 'u4', 'u5', 'u6'])
    expect(userRefetch).toHaveBeenCalledTimes(1)
    expect(checkedRefetch).toHaveBeenCalledTimes(1)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('月結進行中的提示卡畫出進度圈與百分比、沒有關閉鈕；6 筆各 17% 合計 102% 時顯示 99%', async () => {
    const resolvers = []
    mockApi.monthly = jest.fn(() => new Promise(resolve => resolvers.push(resolve)))
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({
        message: '確定月結？',
        variant: 'error',
        resign: true,
        salaryCheckout: true,
        monthlyCheckoutInput: [1, 2, 3, 4, 5, 6],
        userSalayItemDataRefetch: () => {},
        isSalaryChackedDataRefetch: () => {},
      })
    )
    fireEvent.click(screen.getByRole('button', { name: '結算' }))
    for (let i = 0; i < 5; i += 1) {
      await act(async () => {
        resolvers[i]({})
      })
      await wait(() => expect(resolvers).toHaveLength(i + 2))
    }
    const card = screen.getByRole('status')
    expect(card).toHaveTextContent('正在月結中 請勿跳轉或刷新畫面')
    expect(card).toHaveTextContent('85%')
    expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
    await act(async () => {
      resolvers[5]({})
    })
    await wait(() => expect(reload).toHaveBeenCalled())
  })
})

describe('確認型：日結', () => {
  it('依選取天數顯示說明；逐日日結並帶結帳人員、清空選取、重新整理', async () => {
    mockApi.daily = jest.fn(() => Promise.resolve({}))
    const setSelectedOrders = jest.fn()
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({
        message: '確定日結？',
        variant: 'error',
        resign: true,
        isDailyCheckout: true,
        selectedOrders: ['2026-10-20', '2026-10-21'],
        waitCloseOrderResults: [{ date: '2026-10-20' }, { date: '2026-10-21' }, { date: '2026-10-22' }],
        setSelectedOrders,
        checkoutStaff: { id: 'staff-1' },
      })
    )
    expect(screen.getByRole('alertdialog', { name: '確認日結' })).toHaveTextContent('將日結選取的 2 天')
    fireEvent.click(screen.getByRole('button', { name: '確定日結' }))
    expect(screen.getByRole('button', { name: '處理中…' })).toBeDisabled()
    await wait(() => expect(reload).toHaveBeenCalledTimes(1))
    expect(mockApi.daily.mock.calls).toEqual([
      [{ date: '2026-10-20', checkoutStaff: 'staff-1' }],
      [{ date: '2026-10-21', checkoutStaff: 'staff-1' }],
    ])
    expect(setSelectedOrders).toHaveBeenCalledWith([])
    expect(screen.getByRole('status')).toHaveTextContent('日結成功')
  })

  it('選取資料不是陣列時說明顯示 0 天（不拋錯）', () => {
    render(<CustomizedSnackbars />)
    act(() => openSnackbar({ message: '確定日結？', variant: 'error', resign: true, isDailyCheckout: true, selectedOrders: null }))
    expect(screen.getByRole('alertdialog', { name: '確認日結' })).toHaveTextContent('將日結選取的 0 天')
  })
})

describe('確認型：其他', () => {
  it('鎖定加扣項：帶設定日期、成功後重抓、重新整理並提示', async () => {
    mockApi.lock = jest.fn(() => Promise.resolve({}))
    const lockRefetch = jest.fn()
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({
        message: '確定鎖定？',
        variant: 'error',
        resign: true,
        salaryItemsLock: true,
        settingDate: '2026-10',
        salaryItemLockDataRefetch: lockRefetch,
      })
    )
    fireEvent.click(screen.getByRole('button', { name: '鎖定' }))
    await flush()
    expect(mockApi.lock).toHaveBeenCalledWith({ date: '2026-10' })
    expect(lockRefetch).toHaveBeenCalledTimes(1)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('加扣項已鎖定')
  })

  it('掛單：呼叫建立掛單，之後確認鈕停用避免重複掛單', () => {
    const createDraft = jest.fn()
    render(<CustomizedSnackbars />)
    act(() => openSnackbar({ message: '確定掛單？', variant: 'error', resign: true, orderPending: true, usehandleCreateDraftOrder: createDraft }))
    fireEvent.click(screen.getByRole('button', { name: '確定掛單' }))
    expect(createDraft).toHaveBeenCalledTimes(1)
    const busy = screen.getByRole('button', { name: '處理中…' })
    expect(busy).toBeDisabled()
    fireEvent.click(busy)
    expect(createDraft).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['刪除成功', { data: { deleteSystemUpdate: true } }, 'status', 1],
    ['刪除失敗', { data: { deleteSystemUpdate: false } }, 'alert', 0],
  ])('刪除版本更新紀錄：%s', async (text, response, role, refetchCount) => {
    mockApi.deleteRecord = jest.fn(() => Promise.resolve(response))
    const record = { refetch: jest.fn() }
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({
        message: '確定刪除？',
        variant: 'error',
        resign: true,
        deleteSystemRecordPending: true,
        systemUpdateId: 'sys-1',
        systemUpdateRecord: record,
      })
    )
    expect(screen.getByRole('alertdialog', { name: '刪除版本更新紀錄' })).toHaveTextContent('刪除後無法復原。')
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    await flush()
    expect(mockApi.deleteRecord).toHaveBeenCalledWith({ systemUpdateId: 'sys-1' })
    expect(record.refetch).toHaveBeenCalledTimes(refetchCount)
    expect(screen.getByRole(role)).toHaveTextContent(text)
  })

  it('刪除版本更新紀錄：mutation 失敗顯示錯誤訊息', async () => {
    mockApi.deleteRecord = jest.fn(() => Promise.reject(new Error('沒有權限')))
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({ message: '確定刪除？', variant: 'error', resign: true, deleteSystemRecordPending: true, systemUpdateId: 'sys-1' })
    )
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    await flush()
    expect(screen.getByRole('alert')).toHaveTextContent('沒有權限')
  })

  it('助理批次編輯：確認呼叫助理抽成的送出函式', () => {
    const submit = jest.fn()
    const submitHelper = jest.fn()
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({
        message: '確定覆蓋？',
        variant: 'error',
        groupEdit: true,
        serviceHelperGroupEdit: true,
        handleSubmitDeductionSetting: submit,
        handleSubmitHelperDeductionSetting: submitHelper,
      })
    )
    fireEvent.click(screen.getByRole('button', { name: '確定覆蓋' }))
    expect(submitHelper).toHaveBeenCalledTimes(1)
    expect(submit).not.toHaveBeenCalled()
  })
})

describe('純訊息：自動消失的暫停與恢復', () => {
  it('滑鼠移入暫停、移出後 1.5 秒消失；disableHide 的提示不會自動消失', () => {
    jest.useFakeTimers()
    render(<CustomizedSnackbars />)
    act(() => openSnackbar({ message: '儲存成功', variant: 'success' }))
    const card = screen.getByRole('status')
    fireEvent.mouseEnter(card)
    act(() => jest.advanceTimersByTime(5000))
    expect(screen.getByText('儲存成功')).toBeInTheDocument()
    fireEvent.mouseLeave(card)
    act(() => jest.advanceTimersByTime(1400))
    expect(screen.getByText('儲存成功')).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(200))
    expect(screen.queryByText('儲存成功')).toBeNull()

    act(() => openSnackbar({ message: '處理中請稍候', variant: 'warning', disableHide: true }))
    const warn = screen.getByRole('status')
    fireEvent.mouseEnter(warn)
    fireEvent.mouseLeave(warn)
    act(() => jest.advanceTimersByTime(10000))
    expect(screen.getByText('處理中請稍候')).toBeInTheDocument()
  })
})

describe('其他呈現', () => {
  it('確認框的訊息可以是元件（不做 trim）', () => {
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({ message: <strong>請確認批次內容</strong>, variant: 'error', groupEdit: true, handleSubmitDeductionSetting: () => {} })
    )
    expect(screen.getByRole('alertdialog', { name: '確認批次編輯' }).querySelector('strong')).toHaveTextContent('請確認批次內容')
  })

  it('版面尚未掛上提示區時呼叫 openSnackbar 不會拋錯', () => {
    jest.isolateModules(() => {
      const fresh = require('../snackbars')
      expect(() => fresh.openSnackbar({ message: '太早', variant: 'info' })).not.toThrow()
    })
  })
})
