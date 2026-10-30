// 為什麼重要：重新開單的「使用預收卡」一列，助理欄位決定助理的抽成；同一個助理出現兩次，店員可能選到不同人或漏填。
// 守住：
// - 選卡券後帳單更新、重新查詢卡券紀錄：助理欄位不重複，類型只有一種格式「服務助理類型-名稱」（與打帳單同格式）
//   （2026/10/22 修正：原本選卡券時產生「洗髮 - 助理A」、查詢時產生「洗髮-助理A」，畫面出現重複欄位）
// - 改助理時送進帳單的類型也是這個格式
// 卡券／員工自動完成元件以簡化替身代替（render 時才讀 mockTicket）（只負責觸發 onChange），GraphQL 由模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { Provider as BillProvider } from 'context/keyInContext'
import { createAutoMockLink, callsOf } from '../../../__tests__/testkit.test'
import CouponUse from '../CouponUse'

const HELPER_SETTING = [
  { type: '洗髮', nameList: ['助理A', '助理B'], helperDeductionType: 'POINT' },
  { type: '吹整', nameList: ['助理C'], helperDeductionType: 'CASH' },
]
const mockTicket = { id: 'ticket-1', price: 450, service: { id: 'service-1', price: 450, helperDeductionSetting: HELPER_SETTING } }

jest.mock('components/CustomerTicketRecordAutoCompleteForQueueOrder', () => props => (
  <button type="button" onClick={() => props.onChange(mockTicket)}>選卡券</button>
))
jest.mock('components/EmployeeAutoComplete', () => props => (
  <button type="button" data-testid={`pick-${props.placeholder}`} onClick={() => props.onChange({ userId: 'helper-9' })}>選助理</button>
))

afterEach(cleanup)

function Harness({ onBillChange }) {
  const [usage, setUsage] = React.useState({ customerTicketId: '', useTicketOrderHelpers: [] })
  return (
    <CouponUse
      index={0}
      couponUsages={[usage]}
      couponUsage={usage}
      onClear={() => {}}
      onChange={change => {
        onBillChange(change)
        // 與 PanelCouponUse 相同：收到變更後換一個新的列物件傳回來
        setUsage(prev => ({ ...prev, [change.key]: change.value }))
      }}
    />
  )
}

function setup() {
  const calls = []
  const link = createAutoMockLink({ GetTicket: { ticketRecords: { data: [mockTicket] } } }, { calls })
  const onBillChange = jest.fn()
  render(
    <MockedProvider link={link} addTypename={false}>
      <BillProvider value={{ bill: { customerId: 'customer-1' }, order: {} }}>
        <Harness onBillChange={onBillChange} />
      </BillProvider>
    </MockedProvider>
  )
  return { calls, onBillChange }
}

const helperLabels = () => Array.from(document.querySelectorAll('[data-testid^="pick-"]')).map(el => el.dataset.testid.replace('pick-', ''))

it('選卡券後重新查詢卡券紀錄：助理欄位不重複、只有一種格式', async () => {
  const { calls } = setup()
  fireEvent.click(screen.getByText('選卡券'))
  await wait(() => expect(callsOf(calls, 'GetTicket').length).toBeGreaterThan(0))
  await new Promise(resolve => setTimeout(resolve, 30))
  expect(helperLabels()).toEqual(['洗髮-助理A', '洗髮-助理B', '吹整-助理C'])
})

it('改助理：送進帳單的類型是「服務助理類型-名稱」', async () => {
  const { calls, onBillChange } = setup()
  fireEvent.click(screen.getByText('選卡券'))
  await wait(() => expect(callsOf(calls, 'GetTicket').length).toBeGreaterThan(0))
  await new Promise(resolve => setTimeout(resolve, 30))
  fireEvent.click(screen.getByTestId('pick-洗髮-助理B'))
  expect(onBillChange).toHaveBeenLastCalledWith({
    index: 0,
    key: 'useTicketOrderHelpers',
    value: [{ type: '洗髮-助理B', helperId: 'helper-9', isDesignate: false, helperDeductiontype: 'POINT' }],
  })
})
