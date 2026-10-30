import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import CustomizedSnackbars, { NETWORK_FAILURE_MESSAGE, normalizeSnackbarMessage, openSnackbar } from '../snackbars'

// 確認後才會用到的 mutation hooks：本測試只驗呈現（對話框／提示卡），不連後端
jest.mock('hooks/useRemoveUserFromMerchant', () => () => ({ setRemoveUserFromMerchant: jest.fn() }))
jest.mock('hooks/useFetchSetUserSalaryMonthlyCheckoutV2', () => () => ({ setUserSalaryMonthlyCheckoutV2: jest.fn() }))
jest.mock('hooks/useFetchSettingUpdateUserOrderableList', () => () => ({ setUpdateUserOrderableList: jest.fn() }))
jest.mock('hooks/useFetchSetLockUserSalaryItem', () => () => ({ setUserSalaryItemLock: jest.fn() }))
const mockCloseDailyAccountV3 = jest.fn()
jest.mock('hooks/useFetchCloseDailyAccountV3', () => () => ({ closeDailyAccountV3: mockCloseDailyAccountV3 }))
jest.mock('hooks/useFetchSystemUpdateRecord', () => ({ useFetchCreateSystemUpdateDelete: () => ({ SystemUpdateDelete: jest.fn() }) }))

beforeEach(() => jest.useFakeTimers())
afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe('openSnackbar 錯誤文案', () => {
  it('去掉 Apollo 的 GraphQL error／Network error 前綴，後端業務訊息原樣保留', () => {
    expect(normalizeSnackbarMessage('GraphQL error: 密碼錯誤')).toBe('密碼錯誤')
    expect(normalizeSnackbarMessage('GraphQL error: 庫存不足\nGraphQL error: 請重新選擇')).toBe('庫存不足\n請重新選擇')
    expect(normalizeSnackbarMessage('刪除訂單失敗: Error: GraphQL error: 訂單不存在')).toBe('刪除訂單失敗: 訂單不存在')
    expect(normalizeSnackbarMessage('Network error: Response not successful: Received status code 500')).toBe(
      'Response not successful: Received status code 500'
    )
    expect(normalizeSnackbarMessage('帳單新增成功')).toBe('帳單新增成功')
    expect(normalizeSnackbarMessage(undefined)).toBeUndefined()
  })

  it('瀏覽器的連線失敗訊息改成中文說明', () => {
    expect(normalizeSnackbarMessage('Network error: Failed to fetch')).toBe(NETWORK_FAILURE_MESSAGE)
    expect(normalizeSnackbarMessage('Network error: NetworkError when attempting to fetch resource.')).toBe(NETWORK_FAILURE_MESSAGE)
    expect(normalizeSnackbarMessage('Load failed')).toBe(NETWORK_FAILURE_MESSAGE)
    expect(normalizeSnackbarMessage('重結失敗: Error: Network error: Network request failed')).toBe(`重結失敗: ${NETWORK_FAILURE_MESSAGE}`)
  })

  // 為什麼重要：頁面 catch 以 error.message 顯示錯誤，會蓋掉 errorLink 先跳的中文提示；伺服器 500、資料格式錯誤原本以英文原文出現，
  // 櫃台看不懂、不知道下一步。錯誤提示一律翻成中文說明；成功等其他提示不受影響（避免把正常訊息當錯誤改寫）
  it('錯誤提示：伺服器錯誤等英文技術訊息改成中文說明，頁面開頭保留；成功提示不改寫', () => {
    expect(normalizeSnackbarMessage('Network error: Response not successful: Received status code 500', 'error')).toBe(
      '伺服器暫時無法處理，請稍後再試；若持續發生，請截圖並聯絡客服（500）'
    )
    expect(normalizeSnackbarMessage('刪除訂單失敗: Error: Network error: Response not successful: Received status code 502', 'error')).toBe(
      '刪除訂單失敗：伺服器暫時無法處理，請稍後再試；若持續發生，請截圖並聯絡客服（502）'
    )
    expect(normalizeSnackbarMessage('GraphQL error: 密碼錯誤', 'error')).toBe('密碼錯誤')
    expect(normalizeSnackbarMessage('Done', 'success')).toBe('Done')
  })

  it('openSnackbar 顯示錯誤時套用中文說明', () => {
    render(<CustomizedSnackbars />)
    act(() => openSnackbar({ message: 'GraphQL error: Internal server error', variant: 'error' }))
    expect(screen.getByRole('alert')).toHaveTextContent('伺服器暫時無法處理')
  })
})

describe('openSnackbar 純訊息（右下角提示卡）', () => {
  it('成功訊息為 status、3 秒後消失；錯誤訊息為 alert、需手動關閉', () => {
    render(<CustomizedSnackbars />)
    act(() => openSnackbar({ message: '儲存成功', variant: 'success' }))
    expect(screen.getByRole('status')).toHaveTextContent('儲存成功')
    act(() => jest.advanceTimersByTime(3000))
    expect(screen.queryByText('儲存成功')).toBeNull()

    act(() => openSnackbar({ message: 'GraphQL error: 庫存不足', variant: 'error' }))
    expect(screen.getByRole('alert')).toHaveTextContent('庫存不足')
    act(() => jest.advanceTimersByTime(10000))
    expect(screen.getByRole('alert')).toHaveTextContent('庫存不足')
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('同一則訊息連發只顯示一張提示卡', () => {
    render(<CustomizedSnackbars />)
    act(() => {
      openSnackbar({ message: '帳單新增成功', variant: 'success' })
      openSnackbar({ message: '帳單新增成功', variant: 'success' })
    })
    expect(screen.getAllByText('帳單新增成功')).toHaveLength(1)
  })
})

describe('openSnackbar 確認型（對話框）', () => {
  const openDeleteConfirm = onConfirm =>
    act(() =>
      openSnackbar({
        message: '確定要刪除此盤點紀錄草稿？',
        variant: 'error',
        disableHide: true,
        resign: true,
        deleteInventoryWork: true,
        deleteInventoryWorkFunc: onConfirm,
      })
    )

  it('以 alertdialog 呈現標題、訊息與後果；Esc、點背景、取消都只關閉，不觸發確認', () => {
    const onConfirm = jest.fn()
    render(<CustomizedSnackbars />)

    openDeleteConfirm(onConfirm)
    const dialog = screen.getByRole('alertdialog', { name: '刪除盤點草稿' })
    expect(dialog).toHaveTextContent('確定要刪除此盤點紀錄草稿？')
    expect(dialog).toHaveTextContent('刪除後無法復原。')
    // 版面掛載後 3 秒內開啟也不會被自動關閉
    act(() => jest.advanceTimersByTime(5000))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('alertdialog')).toBeNull()

    openDeleteConfirm(onConfirm)
    // Radix 背景是內容前一個同層節點，以原生 pointerdown 模擬點背景。
    const backdrop = screen.getByRole('alertdialog').previousElementSibling
    act(() => jest.advanceTimersByTime(0))
    fireEvent.pointerDown(backdrop, { pointerType: 'mouse', button: 0 })
    expect(screen.queryByRole('alertdialog')).toBeNull()

    openDeleteConfirm(onConfirm)
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(onConfirm).not.toHaveBeenCalled()

    openDeleteConfirm(onConfirm)
    fireEvent.click(screen.getByRole('button', { name: '刪除' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('批次編輯確認呼叫原本的送出函式', () => {
    const submit = jest.fn()
    const submitHelper = jest.fn()
    render(<CustomizedSnackbars />)
    act(() =>
      openSnackbar({
        message: '您確定要批次編緝?，此步驟將會覆蓋原先設定',
        variant: 'error',
        disableHide: true,
        groupEdit: true,
        handleSubmitDeductionSetting: submit,
        handleSubmitHelperDeductionSetting: submitHelper,
      })
    )
    fireEvent.click(screen.getByRole('button', { name: '確定覆蓋' }))
    expect(submit).toHaveBeenCalledTimes(1)
    expect(submitHelper).not.toHaveBeenCalled()
  })
})

it('結帳定值圓環使用 SVG，百分比與無障礙數值一致', () => {
  render(<CustomizedSnackbars />)
  act(() => openSnackbar({ message: '結帳中', variant: 'warning', disableHide: true, checkoutProcessing: true }))
  const progress = screen.getByRole('progressbar')
  expect(progress.tagName.toLowerCase()).toBe('svg')
  expect(progress).toHaveAttribute('aria-valuenow', '0')
  expect(progress).toHaveAttribute('aria-valuemin', '0')
  expect(progress).toHaveAttribute('aria-valuemax', '100')
  expect(screen.getByText('0%')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
})

it('日結完成一半時圓環與中央文字均更新為 50%', async () => {
  mockCloseDailyAccountV3.mockResolvedValueOnce({}).mockImplementationOnce(() => new Promise(() => {}))
  render(<CustomizedSnackbars />)
  act(() =>
    openSnackbar({
      message: '確定日結？',
      variant: 'warning',
      resign: true,
      isDailyCheckout: true,
      selectedOrders: [{ date: 1 }, { date: 2 }],
      waitCloseOrderResults: [{ date: 1 }, { date: 2 }],
      checkoutStaff: { id: 'staff-1' },
    })
  )
  await act(async () => fireEvent.click(screen.getByRole('button', { name: '確定日結' })))
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  expect(screen.getByText('50%')).toBeInTheDocument()
  const ring = screen.getByRole('progressbar').querySelectorAll('circle')[1]
  expect(ring).toHaveAttribute('stroke-dashoffset', '50')
  expect(ring).toHaveAttribute('pathLength', '100')
  expect(ring).toHaveAttribute('stroke', 'rgb(var(--primary))')
})
