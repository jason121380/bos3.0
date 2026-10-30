// 保護 LINE（LIFF）登入流程：未登入要導去 LINE 登入並中止；初始化只做一次；個人資料快取不重複查詢
// liffHelper 在載入時就讀 window.liff 並以模組變數記住初始化狀態，所以每個測試用 isolateModules 重新載入
const loadHelper = liff => {
  window.liff = liff
  let helper
  jest.isolateModules(() => {
    helper = require('helper/liffHelper').default
  })
  return helper
}

const makeLiff = ({ loggedIn = true, initFails = false } = {}) => ({
  init: jest.fn((opts, ok, fail) => (initFails ? fail(new Error('not in LINE')) : ok({}))),
  isLoggedIn: jest.fn(() => loggedIn),
  login: jest.fn(),
  getProfile: jest.fn(() => Promise.resolve({ userId: 'U123', displayName: '小美' })),
  closeWindow: jest.fn(),
  openWindow: jest.fn(),
  sendMessages: jest.fn(() => Promise.resolve()),
})

afterEach(() => {
  delete window.liff
})

describe('liffHelper：LINE 前台登入', () => {
  it('已登入：init 成功，且第二次呼叫不再重新初始化', async () => {
    const liff = makeLiff()
    const helper = loadHelper(liff)
    await expect(helper.init('liff-1')).resolves.toBeUndefined()
    expect(liff.init).toHaveBeenCalledWith({ liffId: 'liff-1' }, expect.any(Function), expect.any(Function))
    await helper.init('liff-1')
    expect(liff.init).toHaveBeenCalledTimes(1)
  })

  it('未登入：導去 LINE 登入並以 NOT_LOGIN 中止，避免以匿名身分繼續操作', async () => {
    const liff = makeLiff({ loggedIn: false })
    const helper = loadHelper(liff)
    await expect(helper.init('liff-1')).rejects.toBe('NOT_LOGIN')
    expect(liff.login).toHaveBeenCalledTimes(1)
  })

  it('不在 LINE 內開啟：init 失敗時把錯誤往外拋給頁面處理', async () => {
    const liff = makeLiff({ initFails: true })
    const helper = loadHelper(liff)
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    await expect(helper.init()).rejects.toThrow('not in LINE')
    log.mockRestore()
  })

  it('getProfile：取得一次後快取，不重複向 LINE 查詢', async () => {
    const liff = makeLiff()
    const helper = loadHelper(liff)
    await expect(helper.getProfile('liff-1')).resolves.toEqual({ userId: 'U123', displayName: '小美' })
    await expect(helper.getProfile('liff-1')).resolves.toEqual({ userId: 'U123', displayName: '小美' })
    expect(liff.getProfile).toHaveBeenCalledTimes(1)
  })

  it('getProfile：LINE 回傳錯誤時拒絕，不回傳空的使用者', async () => {
    const liff = makeLiff()
    liff.getProfile.mockImplementation(() => Promise.reject(new Error('profile fail')))
    const helper = loadHelper(liff)
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    await expect(helper.getProfile()).rejects.toThrow('profile fail')
    log.mockRestore()
  })

  it('getProfile：未登入時同樣中止', async () => {
    const helper = loadHelper(makeLiff({ loggedIn: false }))
    await expect(helper.getProfile()).rejects.toBe('NOT_LOGIN')
  })

  it('sendMessages：單一訊息包成陣列送出', async () => {
    const liff = makeLiff()
    const helper = loadHelper(liff)
    await helper.sendMessages({ type: 'text', text: '預約成功' })
    expect(liff.sendMessages).toHaveBeenCalledWith([{ type: 'text', text: '預約成功' }])
    await helper.sendMessages([
      { type: 'text', text: 'a' },
      { type: 'text', text: 'b' },
    ])
    expect(liff.sendMessages).toHaveBeenLastCalledWith([
      { type: 'text', text: 'a' },
      { type: 'text', text: 'b' },
    ])
  })

  it('sendMessages：送出失敗或未登入時拒絕，讓頁面提示', async () => {
    const liff = makeLiff()
    liff.sendMessages.mockImplementation(() => Promise.reject(new Error('send fail')))
    const helper = loadHelper(liff)
    await expect(helper.sendMessages('x')).rejects.toThrow('send fail')

    const notLogged = loadHelper(makeLiff({ loggedIn: false }))
    await expect(notLogged.sendMessages('x')).rejects.toBe('NOT_LOGIN')
  })

  it('closeWindow／openWindow 直接轉給 LIFF，外開參數照傳', () => {
    const liff = makeLiff()
    const helper = loadHelper(liff)
    helper.closeWindow()
    helper.openWindow('https://example.com', true)
    expect(liff.closeWindow).toHaveBeenCalled()
    expect(liff.openWindow).toHaveBeenCalledWith({ url: 'https://example.com', external: true })
    expect(helper.getLIFFInfo()).toEqual({})
  })
})
