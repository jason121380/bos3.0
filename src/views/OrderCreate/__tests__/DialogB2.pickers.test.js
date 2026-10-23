// B2 真實彈窗與 picker；GraphQL 只使用 testkit 的模擬回應。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import FastCheckOrdersModal from 'components/FastCheckOrdersModal'
import { Provider as StoreProvider } from 'hooks/useStore'
import CustomerInfo from '../../CustomerManagementDetails/General/CustomerInfo'
import CustomerFilterExport from '../../CustomerFilterExport'
import CustomerEditModal from '../../CustomerManagementDetails/General/CustomerEditModal'
import { CUSTOMER, baseFixtures } from '../../CustomerManagementDetails/__tests__/detailsKit.test'

jest.setTimeout(30000)
beforeEach(loginAs)
afterEach(cleanup)
it('快速查帳內人員搜尋選值及 Esc 只關選單，原關閉鈕仍可關窗', async () => {
  const close = jest.fn()
  const page = renderPage(<FastCheckOrdersModal open setOpenModal={close} date={new Date(2026, 9, 23).getTime()} />, { fixtures: {
    GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [{ userId: 'd1', userName: '王小美', userNo: '01', userNickName: '' }] },
  } })
  await page.settle()
  const dialog = screen.getByRole('dialog')
  fireEvent.click(within(dialog).getByRole('button', { name: '起始時間' }))
  fireEvent.click(await screen.findByRole('gridcell', { name: '2026年10月25日', exact: true }))
  await wait(() => expect(screen.queryByRole('gridcell')).toBeNull())
  expect(within(dialog).getByRole('button', { name: '起始時間' })).toHaveTextContent('25')
  expect(close).not.toHaveBeenCalled()
  const input = dialog.querySelector('input[role="combobox"]')
  fireEvent.click(input)
  fireEvent.click(await screen.findByRole('option', { name: /王小美/ }))
  expect(input.value).toContain('王小美')
  fireEvent.click(input)
  fireEvent.keyDown(input, { key: 'Escape', keyCode: 27 })
  await wait(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
  expect(screen.getByRole('listbox')).toHaveClass('hidden')
  expect(close).not.toHaveBeenCalled()
  expect(dialog).toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: '關閉' }))
  expect(close).toHaveBeenCalledWith(false)
})
it('編輯顧客 Select 可選值，取消仍呼叫原 onClose', async () => {
  const close = jest.fn()
  const page = renderPage(<StoreProvider value={{ refetch: jest.fn() }}><CustomerEditModal open onClose={close} customer={CUSTOMER} /></StoreProvider>, { fixtures: baseFixtures() })
  await page.settle()
  const dialog = screen.getByRole('dialog')
  const select = dialog.querySelector('select[name="gender"]')
  const option = within(select).getByText('男')
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
  await wait(() => expect(select.value).toBe(option.value))
  expect(close).not.toHaveBeenCalled()
  fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
  expect(close).toHaveBeenCalledTimes(1)
})

it('顧客建立預約的日期 Esc 只關 picker，面板仍由原取消鈕關閉', async () => {
  const page = renderPage(<StoreProvider value={{ refetch: jest.fn() }}><CustomerInfo customer={CUSTOMER} /></StoreProvider>, { fixtures: baseFixtures() })
  await page.settle()
  fireEvent.click(screen.getByRole('button', { name: '建立預約' }))
  const dialog = screen.getByRole('dialog')
  fireEvent.click(dialog.querySelector('.ui-date-picker input'))
  const day = await screen.findByRole('gridcell', { name: /年.*月25日/ })
  day.focus()
  fireEvent.keyDown(day, { key: 'Escape', code: 'Escape' })
  await wait(() => expect(screen.queryByRole('gridcell')).toBeNull())
  expect(dialog).toBeInTheDocument()
  fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
  expect(dialog).toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: '取消' }))
  await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
})
it('更多篩選的真實日期可開啟，Esc 保留篩選窗', async () => {
  const page = renderPage(<CustomerFilterExport />)
  await page.settle()
  fireEvent.click(screen.getByRole('button', { name: '篩選' }))
  fireEvent.click(screen.getByRole('button', { name: '篩選最後消費週期' }))
  const dialog = screen.getByRole('dialog')
  const dateButton = dialog.querySelector('.ui-date-picker input')
  fireEvent.click(dateButton)
  const day = await screen.findByRole('gridcell', { name: /年.*月25日/ })
  day.focus()
  fireEvent.keyDown(day, { key: 'Escape', code: 'Escape' })
  await wait(() => expect(screen.queryByRole('gridcell')).toBeNull())
  expect(dialog).toBeInTheDocument()
})
