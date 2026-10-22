// 保護什麼：清除快取頁（/customer/clearstorage，顧客端）。先顯示「清除快取中...」，清空 localStorage 後才導回首頁。
// Jason 2026/10/22 fix all：原本 useMounted 第一次 render 回傳 false，頁面一開始就走 Redirect，「清除快取中...」永遠不顯示。
import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import ClearStorage from '..'

afterEach(cleanup)

it('先顯示「清除快取中...」，清空 localStorage 後導回首頁', () => {
  localStorage.setItem('userMerchant', 'm-1')
  const textWhenClearing = []
  const realClear = localStorage.clear
  localStorage.clear = () => {
    textWhenClearing.push(document.body.textContent)
    realClear()
  }
  try {
    render(
      <MemoryRouter initialEntries={['/customer/clearstorage']}>
        <Switch>
          <Route path="/customer/clearstorage" exact component={ClearStorage} />
          <Route path="/" render={() => <p>首頁</p>} />
        </Switch>
      </MemoryRouter>
    )
  } finally {
    localStorage.clear = realClear
  }
  expect(textWhenClearing).toEqual(['清除快取中...'])
  expect(localStorage.getItem('userMerchant')).toBeNull()
  expect(screen.getByText('首頁')).toBeInTheDocument()
  expect(screen.queryByText('清除快取中...')).toBeNull()
})
