// B1 真實表單＋模擬 GraphQL：選值後視窗仍開啟，Esc／背景不新增關閉路徑。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import { emptyCustomerForm } from 'views/OrderShared/customerField'
import CreateCustomer from '../AddCustomerModal'
import EditCustomer from '../../OrderEdit/AddCustomerModal'
import DraftCustomer from '../../DraftOrderEdit/AddCustomerModal'
import QueueCustomer from '../../QueueOrderEdit/AddCustomerModal'
import AddDesigners from '../../EmployeeSchedule/AddDesignersModal'
import ProfileImport from '../../EmployeeManagementList/ProfileImportModal'
import OuterLink from '../../Parameter/OuterLinkModal'
import Deduction from '../../Services/AboutDeductionEditModal'
import Assistant from '../../Services/AssistantSettingEditModal'

beforeEach(loginAs)
afterEach(cleanup)
const fixtures = {
  GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C099' },
  FETCH_USERS: { users: { users: [] } },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹'] },
  GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [{ userId: 'd1', userName: '王小美', userNo: '01', userNickName: '' }] },
  GET_MERCHANT_JOBTITLE: { merchantJobTitlePoint: [{ id: 'job1', jobTitle: '設計師' }] },
  GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: [{ id: 'a1', authorityName: '管理員' }] },
}
const dialog = () => screen.getByRole('dialog')
function stillOpen(onClose) {
  fireEvent.keyDown(dialog(), { key: 'Escape', keyCode: 27 })
  fireEvent.pointerDown(document.body)
  expect(dialog()).toBeInTheDocument()
  expect(onClose).not.toHaveBeenCalled()
  expect(within(dialog()).queryByLabelText('關閉')).toBeNull()
}
function chooseNative(select, label) {
  fireEvent.focus(select)
  const option = within(select).getByText(label)
  // 與 testkit 相同：保留 updater 讀取 event.target 的真實瀏覽器時序。
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, option.value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
  return option.value
}

it.each([['新增帳單', CreateCustomer], ['帳單詳細', EditCustomer], ['草稿', DraftCustomer], ['排隊', QueueCustomer]])('%s 顧客窗可選性別，Esc／背景不關閉', async (name, Component) => {
  const onClose = jest.fn()
  const page = renderPage(<Component open customer={emptyCustomerForm()} customerInModal={[]} setCustomer={jest.fn()} setBill={jest.fn()} onClose={onClose} />, { fixtures })
  await page.settle()
  const select = dialog().querySelector('select[name="gender"]')
  const value = chooseNative(select, '女')
  await wait(() => expect(select.value).toBe(value))
  stillOpen(onClose)
})

it('新增顧客的設計師搜尋可選取，Enter 跳欄保留', async () => {
  const onClose = jest.fn()
  const page = renderPage(<CreateCustomer open customer={emptyCustomerForm()} customerInModal={[{ userId: 'd1', userName: '王小美', userNo: '01' }]} setCustomer={jest.fn()} setBill={jest.fn()} onClose={onClose} />, { fixtures })
  await page.settle()
  const name = dialog().querySelector('input[name="name"]')
  fireEvent.keyDown(name, { key: 'Enter' })
  await wait(() => expect(dialog().querySelector('select[name="gender"]')).toHaveFocus())
  fireEvent.click(dialog().querySelector('input[role="combobox"]'))
  fireEvent.click(await screen.findByRole('option', { name: '王小美-01' }))
  expect(dialog().querySelector('input[name="remark"]')).toHaveFocus()
  stillOpen(onClose)
})

it('排班搜尋選人後保留彈窗與新增的人員列', async () => {
  const onClose = jest.fn()
  function Form() {
    const [designers, setDesigners] = React.useState([{ designerId: '' }])
    return <AddDesigners openAddDesignerModal designers={designers} setDesigners={setDesigners} onClose={onClose} />
  }
  const page = renderPage(<Form />, { fixtures })
  await page.settle()
  fireEvent.click(dialog().querySelector('input[role="combobox"]'))
  fireEvent.click(await screen.findByRole('option', { name: /王小美/ }))
  expect(within(dialog()).getAllByRole('combobox')).toHaveLength(2)
  expect(within(dialog()).getByText('新增', { selector: 'button' })).not.toBeDisabled()
  stillOpen(onClose)
})

it('身份導入可選類別，勾選後確認可用且視窗仍開啟', async () => {
  const onClose = jest.fn()
  const page = renderPage(<ProfileImport open selectedDesigners={['d1']} onClose={onClose} setSelectedDesigners={jest.fn()} />, { fixtures })
  await page.settle()
  const select = dialog().querySelector('select')
  chooseNative(select, '設計師')
  fireEvent.click(within(dialog()).getByLabelText('人員身份'))
  await wait(() => expect(within(dialog()).getByText('確認', { selector: 'button' })).not.toBeDisabled())
  stillOpen(onClose)
})

it('外部連結多選權限可選取且視窗仍開啟', async () => {
  const onClose = jest.fn()
  const page = renderPage(<OuterLink open isCreate onModalClose={onClose} />, { fixtures })
  await page.settle()
  fireEvent.click(dialog().querySelector('input[role="combobox"]'))
  fireEvent.click(await screen.findByRole('option', { name: '管理員' }))
  expect(within(dialog()).getByRole('button', { name: '移除 管理員' })).toBeInTheDocument()
  fireEvent.keyDown(dialog().querySelector('input[role="combobox"]'), { key: 'Escape', keyCode: 27 })
  stillOpen(onClose)
})

it.each(['deduction', 'assistant'])('%s 扣項類別可選取且不關閉', async kind => {
  const onClose = jest.fn()
  function Form() {
    const [items, setItems] = React.useState([{ type: '服務', itemSettings: [{ type: 'onSales', deductionOrder: 1 }] }])
    const [helpers, setHelpers] = React.useState([{ helperDeductionType: 'onSales', type: '', assistantNum: '1' }])
    return kind === 'deduction'
      ? <Deduction openEditDeductionModal ServiceDeductionItems={items} setServiceDeductionItems={setItems} onClose={onClose} />
      : <Assistant openEditAssistantModal helperDeductionSetting={helpers} setHelperDeductionSetting={setHelpers} merchantHelperItems={[]} onClose={onClose} />
  }
  const page = renderPage(<Form />, { fixtures })
  await page.settle()
  const select = dialog().querySelector('select')
  const value = chooseNative(select, '扣薪水')
  await wait(() => expect(select.value).toBe(value))
  stillOpen(onClose)
})
