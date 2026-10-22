// 保護名留×東森會員活動頁（/ehs2/ehs 加入會員、/ehs2/ehs2 結果、/ehs2/privacy 隱私權政策）。守住：
// - 加入會員：以活動的 LIFF id 登入 LINE、取 userId 查是否已是會員（MlgMember），已是會員直接到結果頁；尚未登入 LINE 時導向登入
// - 姓名、手機、同意條款都有才能送出；手機須 09 開頭 10 碼；送出 createMLGMember（姓名、手機、同意、LINE userId／暱稱／頭像）
// - 回傳 0000 → 新會員結果頁（帶 reg）、0302 → 已是會員結果頁；送出失敗或其他回傳碼時按鈕恢復可按（原本永遠停在「努力加入中」）
// - LINE 初始化或取個人資料失敗時提示重新開啟（原本是沒人接的 rejection、畫面沒有任何提示）
// - 結果頁：已領過／新領取兩種文案，新領取依 reg 是否 0000 顯示密碼說明
// LIFF SDK 以假物件代替；GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實會員。
import React from 'react'
import { cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { renderPage, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import Ehs from '../ehs'
import Ehs2 from '../ehs2'
import Privacy from '../privacy'

jest.setTimeout(20000)

const PROFILE = { userId: 'U-line-1', displayName: '小明', pictureUrl: 'https://example.com/p.png' }
let liff
let alertSpy
beforeEach(() => {
  liff = {
    init: jest.fn(() => Promise.resolve()),
    isLoggedIn: jest.fn(() => true),
    getProfile: jest.fn(() => Promise.resolve(PROFILE)),
    login: jest.fn(),
  }
  window.liff = liff
  alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  delete window.liff
})

describe('加入會員（ehs）', () => {
  const setup = (extra = {}) =>
    renderPage(<Ehs />, {
      route: '/ehs2/ehs',
      fixtures: {
        MlgMember: { mlgMember: false },
        createMLGMember: { createMLGMember: JSON.stringify({ returnCode: '0000', registerResult: '0000' }) },
        ...extra,
      },
    })
  const inputs = () => document.querySelectorAll('input')
  const fill = (name, phone) => {
    fireEvent.change(inputs()[0], { target: { value: name } })
    fireEvent.change(inputs()[1], { target: { value: phone } })
  }
  const joinBtn = () => screen.getByRole('button', { name: /加入會員|努力加入中/ })

  it('以活動 LIFF id 登入並以 userId 查是否已是會員；已是會員直接到結果頁', async () => {
    const utils = setup({ MlgMember: { mlgMember: true } })
    await utils.settle()
    expect(liff.init).toHaveBeenCalledWith({ liffId: '1654347144-w0mKXyWa' })
    expect(callsOf(utils.calls, 'MlgMember')[0].variables).toEqual({ lineId: 'U-line-1' })
    await wait(() => expect(currentLocation()).toBe('/ehs2/ehs2?isMember=true'))
  })

  it('尚未登入 LINE：導向 LINE 登入（登入後重新開啟本頁），不查會員', async () => {
    liff.isLoggedIn.mockReturnValue(false)
    const utils = setup()
    await wait(() => expect(liff.login).toHaveBeenCalled())
    await utils.settle()
    expect(liff.getProfile).not.toHaveBeenCalled()
    expect(callsOf(utils.calls, 'MlgMember')).toHaveLength(0)
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('姓名、手機、同意條款都有才能送出；手機長度或開頭不對提示且不送出', async () => {
    const utils = setup()
    await utils.settle()
    expect(currentLocation()).toBe('/ehs2/ehs')
    expect(screen.getByText('名留集團').closest('a')).toHaveAttribute('href', '/ehs2/privacy')
    expect(joinBtn()).toBeDisabled()
    fill(' 王小明 ', '091234567')
    expect(joinBtn()).not.toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(joinBtn()).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(joinBtn())
    expect(alertSpy).toHaveBeenLastCalledWith('手機格式不正確')
    fireEvent.change(inputs()[1], { target: { value: '0812345678' } })
    fireEvent.click(joinBtn())
    expect(alertSpy).toHaveBeenCalledTimes(2)
    await utils.settle()
    expect(callsOf(utils.calls, 'createMLGMember')).toHaveLength(0)
  })

  it('送出姓名（去頭尾空白）、手機、同意與 LINE 資料；0000 到新會員結果頁並帶 reg', async () => {
    const utils = setup({ createMLGMember: { createMLGMember: JSON.stringify({ returnCode: '0000', registerResult: '9999' }) } })
    await utils.settle()
    fill(' 王小明 ', '0912345678')
    fireEvent.click(joinBtn())
    await wait(() => expect(currentLocation()).toBe('/ehs2/ehs2?isMember=false&reg=9999'))
    expect(callsOf(utils.calls, 'createMLGMember').map(c => c.variables)).toEqual([
      {
        input: {
          name: '王小明',
          cellphone: '0912345678',
          policy: true,
          lineId: 'U-line-1',
          displayName: '小明',
          pictureUrl: 'https://example.com/p.png',
        },
      },
    ])
  })

  it('0302（已是東森會員）到已是會員結果頁', async () => {
    const utils = setup({ createMLGMember: { createMLGMember: JSON.stringify({ returnCode: '0302', registerResult: '0302' }) } })
    await utils.settle()
    fill('王小明', '0912345678')
    fireEvent.click(joinBtn())
    expect(joinBtn()).toHaveTextContent('努力加入中...')
    expect(joinBtn()).toBeDisabled()
    await wait(() => expect(currentLocation()).toBe('/ehs2/ehs2?isMember=true&reg=0302'))
  })

  it('其他回傳碼：提示加入失敗、按鈕恢復可按（原本永遠停在「努力加入中」）', async () => {
    const utils = setup({ createMLGMember: { createMLGMember: JSON.stringify({ returnCode: '9001', registerResult: '' }) } })
    await utils.settle()
    fill('王小明', '0912345678')
    fireEvent.click(joinBtn())
    await wait(() => expect(alertSpy).toHaveBeenCalledWith('加入會員失敗，請稍後再試'))
    await wait(() => expect(joinBtn()).toHaveTextContent('加入會員'))
    expect(joinBtn()).not.toBeDisabled()
    expect(currentLocation()).toBe('/ehs2/ehs')
  })

  it('送出失敗（GraphQL 錯誤，提示由 errorLink 負責）：按鈕恢復可按、不導頁', async () => {
    const utils = setup({ createMLGMember: new Error('伺服器錯誤') })
    await utils.settle()
    fill('王小明', '0912345678')
    fireEvent.click(joinBtn())
    await wait(() => expect(callsOf(utils.calls, 'createMLGMember')).toHaveLength(1))
    await wait(() => expect(joinBtn()).not.toBeDisabled())
    expect(currentLocation()).toBe('/ehs2/ehs')
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('LINE 初始化或取個人資料失敗：提示重新開啟此頁（原本沒有任何提示）', async () => {
    liff.init.mockImplementation(() => Promise.reject(new Error('invalid liffId')))
    setup()
    await wait(() => expect(alertSpy).toHaveBeenCalledWith('無法取得 LINE 個人資料，請重新開啟此頁'))
    cleanup()
    alertSpy.mockClear()
    liff.init.mockImplementation(() => Promise.resolve())
    liff.getProfile.mockImplementation(() => Promise.reject(new Error('no profile')))
    const utils = setup()
    await wait(() => expect(alertSpy).toHaveBeenCalledWith('無法取得 LINE 個人資料，請重新開啟此頁'))
    expect(callsOf(utils.calls, 'MlgMember')).toHaveLength(0)
  })
})

describe('結果頁（ehs2）與隱私權政策', () => {
  const renderResult = search =>
    render(
      <MemoryRouter>
        <Ehs2 location={{ search }} />
      </MemoryRouter>
    )

  it('已是會員：顯示已領取過；按鈕連到東森登入', () => {
    const { container } = renderResult('?isMember=true')
    expect(container.textContent).toContain('您已領取過東森幣')
    expect(screen.getByRole('button', { name: '立即登入查看我的東森幣' }).closest('a')).toHaveAttribute('href', 'https://etu.tw/ABfNWQ')
  })

  it('新領取：reg 為 0000 時說明密碼已簡訊寄出，否則請用原本的密碼', () => {
    const { container, unmount } = renderResult('?isMember=false&reg=0000')
    expect(container.textContent).toContain('500枚東森幣已匯入')
    expect(container.textContent).toContain('登入密碼：已發送簡訊至您的手機號')
    unmount()
    const other = renderResult('?isMember=false&reg=0302')
    expect(other.container.textContent).toContain('登入密碼：您本來的密碼')
  })

  it('隱私權政策', () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>
    )
    expect(screen.getByText('名留集團隱私權保護政策')).toBeInTheDocument()
  })
})
