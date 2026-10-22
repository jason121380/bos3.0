// 保護什麼：Dashboard 以外的版面外框（登入頁 Auth＋Topbar、顧客端 Customer、LINE 選單 EHS、地圖 Line、錯誤頁 Error）。
// - 每個版面都要把子路由畫出來（renderRoutes(route.routes)），並掛上全站唯一的提示區（openSnackbar 的訊息才看得到）。
// - 登入頁：已登入（localStorage 有 user）時導回首頁，避免已登入者停在登入畫面。
// - 顧客端：手機上輸入框字級強制 16px（iOS／LINE 內聚焦時不自動放大畫面）。
// - Topbar 顯示目前版號（回報問題時對得上是哪一版）並連回首頁。
import React from 'react'
import { act, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, currentLocation } from '../../__tests__/testkit.test'
import { openSnackbar } from 'elements/snackbars'
import { APP_VERSION } from '../../version'

import Auth from '../Auth'
import Topbar from '../Auth/Topbar'
import Customer from '../Customer'
import EHS from '../EHS'
import Line from '../Line'
import ErrorLayout from '../Error'

const Child = () => <p>子頁面內容</p>
const route = path => ({ routes: [{ path, exact: true, component: Child }] })

beforeEach(() => localStorage.clear())

describe('Auth 版面（登入、註冊、重設密碼）', () => {
  it('未登入：顯示 Topbar 與子頁面，停在原網址', async () => {
    const { settle } = renderPage(<Auth route={route('/auth/login')} />, { route: '/auth/login' })
    await settle()
    expect(screen.getByText('子頁面內容')).toBeInTheDocument()
    expect(screen.getByAltText('BeautyOS')).toBeInTheDocument()
    expect(currentLocation()).toBe('/auth/login')
  })

  it('已登入：導回首頁', async () => {
    loginAs()
    renderPage(<Auth route={route('/auth/login')} />, { route: '/auth/login' })
    await wait(() => expect(currentLocation()).toBe('/'))
  })

  it('Topbar 顯示版號並連回首頁，className 合併', () => {
    renderPage(<Topbar className="extra" data-testid="tb" />)
    const header = screen.getByTestId('tb')
    expect(header.tagName).toBe('HEADER')
    expect(header.className).toContain('extra')
    expect(screen.getByText(APP_VERSION)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })
})

describe('其他版面', () => {
  it.each([
    ['Customer', Customer, '/customer/login'],
    ['EHS', EHS, '/ehs2/ehs'],
    ['Line', Line, '/line/map/1'],
    ['Error', ErrorLayout, '/errors/error-404'],
  ])('%s：畫出子路由', async (_, Layout, path) => {
    const { settle } = renderPage(<Layout route={route(path)} />, { route: path })
    await settle()
    expect(screen.getByText('子頁面內容')).toBeInTheDocument()
  })

  it('子路由不符合時不畫內容（交給上層路由處理）', async () => {
    const { settle } = renderPage(<Customer route={route('/customer/login')} />, { route: '/customer/other' })
    await settle()
    expect(screen.queryByText('子頁面內容')).toBeNull()
  })

  it('Customer：手機上輸入框強制 16px，避免 iOS 聚焦時放大畫面', async () => {
    const { container, settle } = renderPage(<Customer route={route('/customer/login')} />, { route: '/customer/login' })
    await settle()
    const shell = container.querySelector('.ui-root.min-h-screen')
    expect(shell.className).toContain('max-sm:[&_input]:!text-[16px]')
    expect(shell.className).toContain('max-sm:[&_select]:!text-[16px]')
  })

  it.each([
    ['Auth', Auth],
    ['Customer', Customer],
    ['EHS', EHS],
    ['Line', Line],
  ])('%s：掛有提示區，openSnackbar 的訊息看得到', async (_, Layout) => {
    const { settle } = renderPage(<Layout route={route('/x')} />, { route: '/x' })
    await settle()
    act(() => openSnackbar({ message: '已儲存', variant: 'success' }))
    expect(await screen.findByText('已儲存')).toBeInTheDocument()
  })
})
