import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import PublishedDialog from '../PublishedDialog'
import VendorDialog from '../VendorDialog'

afterEach(cleanup)

test('上下架選單保留布林值，Esc 不關閉，取消與確認各走原回呼', () => {
  const setIsPublished = jest.fn()
  const handleClosePublishDialog = jest.fn()
  const handleSetPublished = jest.fn()
  render(<PublishedDialog open isPublished setIsPublished={setIsPublished} handleClosePublishDialog={handleClosePublishDialog} handleSetPublished={handleSetPublished} />)
  const select = screen.getByRole('combobox')
  const down = [...select.options].find(option => option.textContent === '下架')
  fireEvent.change(select, { target: { value: down.value } })
  expect(setIsPublished).toHaveBeenCalledWith(false)
  fireEvent.keyDown(select, { key: 'Escape' })
  expect(handleClosePublishDialog).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '取消' }))
  expect(handleClosePublishDialog).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByTestId('confirm'))
  expect(handleSetPublished).toHaveBeenCalledTimes(1)
})

test('廠商選單在視窗內可選取且只回傳原 uuid，不觸發關閉', () => {
  const setMerchantVendorId = jest.fn()
  const handleClosePublishDialog = jest.fn()
  render(<VendorDialog open option={[{ uuid: 'vendor-1', no: 'V01', nickname: '', name: '測試廠商' }]} merchantVendorId="" setMerchantVendorId={setMerchantVendorId} handleClosePublishDialog={handleClosePublishDialog} />)
  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('option', { name: 'V01 測試廠商' }))
  expect(setMerchantVendorId).toHaveBeenCalledWith('vendor-1')
  expect(handleClosePublishDialog).not.toHaveBeenCalled()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
})

// 還沒選廠商時「確認」停用，旁邊要說出原因（STYLE.md §6）；選了就不顯示
test('廠商未選時確認鈕停用並顯示「尚缺：廠商」', () => {
  const props = { open: true, option: [{ uuid: 'vendor-1', no: 'V01', nickname: '', name: '測試廠商' }], setMerchantVendorId: jest.fn(), handleClosePublishDialog: jest.fn() }
  const { rerender } = render(<VendorDialog {...props} merchantVendorId="" />)
  expect(screen.getByTestId('confirm')).toBeDisabled()
  expect(screen.getByText('尚缺：廠商')).toHaveAttribute('role', 'status')
  rerender(<VendorDialog {...props} merchantVendorId="vendor-1" />)
  expect(screen.getByTestId('confirm')).not.toBeDisabled()
  expect(screen.queryByText('尚缺：廠商')).toBeNull()
})
