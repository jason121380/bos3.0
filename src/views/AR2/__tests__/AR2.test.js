// 保護 AR 變髮色示範頁（/ar、/ar2）：以第三方 YMK SDK 開啟試妝畫面，點色票套用對應髮色。
// 守住：SDK 載入後的初始化參數（540×810、繁中）並開啟；12 個色票各自套用 HAIR_DYE_01 的對應色號；鏡頭權限結果顯示在頁面上。
// SDK 以假物件代替、<Helmet> 以替身攔下載入 SDK 的 script（不執行、不連網）。
import React from 'react'
import { cleanup, fireEvent, render as rtlRender, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AR2 from '..'

jest.mock('react-helmet', () => {
  const { Children, createElement } = require('react')
  return {
    Helmet: ({ children }) =>
      createElement(
        'div',
        { 'data-testid': 'helmet' },
        Children.map(children, child => createElement('span', { 'data-tag': child.type }, child.props.children))
      ),
  }
})

const render = ui => rtlRender(<MemoryRouter initialEntries={['/ar2']}>{ui}</MemoryRouter>)

let alertSpy
beforeEach(() => {
  window.YMK = { init: jest.fn(), open: jest.fn(), applyMakeupBySkuItem: jest.fn() }
  alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  delete window.YMK
  delete window.ymkAsyncInit
  delete window.navigator.getUserMedia
})

it('頁面標題與 SDK 載入 script；SDK 就緒後以 540×810、繁中初始化並開啟', () => {
  render(<AR2 />)
  const helmet = screen.getAllByTestId('helmet').find(h => h.textContent.includes('AR 變髮色'))
  const tags = helmet.querySelectorAll('span')
  expect(tags[0]).toHaveAttribute('data-tag', 'title')
  expect(tags[0]).toHaveTextContent('AR 變髮色')
  expect(tags[1]).toHaveAttribute('data-tag', 'script')
  expect(tags[1].textContent).toContain('https://storage.googleapis.com/storage.lambor.io/sdk10.js?apiKey=')
  expect(typeof window.ymkAsyncInit).toBe('function')
  window.ymkAsyncInit()
  expect(window.YMK.init).toHaveBeenCalledWith(expect.objectContaining({ width: 540, height: 810, language: 'cht' }))
  expect(window.YMK.open).toHaveBeenCalled()
})

it('12 個色票：點選套用 HAIR_DYE_01 的對應色號', () => {
  const { container } = render(<AR2 />)
  const swatches = container.querySelectorAll('li')
  expect(swatches).toHaveLength(12)
  expect(swatches[0].style.backgroundColor).toBe('rgb(255, 159, 45)')
  fireEvent.click(swatches[1])
  const [sku, itemGuid] = window.YMK.applyMakeupBySkuItem.mock.calls[0]
  expect(itemGuid).toBe('HAIR_DYE_01_07')
  expect(sku.sku).toEqual({ skuGuid: 'HAIR_DYE_01', skuId: '0', type: 'hair_dye' })
  expect(sku.items.find(i => i.guid === itemGuid).colors.color).toBe('00bf5484')
})

describe('鏡頭權限', () => {
  const clickCamera = container => fireEvent.click(container.querySelector('ul').nextSibling)

  it('允許：提示並顯示 SUCCESS', () => {
    window.navigator.getUserMedia = jest.fn((constraints, ok) => ok({}))
    const { container } = render(<AR2 />)
    clickCamera(container)
    expect(window.navigator.getUserMedia.mock.calls[0][0]).toEqual({ video: true })
    expect(alertSpy).toHaveBeenCalledWith('SUCCESS')
    expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  })

  it('拒絕：提示並顯示 PERMISSION_DENIED', () => {
    window.navigator.getUserMedia = jest.fn((constraints, ok, fail) => fail('PERMISSION_DENIED'))
    const { container } = render(<AR2 />)
    clickCamera(container)
    expect(alertSpy).toHaveBeenCalledWith('PERMISSION_DENIED')
    expect(screen.getByText('PERMISSION_DENIED')).toBeInTheDocument()
  })

  it('其他錯誤：顯示錯誤名稱', () => {
    window.navigator.getUserMedia = jest.fn((constraints, ok, fail) => fail({ name: 'NotFoundError' }))
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const { container } = render(<AR2 />)
    clickCamera(container)
    expect(screen.getByText('The following error occurred: NotFoundError')).toBeInTheDocument()
    expect(alertSpy).not.toHaveBeenCalled()
    log.mockRestore()
  })
})
