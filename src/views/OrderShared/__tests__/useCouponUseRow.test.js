import React from 'react'
import { act, cleanup, render, wait } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import useCouponUseRow from '../useCouponUseRow'
import { createAutoMockLink, callsOf } from '../../../__tests__/testkit.test'

// 為什麼重要：帳單詳細／掛單詳細的「使用預收卡」一列：助理欄位決定助理的抽成，金額決定這次扣掉的卡券價值。
// 守住：
// - 載入既有帳單時，依卡券綁定服務的助理設定補上「還沒填的」助理欄位，已填的保留、不重複出現
// - 選卡券時金額帶卡券價格、助理欄位依該服務的助理設定展開（沒有設定就沒有欄位），並通知帳單換卡券
// - 改助理時只把「有選人」的助理送進帳單；清除時所有助理清空並通知帳單
// - 金額顯示：過長的小數取一位，四捨五入後為 0 時顯示 0（不顯示 0.0）
// 已知缺口（TODO P3 覆蓋率 A 級疑似 bug ①，待 Jason 決定）：選卡券時產生的助理類型是「洗髮 - 助理A」，之後重新查詢卡券紀錄時
// 產生「洗髮-助理A」，以字串完全相等去重，畫面會出現重複的助理欄位。兩種格式哪個才對尚未決定，這裡只比對類型與人員，
// 也沒有模擬「選完後重新查詢」那一步——本檔不保護「選卡券後不重複」；修正後補上單一格式與重新查詢的斷言。
// GraphQL 由模擬 link 回應，不連後端。

afterEach(cleanup)

const TICKET_RECORDS = {
  ticketRecords: {
    data: [
      {
        id: 'ticket-1',
        service: {
          id: 'service-1',
          helperDeductionSetting: [
            { type: '洗髮', nameList: ['助理A', '助理B'], helperDeductionType: 'POINT' },
            { type: '吹整', nameList: ['助理C'], helperDeductionType: 'CASH' },
          ],
        },
      },
    ],
  },
}

function setup(couponUsage, { index = 0 } = {}) {
  const calls = []
  const link = createAutoMockLink({ GetTicket: TICKET_RECORDS }, { calls })
  const onChange = jest.fn()
  const onClear = jest.fn()
  const latest = {}
  function Row({ usage }) {
    Object.assign(latest, useCouponUseRow({ index, couponUsage: usage, onChange, onClear }))
    return null
  }
  const utils = render(
    <MockedProvider link={link} addTypename={false}>
      <Row usage={couponUsage} />
    </MockedProvider>
  )
  return { ...utils, calls, onChange, onClear, latest }
}

describe('載入既有帳單的預收卡', () => {
  it('依卡券綁定服務的助理設定，補上還沒填的助理欄位；已填的保留、不重複', async () => {
    const saved = { type: '洗髮-助理A', isDesignate: true, helperId: 'helper-1', helperDeductiontype: 'POINT' }
    const { calls, latest } = setup({ customerTicketId: 'ticket-1', price: 600, useTicketOrderHelpers: [saved] })
    await wait(() => expect(latest.ticketOrderHelpers).toHaveLength(3))
    expect(callsOf(calls, 'GetTicket')[0].variables).toEqual({ input: { ids: ['ticket-1'] } })
    expect(latest.price).toBe(600)
    expect(latest.ticketOrderHelpers).toEqual([
      saved,
      { type: '洗髮-助理B', isDesignate: false, helperId: '', helperDeductiontype: 'POINT' },
      { type: '吹整-助理C', isDesignate: false, helperId: '', helperDeductiontype: 'CASH' },
    ])
  })

  it('還沒選卡券的空白列：不查詢卡券', async () => {
    const { calls, latest } = setup({ customerTicketId: '', useTicketOrderHelpers: [] })
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(callsOf(calls, 'GetTicket')).toEqual([])
    expect(latest.ticketOrderHelpers).toEqual([])
  })
})

describe('選卡券、改助理、清除', () => {
  const ticket = {
    id: 'ticket-2',
    price: 450,
    service: {
      helperDeductionSetting: [
        { type: '洗髮', nameList: ['助理A', '助理B'], helperDeductionType: 'POINT' },
        { type: '吹整', nameList: ['助理C'], helperDeductionType: 'CASH' },
      ],
    },
  }

  it('選卡券：金額帶卡券價格、依服務的助理設定展開助理欄位，並通知帳單換卡券', () => {
    const { latest, onChange } = setup({ customerTicketId: '', useTicketOrderHelpers: [] }, { index: 2 })
    act(() => latest.handleCustomerTicketChange(ticket))
    expect(latest.price).toBe(450)
    // 類型名稱的分隔格式與載入既有帳單時不同（見檔頭已知缺口），這裡只比對類型與人員
    const expected = [['洗髮', '助理A', 'POINT'], ['洗髮', '助理B', 'POINT'], ['吹整', '助理C', 'CASH']]
    expect(latest.ticketOrderHelpers).toHaveLength(3)
    latest.ticketOrderHelpers.forEach((helper, i) => {
      const [type, name, deductionType] = expected[i]
      expect(helper.type).toMatch(new RegExp(`^${type}\\s?-\\s?${name}$`))
      expect(helper).toEqual(expect.objectContaining({ helperId: '', isDesignate: false, helperDeductiontype: deductionType }))
    })
    expect(onChange).toHaveBeenCalledWith({ key: 'customerTicketId', value: 'ticket-2', index: 2 })
  })

  it('卡券的服務沒有助理設定：沒有助理欄位', () => {
    const { latest } = setup({ customerTicketId: '', useTicketOrderHelpers: [] })
    act(() => latest.handleCustomerTicketChange({ ...ticket, service: { helperDeductionSetting: [] } }))
    expect(latest.ticketOrderHelpers).toEqual([])
  })

  it('改助理：只把有選人的助理送進帳單', () => {
    const { latest, onChange } = setup({ customerTicketId: '', useTicketOrderHelpers: [] }, { index: 1 })
    act(() => latest.handleCustomerTicketChange(ticket))
    act(() => latest.handleAssistantChange({ value: 'helper-9', assistantIndex: 1, key: 'helperId' }))
    expect(latest.ticketOrderHelpers[1].helperId).toBe('helper-9')
    expect(onChange).toHaveBeenLastCalledWith({
      index: 1,
      key: 'useTicketOrderHelpers',
      value: [expect.objectContaining({ helperId: 'helper-9', helperDeductiontype: 'POINT' })],
    })
  })

  it('清除：所有助理清空、取消指定，並通知帳單清除這一列', () => {
    const { latest, onClear } = setup({ customerTicketId: '', useTicketOrderHelpers: [] }, { index: 3 })
    act(() => latest.handleCustomerTicketChange(ticket))
    act(() => latest.handleAssistantChange({ value: 'helper-9', assistantIndex: 0, key: 'helperId' }))
    act(() => latest.handleAssistantChange({ value: true, assistantIndex: 0, key: 'isDesignate' }))
    act(() => latest.handleClear())
    latest.ticketOrderHelpers.forEach(helper => expect(helper).toEqual(expect.objectContaining({ helperId: '', isDesignate: false })))
    expect(onClear).toHaveBeenCalledWith({ index: 3 })
  })
})

describe('金額顯示', () => {
  it.each([
    [600, 600],
    [1234567, 1234567], // 7 位以內原樣顯示
    [333.333333, '333.3'], // 每次金額＝卡券價格÷次數，常有循環小數
    [0.0000123, 0], // 四捨五入後是 0：顯示 0 而不是 0.0
  ])('%p → %p', (value, shown) => {
    const { latest } = setup({ customerTicketId: '', useTicketOrderHelpers: [] })
    expect(latest.displayFloat(value)).toBe(shown)
  })
})
