// 保護抽獎活動規則編輯：後端的「消費類型規則」要正確還原成表單勾選狀態，否則活動條件被誤存
import { tidyConsumption, tidyDataObj } from 'helper/sweepstake'

const blankRule = () => ({
  product: false,
  membershipCard: false,
  service: { type: '', belong: [] },
  ticketSellInPerformance: { type: '', belong: [] },
  ticketSellNotInPerformance: { type: '', belong: [] },
  ticketUsePerformanceEntered: { type: '', belong: [] },
  ticketUsePerformanceNotEntered: { type: '', belong: [] },
})

describe('sweepstake：抽獎活動的消費類型規則還原成表單', () => {
  it('店販與會員卡只有「是否參加」，沒有範圍設定', () => {
    const data = blankRule()
    tidyDataObj.PRODUCT(data)
    tidyDataObj.MEMBERSHIP(data)
    expect(data.product).toBe(true)
    expect(data.membershipCard).toBe(true)
    // 不會誤動到其他類型
    expect(data.service).toEqual({ type: '', belong: [] })
  })

  it('服務：帶入適用範圍與指定的歸屬項目', () => {
    const data = blankRule()
    tidyDataObj.SERVICE(data, 'PART', ['s1', 's2'])
    expect(data.service).toEqual({ type: 'PART', belong: ['s1', 's2'] })
  })

  it.each([
    ['TICKETSELLINPERFORMANCE', 'ticketSellInPerformance'],
    ['TICKETSELLNOTINPERFORMANCE', 'ticketSellNotInPerformance'],
    ['TICKETUSEPERFORMANCEENTERED', 'ticketUsePerformanceEntered'],
    ['TICKETUSEPERFORMANCENOTENTERED', 'ticketUsePerformanceNotEntered'],
  ])('卡券 %s 對應到表單欄位 %s（入不入業績分開設定）', (type, key) => {
    const data = blankRule()
    tidyDataObj[type](data, 'ALL', [])
    expect(data[key]).toEqual({ type: 'ALL', belong: [] })
    // 其他卡券欄位維持空白
    Object.keys(data)
      .filter(k => k.startsWith('ticket') && k !== key)
      .forEach(k => expect(data[k].type).toBe(''))
  })

  it('未知的消費類型沒有對應處理（呼叫端以 if 判斷略過）', () => {
    expect(tidyDataObj.UNKNOWN).toBeUndefined()
  })

  it('tidyConsumption 直接寫入指定欄位', () => {
    const data = blankRule()
    tidyConsumption(data, 'PART', ['x'], 'service')
    expect(data.service.belong).toEqual(['x'])
  })
})
